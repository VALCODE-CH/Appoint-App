import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import de from './locales/de.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import hr from './locales/hr.json';
import pt from './locales/pt.json';

const LANGUAGE_STORAGE_KEY = '@appoint_language';

// Language detector plugin
const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lang: string) => void) => {
    try {
      // First, try to get saved language from storage
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage) {
        return callback(savedLanguage);
      }

      // If no saved language, use device language
      const deviceLanguage = Localization.getLocales()[0]?.languageCode;

      // Fallback to German if device language is not supported
      const supportedLanguages = ['de', 'en', 'fr', 'hr', 'pt'];
      const languageToUse = deviceLanguage && supportedLanguages.includes(deviceLanguage)
        ? deviceLanguage
        : 'de';

      callback(languageToUse);
    } catch (error) {
      console.error('Error detecting language:', error);
      callback('de'); // Fallback to German on error
    }
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: {
      de: { translation: de },
      en: { translation: en },
      fr: { translation: fr },
      hr: { translation: hr },
      pt: { translation: pt },
    },
    fallbackLng: 'de',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;

// Helper function to change language
export const changeLanguage = async (language: string) => {
  try {
    await i18n.changeLanguage(language);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    console.error('Error changing language:', error);
  }
};

// Helper function to get current language
export const getCurrentLanguage = () => i18n.language;

// Helper function to get available languages
export const getAvailableLanguages = () => [
  { code: 'de', name: 'Deutsch' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'hr', name: 'Hrvatski' },
  { code: 'pt', name: 'Português' },
];
