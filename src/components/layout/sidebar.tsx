'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Wrench,
  LogOut,
  QrCode,
  Dumbbell,
  UserRound,
} from 'lucide-react';
import { logout } from '@/lib/api';
import { useAppSettings } from '@/context/app-settings-context';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Members', href: '/clients', icon: Users },
  { name: 'Check-in', href: '/checkin', icon: QrCode },
  { name: 'Sales Pipeline', href: '/pipeline', icon: TrendingUp },
  { name: 'Equipment', href: '/equipment', icon: Wrench },
  { name: 'Employees', href: '/employees', icon: UserRound },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { gymName } = useAppSettings();

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden h-screen w-64 flex-col border-r border-[#E5EAF3] bg-white md:flex">
        <div className="border-b border-[#E5EAF3] px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B57F0] text-white shadow-sm">
              <Dumbbell className="h-5 w-5" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold text-[#0B57F0]">GymOS</h1>
              <p className="mt-1 truncate text-xs text-[#5B6475]">{gymName || 'Elite Management'}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-[#0B57F0]/8 text-[#0B57F0]'
                    : 'text-[#5B6475] hover:bg-[#F5F7FB] hover:text-[#0A1733]'
                }`}
              >
                {isActive && (
                  <span
                    className="absolute right-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-l-full bg-[#0B57F0]"
                    aria-hidden
                  />
                )}
                <item.icon
                  className={`h-5 w-5 shrink-0 ${isActive ? 'text-[#0B57F0]' : 'text-[#5B6475]'}`}
                  strokeWidth={1.75}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-[#E5EAF3] p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-start gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-[#5B6475] transition hover:bg-[#F5F7FB] hover:text-[#0A1733]"
          >
            <LogOut className="h-5 w-5 shrink-0 text-[#5B6475]" strokeWidth={1.75} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex overflow-x-auto border-t border-[#E5EAF3] bg-white px-1 py-2 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const shortLabel =
            item.name === "Sales Pipeline"
              ? "Pipeline"
              : item.name.length > 8
                ? item.name.slice(0, 7)
                : item.name;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex min-w-[4.25rem] flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-[9px] font-medium ${
                isActive ? 'text-[#0B57F0]' : 'text-[#5B6475]'
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              <span className="truncate text-center leading-tight">{shortLabel}</span>
            </Link>
          );
        })}
      </nav>
      <div className="h-16 md:hidden" aria-hidden />
    </>
  );
}
