'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, TrendingUp, Wrench, LogOut } from 'lucide-react';
import { logout } from '@/lib/api';
import { useAppSettings } from '@/context/app-settings-context';
import { useState } from 'react';
import toast from 'react-hot-toast';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Miembros', href: '/clients', icon: Users },
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
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6">
          {isEditingGymName ? (
            <input
              value={tempGymName}
              onChange={(e) => setTempGymName(e.target.value)}
              onBlur={handleSaveGymName}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveGymName()}
              autoFocus
              className="text-xl font-bold text-slate-900 bg-white border border-slate-300 rounded px-2 py-1 truncate flex-1"
            />
          ) : (
            <h1 
              onClick={() => setIsEditingGymName(true)}
              className="text-xl font-bold text-slate-900 truncate cursor-pointer hover:opacity-70 transition flex-1"
              title="Click para editar"
            >
              {gymName}
            </h1>
          )}
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
