'use client';

import { useMemo, useEffect } from 'react';
import { useGymStore } from '@/store/useGymStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, TrendingDown, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function EnhancedDashboard() {

  useEffect(() => {
   fetch(`${process.env.NEXT_PUBLIC_API_URL}/members`)
    .then(res => res.json())
    .then(data => console.log("DATA:", data))
    .catch(err => console.error("ERROR:", err));
  }, []);

  const { clients, leads, alerts, equipment } = useGymStore();

  const metrics = useMemo(() => {
    const totalMembers = clients.length;
    const activeMembers = clients.filter((m) => m.membershipStatus === 'activo').length;
    
    const highRiskMembers = clients.filter((m) => 
      m.churnRiskLevel === 'alto' || m.churnRiskLevel === 'critico'
    ).length;
    const churnRate = totalMembers > 0 ? Math.round((highRiskMembers / totalMembers) * 100) : 0;
    
    const monthlyRevenue = clients
      .filter((m) => m.membershipStatus === 'activo')
      .reduce((sum, m) => sum + m.monthlyPrice, 0);
    
    const averageLTV = activeMembers > 0 
      ? Math.round(monthlyRevenue / activeMembers * 12)
      : 0;

    return { totalMembers, activeMembers, churnRate, monthlyRevenue, averageLTV };
  }, [clients]);

  const pipelineData = useMemo(() => {
    const stages = ['nuevo', 'contactado', 'tour_agendado', 'propuesta', 'negociacion', 'cerrado_ganado'];
    return stages.map((stage) => ({
      stage: stage.replace('_', ' '),
      count: leads.filter((l) => l.status === stage).length,
      value: leads.filter((l) => l.status === stage).reduce((sum, l) => sum + l.budget, 0),
    }));
  }, [leads]);

  const churnDistribution = useMemo(() => {
    const distribution = [
      { name: 'Bajo Riesgo', value: clients.filter((m) => m.churnRiskLevel === 'bajo').length },
      { name: 'Riesgo Medio', value: clients.filter((m) => m.churnRiskLevel === 'medio').length },
      { name: 'Alto/Crítico', value: clients.filter((m) => m.churnRiskLevel === 'alto' || m.churnRiskLevel === 'critico').length },
    ];
    return distribution.filter((d) => d.value > 0);
  }, [clients]);

  const membershipTypes = useMemo(() => {
    const types = ['basica', 'premium', 'vip', 'estudiante'];
    return types.map((type) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count: clients.filter((m) => m.membershipType === type).length,
    })).filter((t) => t.count > 0);
  }, [clients]);

  const criticalAlerts = alerts.filter((a) => a.severity === 'critica' && a.status !== 'resuelta');
  const highPriorityAlerts = alerts.filter((a) => a.severity === 'accion_requerida' && a.status !== 'resuelta');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-sm text-slate-600 mt-1">Métricas y análisis del gimnasio</p>
      </div>

      {(criticalAlerts.length > 0 || highPriorityAlerts.length > 0) && (
        <div className="rounded-xl border-2 border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900">
                {criticalAlerts.length} Alertas Críticas Requieren Atención
              </h3>
              <p className="mt-1 text-sm text-red-700">
                Miembros en riesgo inminente de abandono necesitan intervención inmediata
              </p>
              <div className="mt-3 space-y-2">
                {[...criticalAlerts, ...highPriorityAlerts].slice(0, 3).map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between rounded-lg bg-white p-3">
                    <div>
                      <p className="font-medium text-slate-900">{alert.clientName}</p>
                      <p className="text-xs text-slate-600">{alert.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      alert.severity === 'critica' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {alert.severity === 'critica' ? 'CRÍTICA' : 'ALTA'}
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
              <p className="mt-2 text-3xl font-bold text-slate-900">{metrics.activeMembers}</p>
              <p className="mt-1 text-xs text-slate-500">de {metrics.totalMembers} totales</p>
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
              <p className="mt-2 text-3xl font-bold text-slate-900">${(metrics.monthlyRevenue / 1000).toFixed(1)}k</p>
              <p className="mt-1 text-xs text-green-600">Proyectado anual: ${(metrics.averageLTV / 1000).toFixed(1)}k</p>
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
              <p className="mt-2 text-3xl font-bold text-slate-900">{metrics.churnRate}%</p>
              <p className="mt-1 text-xs text-slate-500">Miembros en riesgo alto</p>
            </div>
            <div className={`rounded-full p-3 ${metrics.churnRate > 30 ? 'bg-red-100' : 'bg-yellow-100'}`}>
              <TrendingDown className={`h-6 w-6 ${metrics.churnRate > 30 ? 'text-red-600' : 'text-yellow-600'}`} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Leads en Pipeline</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{leads.length}</p>
              <p className="mt-1 text-xs text-slate-500">
                Valor potencial: ${(leads.reduce((sum, l) => sum + l.budget, 0) / 1000).toFixed(1)}k
              </p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Embudo de Ventas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pipelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" />
              <YAxis />
              <Tooltip formatter={(value) => [value, 'Leads']} />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

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
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Tipos de Membresía</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={membershipTypes} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="type" type="category" width={100} />
            <Tooltip />
            <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Estado del Equipamiento</h3>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: 'Operativos', count: equipment.filter(e => e.status === 'operativo').length, color: 'bg-green-100 text-green-700' },
            { label: 'En Mantenimiento', count: equipment.filter(e => e.status === 'en_mantenimiento').length, color: 'bg-yellow-100 text-yellow-700' },
            { label: 'Fuera de Servicio', count: equipment.filter(e => e.status === 'fuera_servicio').length, color: 'bg-red-100 text-red-700' },
            { label: 'Nuevos', count: equipment.filter(e => e.status === 'nuevo').length, color: 'bg-blue-100 text-blue-700' },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-lg p-4 ${stat.color}`}>
              <p className="text-sm font-medium opacity-80">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold">{stat.count}</p>
            </div>
          ))}
        </div>
        
        {equipment.filter(e => e.status === 'fuera_servicio' || e.status === 'en_mantenimiento').length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Equipos que requieren atención:</h4>
            <div className="space-y-2">
              {equipment
                .filter(e => e.status === 'fuera_servicio' || e.status === 'en_mantenimiento')
                .slice(0, 3)
                .map((eq) => (
                  <div key={eq.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{eq.name}</p>
                      <p className="text-xs text-slate-500">{eq.location}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      eq.status === 'fuera_servicio' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {eq.status === 'fuera_servicio' ? 'FUERA DE SERVICIO' : 'EN MANTENIMIENTO'}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
