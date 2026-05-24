"use client";

import { type ReactNode, useEffect, useState } from "react";
import { Loader } from "lucide-react";
import Sidebar from "./sidebar";
import { useMembers } from "@/context/members-context";
import { useRouter } from "next/navigation";
import { premium } from "@/lib/premium-ui";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const { isAuthenticated, loading } = useMembers();
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && !loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, loading, router, isHydrated]);

  if (!isHydrated || loading || !isAuthenticated) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${premium.pageBg}`}>
        <div className="space-y-4 text-center">
          <Loader className="mx-auto h-10 w-10 animate-spin text-[#0B57F0]" />
          <p className="text-sm font-medium text-[#5B6475]">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${premium.pageBg} text-[#0A1733]`}>
      <Sidebar />
      <main className="min-h-screen pl-0 transition-[padding] md:pl-64">
        <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          {children}
        </div>
      </main>
    </div>
  );
}
