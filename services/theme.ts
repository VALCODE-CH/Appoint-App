import { StorageService } from './storage';
import { API, DesignSettings } from './api';

// Standard Theme (current app design)
export const STANDARD_THEME = {
  background: '#121212',
  card: '#1E1E1E',
  cardSecondary: '#2A2A2A',
  primary: '#7C3AED',
  primaryLight: '#9F67FF',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  border: '#333333',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  shadow: '#7C3AED',
};

export type Theme = typeof STANDARD_THEME;

export type ThemeMode = 'standard' | 'custom';

class ThemeService {
  private currentTheme: Theme = STANDARD_THEME;
  private customDesignSettings: DesignSettings | null = null;
  private themeMode: ThemeMode = 'standard';

  async initialize() {
    try {
      // Load saved theme mode
      const savedMode = await StorageService.getThemeMode();
      this.themeMode = savedMode;

      if (this.themeMode === 'custom') {
        await this.loadCustomTheme();
      } else {
        this.currentTheme = STANDARD_THEME;
      }
    } catch (error) {
      console.error('Error initializing theme:', error);
      this.currentTheme = STANDARD_THEME;
      this.themeMode = 'standard';
    }
  }

  async loadCustomTheme() {
    try {
      const designSettings = await API.getDesignSettings();
      this.customDesignSettings = designSettings;

      // Map server colors to app theme
      this.currentTheme = {
        background: '#121212', // Keep dark background
        card: '#1E1E1E', // Keep dark cards
        cardSecondary: '#2A2A2A',
        primary: designSettings.accent_color,
        primaryLight: designSettings.accent_gradient_start,
        text: '#FFFFFF',
        textSecondary: '#A0A0A0',
        border: '#333333',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        shadow: designSettings.accent_color,
      };
    } catch (error) {
      console.error('Error loading custom theme:', error);
      console.warn('Custom theme loading failed, using standard theme temporarily. Theme mode stays "custom".');
      // Use standard theme temporarily but keep mode as custom
      // So it will retry next time
      this.currentTheme = STANDARD_THEME;
    }
  }

  async setThemeMode(mode: ThemeMode) {
    this.themeMode = mode;
    await StorageService.saveThemeMode(mode);

    if (mode === 'custom') {
      await this.loadCustomTheme();
    } else {
      this.currentTheme = STANDARD_THEME;
    }
  }

  getTheme(): Theme {
    return this.currentTheme;
  }

  getThemeMode(): ThemeMode {
    return this.themeMode;
  }

  getCustomDesignSettings(): DesignSettings | null {
    return this.customDesignSettings;
  }
}

export const ThemeServiceInstance = new ThemeService();
