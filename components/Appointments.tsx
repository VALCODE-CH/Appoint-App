import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { API, Appointment } from "../services/api";
import { StorageService } from "../services/storage";
import { CreateAppointment } from "./CreateAppointment";

interface GroupedAppointments {
  heute: Appointment[];
  morgen: Appointment[];
  zukunft: Appointment[];
}

export function Appointments() {
  const [appointments, setAppointments] = useState<GroupedAppointments>({
    heute: [],
    morgen: [],
    zukunft: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [hasViewPermission, setHasViewPermission] = useState(true);
  const [hasCreatePermission, setHasCreatePermission] = useState(true);
  const [hasEditPermission, setHasEditPermission] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    checkPermissionsAndLoadAppointments();
  }, []);

  const checkPermissionsAndLoadAppointments = async () => {
    try {
      const staffData = await StorageService.getStaffData();
      const canViewAllAppointments = staffData?.permissions?.can_view_all_appointments ?? true;
      const canCreateAppointments = staffData?.permissions?.can_create_appointments ?? true;
      const canEditAppointments = staffData?.permissions?.can_edit_appointments ?? true;

      setHasViewPermission(canViewAllAppointments);
      setHasCreatePermission(canCreateAppointments);
      setHasEditPermission(canEditAppointments);

      if (canViewAllAppointments) {
        await loadAppointments();
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error checking permissions:", err);
      setIsLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      setError("");
      const staff = await StorageService.getStaffData();

      if (!staff) {
        setError("Staff-Daten nicht gefunden");
        setIsLoading(false);
        return;
      }

      // Hole alle Termine ab heute
      const today = new Date();
      const startOfToday = formatDate(today) + " 00:00:00";

      // Hole Termine für die nächsten 30 Tage
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + 30);
      const endOfFuture = formatDate(futureDate) + " 23:59:59";

      const allAppointments = await API.getAppointments({
        staff_id: staff.id,
        start: startOfToday,
        end: endOfFuture,
      });

      // Gruppiere Termine nach Datum
      const grouped = groupAppointmentsByDate(allAppointments, today);
      setAppointments(grouped);

    } catch (err: any) {
      console.error("Error loading appointments:", err);
      setError("Fehler beim Laden der Termine");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const groupAppointmentsByDate = (appointments: Appointment[], today: Date): GroupedAppointments => {
    const grouped: GroupedAppointments = {
      heute: [],
      morgen: [],
      zukunft: []
    };

    const todayStr = formatDate(today);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = formatDate(tomorrow);

    appointments.forEach((apt) => {
      const aptDate = apt.starts_at.split(" ")[0];

      if (aptDate === todayStr) {
        grouped.heute.push(apt);
      } else if (aptDate === tomorrowStr) {
        grouped.morgen.push(apt);
      } else {
        grouped.zukunft.push(apt);
      }
    });

    // Sortiere jede Gruppe nach Zeit
    grouped.heute.sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
    grouped.morgen.sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
    grouped.zukunft.sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

    return grouped;
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const formatDisplayDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit'
    };
    return date.toLocaleDateString('de-DE', options);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return { bg: "rgba(74, 222, 128, 0.2)", text: "#4ADE80", label: "Bestätigt" };
      case 'pending':
        return { bg: "rgba(251, 146, 60, 0.2)", text: "#FB923C", label: "Ausstehend" };
      case 'cancelled':
        return { bg: "rgba(239, 68, 68, 0.2)", text: "#EF4444", label: "Abgesagt" };
      default:
        return { bg: "rgba(156, 163, 175, 0.2)", text: "#9CA3AF", label: status };
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    checkPermissionsAndLoadAppointments();
  };

  const totalAppointments = appointments.heute.length + appointments.morgen.length + appointments.zukunft.length;

  const handleCreateSuccess = () => {
    // Lade Termine neu nach erfolgreichem Erstellen
    checkPermissionsAndLoadAppointments();
  };

  const renderAppointmentCard = (appointment: Appointment, dateLabel: string) => {
    const statusStyle = getStatusColor(appointment.status);

    return (
      <TouchableOpacity
        key={appointment.id}
        style={[
          styles.appointmentCard,
          !hasEditPermission && styles.appointmentCardDisabled
        ]}
        disabled={!hasEditPermission}
        activeOpacity={hasEditPermission ? 0.7 : 1}
      >
        <View style={styles.appointmentHeader}>
          <View style={styles.dateTimeContainer}>
            <Text style={styles.timeText}>{formatTime(appointment.starts_at)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {statusStyle.label}
            </Text>
          </View>
        </View>
        <View style={styles.appointmentBody}>
          <Text style={styles.customerName}>{appointment.customer_name}</Text>
          <Text style={styles.serviceName}>{appointment.service_name}</Text>
          <View style={styles.staffContainer}>
            <Ionicons name="person-outline" size={16} color="#A78BFA" />
            <Text style={styles.staffName}>{appointment.staff_name}</Text>
          </View>
        </View>
        {hasEditPermission ? (
          <Ionicons name="chevron-forward" size={20} color="#6B7280" style={styles.chevronIcon} />
        ) : (
          <View style={styles.lockIconContainer}>
            <Ionicons name="lock-closed" size={16} color="#6B7280" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Zeige CreateAppointment-Formular wenn aktiv
  if (showCreateForm) {
    return (
      <CreateAppointment
        onBack={() => setShowCreateForm(false)}
        onSuccess={handleCreateSuccess}
      />
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C3AED" />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Termine</Text>
          <Text style={styles.subtitle}>
            {isLoading ? "Lade..." : `${totalAppointments} Termine`}
          </Text>
        </View>
      </View>

      {/* Add Button - nur anzeigen wenn Berechtigung vorhanden */}
      {hasCreatePermission && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateForm(true)}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Neuer Termin</Text>
        </TouchableOpacity>
      )}

      {/* No Permission State */}
      {!hasViewPermission ? (
        <View style={styles.noPermissionContainer}>
          <View style={styles.noPermissionIcon}>
            <Ionicons name="lock-closed" size={64} color="#6B7280" />
          </View>
          <Text style={styles.noPermissionTitle}>Keine Berechtigung</Text>
          <Text style={styles.noPermissionText}>
            Du hast keine Berechtigung, Termine anzuzeigen.
          </Text>
          <Text style={styles.noPermissionHint}>
            Kontaktiere den Administrator, um Zugriff zu erhalten.
          </Text>
        </View>
      ) : isLoading ? (
        /* Loading State */
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>Lade Termine...</Text>
        </View>
      ) : error ? (
        /* Error State */
        <View style={styles.errorCard}>
          <Ionicons name="alert-circle" size={24} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadAppointments}>
            <Text style={styles.retryButtonText}>Erneut versuchen</Text>
          </TouchableOpacity>
        </View>
      ) : totalAppointments === 0 ? (
        /* Empty State */
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={48} color="#6B7280" />
          <Text style={styles.emptyText}>Keine bevorstehenden Termine</Text>
          <Text style={styles.emptySubtext}>
            Erstelle einen neuen Termin mit dem Button oben
          </Text>
        </View>
      ) : (
        /* Appointments List */
        <View style={styles.appointmentsList}>
          {/* Heute */}
          {appointments.heute.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Ionicons name="today" size={20} color="#60A5FA" />
                <Text style={styles.sectionTitle}>Heute ({appointments.heute.length})</Text>
              </View>
              {appointments.heute.map((apt) =>
                renderAppointmentCard(apt, formatTime(apt.starts_at))
              )}
            </View>
          )}

          {/* Morgen */}
          {appointments.morgen.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Ionicons name="calendar" size={20} color="#FB923C" />
                <Text style={styles.sectionTitle}>Morgen ({appointments.morgen.length})</Text>
              </View>
              {appointments.morgen.map((apt) =>
                renderAppointmentCard(apt, formatTime(apt.starts_at))
              )}
            </View>
          )}

          {/* Zukunft */}
          {appointments.zukunft.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Ionicons name="time" size={20} color="#A78BFA" />
                <Text style={styles.sectionTitle}>Kommende ({appointments.zukunft.length})</Text>
              </View>
              {appointments.zukunft.map((apt) =>
                renderAppointmentCard(apt, formatDisplayDate(apt.starts_at))
              )}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  addButton: {
    backgroundColor: "#7C3AED",
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
    shadowColor: "#7C3AED",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  errorCard: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  errorText: {
    fontSize: 14,
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
  emptyContainer: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
  appointmentsList: {
    gap: 24,
  },
  sectionContainer: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  noPermissionContainer: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    gap: 16,
    borderWidth: 2,
    borderColor: "#2A2A2A",
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
  noPermissionHint: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 8,
  },
  appointmentCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    position: "relative",
  },
  appointmentCardDisabled: {
    opacity: 0.7,
  },
  lockIconContainer: {
    position: "absolute",
    right: 16,
    top: "50%",
    marginTop: -10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  chevronIcon: {
    position: "absolute",
    right: 16,
    top: "50%",
    marginTop: -10,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  dateTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dateText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  timeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#60A5FA",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  appointmentBody: {
    gap: 4,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 8,
  },
  staffContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  staffName: {
    fontSize: 14,
    color: "#9CA3AF",
  },
});
