import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { API, Staff } from "../services/api";
import { StorageService } from "../services/storage";

interface StaffListProps {
  onStaffClick: (staffId: number) => void;
}

interface StaffWithExtras extends Staff {
  initials: string;
  color: string;
}

export function StaffList({ onStaffClick }: StaffListProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [staff, setStaff] = useState<StaffWithExtras[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [hasPermission, setHasPermission] = useState(true);

  useEffect(() => {
    checkPermissionAndLoadStaff();
  }, []);

  const checkPermissionAndLoadStaff = async () => {
    try {
      const staffData = await StorageService.getStaffData();
      const canViewAllStaff = staffData?.permissions?.can_view_all_staff ?? true;

      setHasPermission(canViewAllStaff);

      if (canViewAllStaff) {
        await loadStaff();
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error checking permissions:", err);
      setIsLoading(false);
    }
  };

  const loadStaff = async () => {
    try {
      setError("");
      const staffData = await API.getStaff();

      // Erstelle Initialen und zufällige Farben
      const colors = ["#A78BFA", "#60A5FA", "#EC4899", "#4ADE80", "#FB923C", "#F472B6"];

      const processedStaff: StaffWithExtras[] = staffData.map((member, index) => {
        const nameParts = member.name.split(" ");
        const initials = nameParts.length > 1
          ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
          : member.name.substring(0, 2).toUpperCase();

        return {
          ...member,
          initials,
          color: colors[index % colors.length],
        };
      });

      // Sortiere nach Namen
      processedStaff.sort((a, b) => a.name.localeCompare(b.name));

      setStaff(processedStaff);
    } catch (err: any) {
      console.error("Error loading staff:", err);
      setError(t('staff.error'));
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    checkPermissionAndLoadStaff();
  };

  const filteredStaff = staff.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
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
          <Text style={styles.title}>{t('staff.title')}</Text>
          <Text style={styles.subtitle}>
            {isLoading ? t('staff.loading') : t('staff.subtitle', { count: staff.length })}
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('staff.search')}
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
        <Text style={styles.addButtonText}>Neuer Mitarbeiter</Text>
      </TouchableOpacity>
      */}

      {/* No Permission State */}
      {!hasPermission ? (
        <View style={styles.noPermissionContainer}>
          <View style={styles.noPermissionIcon}>
            <Ionicons name="lock-closed" size={64} color="#6B7280" />
          </View>
          <Text style={styles.noPermissionTitle}>{t('staff.noPermission.title')}</Text>
          <Text style={styles.noPermissionText}>
            {t('staff.noPermission.description')}
          </Text>
          <Text style={styles.noPermissionHint}>
            {t('staff.noPermission.hint')}
          </Text>
        </View>
      ) : isLoading ? (
        /* Loading State */
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>{t('staff.loadingStaff')}</Text>
        </View>
      ) : error ? (
        /* Error State */
        <View style={styles.errorCard}>
          <Ionicons name="alert-circle" size={24} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadStaff}>
            <Text style={styles.retryButtonText}>{t('staff.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : filteredStaff.length === 0 ? (
        /* Empty State */
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={48} color="#6B7280" />
          <Text style={styles.emptyText}>
            {searchQuery ? t('staff.empty.noResults') : t('staff.empty.noStaff')}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchQuery
              ? t('staff.empty.tryOtherSearch')
              : t('staff.empty.addFirst')}
          </Text>
        </View>
      ) : (
        /* Staff List */
        <View style={styles.staffList}>
          {filteredStaff.map((member) => (
            <TouchableOpacity
              key={member.id}
              onPress={() => onStaffClick(parseInt(member.id))}
              style={styles.staffCard}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{member.initials}</Text>
              </View>
              <View style={styles.staffInfo}>
                <Text style={styles.staffName}>{member.name}</Text>
                <View style={styles.contactRow}>
                  <Ionicons name="mail-outline" size={14} color="#9CA3AF" />
                  <Text style={styles.staffEmail}>{member.email}</Text>
                </View>
                <View style={styles.contactRow}>
                  <Ionicons name="call-outline" size={14} color="#9CA3AF" />
                  <Text style={styles.staffPhone}>{member.phone}</Text>
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
  staffList: {
    gap: 12,
  },
  staffCard: {
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
  staffInfo: {
    flex: 1,
    gap: 4,
  },
  staffName: {
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
  staffEmail: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  staffPhone: {
    fontSize: 13,
    color: "#9CA3AF",
  },
});
