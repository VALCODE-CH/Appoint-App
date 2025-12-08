import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeServiceInstance, Theme, STANDARD_THEME } from '../services/theme';
import { StorageService } from '../services/storage';

interface ThemeContextType {
  theme: Theme;
  refreshTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(STANDARD_THEME);

  useEffect(() => {
    initializeTheme();
  }, []);

  const initializeTheme = async () => {
    try {
      // First, just load the theme mode from storage without calling API
      const savedMode = await StorageService.getThemeMode();
      console.log('🎨 Theme mode loaded from storage:', savedMode);

      // If custom mode, try to initialize (will call API)
      // If it fails, ThemeService will use standard theme temporarily
      if (savedMode === 'custom') {
        console.log('🎨 Custom theme mode detected, initializing theme service...');
        await ThemeServiceInstance.initialize();
        const currentTheme = ThemeServiceInstance.getTheme();
        setTheme(currentTheme);
        console.log('🎨 Theme loaded:', currentTheme.primary);
      } else {
        console.log('🎨 Standard theme mode, using default colors');
        setTheme(STANDARD_THEME);
      }
    } catch (error) {
      console.error('Error initializing theme:', error);
      setTheme(STANDARD_THEME);
    }
  };

  const refreshTheme = async () => {
    try {
      await ThemeServiceInstance.initialize();
      const currentTheme = ThemeServiceInstance.getTheme();
      setTheme(currentTheme);
    } catch (error) {
      console.error('Error refreshing theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, refreshTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
