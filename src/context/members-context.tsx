"use client";

import {
  createContext,
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
} from "@/lib/api";
import type { Member } from "@/types/member";
import { mockClients } from "@/lib/mock-data";

type MemberInput = Omit<Member, "id" | "createdAt" | "updatedAt">;

type MembersContextValue = {
  members: Member[];
  loading: boolean;
  error: string | null;
  addMember: (payload: MemberInput) => Promise<Member>;
  updateMember: (id: string, payload: Partial<MemberInput>) => Promise<Member | null>;
  getMemberById: (id: string) => Member | undefined;
  deleteMember: (id: string) => Promise<void>;
  refreshMembers: () => Promise<void>;
};

const MembersContext = createContext<MembersContextValue | null>(null);

// Convert mock data to Member type for initial state
function convertMockData(): Member[] {
  return (mockClients as any[]).map((client: any) => ({
    ...client,
    status: client.status || "active",
    membershipStatus: "activo",
    checkInsLast30Days: client.attendance?.length || 0,
    averageCheckInsPerWeek: 2,
    churnRiskScore: 0,
    churnRiskLevel: "bajo",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

export function MembersProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>(convertMockData());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMembers();
      setMembers(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load members";
      setError(errorMessage);
      console.error("Error refreshing members:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Optional: uncomment to fetch members on mount
    // refreshMembers();
  }, []);

  const value = useMemo<MembersContextValue>(
    () => ({
      members,
      loading,
      error,
      addMember: async (payload) => {
        try {
          const response = await createMemberAPI(payload);
          const newMember = response.data || response;
          setMembers((current) => [newMember, ...current]);
          return newMember;
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Failed to create member";
          setError(errorMessage);
          throw err;
        }
      },
      updateMember: async (id, payload) => {
        try {
          const response = await updateMemberAPI(id, payload);
          const updatedMember = response.data || response;

          setMembers((current) =>
            current.map((member) =>
              member.id === id ? updatedMember : member
            )
          );

          return updatedMember;
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
          setMembers((current) =>
            current.filter((member) => member.id !== id)
          );
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Failed to delete member";
          setError(errorMessage);
          throw err;
        }
      },
      refreshMembers,
    }),
    [members, loading, error]
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
