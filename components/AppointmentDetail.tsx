import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { API, Appointment } from "../services/api";
import { StorageService } from "../services/storage";

interface AppointmentDetailProps {
  appointmentId: string | null;
  onBack: () => void;
}

export function AppointmentDetail({ appointmentId, onBack }: AppointmentDetailProps) {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasViewPermission, setHasViewPermission] = useState(true);
  const [hasEditPermission, setHasEditPermission] = useState(true);
  const [hasDeletePermission, setHasDeletePermission] = useState(true);

  useEffect(() => {
    if (appointmentId) {
      checkPermissionsAndLoadDetail();
    }
  }, [appointmentId]);

  const checkPermissionsAndLoadDetail = async () => {
    try {
      const staffData = await StorageService.getStaffData();
      const canViewAllAppointments = staffData?.permissions?.can_view_all_appointments ?? true;
      const canEditAppointments = staffData?.permissions?.can_edit_appointments ?? true;
      const canDeleteAppointments = staffData?.permissions?.can_delete_appointments ?? true;

      setHasViewPermission(canViewAllAppointments);
      setHasEditPermission(canEditAppointments);
      setHasDeletePermission(canDeleteAppointments);

      if (canViewAllAppointments) {
        await loadAppointmentDetail();
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error checking permissions:", err);
      setIsLoading(false);
    }
  };

  const loadAppointmentDetail = async () => {
    if (!appointmentId) return;

    try {
      setIsLoading(true);
      setError("");

      // Lade Termin-Daten
      const appointmentData = await API.getAppointment(appointmentId);
      setAppointment(appointmentData);

    } catch (err: any) {
      console.error("Error loading appointment detail:", err);
      setError(err.message || "Fehler beim Laden der Termindetails");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!appointment || !hasEditPermission) return;

    try {
      await API.updateAppointment(appointmentId!, { status: newStatus });
      setAppointment({ ...appointment, status: newStatus });
      Alert.alert("Erfolg", "Status wurde erfolgreich aktualisiert.");
    } catch (err: any) {
      Alert.alert("Fehler", err.message || "Status konnte nicht aktualisiert werden.");
    }
  };

  const handleDeleteAppointment = () => {
    if (!appointment || !hasDeletePermission) return;

    Alert.alert(
      "Termin löschen",
      `Möchtest du den Termin mit ${appointment.customer_name} wirklich löschen?`,
      [
        {
          text: "Abbrechen",
          style: "cancel",
        },
        {
          text: "Löschen",
          style: "destructive",
          onPress: async () => {
            try {
              await API.deleteAppointment(appointmentId!);
              Alert.alert("Erfolg", "Termin wurde erfolgreich gelöscht.", [
                {
                  text: "OK",
                  onPress: () => onBack(),
                },
              ]);
            } catch (err: any) {
              Alert.alert("Fehler", err.message || "Termin konnte nicht gelöscht werden.");
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "confirmed":
        return "#10B981";
      case "pending":
        return "#F59E0B";
      case "cancelled":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "confirmed":
        return "Bestätigt";
      case "pending":
        return "Ausstehend";
      case "cancelled":
        return "Abgesagt";
      default:
        return status;
    }
  };

  const getDuration = (): string => {
    if (!appointment) return "";
    const start = new Date(appointment.starts_at);
    const end = new Date(appointment.ends_at);
    const diff = end.getTime() - start.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 60) {
      return `${minutes} Min.`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMins = minutes % 60;
      if (remainingMins === 0) {
        return `${hours} Std.`;
      } else {
        return `${hours} Std. ${remainingMins} Min.`;
      }
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Lade Termindetails...</Text>
      </View>
    );
  }

  if (!hasViewPermission) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Termindetails</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.noPermissionContainer}>
          <View style={styles.noPermissionIcon}>
            <Ionicons name="lock-closed" size={64} color="#6B7280" />
          </View>
          <Text style={styles.noPermissionTitle}>Keine Berechtigung</Text>
          <Text style={styles.noPermissionText}>
            Du hast keine Berechtigung, Termindetails anzuzeigen.
          </Text>
        </View>
      </View>
    );
  }

  if (error || !appointment) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Termindetails</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.errorCard}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error || "Termin nicht gefunden"}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadAppointmentDetail}>
            <Text style={styles.retryButtonText}>Erneut versuchen</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Termindetails</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Status Badge */}
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${getStatusColor(appointment.status)}20` },
          ]}
        >
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(appointment.status) }]} />
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(appointment.status) },
            ]}
          >
            {getStatusLabel(appointment.status)}
          </Text>
        </View>
      </View>

      {/* Appointment Info Card */}
      <View style={styles.appointmentCard}>
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Datum & Uhrzeit</Text>
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="calendar" size={20} color="#7C3AED" />
            </View>
            <Text style={styles.infoText}>{formatDate(appointment.starts_at)}</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="time" size={20} color="#7C3AED" />
            </View>
            <Text style={styles.infoText}>
              {formatTime(appointment.starts_at)} - {formatTime(appointment.ends_at)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="hourglass" size={20} color="#7C3AED" />
            </View>
            <Text style={styles.infoText}>{getDuration()}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Dienstleistung</Text>
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="briefcase" size={20} color="#7C3AED" />
            </View>
            <Text style={styles.infoText}>{appointment.service_name}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Kunde</Text>
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="person" size={20} color="#7C3AED" />
            </View>
            <Text style={styles.infoText}>{appointment.customer_name}</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="mail" size={20} color="#7C3AED" />
            </View>
            <Text style={styles.infoText}>{appointment.customer_email}</Text>
          </View>
          {appointment.customer_phone && (
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="call" size={20} color="#7C3AED" />
              </View>
              <Text style={styles.infoText}>{appointment.customer_phone}</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Mitarbeiter</Text>
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="people" size={20} color="#7C3AED" />
            </View>
            <Text style={styles.infoText}>{appointment.staff_name}</Text>
          </View>
        </View>

        {appointment.notes && (
          <>
            <View style={styles.divider} />
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Notizen</Text>
              <View style={styles.notesBox}>
                <Text style={styles.notesText}>{appointment.notes}</Text>
              </View>
            </View>
          </>
        )}
      </View>

      {/* Actions */}
      {(hasEditPermission || hasDeletePermission) && (
        <View style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Aktionen</Text>

          {hasEditPermission && (
            <>
              <Text style={styles.actionSubtitle}>Status ändern</Text>
              <View style={styles.statusButtons}>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    appointment.status === "pending" && styles.statusButtonActive,
                    { borderColor: "#F59E0B" },
                  ]}
                  onPress={() => handleStatusChange("pending")}
                >
                  <Ionicons
                    name="time"
                    size={20}
                    color={appointment.status === "pending" ? "#F59E0B" : "#6B7280"}
                  />
                  <Text
                    style={[
                      styles.statusButtonText,
                      appointment.status === "pending" && { color: "#F59E0B" },
                    ]}
                  >
                    Ausstehend
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    appointment.status === "confirmed" && styles.statusButtonActive,
                    { borderColor: "#10B981" },
                  ]}
                  onPress={() => handleStatusChange("confirmed")}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={appointment.status === "confirmed" ? "#10B981" : "#6B7280"}
                  />
                  <Text
                    style={[
                      styles.statusButtonText,
                      appointment.status === "confirmed" && { color: "#10B981" },
                    ]}
                  >
                    Bestätigt
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    appointment.status === "cancelled" && styles.statusButtonActive,
                    { borderColor: "#EF4444" },
                  ]}
                  onPress={() => handleStatusChange("cancelled")}
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={appointment.status === "cancelled" ? "#EF4444" : "#6B7280"}
                  />
                  <Text
                    style={[
                      styles.statusButtonText,
                      appointment.status === "cancelled" && { color: "#EF4444" },
                    ]}
                  >
                    Abgesagt
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {hasDeletePermission && (
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAppointment}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
              <Text style={styles.deleteButtonText}>Termin löschen</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    paddingTop: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1E1E1E",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  noPermissionContainer: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 40,
    margin: 24,
    alignItems: "center",
    gap: 16,
  },
  noPermissionIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#2A2A2A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  noPermissionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  noPermissionText: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 24,
  },
  errorCard: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 16,
    padding: 40,
    margin: 24,
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#7C3AED",
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  statusContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  appointmentCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  infoSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(124, 58, 237, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  infoText: {
    fontSize: 15,
    color: "#E5E7EB",
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#2A2A2A",
    marginVertical: 16,
  },
  notesBox: {
    backgroundColor: "#2A2A2A",
    borderRadius: 12,
    padding: 16,
  },
  notesText: {
    fontSize: 14,
    color: "#9CA3AF",
    lineHeight: 20,
  },
  actionsCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  actionSubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 12,
    marginTop: 8,
  },
  statusButtons: {
    gap: 12,
    marginBottom: 16,
  },
  statusButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#2A2A2A",
    backgroundColor: "#121212",
  },
  statusButtonActive: {
    backgroundColor: "rgba(124, 58, 237, 0.05)",
  },
  statusButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
    marginTop: 8,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#EF4444",
  },
});
