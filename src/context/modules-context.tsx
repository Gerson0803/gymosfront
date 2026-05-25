'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import {
  getModuleCatalog,
  getGymModules,
  activateModule as activateModuleApi,
  deactivateModule as deactivateModuleApi,
  getAuthToken,
} from '@/lib/api';

export interface ModuleInfo {
  id: string;
  key: string;
  name: string;
  description?: string;
  price: number;
  icon?: string;
}

export interface GymModuleInfo {
  id: string;
  gymId: string;
  moduleId: string;
  status: 'TRIAL' | 'ACTIVE' | 'EXPIRED';
  activatedAt?: string;
  trialEndsAt?: string;
  module: ModuleInfo;
}

interface ModulesContextValue {
  modules: ModuleInfo[];
  gymModules: GymModuleInfo[];
  loading: boolean;
  error: string | null;
  isModuleEnabled: (key: string) => boolean;
  activateModule: (key: string) => Promise<void>;
  deactivateModule: (key: string) => Promise<void>;
  refreshModules: () => Promise<void>;
}

const ModulesContext = createContext<ModulesContextValue | null>(null);

export function ModulesProvider({ children }: { children: ReactNode }) {
  const [modules, setModules] = useState<ModuleInfo[]>([]);
  const [gymModules, setGymModules] = useState<GymModuleInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshModules = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [catalogRes, gymModulesRes] = await Promise.all([
        getModuleCatalog(),
        getGymModules(),
      ]);

      const catalogData = catalogRes as any;
      const gymModulesData = gymModulesRes as any;

      setModules(catalogData.data || []);
      setGymModules(gymModulesData.data || []);
    } catch (err) {
      console.error('Error loading modules:', err);
      setError(err instanceof Error ? err.message : 'Failed to load modules');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshModules();
  }, [refreshModules]);

  const isModuleEnabled = useCallback(
    (key: string) => {
      const gymModule = gymModules.find(
        (gm) => gm.module.key === key && (gm.status === 'ACTIVE' || gm.status === 'TRIAL')
      );

      if (!gymModule) return false;

      if (gymModule.status === 'ACTIVE') return true;

      if (gymModule.status === 'TRIAL' && gymModule.trialEndsAt) {
        return new Date(gymModule.trialEndsAt) > new Date();
      }

      return false;
    },
    [gymModules]
  );

  const activateModule = useCallback(
    async (key: string) => {
      try {
        await activateModuleApi(key);
        await refreshModules();
      } catch (err) {
        throw err;
      }
    },
    [refreshModules]
  );

  const deactivateModule = useCallback(
    async (key: string) => {
      try {
        await deactivateModuleApi(key);
        await refreshModules();
      } catch (err) {
        throw err;
      }
    },
    [refreshModules]
  );

  const value = useMemo<ModulesContextValue>(
    () => ({
      modules,
      gymModules,
      loading,
      error,
      isModuleEnabled,
      activateModule,
      deactivateModule,
      refreshModules,
    }),
    [
      modules,
      gymModules,
      loading,
      error,
      isModuleEnabled,
      activateModule,
      deactivateModule,
      refreshModules,
    ]
  );

  return (
    <ModulesContext.Provider value={value}>{children}</ModulesContext.Provider>
  );
}

export function useModules() {
  const context = useContext(ModulesContext);
  if (!context) {
    throw new Error('useModules must be used within ModulesProvider');
  }
  return context;
}
