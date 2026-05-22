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

import { PageHeader } from '@/components/layout/page-header';
import { premium } from '@/lib/premium-ui';

const stages: { id: LeadStatus; label: string }[] = [
  { id: 'nuevo', label: 'New Leads' },
  { id: 'contactado', label: 'Contacted' },
  { id: 'tour_agendado', label: 'Tour Scheduled' },
  { id: 'propuesta', label: 'Proposal' },
  { id: 'negociacion', label: 'Negotiation' },
  { id: 'cerrado_ganado', label: 'Closed Won' },
];

function DraggableCard({ lead, onEdit, onDelete }: { lead: Lead; onEdit: (lead: Lead) => void; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  });

  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`cursor-grab rounded-2xl border border-[#E5EAF3] bg-white p-4 shadow-[0_2px_12px_-4px_rgba(10,23,51,0.06)] transition ${
        isDragging ? 'opacity-50 active:cursor-grabbing' : 'hover:shadow-[0_8px_24px_-8px_rgba(10,23,51,0.1)]'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-[#0A1733]">{lead.name}</h4>
        <span className="shrink-0 rounded-lg bg-[#0B57F0]/10 px-2 py-0.5 text-xs font-semibold text-[#0B57F0]">
          {lead.conversionProbability}%
        </span>
      </div>
      <p className="mt-2 text-xs text-[#5B6475] line-clamp-2">{lead.fitnessGoal}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="rounded-lg bg-[#F5F7FB] px-2 py-1 text-xs font-medium text-[#5B6475]">
          ${(lead.budget / 1000).toFixed(0)}k/m
        </span>
        <div className="flex gap-1">
          <button type="button" onClick={() => onEdit(lead)} className="rounded-lg p-1.5 text-[#5B6475] hover:bg-[#0B57F0]/5 hover:text-[#0B57F0]">
            <Edit className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => onDelete(lead.id)} className="rounded-lg p-1.5 text-[#5B6475] hover:bg-red-50 hover:text-red-600">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function DroppableColumn({ stageId, stageName, leads, onEdit, onDelete }: { stageId: string; stageName: string; leads: Lead[]; onEdit: (lead: Lead) => void; onDelete: (id: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({
    id: stageId,
  });

  return (
    <div
      ref={setNodeRef}
      id={stageId}
      className={`flex min-h-[calc(100dvh-11rem)] flex-col rounded-[1.25rem] border border-[#E5EAF3] bg-[#EEF2F8]/60 p-4 transition ${
        isOver ? 'ring-2 ring-[#0B57F0]/20' : ''
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[#0A1733]">{stageName}</h3>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0B57F0] text-xs font-bold text-white">
          {leads?.length || 0}
        </span>
      </div>

      <div className="flex flex-1 flex-col space-y-3">
        {(leads || []).map((lead) => (
          <DraggableCard key={lead.id} lead={lead} onEdit={onEdit} onDelete={onDelete} />
        ))}
        {(!leads || leads.length === 0) && (
          <div className="flex flex-1 items-center justify-center rounded-2xl border-2 border-dashed border-[#E5EAF3] bg-white/50">
            <p className="text-xs font-medium text-[#5B6475]">Drop leads here</p>
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
    defaultValues: {} as Partial<LeadFormData>,
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
      reset();
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
    <div className="space-y-6 pb-4">
      <PageHeader
        title="Sales Pipeline"
        actions={
          <button
            type="button"
            onClick={() => { setEditingLead(null); reset(); setIsPanelOpen(true); }}
            className={premium.pillBtn}
          >
            <Plus className="h-4 w-4" /> New Lead
          </button>
        }
      />

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <div key={stage.id} className="w-[min(100%,280px)] shrink-0 sm:w-[260px]">
              <DroppableColumn
                stageId={stage.id}
                stageName={stage.label}
                leads={leadsByStage[stage.id] || []}
                onEdit={handleEdit}
                onDelete={(id) => setDeleteConfirmId(id)}
              />
            </div>
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
