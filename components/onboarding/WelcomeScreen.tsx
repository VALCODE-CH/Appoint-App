import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface WelcomeScreenProps {
  onContinue: () => void;
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  const features = [
    {
      icon: "calendar-outline",
      title: "Terminverwaltung",
      description: "Verwalte alle deine Termine übersichtlich an einem Ort",
    },
    {
      icon: "people-outline",
      title: "Mitarbeiter & Kunden",
      description: "Behalte den Überblick über dein Team und deine Kunden",
    },
    {
      icon: "cut-outline",
      title: "Dienstleistungen",
      description: "Organisiere deine Services mit Preisen und Dauer",
    },
    {
      icon: "stats-chart-outline",
      title: "Statistiken",
      description: "Verfolge Umsätze und wichtige Kennzahlen in Echtzeit",
    },
    {
      icon: "notifications-outline",
      title: "Benachrichtigungen",
      description: "Verpasse keine wichtigen Termine mehr",
    },
    {
      icon: "sync-outline",
      title: "WordPress Integration",
      description: "Nahtlose Synchronisation mit deinem Booking-Plugin",
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Logo/Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="calendar" size={64} color="#7C3AED" />
        </View>
        <Text style={styles.title}>Willkommen bei Appoint</Text>
        <Text style={styles.subtitle}>
          Deine professionelle Lösung für Terminverwaltung
        </Text>
      </View>

      {/* Features */}
      <View style={styles.featuresContainer}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Ionicons name={feature.icon as any} size={28} color="#7C3AED" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Continue Button */}
      <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
        <Text style={styles.continueButtonText}>Los geht's</Text>
        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Footer */}
      <Text style={styles.footerText}>
        Verbinde deine WordPress-Installation in wenigen Schritten
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  content: {
    padding: 24,
    paddingTop: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(124, 58, 237, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  featuresContainer: {
    gap: 16,
    marginBottom: 32,
  },
  featureCard: {
    flexDirection: "row",
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(124, 58, 237, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  featureContent: {
    flex: 1,
    justifyContent: "center",
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: "#9CA3AF",
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: "#7C3AED",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
    shadowColor: "#7C3AED",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  footerText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
});
