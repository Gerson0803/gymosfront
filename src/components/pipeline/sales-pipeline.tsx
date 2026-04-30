'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import {
  DndContext,
  DragEndEvent,
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { leadSchema, type LeadFormData } from '@/lib/validations';
import { Lead, LeadStatus } from '@/types/client';
import { Plus, Edit, Trash2, Loader } from 'lucide-react';
import { getLeads, createLead, updateLeadApi, deleteLeadApi, moveLeadStage } from '@/lib/api';

const stages: { id: LeadStatus; label: string; color: string }[] = [
  { id: 'nuevo', label: 'Leads Nuevos', color: 'bg-slate-100 border-slate-300' },
  { id: 'contactado', label: 'Contactados', color: 'bg-blue-50 border-blue-300' },
  { id: 'tour_agendado', label: 'Tour Agendado', color: 'bg-purple-50 border-purple-300' },
  { id: 'propuesta', label: 'Propuesta', color: 'bg-amber-50 border-amber-300' },
  { id: 'negociacion', label: 'Negociación', color: 'bg-orange-50 border-orange-300' },
  { id: 'cerrado_ganado', label: 'Cerrado ✅', color: 'bg-green-50 border-green-300' },
];

function DraggableCard({ lead, onEdit, onDelete }: { lead: Lead; onEdit: (lead: Lead) => void; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  });

  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={`cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition ${isDragging ? 'opacity-50 active:cursor-grabbing' : 'hover:shadow-md'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-slate-900 text-sm">{lead.name}</h4>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{lead.fitnessGoal}</p>
        </div>
        <div className="flex gap-1 ml-2">
          <button onClick={() => onEdit(lead)} className="rounded p-1 text-slate-600 hover:bg-slate-100 hover:text-blue-600"><Edit className="w-3.5 h-3.5" /></button>
          <button onClick={() => onDelete(lead.id)} className="rounded p-1 text-slate-600 hover:bg-red-50 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      
      <div className="mt-3 space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-500">Presupuesto:</span>
          <span className="font-semibold">${lead.budget.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Fuente:</span>
          <span className="capitalize">{lead.source.replace('_', ' ')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Probabilidad:</span>
          <span className={`font-semibold ${lead.conversionProbability >= 70 ? 'text-green-600' : lead.conversionProbability >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
            {lead.conversionProbability}%
          </span>
        </div>
        <div className="pt-2 border-t border-slate-100">
          <p className="text-slate-500">Asesor: {lead.assignedAdvisor}</p>
        </div>
      </div>
    </div>
  );
}

