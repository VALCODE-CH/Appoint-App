import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { API, Appointment } from "../services/api";
import { StorageService } from "../services/storage";

interface DashboardProps {
  onNavigateToSettings: () => void;
  onNavigateToAppointment?: (appointmentId: string) => void;
  onNavigateToAppointments?: () => void;
  onNavigateToCustomers?: () => void;
  shouldRefresh?: number; // Timestamp um Refresh zu triggern
}

export function Dashboard({ onNavigateToSettings, onNavigateToAppointment, onNavigateToAppointments, onNavigateToCustomers, shouldRefresh }: DashboardProps) {
  const { t, i18n } = useTranslation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [showingTomorrow, setShowingTomorrow] = useState(false);
  const [stats, setStats] = useState({
    todayAppointmentsCount: 0,
    monthlyGrowth: "+0%",
    totalCustomers: 0,
    todayRevenue: "0.00"
  });

  // Lade Daten beim ersten Render UND jedes Mal wenn shouldRefresh sich ändert
  useEffect(() => {
    loadAppointments();
  }, [shouldRefresh]);

  const loadAppointments = async () => {
    try {
      setError("");
      setShowingTomorrow(false);
      const staff = await StorageService.getStaffData();

      console.log("Loaded staff data:", JSON.stringify(staff, null, 2));

      if (!staff) {
        // Prüfe alle gespeicherten Daten
        const token = await StorageService.getToken();
        const domain = await StorageService.getDomain();
        console.log("Token exists:", !!token);
        console.log("Domain:", domain);

        setError(t('dashboard.appointments.errorStaffNotFound', { hasToken: !!token, domain: domain }));
        setIsLoading(false);
        return;
      }

      // Hole heutige Termine
      const today = new Date();
      const startOfDay = formatDate(today) + " 00:00:00";
      const endOfDay = formatDate(today) + " 23:59:59";

      const todayData = await API.getAppointments({
        staff_id: staff.id,
        start: startOfDay,
        end: endOfDay,
      });

      // Filtere nur zukünftige Termine (die noch bevorstehen)
      const now = new Date();
      const upcomingToday = todayData.filter((apt) => {
        const appointmentTime = new Date(apt.starts_at);
        return appointmentTime > now;
      });

      // Lade auch Statistiken
      await loadStats(staff.id, today, todayData);

      // Wenn heute keine Termine mehr, hole morgige Termine
      if (upcomingToday.length === 0) {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStart = formatDate(tomorrow) + " 00:00:00";
        const tomorrowEnd = formatDate(tomorrow) + " 23:59:59";

        const tomorrowData = await API.getAppointments({
          staff_id: staff.id,
          start: tomorrowStart,
          end: tomorrowEnd,
        });

        if (tomorrowData.length > 0) {
          setShowingTomorrow(true);
          // Sortiere nach Zeit
          tomorrowData.sort((a, b) =>
            new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
          );
          setAppointments(tomorrowData);
        } else {
          setAppointments([]);
        }
      } else {
        // Sortiere nach Zeit
        upcomingToday.sort((a, b) =>
          new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
        );
        setAppointments(upcomingToday);
      }
    } catch (err: any) {
      console.error("Error loading appointments:", err);
      setError(t('dashboard.appointments.errorLoading'));
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const loadStats = async (staffId: string, today: Date, todayAppointments: Appointment[]) => {
    try {
      // Hole alle Kunden
      const customers = await API.getCustomers();

      // Berechne monatliche Termine für Wachstum
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      const monthStart = formatDate(firstDayOfMonth) + " 00:00:00";
      const monthEnd = formatDate(lastDayOfMonth) + " 23:59:59";

      const monthAppointments = await API.getAppointments({
        staff_id: staffId,
        start: monthStart,
        end: monthEnd,
      });

      // Berechne vorherigen Monat für Vergleich
      const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

      const lastMonthStart = formatDate(firstDayLastMonth) + " 00:00:00";
      const lastMonthEnd = formatDate(lastDayLastMonth) + " 23:59:59";

      const lastMonthAppointments = await API.getAppointments({
        staff_id: staffId,
        start: lastMonthStart,
        end: lastMonthEnd,
      });

      // Berechne Wachstum
      const growth = lastMonthAppointments.length > 0
        ? Math.round(((monthAppointments.length - lastMonthAppointments.length) / lastMonthAppointments.length) * 100)
        : 0;

      // Berechne heutiges Revenue (Summe aller Service-Preise von heute)
      let todayRevenue = 0;

      // Lade Service-Details für jeden Termin und summiere die Preise
      for (const apt of todayAppointments) {
        try {
          const service = await API.getService(apt.service_id);
          const price = parseFloat(service.price);
          if (!isNaN(price)) {
            todayRevenue += price;
          }
        } catch (err) {
          console.error(`Error loading service ${apt.service_id}:`, err);
          // Ignoriere Fehler für einzelne Services und fahre fort
        }
      }

      setStats({
        todayAppointmentsCount: todayAppointments.length,
        monthlyGrowth: `${growth > 0 ? '+' : ''}${growth}%`,
        totalCustomers: customers.length,
        todayRevenue: todayRevenue.toFixed(2)
      });
    } catch (err) {
      console.error("Error loading stats:", err);
      // Behalte Standard-Werte bei Fehler
    }
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAppointments();
  };

  const statsDisplay = [
    { label: t('dashboard.stats.todayAppointments'), value: stats.todayAppointmentsCount.toString(), icon: "calendar-outline", color: "#60A5FA" },
    { label: t('dashboard.stats.growth'), value: stats.monthlyGrowth, icon: "trending-up-outline", color: "#FB923C" },
    { label: t('dashboard.stats.customers'), value: stats.totalCustomers.toString(), icon: "people-outline", color: "#A78BFA" },
    { label: t('dashboard.stats.todayRevenue'), value: `CHF ${stats.todayRevenue}`, icon: "cash-outline", color: "#4ADE80" },
  ];

  const getCurrentDate = (): string => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    // Map language codes to locale strings
    const localeMap: { [key: string]: string } = {
      'en': 'en-US',
      'de': 'de-DE',
      'fr': 'fr-FR',
      'hr': 'hr-HR',
      'pt': 'pt-PT'
    };
    const locale = localeMap[i18n.language] || 'en-US';
    return date.toLocaleDateString(locale, options);
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
          <Text style={styles.title}>{t('dashboard.title')}</Text>
          <Text style={styles.subtitle}>{getCurrentDate()}</Text>
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
        {statsDisplay.map((stat, index) => {
          const isClickable = stat.label === t('dashboard.stats.todayAppointments') || stat.label === t('dashboard.stats.customers');
          const onPress = stat.label === t('dashboard.stats.todayAppointments')
            ? onNavigateToAppointments
            : stat.label === t('dashboard.stats.customers')
            ? onNavigateToCustomers
            : undefined;

          if (isClickable && onPress) {
            return (
              <TouchableOpacity
                key={stat.label}
                style={styles.statCard}
                onPress={onPress}
                activeOpacity={0.7}
              >
                <View style={styles.statIconContainer}>
                  <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <View style={styles.statLabelContainer}>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Ionicons name="chevron-forward" size={14} color="#6B7280" />
                </View>
              </TouchableOpacity>
            );
          }

          return (
            <View key={stat.label} style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name={stat.icon as any} size={20} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          );
        })}
      </View>

      {/* Today's Appointments */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {showingTomorrow ? t('dashboard.appointments.tomorrow') : t('dashboard.appointments.today')}
          </Text>
          {showingTomorrow && (
            <View style={styles.tomorrowBadge}>
              <Ionicons name="calendar" size={14} color="#60A5FA" />
              <Text style={styles.tomorrowBadgeText}>{t('dashboard.appointments.tomorrowBadge')}</Text>
            </View>
          )}
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <Text style={styles.loadingText}>{t('dashboard.appointments.loading')}</Text>
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle" size={24} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadAppointments}>
              <Text style={styles.retryButtonText}>{t('dashboard.appointments.retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : appointments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color="#6B7280" />
            <Text style={styles.emptyText}>
              {showingTomorrow
                ? t('dashboard.appointments.noTomorrow')
                : t('dashboard.appointments.noUpcoming')}
            </Text>
          </View>
        ) : (
          <View style={styles.appointmentsList}>
            {appointments.map((appointment) => (
              <TouchableOpacity
                key={appointment.id}
                style={styles.appointmentCard}
                onPress={() => onNavigateToAppointment?.(appointment.id)}
                activeOpacity={0.7}
              >
                <View style={styles.appointmentHeader}>
                  <View style={styles.appointmentInfo}>
                    <Text style={styles.customerName}>{appointment.customer_name}</Text>
                    <Text style={styles.serviceName}>{appointment.service_name}</Text>
                  </View>
                  <View style={styles.timeContainer}>
                    <Text style={styles.appointmentTime}>{formatTime(appointment.starts_at)}</Text>
                    <Ionicons name="chevron-forward" size={16} color="#6B7280" />
                  </View>
                </View>
                <View style={styles.appointmentFooter}>
                  <View style={styles.staffIconContainer}>
                    <Ionicons name="person-outline" size={16} color="#A78BFA" />
                  </View>
                  <Text style={styles.staffName}>{appointment.staff_name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
  statLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  tomorrowBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(96, 165, 250, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(96, 165, 250, 0.3)",
  },
  tomorrowBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#60A5FA",
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
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
});
