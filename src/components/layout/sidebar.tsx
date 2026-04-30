'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { LayoutDashboard, Users, TrendingUp, Wrench, LogOut, Moon, Sun, QrCode } from 'lucide-react';
import { logout } from '@/lib/api';
import { useAppSettings } from '@/context/app-settings-context';
import { useState } from 'react';
import toast from 'react-hot-toast';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Miembros', href: '/clients', icon: Users },
  { name: 'Check-in', href: '/checkin', icon: QrCode },
  { name: 'Pipeline Ventas', href: '/pipeline', icon: TrendingUp },
  { name: 'Equipamiento', href: '/equipment', icon: Wrench },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { gymName, setGymName } = useAppSettings();
  const [isEditingGymName, setIsEditingGymName] = useState(false);
  const [tempGymName, setTempGymName] = useState(gymName);

  const handleLogout = () => {
    logout();
  };

  const handleSaveGymName = () => {
    if (tempGymName.trim()) {
      setGymName(tempGymName);
      setIsEditingGymName(false);
      toast.success('Nombre del gimnasio actualizado');
    } else {
      toast.error('El nombre no puede estar vacío');
    }
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transition-colors">
      <div className="flex h-full flex-col">
        <div className="border-b border-slate-200 px-6 pb-4 pt-4">
          <h1 className="text-xl font-bold text-slate-900">GymOS</h1>
          <div className="mt-2">
            {isEditingGymName ? (
              <input
                value={tempGymName}
                onChange={(e) => setTempGymName(e.target.value)}
                onBlur={handleSaveGymName}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveGymName()}
                autoFocus
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                placeholder="Nombre del gimnasio"
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingGymName(true)}
                className="w-full text-left text-sm font-semibold text-slate-700 hover:text-slate-900"
              >
                {gymName || 'Agregar nombre del gimnasio'}
              </button>
            )}
          </div>
        </div>
        
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4 space-y-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition"
          >
            <LogOut className="h-5 w-5 text-slate-400" />
            Cerrar sesión
          </button>
          
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-600">v2.0 - Fusion Edition</p>
            <p className="mt-1 text-xs text-slate-500">Next.js 16 + React 19</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
