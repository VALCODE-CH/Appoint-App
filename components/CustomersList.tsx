import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { API, Customer } from "../services/api";
import { StorageService } from "../services/storage";
import { useTheme } from "../contexts/ThemeContext";

interface CustomerWithStats extends Customer {
  fullName: string;
  initials: string;
}

interface CustomersListProps {
  onCustomerClick?: (customerId: string) => void;
}

export function CustomersList({ onCustomerClick }: CustomersListProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [hasViewPermission, setHasViewPermission] = useState(true);
  const [hasEditPermission, setHasEditPermission] = useState(true);

  useEffect(() => {
    checkPermissionsAndLoadCustomers();
  }, []);

  const checkPermissionsAndLoadCustomers = async () => {
    try {
      const staffData = await StorageService.getStaffData();
      const canViewCustomers = staffData?.permissions?.can_view_customers ?? true;
      const canEditCustomers = staffData?.permissions?.can_edit_customers ?? true;

      setHasViewPermission(canViewCustomers);
      setHasEditPermission(canEditCustomers);

      if (canViewCustomers) {
        await loadCustomers();
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error checking permissions:", err);
      setIsLoading(false);
    }
  };

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
      setError(t('customers.error'));
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    checkPermissionsAndLoadCustomers();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return t('customers.relativeTime.today');
    } else if (diffDays === 1) {
      return t('customers.relativeTime.yesterday');
    } else if (diffDays < 7) {
      return t('customers.relativeTime.daysAgo', { count: diffDays });
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1
        ? t('customers.relativeTime.weekAgo', { count: weeks })
        : t('customers.relativeTime.weeksAgo', { count: weeks });
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return months === 1
        ? t('customers.relativeTime.monthAgo', { count: months })
        : t('customers.relativeTime.monthsAgo', { count: months });
    } else {
      const years = Math.floor(diffDays / 365);
      return years === 1
        ? t('customers.relativeTime.yearAgo', { count: years })
        : t('customers.relativeTime.yearsAgo', { count: years });
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (customer.phone && customer.phone.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('customers.title')}</Text>
          <Text style={styles.subtitle}>
            {isLoading ? t('customers.loading') : t('customers.subtitle', { count: customers.length })}
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('customers.search')}
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
      {/*
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Neuer Kunde</Text>
      </TouchableOpacity>
      */}

      {/* No Permission State */}
      {!hasViewPermission ? (
        <View style={styles.noPermissionContainer}>
          <View style={styles.noPermissionIcon}>
            <Ionicons name="lock-closed" size={64} color="#6B7280" />
          </View>
          <Text style={styles.noPermissionTitle}>{t('customers.noPermission.title')}</Text>
          <Text style={styles.noPermissionText}>
            {t('customers.noPermission.description')}
          </Text>
          <Text style={styles.noPermissionHint}>
            {t('customers.noPermission.hint')}
          </Text>
        </View>
      ) : isLoading ? (
        /* Loading State */
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>{t('customers.loadingCustomers')}</Text>
        </View>
      ) : error ? (
        /* Error State */
        <View style={styles.errorCard}>
          <Ionicons name="alert-circle" size={24} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: theme.primary }]} onPress={loadCustomers}>
            <Text style={styles.retryButtonText}>{t('customers.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : filteredCustomers.length === 0 ? (
        /* Empty State */
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={48} color="#6B7280" />
          <Text style={styles.emptyText}>
            {searchQuery ? t('customers.empty.noResults') : t('customers.empty.noCustomers')}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchQuery
              ? t('customers.empty.tryOtherSearch')
              : t('customers.empty.addFirst')}
          </Text>
        </View>
      ) : (
        /* Customers List */
        <View style={styles.customersList}>
          {filteredCustomers.map((customer) => (
            <TouchableOpacity
              key={customer.id}
              style={[
                styles.customerCard,
                !hasViewPermission && styles.customerCardDisabled
              ]}
              disabled={!hasViewPermission}
              activeOpacity={hasViewPermission ? 0.7 : 1}
              onPress={() => onCustomerClick && onCustomerClick(customer.id)}
            >
              <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
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
                  <Text style={styles.metaText}>{t('customers.created')}: {formatDate(customer.created_at)}</Text>
                </View>
              </View>
              {hasViewPermission ? (
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              ) : (
                <View style={styles.lockIconContainer}>
                  <Ionicons name="lock-closed" size={16} color="#6B7280" />
                </View>
              )}
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
  noPermissionContainer: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    gap: 16,
    borderWidth: 2,
    borderColor: "#2A2A2A",
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
  noPermissionHint: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 8,
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
  customerCardDisabled: {
    opacity: 0.7,
  },
  lockIconContainer: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
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
