import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StorageService } from "../services/storage";
import { API, Staff } from "../services/api";
import { Notifications } from "./Notifications";

interface SettingsProps {
  onBack: () => void;
  onLogout?: () => void;
}

type SettingsView = "main" | "notifications";

export function Settings({ onBack, onLogout }: SettingsProps) {
  const [currentView, setCurrentView] = useState<SettingsView>("main");
  const [staffData, setStaffData] = useState<Staff | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [editedPhone, setEditedPhone] = useState("");

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const data = await StorageService.getStaffData();
      if (data) {
        setStaffData(data);
        setEditedName(data.name);
        setEditedEmail(data.email);
        setEditedPhone(data.phone || "");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      Alert.alert("Fehler", "Benutzerdaten konnten nicht geladen werden.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!staffData) return;

    // Validierung
    if (!editedName.trim()) {
      Alert.alert("Fehler", "Bitte gib einen Namen ein.");
      return;
    }
    if (!editedEmail.trim()) {
      Alert.alert("Fehler", "Bitte gib eine E-Mail-Adresse ein.");
      return;
    }

    try {
      setIsSaving(true);

      // API Call - update staff member
      await API.request(`/staff/${staffData.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editedName,
          email: editedEmail,
          phone: editedPhone,
        }),
      });

      // Update local storage
      const updatedStaff = {
        ...staffData,
        name: editedName,
        email: editedEmail,
        phone: editedPhone,
      };
      await StorageService.saveStaffData(updatedStaff);
      setStaffData(updatedStaff);
      setIsEditing(false);

      Alert.alert("Erfolg", "Deine Daten wurden erfolgreich aktualisiert.");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Alert.alert("Fehler", error.message || "Profil konnte nicht aktualisiert werden.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (staffData) {
      setEditedName(staffData.name);
      setEditedEmail(staffData.email);
      setEditedPhone(staffData.phone || "");
    }
    setIsEditing(false);
  };
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Show Notifications view
  if (currentView === "notifications") {
    return <Notifications onBack={() => setCurrentView("main")} />;
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Lade Benutzerdaten...</Text>
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
        <Text style={styles.title}>Einstellungen</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>
            {staffData ? getInitials(staffData.name) : "??"}
          </Text>
        </View>
        <Text style={styles.profileName}>{staffData?.name || "Unbekannt"}</Text>
        <Text style={styles.profileEmail}>{staffData?.email || "Keine E-Mail"}</Text>
      </View>

      {/* Business Profile Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Business Profile</Text>
          {!isEditing ? (
            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
              <Ionicons name="create-outline" size={20} color="#7C3AED" />
              <Text style={styles.editButtonText}>Bearbeiten</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.profileCard}>
          {/* Name Field */}
          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <Ionicons name="person-outline" size={20} color="#9CA3AF" />
              <Text style={styles.labelText}>Name</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Dein Name"
                placeholderTextColor="#6B7280"
              />
            ) : (
              <Text style={styles.inputValue}>{staffData?.name || "-"}</Text>
            )}
          </View>

          {/* Email Field */}
          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
              <Text style={styles.labelText}>E-Mail</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedEmail}
                onChangeText={setEditedEmail}
                placeholder="deine@email.com"
                placeholderTextColor="#6B7280"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <Text style={styles.inputValue}>{staffData?.email || "-"}</Text>
            )}
          </View>

          {/* Phone Field */}
          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <Ionicons name="call-outline" size={20} color="#9CA3AF" />
              <Text style={styles.labelText}>Telefon</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedPhone}
                onChangeText={setEditedPhone}
                placeholder="Telefonnummer (optional)"
                placeholderTextColor="#6B7280"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.inputValue}>{staffData?.phone || "-"}</Text>
            )}
          </View>

          {/* Save/Cancel Buttons */}
          {isEditing ? (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={handleCancelEdit}
                style={[styles.actionButton, styles.cancelButton]}
                disabled={isSaving}
              >
                <Ionicons name="close" size={20} color="#6B7280" />
                <Text style={styles.cancelButtonText}>Abbrechen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveProfile}
                style={[styles.actionButton, styles.saveButton]}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    <Text style={styles.saveButtonText}>Speichern</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </View>

      {/* Other Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weitere Einstellungen</Text>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => setCurrentView("notifications")}
        >
          <View style={[styles.settingIcon, { backgroundColor: "rgba(251, 146, 60, 0.15)" }]}>
            <Ionicons name="notifications-outline" size={24} color="#FB923C" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Benachrichtigungen</Text>
            <Text style={styles.settingDescription}>Benachrichtigungseinstellungen verwalten</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>
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
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "rgba(124, 58, 237, 0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#7C3AED",
  },
  editButtonText: {
    color: "#7C3AED",
    fontSize: 14,
    fontWeight: "600",
  },
  profileCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  labelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  input: {
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#3A3A3A",
  },
  inputValue: {
    fontSize: 16,
    color: "#FFFFFF",
    paddingVertical: 8,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: "#2A2A2A",
    borderWidth: 1,
    borderColor: "#3A3A3A",
  },
  cancelButtonText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#7C3AED",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 16,
    gap: 16,
    marginTop: 12,
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  settingContent: {
    flex: 1,
    gap: 4,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  settingDescription: {
    fontSize: 14,
    color: "#9CA3AF",
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
