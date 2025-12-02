import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { API } from "../../services/api";

interface LoginScreenProps {
  domain: string;
  onLoginSuccess: (token: string) => void;
  onBack: () => void;
}

export function LoginScreen({ domain, onLoginSuccess, onBack }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    if (!username.trim()) {
      setError("Bitte gib deinen Benutzernamen ein");
      return;
    }

    if (!password) {
      setError("Bitte gib dein Passwort ein");
      return;
    }

    setIsLoading(true);

    try {
      // Setze Base URL (falls noch nicht gesetzt)
      API.setBaseUrl(domain);

      // Login mit echter API
      const response = await API.login(username, password);

      setIsLoading(false);

      // Erfolgreicher Login - Token weitergeben
      onLoginSuccess(response.token);
    } catch (err: any) {
      setIsLoading(false);

      // Detaillierte Fehlermeldungen
      const errorMessage = err.message || "Unbekannter Fehler";

      if (errorMessage.includes("Invalid") || errorMessage.includes("401")) {
        setError("Ungültige E-Mail oder Passwort. Bitte versuche es erneut.");
      } else if (errorMessage.includes("Network") || errorMessage.includes("Failed to fetch")) {
        setError("Verbindungsfehler. Prüfe deine Internetverbindung.");
      } else {
        setError(`Login fehlgeschlagen: ${errorMessage}`);
      }

      console.error("Login error:", err);
    }
  };

  // Extrahiere Domain-Namen für Anzeige
  const displayDomain = domain.replace(/^https?:\/\//, "");

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="log-in-outline" size={48} color="#7C3AED" />
        </View>
        <Text style={styles.title}>Anmelden</Text>
        <Text style={styles.subtitle}>
          Melde dich mit deinem WordPress-Account an
        </Text>
      </View>

      {/* Domain Info */}
      <View style={styles.domainCard}>
        <View style={styles.domainIcon}>
          <Ionicons name="checkmark-circle" size={20} color="#4ADE80" />
        </View>
        <View style={styles.domainContent}>
          <Text style={styles.domainLabel}>Verbunden mit</Text>
          <Text style={styles.domainText}>{displayDomain}</Text>
        </View>
      </View>

      {/* Login Form */}
      <View style={styles.form}>
        {/* Username Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Benutzername oder E-Mail</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="admin"
              placeholderTextColor="#6B7280"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                setError("");
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Passwort</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#6B7280"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError("");
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Error Message */}
        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
      </View>

      {/* Login Button */}
      <TouchableOpacity
        style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <ActivityIndicator color="#FFFFFF" />
            <Text style={styles.loginButtonText}>Anmelden...</Text>
          </>
        ) : (
          <>
            <Text style={styles.loginButtonText}>Anmelden</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </>
        )}
      </TouchableOpacity>

      {/* Info */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle-outline" size={20} color="#9CA3AF" />
        <Text style={styles.infoText}>
          Verwende deine WordPress-Zugangsdaten. Deine Daten werden sicher übertragen und verschlüsselt gespeichert.
        </Text>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
    flexGrow: 1,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#1E1E1E",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(124, 58, 237, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
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
  domainCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 32,
  },
  domainIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(74, 222, 128, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  domainContent: {
    flex: 1,
  },
  domainLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  domainText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  form: {
    gap: 20,
    marginBottom: 32,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#2A2A2A",
  },
  inputIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    padding: 16,
    paddingLeft: 12,
    fontSize: 16,
    color: "#FFFFFF",
  },
  eyeButton: {
    padding: 16,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: "#EF4444",
  },
  loginButton: {
    backgroundColor: "#7C3AED",
    borderRadius: 16,
    paddingVertical: 16,
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
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  infoCard: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#9CA3AF",
    lineHeight: 18,
  },
});
