'use client';

import { useState, useMemo } from 'react';
import { useMembers } from '@/context/members-context';
import { checkinMember } from '@/lib/api';
import { Search, Filter, Download, AlertTriangle, CheckCircle, TrendingDown, Edit, Trash2, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function EnhancedClientsTable() {
  const { members, loading, error, deleteMember, refreshMembers } = useMembers();
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [checkingInId, setCheckingInId] = useState<string | null>(null);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch = 
        member.name.toLowerCase().includes(search.toLowerCase()) ||
        member.email.toLowerCase().includes(search.toLowerCase());
      
      const matchesRisk = riskFilter === 'all' || member.churnRiskLevel === riskFilter;
      
      return matchesSearch && matchesRisk;
    });
  }, [members, search, riskFilter]);

  const handleCheckIn = async (memberId: string) => {
    setCheckingInId(memberId);
    try {
      await checkinMember(memberId);
      toast.success('✅ Check-in registrado');
      await refreshMembers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrar check-in';
      toast.error(errorMessage);
    } finally {
      setCheckingInId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMember(id);
      toast.success('Miembro eliminado');
      setDeleteConfirmId(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar miembro';
      toast.error(errorMessage);
    }
  };

  const exportToCSV = () => {
    const headers = ['Nombre', 'Email', 'Teléfono', 'Membresía', 'Estado', 'Riesgo Churn', 'Último Check-in'];
    const rows = filteredMembers.map(m => [
      m.name, m.email, m.phone || 'N/A', m.membershipType, m.status, m.churnRiskLevel, m.lastCheckIn ? new Date(m.lastCheckIn).toLocaleDateString('es-CO') : 'Nunca'
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `miembros_gym_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('📄 CSV exportado');
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critico': return 'bg-red-100 text-red-700 border-red-300';
      case 'alto': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medio': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'bajo': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700';
      case 'at-risk': return 'bg-amber-100 text-amber-700';
      case 'inactive': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-slate-600">Cargando miembros...</p>
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
            <h3 className="text-lg font-semibold text-red-900">Error al cargar miembros</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Miembros</h2>
          <p className="text-sm text-slate-500">{filteredMembers.length} miembros encontrados</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={exportToCSV} 
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
          >
            <Download className="w-4 h-4" /> Exportar CSV
          </button>
          <Link 
            href="/clients/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Nuevo Miembro
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los riesgos</option>
            <option value="bajo">Bajo riesgo</option>
            <option value="medio">Riesgo medio</option>
            <option value="alto">Alto riesgo</option>
            <option value="critico">Crítico</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Miembro</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Membresía</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Riesgo Churn</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Frecuencia</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Último Check-in</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-900">{member.name}</p>
                      <p className="text-xs text-slate-500">{member.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {member.membershipType}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">${(member.monthlyPrice || 0).toLocaleString()}/mes</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                      {member.status === 'active' ? 'Activo' : member.status === 'at-risk' ? 'En Riesgo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border ${getRiskColor(member.churnRiskLevel)}`}>
                      {member.churnRiskLevel === 'critico' && <AlertTriangle className="h-3 w-3" />}
                      {member.churnRiskLevel === 'bajo' && <CheckCircle className="h-3 w-3" />}
                      {member.churnRiskLevel.toUpperCase()} ({member.churnRiskScore}%)
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-900">{member.averageCheckInsPerWeek}x/semana</p>
                    <p className="text-xs text-slate-500">{member.checkInsLast30Days} en 30 días</p>
                  </td>
                  <td className="px-4 py-3">
                    {member.lastCheckIn ? (
                      <p className="text-sm text-slate-600">
                        {new Date(member.lastCheckIn).toLocaleDateString('es-CO')}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-400">Nunca</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleCheckIn(member.id)}
                        disabled={checkingInId === member.id}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                        title="Registrar check-in"
                      >
                        {checkingInId === member.id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </button>
                      <Link
                        href={`/clients/${member.id}/edit`}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteConfirmId(member.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">¿Eliminar miembro?</h3>
            <p className="text-sm text-slate-600 mb-4">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirmId)} className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
