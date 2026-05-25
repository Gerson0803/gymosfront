'use client';

import React, { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react';

interface AppSettings {
  gymName: string;
  notifications?: boolean;
  emailNotifications?: boolean;
}

interface AppSettingsContextType {
  gymName: string;
  commitGymName: (name: string) => void;
  notifications: boolean;
  setNotifications: (value: boolean) => void;
  emailNotifications: boolean;
  setEmailNotifications: (value: boolean) => void;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

function persistSettings(settings: AppSettings) {
  localStorage.setItem('appSettings', JSON.stringify(settings));
}

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [gymName, setGymNameState] = useState('GymOS');
  const [notifications, setNotificationsState] = useState(true);
  const [emailNotifications, setEmailNotificationsState] = useState(true);

  useLayoutEffect(() => {
    const saved = localStorage.getItem('appSettings');
    if (saved) {
      try {
        const settings = JSON.parse(saved) as AppSettings;
        if (settings.gymName) {
          setGymNameState(settings.gymName);
        }
        if (settings.notifications !== undefined) {
          setNotificationsState(settings.notifications);
        }
        if (settings.emailNotifications !== undefined) {
          setEmailNotificationsState(settings.emailNotifications);
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
    persistSettings({ gymName, notifications, emailNotifications });
  }, [notifications, emailNotifications, mounted]);

  const commitGymName = (name: string) => {
    const value = name.trim() || 'GymOS';
    setGymNameState(value);
    persistSettings({
      gymName: value,
      notifications,
      emailNotifications,
    });
  };

  const setNotifications = (value: boolean) => setNotificationsState(value);
  const setEmailNotifications = (value: boolean) => setEmailNotificationsState(value);

  return (
    <AppSettingsContext.Provider
      value={{
        gymName,
        commitGymName,
        notifications,
        setNotifications,
        emailNotifications,
        setEmailNotifications,
      }}
    >
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
