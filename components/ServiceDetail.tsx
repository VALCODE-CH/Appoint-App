import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { API, Service, Appointment } from "../services/api";
import { useTheme } from "../contexts/ThemeContext";

interface ServiceDetailProps {
  serviceId: string | null;
  onBack: () => void;
}

export function ServiceDetail({ serviceId, onBack }: ServiceDetailProps) {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const [service, setService] = useState<Service | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    popularityRank: 0,
  });

  useEffect(() => {
    if (serviceId) {
      loadServiceDetail();
    }
  }, [serviceId]);

  const loadServiceDetail = async () => {
    if (!serviceId) return;

    try {
      setIsLoading(true);
      setError("");

      // Lade Service-Daten
      const serviceData = await API.getService(serviceId);
      setService(serviceData);

      // Lade alle Termine
      const allAppointments = await API.getAppointments();

      // Filtere Termine für diesen Service
      const serviceAppointments = allAppointments.filter(
        (apt) => apt.service_id === serviceId
      );

      // Sortiere Termine nach Datum (neueste zuerst)
      serviceAppointments.sort((a, b) =>
        new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()
      );

      setAppointments(serviceAppointments);

      // Berechne Statistiken
      const now = new Date();
      const upcoming = serviceAppointments.filter(
        (apt) => new Date(apt.starts_at) > now
      );

      setStats({
        totalBookings: serviceAppointments.length,
        upcomingBookings: upcoming.length,
        popularityRank: 0, // Könnte berechnet werden basierend auf allen Services
      });

    } catch (err: any) {
      console.error("Error loading service detail:", err);
      setError(err.message || t('services.errorDetails'));
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (minutes: string): string => {
    const mins = parseInt(minutes);
    if (mins < 60) {
      return t('services.duration.minutes', { count: mins });
    } else {
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      if (remainingMins === 0) {
        return t('services.duration.hours', { count: hours });
      } else {
        return t('services.duration.hoursMinutes', { hours, minutes: remainingMins });
      }
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "confirmed":
        return "#10B981";
      case "pending":
        return "#F59E0B";
      case "cancelled":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "confirmed":
        return "Bestätigt";
      case "pending":
        return "Ausstehend";
      case "cancelled":
        return "Abgesagt";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Lade Dienstleistungsdetails...</Text>
      </View>
    );
  }

  if (error || !service) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Dienstleistungsdetails</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.errorCard}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error || "Dienstleistung nicht gefunden"}</Text>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: theme.primary }]} onPress={loadServiceDetail}>
            <Text style={styles.retryButtonText}>Erneut versuchen</Text>
          </TouchableOpacity>
        </View>
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
        <Text style={styles.title}>Dienstleistungsdetails</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Service Info Card */}
      <View style={styles.serviceCard}>
        <View style={styles.serviceHeader}>
          <View style={[styles.iconContainer, { backgroundColor: `${theme.primary}26` }]}>
            <Ionicons name="briefcase" size={32} color={theme.primary} />
          </View>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{service.name}</Text>
            <View style={styles.serviceDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={16} color="#9CA3AF" />
                <Text style={styles.detailText}>{formatDuration(service.duration_minutes)}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="cash-outline" size={16} color="#9CA3AF" />
                <Text style={styles.detailText}>{service.price}€</Text>
              </View>
            </View>
            <View style={styles.statusBadgeContainer}>
              {service.active === "1" ? (
                <View style={[styles.statusBadge, { backgroundColor: "rgba(16, 185, 129, 0.15)" }]}>
                  <View style={[styles.statusDot, { backgroundColor: "#10B981" }]} />
                  <Text style={[styles.statusText, { color: "#10B981" }]}>Aktiv</Text>
                </View>
              ) : (
                <View style={[styles.statusBadge, { backgroundColor: "rgba(107, 114, 128, 0.15)" }]}>
                  <View style={[styles.statusDot, { backgroundColor: "#6B7280" }]} />
                  <Text style={[styles.statusText, { color: "#6B7280" }]}>Inaktiv</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Created/Updated Info */}
        <View style={styles.metaInfo}>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.metaText}>Erstellt: {formatDate(service.created_at)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="refresh-outline" size={14} color="#6B7280" />
            <Text style={styles.metaText}>Aktualisiert: {formatDate(service.updated_at)}</Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: `${theme.primary}26` }]}>
            <Ionicons name="calendar" size={24} color={theme.primary} />
          </View>
          <Text style={styles.statValue}>{stats.totalBookings}</Text>
          <Text style={styles.statLabel}>Gesamt Buchungen</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: `${theme.primary}26` }]}>
            <Ionicons name="time" size={24} color={theme.primaryLight} />
          </View>
          <Text style={styles.statValue}>{stats.upcomingBookings}</Text>
          <Text style={styles.statLabel}>Bevorstehend</Text>
        </View>
      </View>

      {/* Recent Bookings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Letzte Buchungen</Text>

        {appointments.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#6B7280" />
            <Text style={styles.emptyText}>Keine Buchungen</Text>
            <Text style={styles.emptySubtext}>
              Diese Dienstleistung wurde noch nicht gebucht
            </Text>
          </View>
        ) : (
          <View style={styles.appointmentsList}>
            {appointments.slice(0, 10).map((appointment) => (
              <View key={appointment.id} style={styles.appointmentCard}>
                <View style={styles.appointmentHeader}>
                  <View style={styles.appointmentDate}>
                    <Ionicons name="calendar-outline" size={16} color={theme.primary} />
                    <Text style={styles.appointmentDateText}>
                      {formatDate(appointment.starts_at)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.appointmentStatusBadge,
                      { backgroundColor: `${getStatusColor(appointment.status)}20` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.appointmentStatusText,
                        { color: getStatusColor(appointment.status) },
                      ]}
                    >
                      {getStatusLabel(appointment.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.appointmentDetails}>
                  <View style={styles.appointmentDetailRow}>
                    <Ionicons name="time-outline" size={16} color="#9CA3AF" />
                    <Text style={styles.appointmentDetailText}>
                      {formatTime(appointment.starts_at)} - {formatTime(appointment.ends_at)}
                    </Text>
                  </View>

                  <View style={styles.appointmentDetailRow}>
                    <Ionicons name="person-outline" size={16} color="#9CA3AF" />
                    <Text style={styles.appointmentDetailText}>{appointment.customer_name}</Text>
                  </View>

                  <View style={styles.appointmentDetailRow}>
                    <Ionicons name="people-outline" size={16} color="#9CA3AF" />
                    <Text style={styles.appointmentDetailText}>{appointment.staff_name}</Text>
                  </View>
                </View>
              </View>
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
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: "#9CA3AF",
    fontSize: 14,
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
  errorCard: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 16,
    padding: 40,
    margin: 24,
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  errorText: {
    fontSize: 16,
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
  serviceCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  serviceHeader: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(124, 58, 237, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  serviceInfo: {
    flex: 1,
    gap: 8,
  },
  serviceName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  serviceDetails: {
    flexDirection: "row",
    gap: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  statusBadgeContainer: {
    flexDirection: "row",
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  metaInfo: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#2A2A2A",
    gap: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaText: {
    fontSize: 12,
    color: "#6B7280",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
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
  },
  appointmentDate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  appointmentDateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  appointmentStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  appointmentStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  appointmentDetails: {
    gap: 8,
  },
  appointmentDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  appointmentDetailText: {
    fontSize: 14,
    color: "#9CA3AF",
    flex: 1,
  },
});
