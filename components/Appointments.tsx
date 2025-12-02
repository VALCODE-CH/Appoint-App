import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function Appointments() {
  const appointments = [
    { id: 1, date: "Today", time: "09:00", customer: "Sarah Johnson", service: "Haircut & Style", staff: "Emma Wilson", status: "confirmed" },
    { id: 2, date: "Today", time: "10:30", customer: "Michael Chen", service: "Men's Haircut", staff: "James Miller", status: "confirmed" },
    { id: 3, date: "Today", time: "14:00", customer: "Lisa Anderson", service: "Color Treatment", staff: "Emma Wilson", status: "pending" },
    { id: 4, date: "Tomorrow", time: "09:00", customer: "David Brown", service: "Beard Trim", staff: "James Miller", status: "confirmed" },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Bookings</Text>
        <Text style={styles.subtitle}>Manage appointments</Text>
      </View>

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text style={styles.addButtonText}>New Booking</Text>
      </TouchableOpacity>

      {/* Appointments List */}
      <View style={styles.appointmentsList}>
        {appointments.map((appointment) => (
          <TouchableOpacity key={appointment.id} style={styles.appointmentCard}>
            <View style={styles.appointmentHeader}>
              <View style={styles.dateTimeContainer}>
                <Text style={styles.dateText}>{appointment.date}</Text>
                <Text style={styles.timeText}>{appointment.time}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                appointment.status === "confirmed" ? styles.statusConfirmed : styles.statusPending
              ]}>
                <Text style={[
                  styles.statusText,
                  appointment.status === "confirmed" ? styles.statusTextConfirmed : styles.statusTextPending
                ]}>
                  {appointment.status === "confirmed" ? "Confirmed" : "Pending"}
                </Text>
              </View>
            </View>
            <View style={styles.appointmentBody}>
              <Text style={styles.customerName}>{appointment.customer}</Text>
              <Text style={styles.serviceName}>{appointment.service}</Text>
              <View style={styles.staffContainer}>
                <Ionicons name="person-outline" size={16} color="#A78BFA" />
                <Text style={styles.staffName}>{appointment.staff}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
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
  statusConfirmed: {
    backgroundColor: "rgba(74, 222, 128, 0.2)",
  },
  statusPending: {
    backgroundColor: "rgba(251, 146, 60, 0.2)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusTextConfirmed: {
    color: "#4ADE80",
  },
  statusTextPending: {
    color: "#FB923C",
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
