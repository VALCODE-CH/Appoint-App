import { useState, useEffect, useRef } from "react";
import { View, TouchableOpacity, StyleSheet, SafeAreaView, Platform, ActivityIndicator, Animated, Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { GestureHandlerRootView, GestureDetector, Gesture } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { Dashboard } from "./components/Dashboard";
import { StaffList } from "./components/StaffList";
import { StaffDetail } from "./components/StaffDetail";
import { ServicesList } from "./components/ServicesList";
import { ServiceDetail } from "./components/ServiceDetail";
import { CustomersList } from "./components/CustomersList";
import { CustomerDetail } from "./components/CustomerDetail";
import { Appointments } from "./components/Appointments";
import { AppointmentDetail } from "./components/AppointmentDetail";
import { Settings } from "./components/Settings";
import { Onboarding } from "./components/Onboarding";
import { StorageService } from "./services/storage";
import { API } from "./services/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TABS: Tab[] = ["dashboard", "staff", "services", "customers", "appointments"];

type Tab = "dashboard" | "staff" | "services" | "customers" | "appointments";
type Screen = "dashboard" | "staff-list" | "staff-detail" | "services" | "services-detail" | "customers" | "customers-detail" | "appointments" | "appointments-detail" | "settings";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [currentScreen, setCurrentScreen] = useState<Screen>("dashboard");
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(Date.now());

  // Animation values
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // Check if user has completed onboarding
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const onboardingCompleted = await StorageService.isOnboardingCompleted();
      const token = await StorageService.getToken();
      const domain = await StorageService.getDomain();

      // Initialisiere API mit gespeicherten Werten
      if (domain && token) {
        await API.initialize();

        // Aktualisiere Permissions automatisch beim App-Start
        try {
          console.log("===============================================");
          console.log("AKTUALISIERE PERMISSIONS BEIM APP-START");
          console.log("===============================================");
          console.log("Rufe /auth/validate auf...");

          const response = await API.validateToken();

          console.log("===============================================");
          console.log("KOMPLETTE RESPONSE VON /auth/validate:");
          console.log(JSON.stringify(response, null, 2));
          console.log("===============================================");
          console.log("Staff-Daten:");
          console.log(JSON.stringify(response.staff, null, 2));
          console.log("===============================================");
          console.log("Permissions vom Server:");
          console.log(JSON.stringify(response.staff.permissions, null, 2));
          console.log("===============================================");

          // Speichere aktualisierte Staff-Daten
          await StorageService.saveStaffData(response.staff);

          // Speichere auch License-Daten falls vorhanden
          if (response.license) {
            await StorageService.saveLicenseData(response.license);
            console.log("License-Daten gespeichert:", JSON.stringify(response.license, null, 2));
          }

          console.log("✅ Permissions erfolgreich aktualisiert und gespeichert");
          console.log("===============================================");
        } catch (permError) {
          console.error("===============================================");
          console.error("❌ FEHLER beim Aktualisieren der Permissions:");
          console.error(permError);
          console.error("===============================================");

          // Wenn Token ungültig ist, logout
          if (permError instanceof Error &&
              (permError.message.includes("401") ||
               permError.message.includes("Invalid or expired token"))) {
            console.log("⚠️ Token ungültig oder abgelaufen - Automatischer Logout");
            await StorageService.clearAll();
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
          }
          // Bei anderen Fehlern trotzdem fortfahren mit gecachten Daten
          console.log("⚠️ Fortfahren mit gecachten Daten");
        }
      }

      setIsAuthenticated(onboardingCompleted && !!token && !!domain);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = async (domain: string, token: string, staff: any, license: any) => {
    try {
      await StorageService.saveDomain(domain);
      await StorageService.saveToken(token);
      await StorageService.saveStaffData(staff);
      await StorageService.saveLicenseData(license);
      await StorageService.setOnboardingCompleted();
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const navigateToStaffDetail = (staffId: number) => {
    setSelectedStaffId(staffId);
    setCurrentScreen("staff-detail");
  };

  const navigateToServiceDetail = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setCurrentScreen("services-detail");
  };

  const navigateToCustomerDetail = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setCurrentScreen("customers-detail");
  };

  const navigateToAppointmentDetail = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setCurrentScreen("appointments-detail");
  };

  const navigateBackFromStaff = () => {
    setCurrentScreen("staff-list");
  };

  const navigateBackFromService = () => {
    setCurrentScreen("services");
  };

  const navigateBackFromCustomer = () => {
    setCurrentScreen("customers");
  };

  const navigateBackFromAppointment = () => {
    setCurrentScreen("appointments");
  };

  const navigateToSettings = () => {
    setCurrentScreen("settings");
  };

  const handleTabChange = (tab: Tab, animated: boolean = true) => {
    const currentIndex = TABS.indexOf(activeTab);
    const newIndex = TABS.indexOf(tab);
    const direction = newIndex > currentIndex ? -1 : 1;

    if (animated) {
      // Fade out + slide
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: direction * 20,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Update tab
        setActiveTab(tab);
        switch (tab) {
          case "dashboard":
            setCurrentScreen("dashboard");
            setDashboardRefreshKey(Date.now());
            break;
          case "staff":
            setCurrentScreen("staff-list");
            break;
          case "services":
            setCurrentScreen("services");
            break;
          case "customers":
            setCurrentScreen("customers");
            break;
          case "appointments":
            setCurrentScreen("appointments");
            break;
        }

        // Reset position and fade in
        translateX.setValue(direction * -20);
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(translateX, {
            toValue: 0,
            tension: 80,
            friction: 10,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      setActiveTab(tab);
      switch (tab) {
        case "dashboard":
          setCurrentScreen("dashboard");
          setDashboardRefreshKey(Date.now());
          break;
        case "staff":
          setCurrentScreen("staff-list");
          break;
        case "services":
          setCurrentScreen("services");
          break;
        case "customers":
          setCurrentScreen("customers");
          break;
        case "appointments":
          setCurrentScreen("appointments");
          break;
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentScreen("dashboard");
    setActiveTab("dashboard");
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "dashboard":
        return <Dashboard onNavigateToSettings={navigateToSettings} shouldRefresh={dashboardRefreshKey} />;
      case "staff-list":
        return <StaffList onStaffClick={navigateToStaffDetail} />;
      case "staff-detail":
        return <StaffDetail staffId={selectedStaffId} onBack={navigateBackFromStaff} />;
      case "services":
        return <ServicesList onServiceClick={navigateToServiceDetail} />;
      case "services-detail":
        return <ServiceDetail serviceId={selectedServiceId} onBack={navigateBackFromService} />;
      case "customers":
        return <CustomersList onCustomerClick={navigateToCustomerDetail} />;
      case "customers-detail":
        return <CustomerDetail customerId={selectedCustomerId} onBack={navigateBackFromCustomer} />;
      case "appointments":
        return <Appointments onAppointmentClick={navigateToAppointmentDetail} />;
      case "appointments-detail":
        return <AppointmentDetail appointmentId={selectedAppointmentId} onBack={navigateBackFromAppointment} />;
      case "settings":
        return <Settings
          onBack={() => {
            setCurrentScreen("dashboard");
            setDashboardRefreshKey(Date.now()); // Refresh Dashboard when returning from settings
          }}
          onLogout={handleLogout}
        />;
      default:
        return <Dashboard onNavigateToSettings={navigateToSettings} shouldRefresh={dashboardRefreshKey} />;
    }
  };

  const getIconName = (tab: Tab, focused: boolean): keyof typeof Ionicons.glyphMap => {
    switch (tab) {
      case "dashboard":
        return focused ? "home" : "home-outline";
      case "staff":
        return focused ? "people" : "people-outline";
      case "services":
        return focused ? "briefcase" : "briefcase-outline";
      case "customers":
        return focused ? "person-circle" : "person-circle-outline";
      case "appointments":
        return focused ? "calendar" : "calendar-outline";
    }
  };

  // Loading Screen
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  // Show Onboarding if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <StatusBar style="light" />
        <Onboarding onComplete={handleOnboardingComplete} />
      </>
    );
  }

  // Swipe gesture for main tabs only
  const isMainTabScreen = ["dashboard", "staff-list", "services", "customers", "appointments"].includes(currentScreen);

  const panGesture = Gesture.Pan()
    .enabled(isMainTabScreen)
    .onUpdate((event) => {
      if (!isMainTabScreen) return;
      const currentIndex = TABS.indexOf(activeTab);
      const translation = event.translationX;

      // Subtle movement while swiping
      if ((currentIndex > 0 && translation > 0) || (currentIndex < TABS.length - 1 && translation < 0)) {
        translateX.setValue(translation * 0.3);
      }
    })
    .onEnd((event) => {
      if (!isMainTabScreen) return;

      const currentIndex = TABS.indexOf(activeTab);
      const velocity = event.velocityX;
      const translation = event.translationX;

      const shouldSwitchTab = Math.abs(translation) > SCREEN_WIDTH / 4 || Math.abs(velocity) > 800;

      if (shouldSwitchTab) {
        if (translation > 0 && currentIndex > 0) {
          // Swipe right - previous tab
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          handleTabChange(TABS[currentIndex - 1]);
        } else if (translation < 0 && currentIndex < TABS.length - 1) {
          // Swipe left - next tab
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          handleTabChange(TABS[currentIndex + 1]);
        } else {
          // Spring back
          Animated.spring(translateX, {
            toValue: 0,
            tension: 80,
            friction: 10,
            useNativeDriver: true,
          }).start();
        }
      } else {
        // Spring back
        Animated.spring(translateX, {
          toValue: 0,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }).start();
      }
    });

  // Main App
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />

        {/* Main Content with Swipe Gesture */}
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.content,
              {
                opacity,
                transform: [{ translateX }],
              },
            ]}
          >
            {renderScreen()}
          </Animated.View>
        </GestureDetector>

        {/* Bottom Tab Navigation - Modern Design */}
        <View style={styles.tabBarContainer}>
          <View style={styles.tabBar}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    handleTabChange(tab);
                  }}
                  style={[styles.tabItem, isActive && styles.tabItemActive]}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
                    <Ionicons
                      name={getIconName(tab, isActive)}
                      size={24}
                      color={isActive ? "#FFFFFF" : "#6B7280"}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  content: {
    flex: 1,
  },
  tabBarContainer: {
    backgroundColor: "#121212",
    paddingBottom: Platform.OS === "ios" ? 0 : 8,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#1E1E1E",
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: 8,
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 8,
    justifyContent: "space-around",
    shadowColor: "#7C3AED",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  tabItemActive: {
    transform: [{ scale: 1.05 }],
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainerActive: {
    backgroundColor: "#7C3AED",
    shadowColor: "#7C3AED",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
});
