import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { API, Service } from "../services/api";

export function ServicesList() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setError("");
      const servicesData = await API.getServices();

      // Sortiere nach Namen
      servicesData.sort((a, b) => a.name.localeCompare(b.name));

      setServices(servicesData);
    } catch (err: any) {
      console.error("Error loading services:", err);
      setError("Fehler beim Laden der Dienstleistungen");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadServices();
  };

  const formatDuration = (minutes: string): string => {
    const mins = parseInt(minutes);
    if (mins < 60) {
      return `${mins} Min.`;
    } else {
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      if (remainingMins === 0) {
        return `${hours} ${hours === 1 ? 'Std.' : 'Std.'}`;
      } else {
        return `${hours} Std. ${remainingMins} Min.`;
      }
    }
  };

  const formatPrice = (price: string): string => {
    const numPrice = parseFloat(price);
    return `CHF ${numPrice.toFixed(2)}`;
  };

  const getServiceIcon = (serviceName: string): string => {
    const name = serviceName.toLowerCase();

    // Haarschnitte
    if (name.includes('haircut') || name.includes('schnitt') || name.includes('frisur')) {
      return 'cut-outline';
    }
    // Farbe / Färben
    if (name.includes('color') || name.includes('färb') || name.includes('farb')) {
      return 'color-palette-outline';
    }
    // Waschen
    if (name.includes('wash') || name.includes('wasch')) {
      return 'water-outline';
    }
    // Massage
    if (name.includes('massage')) {
      return 'hand-left-outline';
    }
    // Gesicht / Facial
    if (name.includes('facial') || name.includes('gesicht')) {
      return 'happy-outline';
    }
    // Nägel / Maniküre
    if (name.includes('nail') || name.includes('maniküre') || name.includes('pediküre')) {
      return 'hand-right-outline';
    }
    // Bart
    if (name.includes('beard') || name.includes('bart')) {
      return 'cut-outline';
    }
    // Standard Icon für Dienstleistungen
    return 'sparkles-outline';
  };

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
          <Text style={styles.title}>Dienstleistungen</Text>
          <Text style={styles.subtitle}>
            {isLoading ? "Lade..." : `${services.length} Dienstleistungen`}
          </Text>
        </View>
      </View>

      {/* Add Button */}
      {/*
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Neue Dienstleistung</Text>
      </TouchableOpacity>
      */}

      {/* Loading State */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>Lade Dienstleistungen...</Text>
        </View>
      ) : error ? (
        /* Error State */
        <View style={styles.errorCard}>
          <Ionicons name="alert-circle" size={24} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadServices}>
            <Text style={styles.retryButtonText}>Erneut versuchen</Text>
          </TouchableOpacity>
        </View>
      ) : services.length === 0 ? (
        /* Empty State */
        <View style={styles.emptyContainer}>
          <Ionicons name="briefcase-outline" size={48} color="#6B7280" />
          <Text style={styles.emptyText}>Keine Dienstleistungen</Text>
          <Text style={styles.emptySubtext}>
            Füge deine erste Dienstleistung hinzu
          </Text>
        </View>
      ) : (
        /* Services List */
        <View style={styles.servicesList}>
          {services.map((service) => (
            <TouchableOpacity key={service.id} style={styles.serviceCard}>
              <View style={styles.serviceIcon}>
                <Ionicons name={getServiceIcon(service.name) as any} size={24} color="#7C3AED" />
              </View>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <View style={styles.serviceDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                    <Text style={styles.serviceDuration}>{formatDuration(service.duration_minutes)}</Text>
                  </View>
                  <Text style={styles.serviceDivider}>•</Text>
                  <View style={styles.detailItem}>
                    <Ionicons name="cash-outline" size={14} color="#4ADE80" />
                    <Text style={styles.servicePrice}>{formatPrice(service.price)}</Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          ))}
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
    width: 56,
    height: 56,
    borderRadius: 28,
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
    marginBottom: 8,
  },
  serviceDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  serviceDuration: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  serviceDivider: {
    fontSize: 14,
    color: "#6B7280",
  },
  servicePrice: {
    fontSize: 14,
    color: "#4ADE80",
    fontWeight: "600",
  },
});
