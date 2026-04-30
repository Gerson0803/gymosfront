'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Wrench, AlertTriangle, CheckCircle, XCircle, Clock, Loader, Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Equipment, EquipmentStatus } from '@/types/client';
import { getEquipment, createEquipment, updateEquipmentApi, deleteEquipment } from '@/lib/api';

type EquipmentFormData = Omit<Equipment, 'id' | 'createdAt' | 'updatedAt' | 'price' | 'totalUsageHours' | 'maintenanceIntervalDays'> & {
  price: number | '';
  totalUsageHours: number | '';
  maintenanceIntervalDays: number | '';
};

export default function EquipmentTable() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<EquipmentFormData>({
    name: '', category: 'cardio', brand: '', model: '', serialNumber: '', location: '',
    price: '', status: 'nuevo', purchaseDate: new Date().toISOString().split('T')[0],
    maintenanceIntervalDays: '', nextMaintenance: new Date().toISOString().split('T')[0],
    totalUsageHours: '', notes: '', maintenanceHistory: []
  });

  const filteredEquipment = useMemo(() => {
    return equipment.filter((eq) => {
      const matchesSearch = eq.name.toLowerCase().includes(search.toLowerCase()) || eq.brand?.toLowerCase().includes(search.toLowerCase());
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
        const list = Array.isArray(raw) ? raw : raw.data?.equipment || raw.data?.items || raw.data || raw.equipment || [];
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
    const daysUntil = Math.floor((new Date(eq.nextMaintenance).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
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

  const handleOpenCreate = () => {
    setEditingEquipment(null);
    setFormData({
      name: '', category: 'cardio', brand: '', model: '', serialNumber: '', location: '',
      price: '', status: 'nuevo', purchaseDate: new Date().toISOString().split('T')[0],
      maintenanceIntervalDays: '', nextMaintenance: new Date().toISOString().split('T')[0],
      totalUsageHours: '', notes: '', maintenanceHistory: []
    });
    setIsCreateModalOpen(true);
  };

  const handleEdit = (eq: Equipment) => {
    setEditingEquipment(eq);
    setFormData({
      name: eq.name,
      category: eq.category,
      brand: eq.brand || '',
      model: eq.model || '',
      serialNumber: eq.serialNumber || '',
      location: eq.location || '',
      price: eq.price ?? '',
      status: eq.status,
      purchaseDate: eq.purchaseDate || new Date().toISOString().split('T')[0],
      maintenanceIntervalDays: eq.maintenanceIntervalDays ?? '',
      nextMaintenance: eq.nextMaintenance || new Date().toISOString().split('T')[0],
      totalUsageHours: eq.totalUsageHours ?? '',
      notes: eq.notes || '',
      maintenanceHistory: eq.maintenanceHistory || [],
    });
    setIsCreateModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = {
      ...formData,
      price: formData.price === '' ? undefined : Number(formData.price),
      totalUsageHours: formData.totalUsageHours === '' ? undefined : Number(formData.totalUsageHours),
      maintenanceIntervalDays: formData.maintenanceIntervalDays === '' ? 90 : Number(formData.maintenanceIntervalDays),
    };
    try {
      if (editingEquipment) {
        await updateEquipmentApi(editingEquipment.id, payload);
        setEquipment(equipment.map(eq => eq.id === editingEquipment.id ? {...eq, ...payload} : eq));
        toast.success('Equipo actualizado');
      } else {
        const response = await createEquipment(payload);
        const raw = response as any;
        const newEquipment = raw.data || raw;
        setEquipment([...equipment, newEquipment]);
        toast.success('Equipo creado');
      }
      setIsCreateModalOpen(false);
      setEditingEquipment(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsSubmitting(true);
    try {
      await deleteEquipment(id);
      setEquipment(equipment.filter(eq => eq.id !== id));
      toast.success('Equipo eliminado');
      setDeleteConfirmId(null);
    } catch (err) {
      toast.error('Error al eliminar');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center p-12"><Loader className="animate-spin h-8 w-8 text-blue-600" /></div>;
  if (error) return <div className="text-red-600 p-4 rounded-lg bg-red-50 border border-red-200">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Equipamiento</h2>
          <p className="text-sm text-slate-500">{filteredEquipment.length} equipos registrados</p>
        </div>
        <button onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"><Plus className="w-4 h-4" /> Nuevo Equipo</button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o marca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas las categorías</option>
            <option value="cardio">Cardio</option>
            <option value="pesas">Pesas</option>
            <option value="maquinas">Máquinas</option>
            <option value="funcional">Funcional</option>
            <option value="accesorios">Accesorios</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los estados</option>
            <option value="operativo">Operativo</option>
            <option value="en_mantenimiento">En Mantenimiento</option>
            <option value="fuera_servicio">Fuera de Servicio</option>
            <option value="nuevo">Nuevo</option>
          </select>
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
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(eq.status)}`}>{eq.status.replace('_', ' ').toUpperCase()}</span>
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
                {eq.serialNumber && <div className="flex justify-between"><span className="text-slate-500">Serial:</span><span className="font-mono text-xs text-slate-700">{eq.serialNumber}</span></div>}
                {maintStatus && <div className="flex items-center justify-between pt-2 border-t border-slate-100"><span className="text-slate-500 flex items-center gap-1"><maintStatus.icon className="w-4 h-4" />Próximo mant.:</span><span className={`text-xs font-medium ${maintStatus.color}`}>{maintStatus.text}</span></div>}
              </div>

              {eq.notes && <div className="mt-3 p-2 bg-slate-50 rounded-lg"><p className="text-xs text-slate-600">{eq.notes}</p></div>}

              <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                <select value={eq.status} onChange={(e) => handleStatusChange(eq.id, e.target.value)} className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                  <option value="operativo">Operativo</option>
                  <option value="en_mantenimiento">En Mantenimiento</option>
                  <option value="fuera_servicio">Fuera de Servicio</option>
                  <option value="nuevo">Nuevo</option>
                </select>
                <button onClick={() => handleEdit(eq)} className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit className="w-4 h-4" /></button>
                <button onClick={() => setDeleteConfirmId(eq.id)} className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEquipment.length === 0 && <div className="text-center py-12"><Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500">No se encontraron equipos</p></div>}

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-slate-900">{editingEquipment ? 'Editar Equipo' : 'Crear Nuevo Equipo'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="Nombre" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="col-span-2 rounded-lg border border-slate-300 px-4 py-2" />
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value as any})} className="rounded-lg border border-slate-300 px-4 py-2">
                  <option value="cardio">Cardio</option>
                  <option value="pesas">Pesas</option>
                  <option value="maquinas">Máquinas</option>
                  <option value="funcional">Funcional</option>
                  <option value="accesorios">Accesorios</option>
                </select>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})} className="rounded-lg border border-slate-300 px-4 py-2">
                  <option value="nuevo">Nuevo</option>
                  <option value="operativo">Operativo</option>
                  <option value="en_mantenimiento">En Mantenimiento</option>
                  <option value="fuera_servicio">Fuera de Servicio</option>
                </select>
                <input placeholder="Marca" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} className="rounded-lg border border-slate-300 px-4 py-2" />
                <input placeholder="Modelo" value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} className="rounded-lg border border-slate-300 px-4 py-2" />
                <input placeholder="Serial" value={formData.serialNumber} onChange={(e) => setFormData({...formData, serialNumber: e.target.value})} className="rounded-lg border border-slate-300 px-4 py-2" />
                <input placeholder="Ubicación" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="rounded-lg border border-slate-300 px-4 py-2" />
                <input type="number" placeholder="Precio (COP)" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value === '' ? '' : Number(e.target.value)})} className="rounded-lg border border-slate-300 px-4 py-2" />
                <input type="number" placeholder="Horas de uso" value={formData.totalUsageHours} onChange={(e) => setFormData({...formData, totalUsageHours: e.target.value === '' ? '' : Number(e.target.value)})} className="rounded-lg border border-slate-300 px-4 py-2" />
                <input type="date" value={formData.purchaseDate} onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})} className="rounded-lg border border-slate-300 px-4 py-2" />
                <input type="number" placeholder="Días entre mantenimientos (ej: 90)" value={formData.maintenanceIntervalDays} onChange={(e) => setFormData({...formData, maintenanceIntervalDays: e.target.value === '' ? '' : Number(e.target.value)})} className="rounded-lg border border-slate-300 px-4 py-2" />
                <input type="date" value={formData.nextMaintenance} onChange={(e) => setFormData({...formData, nextMaintenance: e.target.value})} className="rounded-lg border border-slate-300 px-4 py-2" />
              </div>
              <textarea placeholder="Notas" rows={3} value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full rounded-lg border border-slate-300 px-4 py-2" />
              <div className="flex gap-3">
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{isSubmitting ? 'Guardando...' : 'Guardar'}</button>
                <button type="button" onClick={() => setIsCreateModalOpen(false)} disabled={isSubmitting} className="flex-1 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">¿Eliminar equipo?</h3>
            <p className="text-sm text-slate-600 mb-4">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmId(null)} disabled={isSubmitting} className="flex-1 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50">Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirmId)} disabled={isSubmitting} className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
