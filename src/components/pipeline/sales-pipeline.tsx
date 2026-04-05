'use client';

import { useState, useMemo } from 'react';
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
import { useGymStore } from '@/store/useGymStore';
import { leadSchema, type LeadFormData } from '@/lib/validations';
import { Lead, LeadStatus } from '@/types/client';
import { Plus, Edit, Trash2 } from 'lucide-react';

const stages: { id: LeadStatus; label: string; color: string }[] = [
  { id: 'nuevo', label: 'Leads Nuevos', color: 'bg-slate-100 border-slate-300' },
  { id: 'contactado', label: 'Contactados', color: 'bg-blue-50 border-blue-300' },
  { id: 'tour_agendado', label: 'Tour Agendado', color: 'bg-purple-50 border-purple-300' },
  { id: 'propuesta', label: 'Propuesta', color: 'bg-amber-50 border-amber-300' },
  { id: 'negociacion', label: 'Negociación', color: 'bg-orange-50 border-orange-300' },
  { id: 'cerrado_ganado', label: 'Cerrado ✅', color: 'bg-green-50 border-green-300' },
];

export default function SalesPipeline() {
  const { leads, moveLead, addLead, updateLead, deleteLead } = useGymStore();
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const leadId = active.id as string;
    const newStatus = over.id as LeadStatus;
    if (!stages.find((s) => s.id === newStatus)) return;
    moveLead(leadId, newStatus);
    toast.success(newStatus === 'cerrado_ganado' ? '🎉 ¡Nueva membresía vendida!' : 'Lead movido');
  };

  const { register, handleSubmit, reset, formState: { errors } } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: { budget: 0 },
  });

  const onSubmit = (data: LeadFormData) => {
    if (editingLead) {
      updateLead(editingLead.id, data);
      toast.success('Lead actualizado');
    } else {
      addLead(data);
      toast.success('Lead creado');
    }
    setIsPanelOpen(false);
    setEditingLead(null);
    reset({ budget: 0 });
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    reset({ name: lead.name, email: lead.email, phone: lead.phone, fitnessGoal: lead.fitnessGoal, budget: lead.budget, source: lead.source });
    setIsPanelOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteLead(id);
    toast.success('Lead eliminado');
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Pipeline de Ventas</h2>
          <p className="text-sm text-slate-600 mt-1">Arrastra leads entre etapas para gestionar ventas</p>
        </div>
        <button onClick={() => setIsPanelOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <Plus className="w-4 h-4" /> Nuevo Lead
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {stages.map((stage) => (
            <div key={stage.id} id={stage.id} className={`rounded-xl border-2 ${stage.color} p-4 min-h-[500px]`}>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">{stage.label}</h3>
                  <p className="text-xs text-slate-600">{leadsByStage[stage.id]?.length || 0} leads</p>
                </div>
                <div className="rounded-lg bg-white px-2 py-1.5 text-xs font-semibold text-slate-900 shadow-sm">
                  ${((valueByStage[stage.id] || 0) / 1000).toFixed(1)}k
                </div>
              </div>

              <div className="space-y-3">
                {(leadsByStage[stage.id] || []).map((lead) => (
                  <div key={lead.id} id={lead.id} className="cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md active:cursor-grabbing">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 text-sm">{lead.name}</h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{lead.fitnessGoal}</p>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button onClick={() => handleEdit(lead)} className="rounded p-1 text-slate-600 hover:bg-slate-100 hover:text-blue-600">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteConfirmId(lead.id)} className="rounded p-1 text-slate-600 hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
                ))}
                {(!leadsByStage[stage.id] || leadsByStage[stage.id].length === 0) && (
                  <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-slate-300">
                    <p className="text-xs text-slate-400">Arrastra aquí</p>
                  </div>
                )}
              </div>
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
              <input {...register('name')} placeholder="Nombre completo" className="w-full rounded-lg border border-slate-300 px-4 py-2" />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <input {...register('email')} type="email" placeholder="Email" className="w-full rounded-lg border border-slate-300 px-4 py-2" />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <input {...register('phone')} placeholder="Teléfono" className="w-full rounded-lg border border-slate-300 px-4 py-2" />
              {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <input {...register('fitnessGoal')} placeholder="Objetivo fitness" className="w-full rounded-lg border border-slate-300 px-4 py-2" />
              {errors.fitnessGoal && <p className="text-sm text-red-500 mt-1">{errors.fitnessGoal.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input {...register('budget', { valueAsNumber: true })} type="number" placeholder="Presupuesto" className="w-full rounded-lg border border-slate-300 px-4 py-2" />
                {errors.budget && <p className="text-sm text-red-500 mt-1">{errors.budget.message}</p>}
              </div>
              <div>
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
