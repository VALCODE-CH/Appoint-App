import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { API, Staff, Appointment } from "../services/api";

interface StaffDetailProps {
  staffId: number | null;
  onBack: () => void;
}

export function StaffDetail({ staffId, onBack }: StaffDetailProps) {
  const [staff, setStaff] = useState<Staff | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    todayCount: 0,
    weekRevenue: 0,
  });

  useEffect(() => {
    if (staffId) {
      loadStaffDetail();
    }
  }, [staffId]);

  const loadStaffDetail = async () => {
    if (!staffId) return;

    try {
      setError("");
      const staffData = await API.getStaffMember(staffId.toString());
      setStaff(staffData);

      // Lade heutige Termine
      const today = new Date();
      const startOfDay = formatDate(today) + " 00:00:00";
      const endOfDay = formatDate(today) + " 23:59:59";

      const todayAppointments = await API.getAppointments({
        staff_id: staffId.toString(),
        start: startOfDay,
        end: endOfDay,
      });

      // Lade Wochen-Termine
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const weekAppointments = await API.getAppointments({
        staff_id: staffId.toString(),
        start: formatDate(startOfWeek) + " 00:00:00",
        end: formatDate(endOfWeek) + " 23:59:59",
      });

      setAppointments(todayAppointments);
      setStats({
        todayCount: todayAppointments.length,
        weekRevenue: 0, // Wird später berechnet wenn Service-Preise verfügbar
      });
    } catch (err: any) {
      console.error("Error loading staff detail:", err);
      setError("Fehler beim Laden der Mitarbeiter-Details");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getInitials = (name: string): string => {
    const nameParts = name.split(" ");
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Personal Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>Lade Details...</Text>
        </View>
      </View>
    );
  }

  if (error || !staff) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Personal Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error || "Mitarbeiter nicht gefunden"}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadStaffDetail}>
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
        <Text style={styles.title}>Personal Details</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Profile */}
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(staff.name)}</Text>
        </View>
        <Text style={styles.name}>{staff.name}</Text>
        <View style={styles.contactInfo}>
          <View style={styles.contactRow}>
            <Ionicons name="mail-outline" size={16} color="#9CA3AF" />
            <Text style={styles.contactText}>{staff.email}</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="call-outline" size={16} color="#9CA3AF" />
            <Text style={styles.contactText}>{staff.phone}</Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="calendar-outline" size={24} color="#60A5FA" />
          </View>
          <Text style={styles.statValue}>{stats.todayCount}</Text>
          <Text style={styles.statLabel}>Termine heute</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="time-outline" size={24} color="#A78BFA" />
          </View>
          <Text style={styles.statValue}>{appointments.length}</Text>
          <Text style={styles.statLabel}>Gesamt heute</Text>
        </View>
      </View>

      {/* Todays Appointments */}
      {appointments.length > 0 && (
        <View style={styles.appointmentsSection}>
          <Text style={styles.sectionTitle}>Heutige Termine</Text>
          {appointments.slice(0, 3).map((apt) => (
            <View key={apt.id} style={styles.appointmentCard}>
              <View style={styles.appointmentInfo}>
                <Text style={styles.appointmentCustomer}>{apt.customer_name}</Text>
                <Text style={styles.appointmentService}>{apt.service_name}</Text>
              </View>
              <Text style={styles.appointmentTime}>
                {new Date(apt.starts_at).toLocaleTimeString('de-DE', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          ))}
          {appointments.length > 3 && (
            <Text style={styles.moreText}>+{appointments.length - 3} weitere Termine</Text>
          )}
        </View>
      )}

      {/* Action Buttons */}
      {/*
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Terminplan anzeigen</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="create-outline" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Details bearbeiten</Text>
        </TouchableOpacity>
      </View>
      */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    gap: 16,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 16,
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
  profileSection: {
    alignItems: "center",
    padding: 24,
    paddingTop: 0,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  contactInfo: {
    gap: 8,
    alignItems: "center",
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
  statsSection: {
    flexDirection: "row",
    gap: 16,
    padding: 24,
    paddingTop: 0,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(124, 58, 237, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
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
  appointmentsSection: {
    padding: 24,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  appointmentCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentCustomer: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  appointmentService: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  appointmentTime: {
    fontSize: 16,
    fontWeight: "600",
    color: "#60A5FA",
  },
  moreText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 8,
  },
  actions: {
    gap: 12,
    padding: 24,
    paddingTop: 0,
  },
  actionButton: {
    backgroundColor: "#7C3AED",
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
