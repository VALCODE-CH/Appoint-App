import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { API, Customer, Appointment } from "../services/api";
import { StorageService } from "../services/storage";

interface CustomerDetailProps {
  customerId: string | null;
  onBack: () => void;
}

export function CustomerDetail({ customerId, onBack }: CustomerDetailProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasViewPermission, setHasViewPermission] = useState(true);
  const [hasEditPermission, setHasEditPermission] = useState(true);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    totalSpent: 0,
  });

  useEffect(() => {
    if (customerId) {
      checkPermissionsAndLoadDetail();
    }
  }, [customerId]);

  const checkPermissionsAndLoadDetail = async () => {
    try {
      const staffData = await StorageService.getStaffData();
      const canViewCustomers = staffData?.permissions?.can_view_customers ?? true;
      const canEditCustomers = staffData?.permissions?.can_edit_customers ?? true;

      setHasViewPermission(canViewCustomers);
      setHasEditPermission(canEditCustomers);

      if (canViewCustomers) {
        await loadCustomerDetail();
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error checking permissions:", err);
      setIsLoading(false);
    }
  };

  const loadCustomerDetail = async () => {
    if (!customerId) return;

    try {
      setIsLoading(true);
      setError("");

      // Lade Kundendaten
      const customerData = await API.getCustomer(customerId);
      setCustomer(customerData);

      // Lade Termine des Kunden
      const allAppointments = await API.getAppointments();
      const customerAppointments = allAppointments.filter(
        (apt) => apt.customer_email === customerData.email
      );

      // Sortiere Termine nach Datum (neueste zuerst)
      customerAppointments.sort((a, b) =>
        new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()
      );

      setAppointments(customerAppointments);

      // Berechne Statistiken
      const now = new Date();
      const upcoming = customerAppointments.filter(
        (apt) => new Date(apt.starts_at) > now
      );

      setStats({
        totalAppointments: customerAppointments.length,
        upcomingAppointments: upcoming.length,
        totalSpent: 0, // Wird später berechnet wenn Preis-Daten verfügbar sind
      });

    } catch (err: any) {
      console.error("Error loading customer detail:", err);
      setError(err.message || "Fehler beim Laden der Kundendetails");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCustomer = () => {
    if (!customer || !hasEditPermission) return;

    Alert.alert(
      "Kunde löschen",
      `Möchtest du ${customer.first_name} ${customer.last_name} wirklich löschen?`,
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
              await API.deleteCustomer(customerId!);
              Alert.alert("Erfolg", "Kunde wurde erfolgreich gelöscht.");
              onBack();
            } catch (err: any) {
              Alert.alert("Fehler", err.message || "Kunde konnte nicht gelöscht werden.");
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

  const getInitials = (): string => {
    if (!customer) return "?";
    const first = customer.first_name[0] || "";
    const last = customer.last_name[0] || "";
    return `${first}${last}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Lade Kundendetails...</Text>
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
          <Text style={styles.title}>Kundendetails</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.noPermissionContainer}>
          <View style={styles.noPermissionIcon}>
            <Ionicons name="lock-closed" size={64} color="#6B7280" />
          </View>
          <Text style={styles.noPermissionTitle}>Keine Berechtigung</Text>
          <Text style={styles.noPermissionText}>
            Du hast keine Berechtigung, Kundendetails anzuzeigen.
          </Text>
        </View>
      </View>
    );
  }

  if (error || !customer) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Kundendetails</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.errorCard}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error || "Kunde nicht gefunden"}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadCustomerDetail}>
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
        <Text style={styles.title}>Kundendetails</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Customer Info Card */}
      <View style={styles.customerCard}>
        <View style={styles.customerHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </View>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>
              {customer.first_name} {customer.last_name}
            </Text>
            <View style={styles.contactRow}>
              <Ionicons name="mail-outline" size={16} color="#9CA3AF" />
              <Text style={styles.contactText}>{customer.email}</Text>
            </View>
            {customer.phone && (
              <View style={styles.contactRow}>
                <Ionicons name="call-outline" size={16} color="#9CA3AF" />
                <Text style={styles.contactText}>{customer.phone}</Text>
              </View>
            )}
            <View style={styles.contactRow}>
              <Ionicons name="calendar-outline" size={16} color="#9CA3AF" />
              <Text style={styles.contactText}>
                Kunde seit {formatDate(customer.created_at)}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        {hasEditPermission && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteCustomer}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
              <Text style={styles.deleteButtonText}>Löschen</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: "rgba(124, 58, 237, 0.15)" }]}>
            <Ionicons name="calendar" size={24} color="#7C3AED" />
          </View>
          <Text style={styles.statValue}>{stats.totalAppointments}</Text>
          <Text style={styles.statLabel}>Gesamt Termine</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: "rgba(16, 185, 129, 0.15)" }]}>
            <Ionicons name="time" size={24} color="#10B981" />
          </View>
          <Text style={styles.statValue}>{stats.upcomingAppointments}</Text>
          <Text style={styles.statLabel}>Bevorstehend</Text>
        </View>
      </View>

      {/* Appointments Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Termine</Text>

        {appointments.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#6B7280" />
            <Text style={styles.emptyText}>Keine Termine</Text>
            <Text style={styles.emptySubtext}>
              Dieser Kunde hat noch keine Termine gebucht
            </Text>
          </View>
        ) : (
          <View style={styles.appointmentsList}>
            {appointments.map((appointment) => (
              <View key={appointment.id} style={styles.appointmentCard}>
                <View style={styles.appointmentHeader}>
                  <View style={styles.appointmentDate}>
                    <Ionicons name="calendar-outline" size={16} color="#7C3AED" />
                    <Text style={styles.appointmentDateText}>
                      {formatDate(appointment.starts_at)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${getStatusColor(appointment.status)}20` },
                    ]}
                  >
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

                <View style={styles.appointmentDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={16} color="#9CA3AF" />
                    <Text style={styles.detailText}>
                      {formatTime(appointment.starts_at)} - {formatTime(appointment.ends_at)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="briefcase-outline" size={16} color="#9CA3AF" />
                    <Text style={styles.detailText}>{appointment.service_name}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="person-outline" size={16} color="#9CA3AF" />
                    <Text style={styles.detailText}>{appointment.staff_name}</Text>
                  </View>

                  {appointment.notes && (
                    <View style={styles.detailRow}>
                      <Ionicons name="document-text-outline" size={16} color="#9CA3AF" />
                      <Text style={styles.detailText}>{appointment.notes}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
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
  customerCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  customerHeader: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
  },
  customerInfo: {
    flex: 1,
    gap: 8,
  },
  customerName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#2A2A2A",
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
  appointmentsList: {
    gap: 12,
  },
  appointmentCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  appointmentDate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  appointmentDateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
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
  appointmentDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#9CA3AF",
    flex: 1,
  },
});
