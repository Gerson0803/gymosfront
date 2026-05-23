'use client';

import React, { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react';

interface AppSettings {
  gymName: string;
}

interface AppSettingsContextType {
  gymName: string;
  setGymName: (name: string) => void;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [gymName, setGymNameState] = useState('GymOS');

  useLayoutEffect(() => {
    const saved = localStorage.getItem('appSettings');
    if (saved) {
      try {
        const settings = JSON.parse(saved) as AppSettings;
        if (settings.gymName) {
          setGymNameState(settings.gymName);
        }
      } catch (e) {
        console.error('Failed to parse app settings:', e);
      }
    }

    const root = document.documentElement;
    const body = document.body;
    root.classList.remove('dark');
    body.classList.remove('dark');
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('appSettings', JSON.stringify({ gymName }));
  }, [gymName, mounted]);

  const setGymName = (name: string) => setGymNameState(name);

  return (
    <AppSettingsContext.Provider value={{ gymName, setGymName }}>
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
