'use client';

import { useModules } from '@/context/modules-context';
import { PageHeader } from '@/components/layout/page-header';
import { premium } from '@/lib/premium-ui';
import {
  Users,
  QrCode,
  TrendingUp,
  Wrench,
  UserRound,
  Loader,
  Check,
  X,
  Crown,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';

const iconMap: Record<string, React.ElementType> = {
  users: Users,
  checkin: QrCode,
  pipeline: TrendingUp,
  equipment: Wrench,
  employees: UserRound,
};

function formatDate(dateStr?: string) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getDaysRemaining(trialEndsAt?: string) {
  if (!trialEndsAt) return 0;
  const end = new Date(trialEndsAt);
  const now = new Date();
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

export default function ModulesPage() {
  const { modules, gymModules, loading, isModuleEnabled, activateModule, deactivateModule } =
    useModules();

  const handleToggle = async (moduleKey: string, currentlyEnabled: boolean) => {
    try {
      if (currentlyEnabled) {
        await deactivateModule(moduleKey);
        toast.success('Módulo desactivado');
      } else {
        await activateModule(moduleKey);
        toast.success('Módulo activado');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al modificar módulo');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader className="h-10 w-10 animate-spin text-[#0B57F0]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      <PageHeader
        title="Módulos"
        subtitle="Gestiona los módulos disponibles para tu gimnasio"
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => {
          const gymModule = gymModules.find((gm) => gm.module.key === module.key);
          const isActive = isModuleEnabled(module.key);
          const isTrial = gymModule?.status === 'TRIAL';
          const daysRemaining = gymModule ? getDaysRemaining(gymModule.trialEndsAt) : 0;

          const IconComponent = iconMap[module.key] || Users;

          return (
            <article
              key={module.id}
              className={`relative overflow-hidden rounded-2xl border p-6 shadow-sm transition ${
                isActive
                  ? 'border-emerald-200 bg-emerald-50/50'
                  : 'border-slate-200 bg-white'
              }`}
            >
              {isActive && (
                <div className="absolute right-4 top-4">
                  {isTrial ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      <Clock className="h-3 w-3" />
                      {daysRemaining} días trial
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      <Check className="h-3 w-3" />
                      Activo
                    </span>
                  )}
                </div>
              )}

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B57F0]/10">
                <IconComponent className="h-6 w-6 text-[#0B57F0]" />
              </div>

              <h3 className="text-lg font-semibold text-slate-900">{module.name}</h3>
              <p className="mt-1 text-sm text-slate-500">
                {module.description || 'Descripción no disponible'}
              </p>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900">
                  ${module.price.toFixed(2)}
                </span>
                <span className="text-sm text-slate-500">/mes</span>
              </div>

              {gymModule && isTrial && (
                <p className="mt-2 text-xs text-amber-600">
                  Trial termina el {formatDate(gymModule.trialEndsAt)}
                </p>
              )}

              <button
                type="button"
                onClick={() => handleToggle(module.key, isActive)}
                className={`mt-5 w-full rounded-xl py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? 'border border-red-200 bg-white text-red-600 hover:bg-red-50'
                    : 'bg-[#0B57F0] text-white hover:bg-[#0a4bd6]'
                }`}
              >
                {isActive ? (
                  <span className="flex items-center justify-center gap-2">
                    <X className="h-4 w-4" />
                    Desactivar
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Crown className="h-4 w-4" />
                    Activar
                  </span>
                )}
              </button>
            </article>
          );
        })}
      </div>

      {modules.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-slate-500">No hay módulos disponibles</p>
        </div>
      )}
    </div>
  );
}
