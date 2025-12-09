import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { API } from "../../services/api";

interface DomainSetupScreenProps {
  onContinue: (domain: string) => void;
}

export function DomainSetupScreen({ onContinue }: DomainSetupScreenProps) {
  const [domain, setDomain] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");

  const validateDomain = (input: string): boolean => {
    // Entferne Protokoll falls vorhanden
    let cleanDomain = input.replace(/^https?:\/\//, "");
    // Entferne trailing slash
    cleanDomain = cleanDomain.replace(/\/$/, "");

    // Validierung für localhost mit optionalem Port
    if (/^localhost(:\d+)?$/.test(cleanDomain)) {
      return true;
    }

    // Validierung für Domains und Subdomains
    // Erlaubt: domain.com, subdomain.domain.com, sub.sub.domain.com, etc.
    const domainPattern = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

    // Validierung für IP-Adressen mit optionalem Port
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}(:\d+)?$/;

    return domainPattern.test(cleanDomain) || ipPattern.test(cleanDomain);
  };

  const handleContinue = async () => {
    setError("");

    if (!domain.trim()) {
      setError("Bitte gib eine Domain ein");
      return;
    }

    // Bereinige Domain
    let cleanDomain = domain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");

    if (!validateDomain(cleanDomain)) {
      setError("Bitte gib eine gültige Domain ein (z.B. meinedomain.de)");
      return;
    }

    // Füge https:// hinzu wenn nicht localhost
    const finalDomain = cleanDomain.startsWith("localhost")
      ? `http://${cleanDomain}`
      : `https://${cleanDomain}`;

    setIsValidating(true);

    // Teste Verbindung zur API
    try {
      // Setze Base URL für API
      API.setBaseUrl(finalDomain);

      // Prüfe ob API erreichbar ist (versuche Services zu laden)
      const isConnected = await API.checkConnection();

      if (isConnected) {
        setIsValidating(false);
        onContinue(finalDomain);
      } else {
        setIsValidating(false);
        setError("WordPress API nicht gefunden. Stelle sicher, dass das Valcode Appoint Plugin installiert und aktiviert ist.");
      }
    } catch (err) {
      setIsValidating(false);
      setError("Verbindung fehlgeschlagen. Prüfe die Domain und versuche es erneut.");
      console.error("Domain validation error:", err);
    }
  };

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
        {/* Header */}
        <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="globe-outline" size={48} color="#7C3AED" />
        </View>
        <Text style={styles.title}>WordPress verbinden</Text>
        <Text style={styles.subtitle}>
          Gib die Domain deiner WordPress-Installation ein
        </Text>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle-outline" size={24} color="#60A5FA" />
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Wichtig</Text>
          <Text style={styles.infoText}>
            Stelle sicher, dass das Appoint Booking Plugin auf deiner WordPress-Seite installiert und aktiviert ist.
          </Text>
          <TouchableOpacity
            onPress={() => Linking.openURL('https://appoint.valcode.ch')}
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>Mehr Informationen</Text>
            <Ionicons name="open-outline" size={16} color="#60A5FA" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Domain Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Website-Domain</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="link-outline" size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="meinedomain.de"
            placeholderTextColor="#6B7280"
            value={domain}
            onChangeText={(text) => {
              setDomain(text);
              setError("");
            }}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={16} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Text style={styles.hint}>
          Beispiele: meinefirma.de, booking.salon-mueller.com
        </Text>
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        style={[styles.continueButton, isValidating && styles.continueButtonDisabled]}
        onPress={handleContinue}
        disabled={isValidating}
      >
        {isValidating ? (
          <>
            <ActivityIndicator color="#FFFFFF" />
            <Text style={styles.continueButtonText}>Verbinde...</Text>
          </>
        ) : (
          <>
            <Text style={styles.continueButtonText}>Weiter</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </>
        )}
      </TouchableOpacity>
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
  header: {
    alignItems: "center",
    marginBottom: 32,
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
  infoCard: {
    flexDirection: "row",
    backgroundColor: "rgba(96, 165, 250, 0.1)",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "rgba(96, 165, 250, 0.2)",
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#60A5FA",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: "#9CA3AF",
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
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
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
  },
  hint: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 8,
  },
  continueButton: {
    backgroundColor: "#7C3AED",
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#7C3AED",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  linkText: {
    fontSize: 14,
    color: "#60A5FA",
    fontWeight: "600",
  },
});
