"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface AppSettings {
  notifications?: boolean;
  emailNotifications?: boolean;
}

interface AppSettingsContextType {
  notifications: boolean;
  setNotifications: (value: boolean) => void;
  emailNotifications: boolean;
  setEmailNotifications: (value: boolean) => void;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(
  undefined,
);

function persistSettings(settings: AppSettings) {
  localStorage.setItem("appSettings", JSON.stringify(settings));
}

function getStoredAppSettings(): AppSettings {
  if (typeof window === "undefined") {
    return {};
  }

  const saved = localStorage.getItem("appSettings");
  if (!saved) {
    return {};
  }

  try {
    return (JSON.parse(saved) as AppSettings) ?? {};
  } catch (e) {
    console.error("Failed to parse app settings:", e);
    return {};
  }
}

export function AppSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const hasMountedRef = useRef(false);
  const [notifications, setNotificationsState] = useState(
    () => getStoredAppSettings().notifications ?? true,
  );
  const [emailNotifications, setEmailNotificationsState] = useState(
    () => getStoredAppSettings().emailNotifications ?? true,
  );

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    root.classList.remove("dark");
    body.classList.remove("dark");
    hasMountedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hasMountedRef.current) return;
    persistSettings({ notifications, emailNotifications });
  }, [notifications, emailNotifications]);

  const setNotifications = (value: boolean) => setNotificationsState(value);
  const setEmailNotifications = (value: boolean) =>
    setEmailNotificationsState(value);

  return (
    <AppSettingsContext.Provider
      value={{
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
    throw new Error("useAppSettings must be used within AppSettingsProvider");
  }
  return context;
}
