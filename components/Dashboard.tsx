import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface DashboardProps {
  onNavigateToSettings: () => void;
}

export function Dashboard({ onNavigateToSettings }: DashboardProps) {
  const todayAppointments = [
    { id: 1, time: "09:00", customer: "Sarah Johnson", service: "Haircut & Style", staff: "Emma Wilson" },
    { id: 2, time: "10:30", customer: "Michael Chen", service: "Men's Haircut", staff: "James Miller" },
    { id: 3, time: "11:00", customer: "Lisa Anderson", service: "Color Treatment", staff: "Emma Wilson" },
    { id: 4, time: "14:00", customer: "David Brown", service: "Beard Trim", staff: "James Miller" },
  ];

  const stats = [
    { label: "Today's Revenue", value: "$850", icon: "cash-outline", color: "#4ADE80" },
    { label: "Appointments", value: "12", icon: "calendar-outline", color: "#60A5FA" },
    { label: "Active Customers", value: "48", icon: "people-outline", color: "#A78BFA" },
    { label: "This Month", value: "+24%", icon: "trending-up-outline", color: "#FB923C" },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Monday, November 24, 2025</Text>
        </View>
        <TouchableOpacity
          onPress={onNavigateToSettings}
          style={styles.settingsButton}
        >
          <Ionicons name="settings-outline" size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={stat.label} style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name={stat.icon as any} size={20} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Today's Appointments */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Appointments</Text>
        <View style={styles.appointmentsList}>
          {todayAppointments.map((appointment) => (
            <View key={appointment.id} style={styles.appointmentCard}>
              <View style={styles.appointmentHeader}>
                <View style={styles.appointmentInfo}>
                  <Text style={styles.customerName}>{appointment.customer}</Text>
                  <Text style={styles.serviceName}>{appointment.service}</Text>
                </View>
                <Text style={styles.appointmentTime}>{appointment.time}</Text>
              </View>
              <View style={styles.appointmentFooter}>
                <View style={styles.staffIconContainer}>
                  <Ionicons name="person-outline" size={16} color="#A78BFA" />
                </View>
                <Text style={styles.staffName}>{appointment.staff}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1E1E1E",
    justifyContent: "center",
    alignItems: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    width: "47%",
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 16,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
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
    alignItems: "flex-start",
    marginBottom: 12,
  },
  appointmentInfo: {
    flex: 1,
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
  },
  appointmentTime: {
    fontSize: 14,
    color: "#60A5FA",
    fontWeight: "600",
  },
  appointmentFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#2A2A2A",
    gap: 8,
  },
  staffIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(167, 139, 250, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  staffName: {
    fontSize: 14,
    color: "#9CA3AF",
  },
});
