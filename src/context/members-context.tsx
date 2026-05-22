"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  getMembers,
  createMember as createMemberAPI,
  updateMember as updateMemberAPI,
  deleteMember as deleteMemberAPI,
  getAuthToken,
  logout,
  purgeLegacyAuthStorage,
} from "@/lib/api";
import type { Member } from "@/types/member";

type MemberInput = Partial<Omit<Member, "id" | "createdAt" | "updatedAt">> &
  Pick<Member, "name" | "email" | "phone" | "goal" | "experienceLevel" | "membershipType" | "monthlyPrice">;

type MembersContextValue = {
  members: Member[];
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  addMember: (payload: MemberInput) => Promise<Member>;
  updateMember: (id: string, payload: Partial<MemberInput>) => Promise<Member | null>;
  getMemberById: (id: string) => Member | undefined;
  deleteMember: (id: string) => Promise<void>;
  refreshMembers: () => Promise<void>;
};

const MembersContext = createContext<MembersContextValue | null>(null);

export function MembersProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const refreshMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMembers();
      console.log('RAW DATA:', JSON.stringify(data));
      const raw = data as any;
      const list = Array.isArray(raw) ? raw : raw.data?.members || raw.data?.items || raw.data || raw.items || [];
      setMembers(list);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load members";
      if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
        logout();
      }
      setError(errorMessage);
      console.error("Error refreshing members:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const syncAuthState = useCallback(() => {
    const token = getAuthToken();
    if (token) {
      setIsAuthenticated(true);
      void refreshMembers();
    } else {
      setIsAuthenticated(false);
      setMembers([]);
      setLoading(false);
    }
  }, [refreshMembers]);

  useEffect(() => {
    purgeLegacyAuthStorage();
    syncAuthState();
  }, [syncAuthState]);

  useEffect(() => {
    const onAuthChanged = () => syncAuthState();
    window.addEventListener("auth:changed", onAuthChanged);
    return () => window.removeEventListener("auth:changed", onAuthChanged);
  }, [syncAuthState]);

  useEffect(() => {
    const handleMembersRefresh = () => {
      void refreshMembers();
    };

    window.addEventListener("members:refresh", handleMembersRefresh);

    return () => {
      window.removeEventListener("members:refresh", handleMembersRefresh);
    };
  }, [refreshMembers]);

  const value = useMemo<MembersContextValue>(
    () => ({
      members,
      loading,
      error,
      isAuthenticated,
      addMember: async (payload) => {
        try {
          const response = await createMemberAPI(payload);
          const newMember = (response as any).data || response;
          setMembers((current) => [newMember as Member, ...current]);
          return newMember as Member;
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Failed to create member";
          setError(errorMessage);
          throw err;
        }
      },
      updateMember: async (id, payload) => {
        try {
          const response = await updateMemberAPI(id, payload);
          const updatedMember = (response as any).data || response;
          setMembers((current) =>
            current.map((member) => (member.id === id ? (updatedMember as Member) : member))
          );
          return updatedMember as Member;
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Failed to update member";
          setError(errorMessage);
          throw err;
        }
      },
      getMemberById: (id) => members.find((member) => member.id === id),
      deleteMember: async (id) => {
        try {
          await deleteMemberAPI(id);
          setMembers((current) => current.filter((member) => member.id !== id));
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Failed to delete member";
          setError(errorMessage);
          throw err;
        }
      },
      refreshMembers,
    }),
    [members, loading, error, isAuthenticated]
  );

  return (
    <MembersContext.Provider value={value}>{children}</MembersContext.Provider>
  );
}

export function useMembers() {
  const context = useContext(MembersContext);
  if (!context) {
    throw new Error("useMembers must be used within MembersProvider");
  }
  return context;
}
