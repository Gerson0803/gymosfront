"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Wrench,
  LogOut,
  QrCode,
  Dumbbell,
  UserRound,
  PanelLeftClose,
  Menu,
  X,
  Settings,
} from "lucide-react";
import { logout } from "@/lib/api";
import { useModules } from "@/context/modules-context";

const baseNavigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    moduleKey: null,
  },
  { name: "Members", href: "/clients", icon: Users, moduleKey: "members" },
  { name: "Check-in", href: "/checkin", icon: QrCode, moduleKey: "checkin" },
  {
    name: "Sales Pipeline",
    href: "/pipeline",
    icon: TrendingUp,
    moduleKey: "pipeline",
  },
  {
    name: "Equipment",
    href: "/equipment",
    icon: Wrench,
    moduleKey: "equipment",
  },
  {
    name: "Employees",
    href: "/employees",
    icon: UserRound,
    moduleKey: "employees",
  },
  { name: "Modules", href: "/modules", icon: Settings, moduleKey: null },
];

type SidebarProps = {
  isCollapsed: boolean;
  onToggleCollapseAction: () => void;
};

export default function Sidebar({
  isCollapsed,
  onToggleCollapseAction,
}: SidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { isModuleEnabled } = useModules();

  const handleLogout = () => {
    logout();
  };

  const navigation = baseNavigation.filter((item) => {
    if (item.moduleKey === null) return true;
    return isModuleEnabled(item.moduleKey);
  });

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden h-screen flex-col border-r border-[#E5EAF3] bg-white transition-[width] duration-300 ease-out md:flex ${
          isCollapsed ? "w-[72px]" : "w-[260px]"
        }`}
      >
        <div
          className={`border-b border-[#E5EAF3] py-5 transition-[padding] duration-300 ease-out ${isCollapsed ? "px-2" : "px-6"}`}
        >
          <div
            className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between gap-3"}`}
          >
            <button
              type="button"
              onClick={isCollapsed ? onToggleCollapseAction : undefined}
              aria-label={isCollapsed ? "Expandir sidebar" : undefined}
              title={isCollapsed ? "Expandir sidebar" : undefined}
              className={`flex min-w-0 items-center transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-[#0B57F0]/20 ${
                isCollapsed
                  ? "h-11 w-11 justify-center rounded-xl hover:bg-[#F5F7FB]"
                  : "pointer-events-none gap-3"
              }`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0B57F0] text-white shadow-sm">
                <Dumbbell className="h-5 w-5" strokeWidth={2} />
              </span>
              <div
                className={`min-w-0 overflow-hidden transition-all duration-300 ease-out ${
                  isCollapsed
                    ? "w-0 -translate-x-2 opacity-0"
                    : "w-auto translate-x-0 opacity-100"
                }`}
              >
                <h1 className="text-lg font-bold text-[#0B57F0]">GymOS</h1>
                <p className="text-xs text-[#5B6475]">Admin suite</p>
              </div>
            </button>
            {!isCollapsed && (
              <button
                type="button"
                onClick={onToggleCollapseAction}
                aria-label="Contraer sidebar"
                title="Contraer sidebar"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#5B6475] transition hover:bg-[#F5F7FB] hover:text-[#0A1733] focus:outline-none focus:ring-2 focus:ring-[#0B57F0]/20"
              >
                <PanelLeftClose className="h-5 w-5" strokeWidth={1.75} />
              </button>
            )}
          </div>
        </div>

        <nav
          className={`flex-1 space-y-1 py-5 transition-[padding] duration-300 ease-out ${isCollapsed ? "px-2" : "px-3"}`}
        >
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                aria-label={item.name}
                className={`relative flex items-center overflow-hidden rounded-xl py-3 text-sm font-medium transition ${
                  isCollapsed ? "h-11 justify-center px-0" : "gap-3 px-4"
                } ${
                  isActive
                    ? "bg-[#0B57F0]/8 text-[#0B57F0]"
                    : "text-[#5B6475] hover:bg-[#F5F7FB] hover:text-[#0A1733]"
                }`}
              >
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 top-0 w-1 rounded-l-xl bg-[#0B57F0]"
                    aria-hidden
                  />
                )}
                <item.icon
                  className={`h-5 w-5 shrink-0 ${isActive ? "text-[#0B57F0]" : "text-[#5B6475]"}`}
                  strokeWidth={1.75}
                />
                <span
                  className={`min-w-0 whitespace-nowrap transition-all duration-300 ease-out ${
                    isCollapsed
                      ? "w-0 -translate-x-2 overflow-hidden opacity-0"
                      : "w-auto translate-x-0 opacity-100"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div
          className={`mt-auto border-t border-[#E5EAF3] transition-[padding] duration-300 ease-out ${isCollapsed ? "p-2" : "p-4"}`}
        >
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            title={isCollapsed ? "Logout" : undefined}
            className={`flex w-full items-center rounded-xl py-3 text-left text-sm font-medium text-[#5B6475] transition hover:bg-[#F5F7FB] hover:text-[#0A1733] focus:outline-none focus:ring-2 focus:ring-[#0B57F0]/20 ${
              isCollapsed
                ? "h-11 justify-center px-0"
                : "justify-start gap-3 px-4"
            }`}
          >
            <LogOut
              className="h-5 w-5 shrink-0 text-[#5B6475]"
              strokeWidth={1.75}
            />
            <span
              className={`min-w-0 whitespace-nowrap transition-all duration-300 ease-out ${
                isCollapsed
                  ? "w-0 -translate-x-2 overflow-hidden opacity-0"
                  : "w-auto translate-x-0 opacity-100"
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Abrir menú"
        className="fixed left-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-[#E5EAF3] bg-white text-[#0A1733] shadow-[0_8px_24px_-8px_rgba(10,23,51,0.25)] transition hover:bg-[#F5F7FB] focus:outline-none focus:ring-2 focus:ring-[#0B57F0]/20 md:hidden"
      >
        <Menu className="h-5 w-5" strokeWidth={1.75} />
      </button>

      <div
        className={`fixed inset-0 z-50 md:hidden ${
          isMobileOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!isMobileOpen}
      >
        <button
          type="button"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Cerrar menú"
          className={`absolute inset-0 bg-[#0A1733]/35 transition-opacity duration-300 ease-out ${
            isMobileOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          className={`relative flex h-full w-[260px] max-w-[82vw] flex-col border-r border-[#E5EAF3] bg-white transition-transform duration-300 ease-out ${
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-[#E5EAF3] px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B57F0] text-white shadow-sm">
                <Dumbbell className="h-5 w-5" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#0B57F0]">GymOS</h1>
                <p className="text-xs text-[#5B6475]">Admin suite</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Cerrar menú"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-[#5B6475] transition hover:bg-[#F5F7FB] hover:text-[#0A1733] focus:outline-none focus:ring-2 focus:ring-[#0B57F0]/20"
            >
              <X className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-5">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-label={item.name}
                  onClick={() => setIsMobileOpen(false)}
                  className={`relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-[#0B57F0]/8 text-[#0B57F0]"
                      : "text-[#5B6475] hover:bg-[#F5F7FB] hover:text-[#0A1733]"
                  }`}
                >
                  {isActive && (
                    <span
                      className="absolute right-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-l-full bg-[#0B57F0]"
                      aria-hidden
                    />
                  )}
                  <item.icon
                    className={`h-5 w-5 shrink-0 ${isActive ? "text-[#0B57F0]" : "text-[#5B6475]"}`}
                    strokeWidth={1.75}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-[#E5EAF3] p-4">
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Cerrar sesión"
              className="flex w-full items-center justify-start gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-[#5B6475] transition hover:bg-[#F5F7FB] hover:text-[#0A1733] focus:outline-none focus:ring-2 focus:ring-[#0B57F0]/20"
            >
              <LogOut
                className="h-5 w-5 shrink-0 text-[#5B6475]"
                strokeWidth={1.75}
              />
              Logout
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}
