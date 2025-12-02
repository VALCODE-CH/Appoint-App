import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

export function CustomersList() {
  const [searchQuery, setSearchQuery] = useState("");

  const customers = [
    { id: 1, name: "Sarah Johnson", phone: "+1 (555) 123-4567", visits: 12, lastVisit: "2 days ago" },
    { id: 2, name: "Michael Chen", phone: "+1 (555) 234-5678", visits: 8, lastVisit: "1 week ago" },
    { id: 3, name: "Lisa Anderson", phone: "+1 (555) 345-6789", visits: 15, lastVisit: "3 days ago" },
    { id: 4, name: "David Brown", phone: "+1 (555) 456-7890", visits: 5, lastVisit: "2 weeks ago" },
  ];

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Customers</Text>
        <Text style={styles.subtitle}>Manage your clients</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search customers..."
          placeholderTextColor="#6B7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Add Customer</Text>
      </TouchableOpacity>

      {/* Customers List */}
      <View style={styles.customersList}>
        {filteredCustomers.map((customer) => (
          <TouchableOpacity key={customer.id} style={styles.customerCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{customer.name[0]}</Text>
            </View>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{customer.name}</Text>
              <Text style={styles.customerPhone}>{customer.phone}</Text>
              <View style={styles.customerMeta}>
                <Text style={styles.metaText}>{customer.visits} visits</Text>
                <Text style={styles.metaDivider}>•</Text>
                <Text style={styles.metaText}>Last: {customer.lastVisit}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
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
  customersList: {
    gap: 12,
  },
  customerCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  customerMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaText: {
    fontSize: 12,
    color: "#6B7280",
  },
  metaDivider: {
    fontSize: 12,
    color: "#6B7280",
  },
});
