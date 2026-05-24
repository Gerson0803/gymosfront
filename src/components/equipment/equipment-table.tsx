'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Wrench, AlertTriangle, CheckCircle, Clock, Loader, Plus, Edit, Trash2, MapPin, MoreVertical } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { premium } from '@/lib/premium-ui';
import toast from 'react-hot-toast';
import { Equipment, EquipmentCategory, EquipmentStatus } from '@/types/client';
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
      return matchesSearch && matchesCategory;
    });
  }, [equipment, search, categoryFilter]);

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

  const categoryTabs = [
    { id: 'all', label: 'All Equipment' },
    { id: 'cardio', label: 'Cardio' },
    { id: 'pesas', label: 'Strength' },
    { id: 'maquinas', label: 'Machines' },
    { id: 'funcional', label: 'Functional' },
  ];

  const getMaintenanceDays = (eq: Equipment) => {
    if (!eq.nextMaintenance) return 45;
    return Math.max(
      0,
      Math.floor(
        (new Date(eq.nextMaintenance).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      ),
    );
  };

  return (
    <div className="space-y-6 pb-4">
      <PageHeader
        title="Equipment"
        search={
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5B6475]" />
            <input
              type="text"
              placeholder="Search equipment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={premium.searchInput}
            />
          </div>
        }
        actions={
          <button type="button" onClick={handleOpenCreate} className={premium.pillBtn}>
            <Plus className="h-4 w-4" /> Add Equipment
          </button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {categoryTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setCategoryFilter(tab.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              categoryFilter === tab.id
                ? 'bg-[#0B57F0] text-white shadow-sm'
                : 'border border-[#E5EAF3] bg-white text-[#5B6475] hover:border-[#0B57F0]/30'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {filteredEquipment.map((eq) => {
          const maintDays = getMaintenanceDays(eq);
          const maintProgress = Math.min(100, Math.max(10, 100 - maintDays));
          const isOperational = eq.status === 'operativo';
          return (
            <article key={eq.id} className={`overflow-hidden ${premium.card}`}>
              <div className="relative h-40 bg-gradient-to-br from-[#E5EAF3] to-[#F5F7FB]">
                <div className="flex h-full items-center justify-center text-5xl opacity-80">
                  {getCategoryIcon(eq.category)}
                </div>
                {isOperational && (
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Operational
                  </span>
                )}
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-[#0A1733]">{eq.name}</h3>
                    <p className="mt-0.5 font-mono text-xs text-[#5B6475]">
                      SN: {eq.serialNumber || '—'}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-full p-2 text-[#5B6475] hover:bg-[#F5F7FB]"
                    aria-label="Options"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div>
                    <p className={premium.labelCaps}>Location</p>
                    <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-[#0A1733]">
                      <MapPin className="h-3.5 w-3.5 text-[#0B57F0]" />
                      {eq.location || '—'}
                    </p>
                  </div>
                  <div>
                    <p className={premium.labelCaps}>Usage</p>
                    <p className="mt-1 text-sm font-semibold text-[#0A1733]">
                      {(eq.totalUsageHours || 0).toLocaleString()} hrs
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-medium text-[#5B6475]">Next Maintenance</span>
                    <span className="font-semibold text-[#0A1733]">{maintDays} Days</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#E5EAF3]">
                    <div
                      className="h-full rounded-full bg-[#0B57F0] transition-all"
                      style={{ width: `${maintProgress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex gap-2 border-t border-[#E5EAF3] pt-4">
                  <button
                    type="button"
                    onClick={() => handleEdit(eq)}
                    className="flex-1 rounded-full border border-[#E5EAF3] py-2 text-xs font-semibold text-[#0B57F0] hover:bg-[#0B57F0]/5"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(eq.id)}
                    className="rounded-full px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {filteredEquipment.length === 0 && <div className="text-center py-12"><Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500">No se encontraron equipos</p></div>}

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1733]/45 px-4 py-6 backdrop-blur-sm">
          <div className={`${premium.formPanel} max-h-[90vh] w-full max-w-3xl overflow-y-auto p-5 sm:p-6`}>
            <div className="mb-6 flex items-start justify-between gap-4 border-b border-[#E5EAF3] pb-5">
              <div>
                <p className={premium.labelCaps}>Equipment</p>
                <h2 className="mt-1 text-2xl font-bold text-[#0A1733]">{editingEquipment ? 'Editar Equipo' : 'Crear Nuevo Equipo'}</h2>
                <p className="mt-1 text-sm text-[#5B6475]">Organize asset details, location and maintenance planning.</p>
              </div>
              <button type="button" onClick={() => setIsCreateModalOpen(false)} disabled={isSubmitting} className={premium.formSecondaryBtn}>Cerrar</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className={premium.formSection}>
                <div className="mb-5">
                  <h3 className="text-lg font-bold text-[#0A1733]">Asset details</h3>
                  <p className="mt-1 text-sm text-[#5B6475]">Basic information to identify this equipment.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className={premium.formLabel}>Nombre *</span>
                    <input required placeholder="Ej: Caminadora Pro 3000" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={premium.formInput} />
                  </label>
                  <label className="block">
                    <span className={premium.formLabel}>Categoría</span>
                    <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value as EquipmentCategory})} className={premium.formInput}>
                      <option value="cardio">Cardio</option>
                      <option value="pesas">Pesas</option>
                      <option value="maquinas">Máquinas</option>
                      <option value="funcional">Funcional</option>
                      <option value="accesorios">Accesorios</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className={premium.formLabel}>Estado</span>
                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as EquipmentStatus})} className={premium.formInput}>
                      <option value="nuevo">Nuevo</option>
                      <option value="operativo">Operativo</option>
                      <option value="en_mantenimiento">En Mantenimiento</option>
                      <option value="fuera_servicio">Fuera de Servicio</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className={premium.formLabel}>Marca</span>
                    <input placeholder="Ej: Life Fitness" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} className={premium.formInput} />
                  </label>
                  <label className="block">
                    <span className={premium.formLabel}>Modelo</span>
                    <input placeholder="Ej: F1 Classic" value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} className={premium.formInput} />
                  </label>
                  <label className="block">
                    <span className={premium.formLabel}>Número Serial</span>
                    <input placeholder="Ej: LF-2024-0001" value={formData.serialNumber} onChange={(e) => setFormData({...formData, serialNumber: e.target.value})} className={premium.formInput} />
                  </label>
                  <label className="block">
                    <span className={premium.formLabel}>Ubicación</span>
                    <input placeholder="Ej: Sala Cardio - Zona A" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className={premium.formInput} />
                  </label>
                </div>
              </div>

              <div className={premium.formSection}>
                <div className="mb-5">
                  <h3 className="text-lg font-bold text-[#0A1733]">Maintenance and usage</h3>
                  <p className="mt-1 text-sm text-[#5B6475]">Track cost, usage and maintenance schedule.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className={premium.formLabel}>Precio (COP)</span>
                    <input type="number" placeholder="Ej: 5000000" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value === '' ? '' : Number(e.target.value)})} className={premium.formInput} />
                  </label>
                  <label className="block">
                    <span className={premium.formLabel}>Horas de uso</span>
                    <input type="number" placeholder="Ej: 250" value={formData.totalUsageHours} onChange={(e) => setFormData({...formData, totalUsageHours: e.target.value === '' ? '' : Number(e.target.value)})} className={premium.formInput} />
                  </label>
                  <label className="block">
                    <span className={premium.formLabel}>Fecha de Compra</span>
                    <input type="date" value={formData.purchaseDate} onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})} className={premium.formInput} />
                  </label>
                  <label className="block">
                    <span className={premium.formLabel}>Intervalo de Mantenimiento (días)</span>
                    <input type="number" placeholder="Ej: 90" value={formData.maintenanceIntervalDays} onChange={(e) => setFormData({...formData, maintenanceIntervalDays: e.target.value === '' ? '' : Number(e.target.value)})} className={premium.formInput} />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className={premium.formLabel}>Próximo Mantenimiento</span>
                    <input type="date" value={formData.nextMaintenance} onChange={(e) => setFormData({...formData, nextMaintenance: e.target.value})} className={premium.formInput} />
                  </label>
                </div>
              </div>

              <label className="block">
                <span className={premium.formLabel}>Notas</span>
                <textarea placeholder="Ej: Equipo en perfecto estado, con manual de usuario incluido..." rows={4} value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className={premium.formTextarea} />
              </label>

              <div className="flex flex-col-reverse gap-3 border-t border-[#E5EAF3] pt-6 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} disabled={isSubmitting} className={premium.formSecondaryBtn}>Cancelar</button>
                <button type="submit" disabled={isSubmitting} className={`${premium.pillBtn} disabled:cursor-not-allowed disabled:opacity-60`}>{isSubmitting ? 'Guardando...' : 'Guardar'}</button>
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
