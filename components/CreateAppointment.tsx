import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { API, Service, Staff } from "../services/api";
import { StorageService } from "../services/storage";

interface CreateAppointmentProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function CreateAppointment({ onBack, onSuccess }: CreateAppointmentProps) {
  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("pending");

  // Data state
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentStaffId, setCurrentStaffId] = useState<string>("");

  // UI state
  const [showServicePicker, setShowServicePicker] = useState(false);
  const [showStaffPicker, setShowStaffPicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoadingData(true);

      // Lade aktuellen Staff
      const currentStaff = await StorageService.getStaffData();
      if (currentStaff) {
        setCurrentStaffId(currentStaff.id);
        setSelectedStaffId(currentStaff.id); // Automatisch vorauswählen
      }

      // Lade Services und Staff parallel
      const [servicesData, staffData] = await Promise.all([
        API.getServices(),
        API.getStaff()
      ]);

      // Filter nur aktive Services
      const activeServices = servicesData.filter(s => s.active === "1");
      setServices(activeServices);
      setStaff(staffData);

    } catch (error: any) {
      console.error("Error loading data:", error);
      Alert.alert("Fehler", "Daten konnten nicht geladen werden: " + error.message);
    } finally {
      setIsLoadingData(false);
    }
  };

  const validateForm = (): boolean => {
    if (!customerName.trim()) {
      Alert.alert("Fehler", "Bitte gib einen Kundennamen ein.");
      return false;
    }

    if (!customerEmail.trim()) {
      Alert.alert("Fehler", "Bitte gib eine E-Mail-Adresse ein.");
      return false;
    }

    // Einfache E-Mail-Validierung
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      Alert.alert("Fehler", "Bitte gib eine gültige E-Mail-Adresse ein.");
      return false;
    }

    if (!selectedServiceId) {
      Alert.alert("Fehler", "Bitte wähle eine Dienstleistung aus.");
      return false;
    }

    if (!selectedStaffId) {
      Alert.alert("Fehler", "Bitte wähle einen Mitarbeiter aus.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);

      // Formatiere Datum und Zeit
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      const hours = String(selectedTime.getHours()).padStart(2, '0');
      const minutes = String(selectedTime.getMinutes()).padStart(2, '0');
      const timeString = `${hours}:${minutes}`;

      // Kombiniere Datum und Zeit
      const startsAt = `${dateString} ${timeString}:00`;

      // Berechne End-Zeit basierend auf Service-Dauer
      const selectedService = services.find(s => s.id === selectedServiceId);
      const durationMinutes = selectedService ? parseInt(selectedService.duration_minutes) : 60;

      const startDateTime = new Date(selectedDate);
      startDateTime.setHours(selectedTime.getHours());
      startDateTime.setMinutes(selectedTime.getMinutes());

      const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);

      const endsAt = `${dateString} ${endDateTime.getHours().toString().padStart(2, '0')}:${endDateTime.getMinutes().toString().padStart(2, '0')}:00`;

      // API Call
      await API.createAppointment({
        service_id: parseInt(selectedServiceId),
        staff_id: parseInt(selectedStaffId),
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim(),
        customer_phone: customerPhone.trim() || "",
        starts_at: startsAt,
        ends_at: endsAt,
        status: status,
        notes: notes.trim() || undefined
      });

      Alert.alert(
        "Erfolg",
        "Termin wurde erfolgreich erstellt.",
        [
          {
            text: "OK",
            onPress: () => {
              onSuccess();
              onBack();
            }
          }
        ]
      );

    } catch (error: any) {
      console.error("Error creating appointment:", error);
      Alert.alert("Fehler", error.message || "Termin konnte nicht erstellt werden.");
    } finally {
      setIsSaving(false);
    }
  };

  const getServiceName = (serviceId: string): string => {
    const service = services.find(s => s.id === serviceId);
    return service ? service.name : "Dienstleistung wählen";
  };

  const getStaffName = (staffId: string): string => {
    const staffMember = staff.find(s => s.id === staffId);
    return staffMember ? staffMember.name : "Mitarbeiter wählen";
  };

  const getStatusLabel = (statusValue: string): string => {
    switch (statusValue) {
      case "confirmed": return "Bestätigt";
      case "pending": return "Ausstehend";
      case "cancelled": return "Abgesagt";
      default: return statusValue;
    }
  };

  const formatDisplayDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const formatDisplayTime = (date: Date): string => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleDateChange = (event: any, date?: Date) => {
    // Auf Android wird der Picker automatisch geschlossen
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (event.type === 'set' && date) {
      setSelectedDate(date);
      // Auf iOS bleibt der Picker offen zum weiteren Bearbeiten
    } else if (event.type === 'dismissed') {
      // Benutzer hat abgebrochen
      setShowDatePicker(false);
    }
  };

  const handleTimeChange = (event: any, date?: Date) => {
    // Auf Android wird der Picker automatisch geschlossen
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }

    if (event.type === 'set' && date) {
      setSelectedTime(date);
      // Auf iOS bleibt der Picker offen zum weiteren Bearbeiten
    } else if (event.type === 'dismissed') {
      // Benutzer hat abgebrochen
      setShowTimePicker(false);
    }
  };

  if (isLoadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Lade Daten...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Neuer Termin</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Kundendaten */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kundendaten</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="Max Mustermann"
              placeholderTextColor="#6B7280"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-Mail *</Text>
            <TextInput
              style={styles.input}
              value={customerEmail}
              onChangeText={setCustomerEmail}
              placeholder="max@example.com"
              placeholderTextColor="#6B7280"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefon</Text>
            <TextInput
              style={styles.input}
              value={customerPhone}
              onChangeText={setCustomerPhone}
              placeholder="+49 123 456789"
              placeholderTextColor="#6B7280"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Termindetails */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Termindetails</Text>

          {/* Service Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dienstleistung *</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowServicePicker(!showServicePicker)}
            >
              <Text style={[styles.pickerButtonText, selectedServiceId && styles.pickerButtonTextSelected]}>
                {getServiceName(selectedServiceId)}
              </Text>
              <Ionicons name={showServicePicker ? "chevron-up" : "chevron-down"} size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {showServicePicker && (
              <View style={styles.pickerOptions}>
                {services.map((service) => (
                  <TouchableOpacity
                    key={service.id}
                    style={[
                      styles.pickerOption,
                      selectedServiceId === service.id && styles.pickerOptionSelected
                    ]}
                    onPress={() => {
                      setSelectedServiceId(service.id);
                      setShowServicePicker(false);
                    }}
                  >
                    <View style={styles.pickerOptionContent}>
                      <Text style={styles.pickerOptionText}>{service.name}</Text>
                      <Text style={styles.pickerOptionSubtext}>
                        {service.duration_minutes} Min • {service.price}€
                      </Text>
                    </View>
                    {selectedServiceId === service.id && (
                      <Ionicons name="checkmark" size={20} color="#7C3AED" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Staff Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mitarbeiter *</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowStaffPicker(!showStaffPicker)}
            >
              <Text style={[styles.pickerButtonText, selectedStaffId && styles.pickerButtonTextSelected]}>
                {getStaffName(selectedStaffId)}
              </Text>
              <Ionicons name={showStaffPicker ? "chevron-up" : "chevron-down"} size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {showStaffPicker && (
              <View style={styles.pickerOptions}>
                {staff.map((member) => (
                  <TouchableOpacity
                    key={member.id}
                    style={[
                      styles.pickerOption,
                      selectedStaffId === member.id && styles.pickerOptionSelected
                    ]}
                    onPress={() => {
                      setSelectedStaffId(member.id);
                      setShowStaffPicker(false);
                    }}
                  >
                    <View style={styles.pickerOptionContent}>
                      <Text style={styles.pickerOptionText}>{member.name}</Text>
                      <Text style={styles.pickerOptionSubtext}>{member.email}</Text>
                    </View>
                    {selectedStaffId === member.id && (
                      <Ionicons name="checkmark" size={20} color="#7C3AED" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Datum */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Datum *</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.dateTimeDisplay}>
                <Ionicons name="calendar-outline" size={20} color="#7C3AED" />
                <Text style={styles.pickerButtonTextSelected}>
                  {formatDisplayDate(selectedDate)}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {showDatePicker && (
              <>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                  locale="de-DE"
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={styles.pickerDoneButton}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.pickerDoneButtonText}>Fertig</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

          {/* Zeit */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Uhrzeit *</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowTimePicker(true)}
            >
              <View style={styles.dateTimeDisplay}>
                <Ionicons name="time-outline" size={20} color="#7C3AED" />
                <Text style={styles.pickerButtonTextSelected}>
                  {formatDisplayTime(selectedTime)}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {showTimePicker && (
              <>
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleTimeChange}
                  is24Hour={true}
                  locale="de-DE"
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={styles.pickerDoneButton}
                    onPress={() => setShowTimePicker(false)}
                  >
                    <Text style={styles.pickerDoneButtonText}>Fertig</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

          {/* Status Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Status</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowStatusPicker(!showStatusPicker)}
            >
              <Text style={styles.pickerButtonTextSelected}>
                {getStatusLabel(status)}
              </Text>
              <Ionicons name={showStatusPicker ? "chevron-up" : "chevron-down"} size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {showStatusPicker && (
              <View style={styles.pickerOptions}>
                {[
                  { value: "pending", label: "Ausstehend" },
                  { value: "confirmed", label: "Bestätigt" },
                  { value: "cancelled", label: "Abgesagt" }
                ].map((statusOption) => (
                  <TouchableOpacity
                    key={statusOption.value}
                    style={[
                      styles.pickerOption,
                      status === statusOption.value && styles.pickerOptionSelected
                    ]}
                    onPress={() => {
                      setStatus(statusOption.value);
                      setShowStatusPicker(false);
                    }}
                  >
                    <Text style={styles.pickerOptionText}>{statusOption.label}</Text>
                    {status === statusOption.value && (
                      <Ionicons name="checkmark" size={20} color="#7C3AED" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Notizen */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notizen</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional: Zusätzliche Informationen..."
              placeholderTextColor="#6B7280"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSaving && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Termin erstellen</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#2A2A2A",
  },
  textArea: {
    minHeight: 100,
    paddingTop: 16,
  },
  hint: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  pickerButton: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2A2A2A",
  },
  pickerButtonText: {
    fontSize: 16,
    color: "#6B7280",
  },
  pickerButtonTextSelected: {
    color: "#FFFFFF",
  },
  dateTimeDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pickerDoneButton: {
    backgroundColor: "#7C3AED",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    marginTop: 12,
  },
  pickerDoneButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  pickerOptions: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 2,
    borderColor: "#2A2A2A",
    overflow: "hidden",
  },
  pickerOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  pickerOptionSelected: {
    backgroundColor: "rgba(124, 58, 237, 0.1)",
  },
  pickerOptionContent: {
    flex: 1,
  },
  pickerOptionText: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  pickerOptionSubtext: {
    fontSize: 14,
    color: "#6B7280",
  },
  submitButton: {
    backgroundColor: "#7C3AED",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    shadowColor: "#7C3AED",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
