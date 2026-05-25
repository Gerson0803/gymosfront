import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ModulesProvider } from "@/context/modules-context";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ModulesProvider>
      <AppShell>{children}</AppShell>
    </ModulesProvider>
  );
}