function DroppableColumn({ stageId, stageName, stageColor, leads, totalValue, onEdit, onDelete }: { stageId: string; stageName: string; stageColor: string; leads: Lead[]; totalValue: number; onEdit: (lead: Lead) => void; onDelete: (id: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({
    id: stageId,
  });

  return (
    <div ref={setNodeRef} id={stageId} className={`rounded-xl border-2 ${stageColor} p-4 min-h-screen transition ${isOver ? 'bg-opacity-50' : ''}`} style={{ minHeight: '500px' }}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">{stageName}</h3>
          <p className="text-xs text-slate-600">{leads?.length || 0} leads</p>
        </div>
        <div className="rounded-lg bg-white px-2 py-1.5 text-xs font-semibold text-slate-900 shadow-sm">
          ${(totalValue / 1000).toFixed(1)}k
        </div>
      </div>

      <div className="space-y-3">
        {(leads || []).map((lead) => (
          <DraggableCard key={lead.id} lead={lead} onEdit={onEdit} onDelete={onDelete} />
        ))}
        {(!leads || leads.length === 0) && (
          <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-slate-300">
            <p className="text-xs text-slate-400">Arrastra aquí</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SalesPipeline() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const leadsByStage = useMemo(() => {
    const grouped: Record<LeadStatus, Lead[]> = {
      nuevo: [], contactado: [], tour_agendado: [], tour_realizado: [],
      propuesta: [], negociacion: [], cerrado_ganado: [], cerrado_perdido: [],
    };
    leads.forEach((lead) => { if (grouped[lead.status]) grouped[lead.status].push(lead); });
    return grouped;
  }, [leads]);

  const valueByStage = useMemo(() => {
    const values: Record<string, number> = {};
    Object.keys(leadsByStage).forEach((stage) => {
      values[stage] = leadsByStage[stage as LeadStatus].reduce((sum, lead) => sum + lead.budget, 0);
    });
    return values;
  }, [leadsByStage]);

  useEffect(() => {
    const loadLeads = async () => {
      try {
        const data = await getLeads();
        const raw = data as any;
        const list = Array.isArray(raw) ? raw
          : raw.data?.leads || raw.data?.items || raw.data || raw.leads || [];
        setLeads(list);
      } catch (err) {
        setError('Error al cargar leads');
      } finally {
        setLoading(false);
      }
    };
    loadLeads();
  }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const leadId = active.id as string;
    const newStatus = over.id as LeadStatus;
    if (!stages.find((s) => s.id === newStatus)) return;
    const previousLeads = [...leads];
    setLeads(leads.map(l => l.id === leadId ? {...l, status: newStatus} : l));
    try {
      await moveLeadStage(leadId, newStatus);
      toast.success(newStatus === 'cerrado_ganado' ? '🎉 ¡Nueva membresía vendida!' : 'Lead movido');
    } catch (err) {
      setLeads(previousLeads);
      toast.error('Error al mover lead');
    }
  };

  const { register, handleSubmit, reset, formState: { errors } } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: { budget: 0 },
  });

  const onSubmit = async (data: LeadFormData) => {
    try {
      if (editingLead) {
        await updateLeadApi(editingLead.id, data as any);
        setLeads(leads.map(l => l.id === editingLead.id ? {...l, ...data} : l));
        toast.success('Lead actualizado');
      } else {
        const response = await createLead(data as any);
        const raw = response as any;
        const newLead = raw.data || raw;
        setLeads([...leads, newLead]);
        toast.success('Lead creado');
      }
      setIsPanelOpen(false);
      setEditingLead(null);
      reset({ budget: 0 });
    } catch (err) {
      toast.error('Error al guardar lead');
    }
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    reset({ name: lead.name, email: lead.email, phone: lead.phone, fitnessGoal: lead.fitnessGoal, budget: lead.budget, source: lead.source });
    setIsPanelOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLeadApi(id);
      setLeads(leads.filter(l => l.id !== id));
      toast.success('Lead eliminado');
      setDeleteConfirmId(null);
    } catch (err) {
      toast.error('Error al eliminar lead');
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Pipeline de Ventas</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Arrastra leads entre etapas para gestionar ventas</p>
        </div>
        <button onClick={() => setIsPanelOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <Plus className="w-4 h-4" /> Nuevo Lead
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {stages.map((stage) => (
            <DroppableColumn 
              key={stage.id} 
              stageId={stage.id} 
              stageName={stage.label} 
              stageColor={stage.color} 
              leads={leadsByStage[stage.id] || []} 
              totalValue={valueByStage[stage.id] || 0}
              onEdit={handleEdit}
              onDelete={(id) => setDeleteConfirmId(id)}
            />
          ))}
        </div>
      </DndContext>

      {isPanelOpen && (
        <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white p-6 shadow-2xl overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">{editingLead ? 'Editar Lead' : 'Nuevo Lead'}</h2>
            <button onClick={() => { setIsPanelOpen(false); setEditingLead(null); reset(); }} className="text-slate-500 hover:text-slate-900">Cerrar</button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre completo</label>
              <input {...register('name')} placeholder="Ej: Juan García" className="w-full rounded-lg border border-slate-300 px-4 py-2" />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
              <input {...register('email')} type="email" placeholder="juan@email.com" className="w-full rounded-lg border border-slate-300 px-4 py-2" />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Teléfono</label>
              <input {...register('phone')} placeholder="+57 300 123 4567" className="w-full rounded-lg border border-slate-300 px-4 py-2" />
              {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Objetivo fitness</label>
              <input {...register('fitnessGoal')} placeholder="Ej: Ganar músculo, Perder peso" className="w-full rounded-lg border border-slate-300 px-4 py-2" />
              {errors.fitnessGoal && <p className="text-sm text-red-500 mt-1">{errors.fitnessGoal.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Presupuesto (COP)</label>
                <input {...register('budget', { valueAsNumber: true })} type="number" placeholder="80000" className="w-full rounded-lg border border-slate-300 px-4 py-2" />
                {errors.budget && <p className="text-sm text-red-500 mt-1">{errors.budget.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Fuente</label>
                <select {...register('source')} className="w-full rounded-lg border border-slate-300 px-4 py-2">
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="google">Google</option>
                  <option value="referido">Referido</option>
                  <option value="walk_in">Walk-in</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {editingLead ? 'Actualizar' : 'Guardar'}
            </button>
          </form>
        </aside>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">¿Eliminar lead?</h3>
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
