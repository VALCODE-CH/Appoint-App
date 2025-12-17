import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, ActivityIndicator, Switch, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StorageService } from "../services/storage";
import { API, Staff } from "../services/api";
import { Notifications } from "./Notifications";
import { ThemeServiceInstance, ThemeMode } from "../services/theme";
import { useTheme } from "../contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import { changeLanguage, getAvailableLanguages } from "../i18n/config";

interface SettingsProps {
  onBack: () => void;
  onLogout?: () => void;
}

type SettingsView = "main" | "notifications";

export function Settings({ onBack, onLogout }: SettingsProps) {
  const { t, i18n } = useTranslation();
  const { refreshTheme } = useTheme();
  const [currentView, setCurrentView] = useState<SettingsView>("main");
  const [staffData, setStaffData] = useState<Staff | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [editedPhone, setEditedPhone] = useState("");
  const [themeMode, setThemeMode] = useState<ThemeMode>("standard");
  const [isThemeLoading, setIsThemeLoading] = useState(false);
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);
  const availableLanguages = getAvailableLanguages();

  useEffect(() => {
    loadUserData();
    loadThemeSettings();
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
      Alert.alert(t("common.error"), t("settings.profile.errors.loadFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const loadThemeSettings = async () => {
    try {
      await ThemeServiceInstance.initialize();
      const mode = ThemeServiceInstance.getThemeMode();
      setThemeMode(mode);
    } catch (error) {
      console.error("Error loading theme settings:", error);
    }
  };

  const handleThemeToggle = async (useCustom: boolean) => {
    try {
      setIsThemeLoading(true);
      const newMode: ThemeMode = useCustom ? "custom" : "standard";
      await ThemeServiceInstance.setThemeMode(newMode);
      setThemeMode(newMode);

      // Refresh theme in ThemeContext to apply changes immediately
      await refreshTheme();

      Alert.alert(
        t("settings.design.updateSuccess"),
        t("settings.design.updateMessage"),
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error changing theme:", error);
      Alert.alert(t("common.error"), t("settings.design.updateFailed"));
    } finally {
      setIsThemeLoading(false);
    }
  };

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await changeLanguage(languageCode);
      setIsLanguageModalVisible(false);
      Alert.alert(
        t("settings.language.title"),
        t("settings.language.changeSuccess"),
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error changing language:", error);
      Alert.alert(t("common.error"), t("settings.language.changeFailed"));
    }
  };

  const refreshPermissions = async () => {
    try {
      setIsLoading(true);

      // Hole aktuelle Staff-Daten vom Server über validateToken
      const response = await API.validateToken();

      console.log("Aktualisierte Staff-Daten vom Server:", JSON.stringify(response.staff, null, 2));

      // Speichere aktualisierte Daten
      await StorageService.saveStaffData(response.staff);
      setStaffData(response.staff);
      setEditedName(response.staff.name);
      setEditedEmail(response.staff.email);
      setEditedPhone(response.staff.phone || "");

      Alert.alert(t("common.success"), t("settings.permissions.updateSuccess"));
    } catch (error: any) {
      console.error("Error refreshing permissions:", error);
      Alert.alert(t("common.error"), error.message || t("settings.permissions.updateFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!staffData) return;

    // Validierung
    if (!editedName.trim()) {
      Alert.alert(t("common.error"), t("settings.profile.errors.nameRequired"));
      return;
    }
    if (!editedEmail.trim()) {
      Alert.alert(t("common.error"), t("settings.profile.errors.emailRequired"));
      return;
    }

    try {
      setIsSaving(true);

      // API Call - update staff member mit der neuen Methode
      const response = await API.updateStaff(staffData.id, {
        name: editedName,
        email: editedEmail,
        phone: editedPhone,
      });

      // Update local storage mit den vom Server zurückgegebenen Daten
      const updatedStaff = {
        ...staffData,
        ...response.staff,
      };
      await StorageService.saveStaffData(updatedStaff);
      setStaffData(updatedStaff);
      setIsEditing(false);

      Alert.alert(t("common.success"), t("settings.profile.saveSuccess"));
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Alert.alert(t("common.error"), error.message || t("settings.profile.errors.updateFailed"));
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
      t("settings.logout.title"),
      t("settings.logout.confirm"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("settings.logout.title"),
          style: "destructive",
          onPress: async () => {
            try {
              await StorageService.clearAll();
              if (onLogout) {
                onLogout();
              }
            } catch (error) {
              console.error("Error during logout:", error);
              Alert.alert(t("common.error"), t("settings.logout.failed"));
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
        <Text style={styles.loadingText}>{t("settings.loadingUserData")}</Text>
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
        <Text style={styles.title}>{t("settings.title")}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>
            {staffData ? getInitials(staffData.name) : "??"}
          </Text>
        </View>
        <Text style={styles.profileName}>{staffData?.name || t("settings.profile.unknown")}</Text>
        <Text style={styles.profileEmail}>{staffData?.email || t("settings.profile.noEmail")}</Text>
      </View>

      {/* Business Profile Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t("settings.profile.title")}</Text>
          {!isEditing ? (
            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
              <Ionicons name="create-outline" size={20} color="#7C3AED" />
              <Text style={styles.editButtonText}>{t("settings.profile.edit")}</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.profileCard}>
          {/* Name Field */}
          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <Ionicons name="person-outline" size={20} color="#9CA3AF" />
              <Text style={styles.labelText}>{t("settings.profile.name")}</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedName}
                onChangeText={setEditedName}
                placeholder={t("settings.profile.namePlaceholder")}
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
              <Text style={styles.labelText}>{t("settings.profile.email")}</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedEmail}
                onChangeText={setEditedEmail}
                placeholder={t("settings.profile.emailPlaceholder")}
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
              <Text style={styles.labelText}>{t("settings.profile.phone")}</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedPhone}
                onChangeText={setEditedPhone}
                placeholder={t("settings.profile.phonePlaceholder")}
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
                <Text style={styles.cancelButtonText}>{t("common.cancel")}</Text>
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
                    <Text style={styles.saveButtonText}>{t("common.save")}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </View>

      {/* Other Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("settings.otherSettings")}</Text>

        {/* Theme Toggle */}
        <View style={styles.settingItem}>
          <View style={[styles.settingIcon, { backgroundColor: "rgba(139, 92, 246, 0.15)" }]}>
            <Ionicons name="color-palette-outline" size={24} color="#8B5CF6" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>{t("settings.design.title")}</Text>
            <Text style={styles.settingDescription}>
              {themeMode === "custom" ? t("settings.design.description") : t("settings.design.descriptionStandard")}
            </Text>
          </View>
          <Switch
            value={themeMode === "custom"}
            onValueChange={handleThemeToggle}
            trackColor={{ false: "#3A3A3A", true: "#7C3AED" }}
            thumbColor={themeMode === "custom" ? "#FFFFFF" : "#9CA3AF"}
            disabled={isThemeLoading}
          />
        </View>

        {/* Language Selector */}
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => setIsLanguageModalVisible(true)}
        >
          <View style={[styles.settingIcon, { backgroundColor: "rgba(59, 130, 246, 0.15)" }]}>
            <Ionicons name="language-outline" size={24} color="#3B82F6" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>{t("settings.language.title")}</Text>
            <Text style={styles.settingDescription}>
              {availableLanguages.find(lang => lang.code === i18n.language)?.name || "Deutsch"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => setCurrentView("notifications")}
        >
          <View style={[styles.settingIcon, { backgroundColor: "rgba(251, 146, 60, 0.15)" }]}>
            <Ionicons name="notifications-outline" size={24} color="#FB923C" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>{t("settings.notifications.title")}</Text>
            <Text style={styles.settingDescription}>{t("settings.notifications.description")}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={refreshPermissions}
        >
          <View style={[styles.settingIcon, { backgroundColor: "rgba(124, 58, 237, 0.15)" }]}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#7C3AED" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>{t("settings.permissions.title")}</Text>
            <Text style={styles.settingDescription}>{t("settings.permissions.description")}</Text>
          </View>
          <Ionicons name="refresh" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        <Text style={styles.logoutButtonText}>{t("settings.logout.title")}</Text>
      </TouchableOpacity>

      {/* Version */}
      <Text style={styles.versionText}>{t("settings.version")} 1.0.0</Text>

      {/* Language Selection Modal */}
      <Modal
        visible={isLanguageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsLanguageModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsLanguageModalVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("settings.language.title")}</Text>
              <TouchableOpacity onPress={() => setIsLanguageModalVisible(false)}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {availableLanguages.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageOption,
                  i18n.language === language.code && styles.languageOptionSelected
                ]}
                onPress={() => handleLanguageChange(language.code)}
              >
                <Text style={styles.languageOptionText}>{language.name}</Text>
                {i18n.language === language.code && (
                  <Ionicons name="checkmark" size={24} color="#7C3AED" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  languageOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#2A2A2A",
    borderRadius: 12,
    marginBottom: 8,
  },
  languageOptionSelected: {
    backgroundColor: "rgba(124, 58, 237, 0.15)",
    borderWidth: 1,
    borderColor: "#7C3AED",
  },
  languageOptionText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },
});
