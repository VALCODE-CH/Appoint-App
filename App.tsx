import { useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, SafeAreaView, Platform, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { Dashboard } from "./components/Dashboard";
import { StaffList } from "./components/StaffList";
import { StaffDetail } from "./components/StaffDetail";
import { ServicesList } from "./components/ServicesList";
import { CustomersList } from "./components/CustomersList";
import { Appointments } from "./components/Appointments";
import { Settings } from "./components/Settings";
import { Onboarding } from "./components/Onboarding";
import { StorageService } from "./services/storage";
import { API } from "./services/api";

type Tab = "dashboard" | "staff" | "services" | "customers" | "appointments";
type Screen = "dashboard" | "staff-list" | "staff-detail" | "services" | "customers" | "appointments" | "settings";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [currentScreen, setCurrentScreen] = useState<Screen>("dashboard");
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(Date.now());

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

  const navigateBack = () => {
    setCurrentScreen("staff-list");
  };

  const navigateToSettings = () => {
    setCurrentScreen("settings");
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    switch (tab) {
      case "dashboard":
        setCurrentScreen("dashboard");
        // Trigger Dashboard refresh
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
        return <StaffDetail staffId={selectedStaffId} onBack={navigateBack} />;
      case "services":
        return <ServicesList />;
      case "customers":
        return <CustomersList />;
      case "appointments":
        return <Appointments />;
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

  // Main App
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Main Content */}
      <View style={styles.content}>
        {renderScreen()}
      </View>

      {/* Bottom Tab Navigation - Modern Design */}
      <View style={styles.tabBarContainer}>
        <View style={styles.tabBar}>
          {(["dashboard", "staff", "services", "customers", "appointments"] as Tab[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => handleTabChange(tab)}
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
