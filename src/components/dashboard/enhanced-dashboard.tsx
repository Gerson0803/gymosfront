'use client';

import { useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMembers } from '@/context/members-context';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, TrendingDown, DollarSign, AlertTriangle, CheckCircle, Loader } from 'lucide-react';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function EnhancedDashboard() {
  const router = useRouter();
  const { members, loading, error, isAuthenticated } = useMembers();

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (!isAuthenticated && !loading) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-slate-600 font-medium">Verificando sesión...</p>
      </div>
    </div>
  );
}

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-red-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-red-900">Error al cargar datos</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.status === 'active' || m.membershipStatus === 'activo').length;
  const highRiskCount = members.filter((m) => m.churnRiskLevel === 'alto' || m.churnRiskLevel === 'critico').length;
  const churnRate = totalMembers > 0 ? Math.round((highRiskCount / totalMembers) * 100) : 0;
  const monthlyRevenue = members
    .filter((m) => m.status === 'active' || m.membershipStatus === 'activo')
    .reduce((sum, m) => sum + (m.monthlyPrice || 0), 0);
  const averageLTV = activeMembers > 0 ? Math.round((monthlyRevenue / activeMembers) * 12) : 0;

  const churnDistribution = [
    { name: 'Bajo Riesgo', value: members.filter((m) => m.churnRiskLevel === 'bajo').length },
    { name: 'Riesgo Medio', value: members.filter((m) => m.churnRiskLevel === 'medio').length },
    { name: 'Alto/Crítico', value: members.filter((m) => m.churnRiskLevel === 'alto' || m.churnRiskLevel === 'critico').length },
  ].filter((d) => d.value > 0);

  const membershipTypes = ['basica', 'premium', 'vip', 'estudiante'].map((type) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    count: members.filter((m) => m.membershipType === type).length,
  })).filter((t) => t.count > 0);

  const highRiskMembers = members
    .filter((m) => m.churnRiskLevel === 'alto' || m.churnRiskLevel === 'critico')
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Métricas y análisis del gimnasio</p>
      </div>

      {highRiskMembers.length > 0 && (
        <div className="rounded-xl border-2 border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900">
                {highRiskMembers.length} Miembros en Riesgo Alto
              </h3>
              <p className="mt-1 text-sm text-red-700">
                Estos miembros necesitan atención inmediata para retenerlos
              </p>
              <div className="mt-3 space-y-2">
                {highRiskMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between rounded-lg bg-white p-3">
                    <div>
                      <p className="font-medium text-slate-900">{member.name}</p>
                      <p className="text-xs text-slate-600">Riesgo: {member.churnRiskScore}%</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      member.churnRiskLevel === 'critico' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {member.churnRiskLevel === 'critico' ? 'CRÍTICO' : 'ALTO'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Miembros Activos</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{activeMembers}</p>
              <p className="mt-1 text-xs text-slate-500">de {totalMembers} totales</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Ingresos Mensuales</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">${(monthlyRevenue / 1000).toFixed(1)}k</p>
              <p className="mt-1 text-xs text-green-600">Proyectado anual: ${(averageLTV / 1000).toFixed(1)}k</p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Tasa de Churn</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{churnRate}%</p>
              <p className="mt-1 text-xs text-slate-500">Miembros en riesgo alto</p>
            </div>
            <div className={`rounded-full p-3 ${churnRate > 30 ? 'bg-red-100' : 'bg-yellow-100'}`}>
              <TrendingDown className={`h-6 w-6 ${churnRate > 30 ? 'text-red-600' : 'text-yellow-600'}`} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Miembros</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{totalMembers}</p>
              <p className="mt-1 text-xs text-slate-500">En base de datos</p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Distribución de Riesgo de Abandono</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={churnDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {churnDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Tipos de Membresía</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={membershipTypes} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="type" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Resumen de Miembros</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg p-4 bg-blue-50">
            <p className="text-sm font-medium text-blue-700">Membresía Básica</p>
            <p className="mt-2 text-2xl font-bold text-blue-900">{members.filter((m) => m.membershipType === 'basica').length}</p>
          </div>
          <div className="rounded-lg p-4 bg-purple-50">
            <p className="text-sm font-medium text-purple-700">Membresía Premium</p>
            <p className="mt-2 text-2xl font-bold text-purple-900">{members.filter((m) => m.membershipType === 'premium').length}</p>
          </div>
          <div className="rounded-lg p-4 bg-amber-50">
            <p className="text-sm font-medium text-amber-700">Membresía VIP</p>
            <p className="mt-2 text-2xl font-bold text-amber-900">{members.filter((m) => m.membershipType === 'vip').length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

