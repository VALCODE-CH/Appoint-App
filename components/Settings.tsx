import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StorageService } from "../services/storage";

interface SettingsProps {
  onBack: () => void;
  onLogout?: () => void;
}

export function Settings({ onBack, onLogout }: SettingsProps) {
  const handleLogout = () => {
    Alert.alert(
      "Abmelden",
      "Möchtest du dich wirklich abmelden?",
      [
        {
          text: "Abbrechen",
          style: "cancel",
        },
        {
          text: "Abmelden",
          style: "destructive",
          onPress: async () => {
            try {
              await StorageService.clearAll();
              if (onLogout) {
                onLogout();
              }
            } catch (error) {
              console.error("Error during logout:", error);
              Alert.alert("Fehler", "Abmelden fehlgeschlagen. Bitte versuche es erneut.");
            }
          },
        },
      ]
    );
  };

  const settingsOptions = [
    { id: 1, title: "Business Profile", icon: "business-outline", color: "#7C3AED" },
    { id: 2, title: "Working Hours", icon: "time-outline", color: "#60A5FA" },
    { id: 3, title: "Notifications", icon: "notifications-outline", color: "#FB923C" },
    { id: 4, title: "Payment Methods", icon: "card-outline", color: "#4ADE80" },
    { id: 5, title: "Privacy & Security", icon: "shield-checkmark-outline", color: "#EC4899" },
    { id: 6, title: "Help & Support", icon: "help-circle-outline", color: "#A78BFA" },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>BS</Text>
        </View>
        <Text style={styles.profileName}>Bella's Salon</Text>
        <Text style={styles.profileEmail}>bella@salon.com</Text>
      </View>

      {/* Settings Options */}
      <View style={styles.optionsList}>
        {settingsOptions.map((option) => (
          <TouchableOpacity key={option.id} style={styles.optionCard}>
            <View style={[styles.optionIcon, { backgroundColor: `${option.color}33` }]}>
              <Ionicons name={option.icon as any} size={24} color={option.color} />
            </View>
            <Text style={styles.optionTitle}>{option.title}</Text>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        <Text style={styles.logoutButtonText}>Abmelden</Text>
      </TouchableOpacity>

      {/* Version */}
      <Text style={styles.versionText}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
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
  profileSection: {
    alignItems: "center",
    padding: 24,
    marginBottom: 16,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  profileAvatarText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  optionsList: {
    paddingHorizontal: 24,
    gap: 12,
  },
  optionCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 12,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  optionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  logoutButton: {
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 16,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  logoutButtonText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "600",
  },
  versionText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 12,
    marginBottom: 32,
  },
});
