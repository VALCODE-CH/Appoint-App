import AsyncStorage from '@react-native-async-storage/async-storage';

const DOMAIN_KEY = '@appoint_domain';
const TOKEN_KEY = '@appoint_token';
const ONBOARDING_KEY = '@appoint_onboarding_completed';

export const StorageService = {
  // Domain
  async saveDomain(domain: string): Promise<void> {
    try {
      await AsyncStorage.setItem(DOMAIN_KEY, domain);
    } catch (error) {
      console.error('Error saving domain:', error);
      throw error;
    }
  },

  async getDomain(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(DOMAIN_KEY);
    } catch (error) {
      console.error('Error getting domain:', error);
      return null;
    }
  },

  // Auth Token
  async saveToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving token:', error);
      throw error;
    }
  },

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  // Onboarding Status
  async setOnboardingCompleted(): Promise<void> {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (error) {
      console.error('Error setting onboarding status:', error);
      throw error;
    }
  },

  async isOnboardingCompleted(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  },

  // Clear all data (logout)
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([DOMAIN_KEY, TOKEN_KEY, ONBOARDING_KEY]);
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },
};
