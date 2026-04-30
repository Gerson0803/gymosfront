'use client';

import React, { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface AppSettings {
  theme: Theme;
  gymName: string;
}

interface AppSettingsContextType {
  theme: Theme;
  gymName: string;
  setTheme: (theme: Theme) => void;
  setGymName: (name: string) => void;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [theme, setThemeState] = useState<Theme>('light');
  const [gymName, setGymNameState] = useState('GymOS');

  useEffect(() => {
    const saved = localStorage.getItem('appSettings');
    if (saved) {
      try {
        const settings = JSON.parse(saved) as AppSettings;
        setThemeState(settings.theme);
        setGymNameState(settings.gymName);
      } catch (e) {
        console.error('Failed to parse app settings:', e);
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('appSettings', JSON.stringify({ theme, gymName }));
  }, [theme, gymName, mounted]);

  useLayoutEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const body = document.body;

    root.classList.toggle('dark', theme === 'dark');
    body.classList.toggle('dark', theme === 'dark');
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => setThemeState(newTheme);
  const setGymName = (name: string) => setGymNameState(name);

  return (
    <AppSettingsContext.Provider value={{ theme, gymName, setTheme, setGymName }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within AppSettingsProvider');
  }
  return context;
}
