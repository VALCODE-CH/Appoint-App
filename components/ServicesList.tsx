import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function ServicesList() {
  const services = [
    { id: 1, name: "Haircut & Style", duration: "45 min", price: "$50", icon: "cut-outline" },
    { id: 2, name: "Men's Haircut", duration: "30 min", price: "$35", icon: "cut-outline" },
    { id: 3, name: "Color Treatment", duration: "90 min", price: "$120", icon: "color-palette-outline" },
    { id: 4, name: "Beard Trim", duration: "20 min", price: "$25", icon: "cut-outline" },
    { id: 5, name: "Hair Wash", duration: "15 min", price: "$15", icon: "water-outline" },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Services</Text>
        <Text style={styles.subtitle}>Manage your offerings</Text>
      </View>

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Add Service</Text>
      </TouchableOpacity>

      {/* Services List */}
      <View style={styles.servicesList}>
        {services.map((service) => (
          <TouchableOpacity key={service.id} style={styles.serviceCard}>
            <View style={styles.serviceIcon}>
              <Ionicons name={service.icon as any} size={24} color="#7C3AED" />
            </View>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <View style={styles.serviceDetails}>
                <Text style={styles.serviceDuration}>{service.duration}</Text>
                <Text style={styles.serviceDivider}>•</Text>
                <Text style={styles.servicePrice}>{service.price}</Text>
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
  servicesList: {
    gap: 12,
  },
  serviceCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 12,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(124, 58, 237, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  serviceDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  serviceDuration: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  serviceDivider: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  servicePrice: {
    fontSize: 14,
    color: "#4ADE80",
    fontWeight: "600",
  },
});
