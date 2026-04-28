'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Wrench, AlertTriangle, CheckCircle, XCircle, Clock, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { Equipment, EquipmentStatus } from '@/types/client';
import { getEquipment, updateEquipmentApi } from '@/lib/api';

export default function EquipmentTable() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredEquipment = useMemo(() => {
    return equipment.filter((eq) => {
      const matchesSearch = 
        eq.name.toLowerCase().includes(search.toLowerCase()) ||
        eq.brand?.toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || eq.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || eq.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [equipment, search, categoryFilter, statusFilter]);

  useEffect(() => {
    const loadEquipment = async () => {
      try {
        const data = await getEquipment();
        const raw = data as any;
        const list = Array.isArray(raw) ? raw
          : raw.data?.equipment || raw.data?.items || raw.data || raw.equipment || [];
        setEquipment(list);
      } catch (err) {
        setError('Error al cargar equipamiento');
      } finally {
        setLoading(false);
      }
    };
    loadEquipment();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operativo': return 'bg-green-100 text-green-700 border-green-300';
      case 'en_mantenimiento': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'fuera_servicio': return 'bg-red-100 text-red-700 border-red-300';
      case 'nuevo': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cardio': return '🏃';
      case 'pesas': return '🏋️';
      case 'maquinas': return '⚙️';
      case 'funcional': return '💪';
      case 'accesorios': return '🎯';
      default: return '📦';
    }
  };

  const getMaintenanceStatus = (eq: Equipment) => {
    if (!eq.nextMaintenance) return null;
    const daysUntil = Math.floor(
      (new Date(eq.nextMaintenance).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysUntil < 0) return { text: `${Math.abs(daysUntil)} días atrasado`, color: 'text-red-600', icon: AlertTriangle };
    if (daysUntil <= 7) return { text: `En ${daysUntil} días`, color: 'text-yellow-600', icon: Clock };
    return { text: `En ${daysUntil} días`, color: 'text-green-600', icon: CheckCircle };
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const previousEquipment = [...equipment];
    setEquipment(equipment.map(eq => eq.id === id ? {...eq, status: newStatus as EquipmentStatus} : eq));
    try {
      await updateEquipmentApi(id, { status: newStatus });
      toast.success('Estado actualizado');
    } catch (err) {
      setEquipment(previousEquipment);
      toast.error('Error al actualizar estado');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center p-12">
      <Loader className="animate-spin h-8 w-8 text-blue-600" />
    </div>
  );
  if (error) return (
    <div className="text-red-600 p-4 rounded-lg bg-red-50 border border-red-200">{error}</div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Equipamiento</h2>
          <p className="text-sm text-slate-500">{filteredEquipment.length} equipos registrados</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o marca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas las categorías</option>
              <option value="cardio">Cardio</option>
              <option value="pesas">Pesas</option>
              <option value="maquinas">Máquinas</option>
              <option value="funcional">Funcional</option>
              <option value="accesorios">Accesorios</option>
            </select>
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="operativo">Operativo</option>
              <option value="en_mantenimiento">En Mantenimiento</option>
              <option value="fuera_servicio">Fuera de Servicio</option>
              <option value="nuevo">Nuevo</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredEquipment.map((eq) => {
          const maintStatus = getMaintenanceStatus(eq);
          return (
            <div key={eq.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getCategoryIcon(eq.category)}</span>
                  <div>
                    <h3 className="font-semibold text-slate-900">{eq.name}</h3>
                    <p className="text-xs text-slate-500">{eq.brand} {eq.model}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(eq.status)}`}>
                  {eq.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Ubicación:</span>
                  <span className="font-medium text-slate-900">{eq.location || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Horas de uso:</span>
                  <span className="font-medium text-slate-900">{eq.totalUsageHours || 0}h</span>
                </div>
                {eq.serialNumber && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Serial:</span>
                    <span className="font-mono text-xs text-slate-700">{eq.serialNumber}</span>
                  </div>
                )}
                {maintStatus && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-slate-500 flex items-center gap-1">
                      <maintStatus.icon className="w-4 h-4" />
                      Próximo mant.:
                    </span>
                    <span className={`text-xs font-medium ${maintStatus.color}`}>
                      {maintStatus.text}
                    </span>
                  </div>
                )}
              </div>

              {eq.notes && (
                <div className="mt-3 p-2 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-600">{eq.notes}</p>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-slate-100">
                <select
                  value={eq.status}
                  onChange={(e) => handleStatusChange(eq.id, e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="operativo">Marcar como Operativo</option>
                  <option value="en_mantenimiento">En Mantenimiento</option>
                  <option value="fuera_servicio">Fuera de Servicio</option>
                  <option value="nuevo">Nuevo</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEquipment.length === 0 && (
        <div className="text-center py-12">
          <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No se encontraron equipos</p>
        </div>
      )}
    </div>
  );
}
