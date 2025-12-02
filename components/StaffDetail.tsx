import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface StaffDetailProps {
  staffId: number | null;
  onBack: () => void;
}

export function StaffDetail({ staffId, onBack }: StaffDetailProps) {
  const staffData = {
    1: { name: "Emma Wilson", role: "Senior Stylist", avatar: "EW", color: "#A78BFA" },
    2: { name: "James Miller", role: "Barber", avatar: "JM", color: "#60A5FA" },
    3: { name: "Sophia Davis", role: "Colorist", avatar: "SD", color: "#EC4899" },
    4: { name: "Oliver Brown", role: "Junior Stylist", avatar: "OB", color: "#4ADE80" },
  };

  const staff = staffId ? staffData[staffId as keyof typeof staffData] : null;

  if (!staff) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Staff member not found</Text>
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
        <Text style={styles.title}>Staff Details</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Profile */}
      <View style={styles.profileSection}>
        <View style={[styles.avatar, { backgroundColor: staff.color }]}>
          <Text style={styles.avatarText}>{staff.avatar}</Text>
        </View>
        <Text style={styles.name}>{staff.name}</Text>
        <Text style={styles.role}>{staff.role}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>24</Text>
          <Text style={styles.statLabel}>Appointments Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>$1,240</Text>
          <Text style={styles.statLabel}>Revenue This Week</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>View Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="create-outline" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Edit Details</Text>
        </TouchableOpacity>
      </View>
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
  profileSection: {
    alignItems: "center",
    padding: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
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
    marginBottom: 8,
  },
  role: {
    fontSize: 16,
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
    padding: 16,
    alignItems: "center",
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
    textAlign: "center",
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
  errorText: {
    color: "#9CA3AF",
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
  },
});
