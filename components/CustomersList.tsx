import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { API, Customer } from "../services/api";

interface CustomerWithStats extends Customer {
  fullName: string;
  initials: string;
}

export function CustomersList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setError("");
      const customersData = await API.getCustomers();

      // Verarbeite Kundendaten
      const processedCustomers: CustomerWithStats[] = customersData.map((customer) => ({
        ...customer,
        fullName: `${customer.first_name} ${customer.last_name}`,
        initials: `${(customer.first_name[0] ? customer.first_name[0] : '')}${(customer.last_name[0] ? customer.last_name[0] : '')}`.toUpperCase(),
      }));

      // Sortiere nach Namen
      processedCustomers.sort((a, b) => a.fullName.localeCompare(b.fullName));

      setCustomers(processedCustomers);
    } catch (err: any) {
      console.error("Error loading customers:", err);
      setError("Fehler beim Laden der Kunden");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCustomers();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Heute";
    } else if (diffDays === 1) {
      return "Gestern";
    } else if (diffDays < 7) {
      return `vor ${diffDays} Tagen`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `vor ${weeks} ${weeks === 1 ? 'Woche' : 'Wochen'}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `vor ${months} ${months === 1 ? 'Monat' : 'Monaten'}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `vor ${years} ${years === 1 ? 'Jahr' : 'Jahren'}`;
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

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
          <Text style={styles.title}>Kunden</Text>
          <Text style={styles.subtitle}>
            {isLoading ? "Lade..." : `${customers.length} Kunden`}
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Kunden suchen..."
          placeholderTextColor="#6B7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery("")}
          >
            <Ionicons name="close-circle" size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Neuer Kunde</Text>
      </TouchableOpacity>

      {/* Loading State */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>Lade Kunden...</Text>
        </View>
      ) : error ? (
        /* Error State */
        <View style={styles.errorCard}>
          <Ionicons name="alert-circle" size={24} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadCustomers}>
            <Text style={styles.retryButtonText}>Erneut versuchen</Text>
          </TouchableOpacity>
        </View>
      ) : filteredCustomers.length === 0 ? (
        /* Empty State */
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={48} color="#6B7280" />
          <Text style={styles.emptyText}>
            {searchQuery ? "Keine Kunden gefunden" : "Noch keine Kunden"}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchQuery
              ? "Versuche einen anderen Suchbegriff"
              : "Füge deinen ersten Kunden hinzu"}
          </Text>
        </View>
      ) : (
        /* Customers List */
        <View style={styles.customersList}>
          {filteredCustomers.map((customer) => (
            <TouchableOpacity key={customer.id} style={styles.customerCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{customer.initials}</Text>
              </View>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{customer.fullName}</Text>
                <View style={styles.contactRow}>
                  <Ionicons name="mail-outline" size={14} color="#9CA3AF" />
                  <Text style={styles.customerEmail}>{customer.email}</Text>
                </View>
                <View style={styles.contactRow}>
                  <Ionicons name="call-outline" size={14} color="#9CA3AF" />
                  <Text style={styles.customerPhone}>{customer.phone}</Text>
                </View>
                <View style={styles.customerMeta}>
                  <Ionicons name="calendar-outline" size={12} color="#6B7280" />
                  <Text style={styles.metaText}>Erstellt: {formatDate(customer.created_at)}</Text>
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
    paddingRight: 48,
    paddingVertical: 12,
    color: "#FFFFFF",
    fontSize: 16,
    borderWidth: 2,
    borderColor: "#2A2A2A",
  },
  clearButton: {
    position: "absolute",
    right: 16,
    top: 14,
    zIndex: 1,
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
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  customerInfo: {
    flex: 1,
    gap: 4,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  customerEmail: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  customerPhone: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  customerMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#6B7280",
  },
});
