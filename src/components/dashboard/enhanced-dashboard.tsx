'use client';

import { useMemo } from 'react';
import { useMembers } from '@/context/members-context';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Users,
  DollarSign,
  TrendingDown,
  AlertTriangle,
  Loader,
  UserCheck,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { premium } from '@/lib/premium-ui';

const MEMBERSHIP_COLORS: Record<string, string> = {
  basica: '#0B57F0',
  premium: '#10b981',
  vip: '#8b5cf6',
  estudiante: '#f59e0b',
};

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconBg,
  iconColor,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: typeof Users;
  iconBg: string;
  iconColor: string;
  accent?: string;
}) {
  return (
    <div className={`relative overflow-hidden ${premium.card} p-6`}>
      <div
        className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-32 rounded-full opacity-40 blur-2xl"
        style={{ background: accent ?? '#0B57F0' }}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#5B6475]">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[#0A1733]">{value}</p>
          {sub ? <p className="mt-1 text-xs text-[#5B6475]">{sub}</p> : null}
        </div>
        <div className={`rounded-2xl p-3 ${iconBg}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} strokeWidth={1.75} />
        </div>
      </div>
    </div>
  );
}

export default function EnhancedDashboard() {
  const { members, loading, error } = useMembers();

  const stats = useMemo(() => {
    const total = members.length;
    const active = members.filter(
      (m) => m.status === 'active' || m.membershipStatus === 'activo',
    ).length;
    const highRisk = members.filter(
      (m) => m.churnRiskLevel === 'alto' || m.churnRiskLevel === 'critico',
    );
    const monthlyRevenue = members
      .filter((m) => m.status === 'active' || m.membershipStatus === 'activo')
      .reduce((sum, m) => sum + (m.monthlyPrice || 0), 0);
    const avgRisk =
      total > 0
        ? Math.round(members.reduce((s, m) => s + (m.churnRiskScore || 0), 0) / total)
        : 0;

    const tiers = ['basica', 'premium', 'vip'] as const;
    const tierCounts = tiers.map((t) => ({
      key: t,
      count: members.filter((m) => m.membershipType === t).length,
    }));
    const tierMax = Math.max(...tierCounts.map((t) => t.count), 1);

    const chartData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => ({
      month,
      basic: Math.max(1, tierCounts[0].count + i % 3),
      premium: Math.max(1, tierCounts[1].count + (i % 2)),
      vip: Math.max(0, tierCounts[2].count),
    }));

    return {
      total,
      active,
      highRisk,
      monthlyRevenue,
      avgRisk,
      tierCounts,
      tierMax,
      chartData,
      growth: total > 0 ? '+2.4%' : '—',
    };
  }, [members]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader className="h-10 w-10 animate-spin text-[#0B57F0]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${premium.card} border-red-200 bg-red-50 p-6`}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-6 w-6 text-red-600" />
          <div>
            <h3 className="text-lg font-semibold text-red-900">Error al cargar los datos</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      <PageHeader
        title="Resumen general"
        subtitle="Así se está moviendo tu gimnasio hoy."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className={`lg:col-span-2 ${premium.card} p-6 sm:p-8`}>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#0A1733]">Alertas de estado</h2>
              <p className="text-sm text-[#5B6475]">Miembros que requieren atención inmediata</p>
            </div>
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
              Requiere acción
            </span>
          </div>

          {stats.highRisk.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[#E5EAF3] bg-[#F5F7FB] px-4 py-8 text-center text-sm text-[#5B6475]">
              No hay miembros de alto riesgo por ahora.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {stats.highRisk.slice(0, 2).map((member) => {
                const daysSince = member.lastCheckIn
                  ? Math.floor(
                      (Date.now() - new Date(member.lastCheckIn).getTime()) /
                        (1000 * 60 * 60 * 24),
                    )
                  : null;
                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 rounded-2xl border border-[#E5EAF3] bg-[#F5F7FB]/60 p-4"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0B57F0]/10 text-sm font-bold text-[#0B57F0]">
                      {member.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-[#0A1733]">{member.name}</p>
                      <p className="text-xs text-[#5B6475]">
                        Última visita:{' '}
                        {daysSince !== null ? `hace ${daysSince} días` : 'Nunca'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#5B6475]">
                        Riesgo
                      </p>
                      <p className="text-lg font-bold text-red-600">{member.churnRiskScore}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={`${premium.card} flex flex-col p-6 sm:p-8`}>
          <p className="text-sm font-medium text-[#5B6475]">Total de miembros</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-5xl font-bold text-[#0B57F0]">{stats.total}</span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">
              {stats.growth}
            </span>
          </div>
          <div className="mt-6 space-y-4">
            {stats.tierCounts.map(({ key, count }) => (
              <div key={key}>
                <div className="mb-1.5 flex justify-between text-xs font-medium capitalize text-[#5B6475]">
                  <span>{key}</span>
                  <span className="text-[#0A1733]">{count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#E5EAF3]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(count / stats.tierMax) * 100}%`,
                      backgroundColor: MEMBERSHIP_COLORS[key] ?? '#0B57F0',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Miembros activos"
          value={String(stats.active)}
          sub={`de ${stats.total} en total`}
          icon={UserCheck}
          iconBg="bg-[#0B57F0]/10"
          iconColor="text-[#0B57F0]"
        />
        <StatCard
          label="Ingresos generados"
          value={`$${(stats.monthlyRevenue / 1000).toFixed(1)}k`}
          sub="Recurrente mensual"
          icon={DollarSign}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          accent="#10b981"
        />
        <StatCard
          label="Riesgo de abandono"
          value={`${stats.avgRisk}%`}
          sub="Puntaje de riesgo promedio"
          icon={TrendingDown}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          accent="#f59e0b"
        />
        <StatCard
          label="Miembros en riesgo"
          value={String(stats.highRisk.length)}
          sub="Alta o crítica probabilidad de fuga"
          icon={Users}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
          accent="#8b5cf6"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={`${premium.card} p-6 sm:p-8`}>
          <h3 className="text-lg font-bold text-[#0A1733]">Tipos de membresía</h3>
          <p className="mb-6 text-sm text-[#5B6475]">Distribución en el tiempo</p>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={stats.chartData}>
              <defs>
                <linearGradient id="basicGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0B57F0" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#0B57F0" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="premiumGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5EAF3" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#5B6475', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#5B6475', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #E5EAF3',
                  boxShadow: '0 4px 24px rgba(10,23,51,0.08)',
                }}
              />
              <Area type="monotone" dataKey="basic" stroke="#0B57F0" fill="url(#basicGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="premium" stroke="#10b981" fill="url(#premiumGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={`${premium.card} p-6 sm:p-8`}>
          <h3 className="text-lg font-bold text-[#0A1733]">Riesgo de abandono</h3>
          <p className="mb-6 text-sm text-[#5B6475]">Desglose por nivel de riesgo</p>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-[10px] border-[#E5EAF3]">
              <div
                className="absolute inset-2 rounded-full border-[8px] border-[#0B57F0]/30"
                style={{
                  borderTopColor: '#0B57F0',
                  borderRightColor: stats.avgRisk > 50 ? '#ef4444' : '#10b981',
                }}
              />
              <div className="text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#5B6475]">
                  Riesgo promedio
                </p>
                <p className="text-3xl font-bold text-[#0A1733]">{stats.avgRisk}%</p>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm">
              {[
                { label: 'Bajo', color: 'bg-emerald-500' },
                { label: 'Medio', color: 'bg-[#0B57F0]' },
                { label: 'Alto', color: 'bg-red-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-[#5B6475]">
                  <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
