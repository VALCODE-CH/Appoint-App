import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

interface StaffListProps {
  onStaffClick: (staffId: number) => void;
}

export function StaffList({ onStaffClick }: StaffListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const staff = [
    { id: 1, name: "Emma Wilson", role: "Senior Stylist", avatar: "EW", status: "active", color: "#A78BFA" },
    { id: 2, name: "James Miller", role: "Barber", avatar: "JM", status: "active", color: "#60A5FA" },
    { id: 3, name: "Sophia Davis", role: "Colorist", avatar: "SD", status: "active", color: "#EC4899" },
    { id: 4, name: "Oliver Brown", role: "Junior Stylist", avatar: "OB", status: "off", color: "#4ADE80" },
  ];

  const filteredStaff = staff.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Staff</Text>
        <Text style={styles.subtitle}>Manage your team</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search staff..."
          placeholderTextColor="#6B7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Add Staff Member</Text>
      </TouchableOpacity>

      {/* Staff List */}
      <View style={styles.staffList}>
        {filteredStaff.map((member) => (
          <TouchableOpacity
            key={member.id}
            onPress={() => onStaffClick(member.id)}
            style={styles.staffCard}
          >
            <View style={styles.staffCardContent}>
              <View style={[styles.avatar, { backgroundColor: member.color }]}>
                <Text style={styles.avatarText}>{member.avatar}</Text>
              </View>
              <View style={styles.staffInfo}>
                <Text style={styles.staffName}>{member.name}</Text>
                <Text style={styles.staffRole}>{member.role}</Text>
              </View>
              <View style={styles.staffStatus}>
                <View style={[
                  styles.statusBadge,
                  member.status === "active" ? styles.statusActive : styles.statusOff
                ]}>
                  <Text style={[
                    styles.statusText,
                    member.status === "active" ? styles.statusTextActive : styles.statusTextOff
                  ]}>
                    {member.status === "active" ? "Active" : "Off"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
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
  searchContainer: {
    position: "relative",
    marginBottom: 16,
  },
  searchIcon: {
    position: "absolute",
    left: 16,
    top: 14,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    paddingLeft: 48,
    paddingRight: 16,
    paddingVertical: 12,
    color: "#FFFFFF",
    fontSize: 16,
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
  staffList: {
    gap: 12,
  },
  staffCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  staffCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  staffRole: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  staffStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: "rgba(74, 222, 128, 0.2)",
  },
  statusOff: {
    backgroundColor: "rgba(156, 163, 175, 0.2)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusTextActive: {
    color: "#4ADE80",
  },
  statusTextOff: {
    color: "#9CA3AF",
  },
});
