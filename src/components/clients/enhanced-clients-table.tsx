'use client';

import { useState, useMemo } from 'react';
import { useGymStore } from '@/store/useGymStore';
import { Search, Filter, Download, AlertTriangle, CheckCircle, TrendingDown, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EnhancedClientsTable() {
  const { clients, updateClient, deleteClient, recordCheckIn } = useGymStore();
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch = 
        client.name.toLowerCase().includes(search.toLowerCase()) ||
        client.email.toLowerCase().includes(search.toLowerCase());
      
      const matchesRisk = riskFilter === 'all' || client.churnRiskLevel === riskFilter;
      
      return matchesSearch && matchesRisk;
    });
  }, [clients, search, riskFilter]);

  const handleCheckIn = (clientId: string) => {
    recordCheckIn(clientId, 60, ['pesas', 'cardio']);
    toast.success('✅ Check-in registrado');
  };

  const handleDelete = (id: string) => {
    deleteClient(id);
    toast.success('Miembro eliminado');
    setDeleteConfirmId(null);
  };

  const exportToCSV = () => {
    const headers = ['Nombre', 'Email', 'Teléfono', 'Membresía', 'Estado', 'Riesgo Churn', 'Último Check-in'];
    const rows = filteredClients.map(c => [
      c.name, c.email, c.phone, c.membershipType, c.status, c.churnRiskLevel, c.lastCheckIn || 'Nunca'
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Miembros</h2>
          <p className="text-sm text-slate-500">{filteredClients.length} miembros encontrados</p>
        </div>
        <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition">
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
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
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-900">{client.name}</p>
                      <p className="text-xs text-slate-500">{client.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {client.membershipType}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">${client.monthlyPrice.toLocaleString()}/mes</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                      {client.status === 'active' ? 'Activo' : client.status === 'at-risk' ? 'En Riesgo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border ${getRiskColor(client.churnRiskLevel)}`}>
                      {client.churnRiskLevel === 'critico' && <AlertTriangle className="h-3 w-3" />}
                      {client.churnRiskLevel === 'bajo' && <CheckCircle className="h-3 w-3" />}
                      {client.churnRiskLevel.toUpperCase()} ({client.churnRiskScore}%)
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-900">{client.averageCheckInsPerWeek}x/semana</p>
                    <p className="text-xs text-slate-500">{client.checkInsLast30Days} en 30 días</p>
                  </td>
                  <td className="px-4 py-3">
                    {client.lastCheckIn ? (
                      <p className="text-sm text-slate-600">
                        {new Date(client.lastCheckIn).toLocaleDateString('es-CO')}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-400">Nunca</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleCheckIn(client.id)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Registrar check-in"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(client.id)}
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
