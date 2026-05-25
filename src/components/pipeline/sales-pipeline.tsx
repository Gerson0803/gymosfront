'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { type LeadFormData } from '@/lib/validations';
import type {
  ComboDetails,
  FitnessProductDetails,
  Lead,
  LeadStatus,
  MembershipDetails,
  PersonalTrainingDetails,
} from '@/types/client';
import { Plus, Edit, Trash2, Loader } from 'lucide-react';
import { getLeads, createLead, updateLeadApi, deleteLeadApi, moveLeadStage } from '@/lib/api';
import { LeadFormModal } from './LeadFormModal';
import { LeadDetailModal } from './LeadDetailModal';
import { ExcelButtons } from './ExcelButtons';

import { PageHeader } from '@/components/layout/page-header';
import { premium } from '@/lib/premium-ui';

type LeadsApiResponse =
  | Lead[]
  | {
      data?: Lead[] | { leads?: Lead[]; items?: Lead[] };
      leads?: Lead[];
      items?: Lead[];
    };

type LeadMutationResponse = Lead | { data?: Lead };

function normalizeLeadsResponse(response: LeadsApiResponse): Lead[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.data?.leads)) return response.data.leads;
  if (Array.isArray(response.data?.items)) return response.data.items;
  if (Array.isArray(response.leads)) return response.leads;
  if (Array.isArray(response.items)) return response.items;
  return [];
}

function normalizeLeadMutationResponse(response: LeadMutationResponse): Lead {
  if ('data' in response && response.data) return response.data;
  return response as Lead;
}

const stages: { id: LeadStatus; label: string }[] = [
  { id: 'nuevo', label: 'New Leads' },
  { id: 'contactado', label: 'Contacted' },
  { id: 'tour_agendado', label: 'Tour Scheduled' },
  { id: 'propuesta', label: 'Proposal' },
  { id: 'negociacion', label: 'Negotiation' },
  { id: 'cerrado_ganado', label: 'Closed Won' },
];

function DraggableCard({ lead, onEdit, onDelete, onViewDetails }: { lead: Lead; onEdit: (lead: Lead) => void; onDelete: (id: string) => void; onViewDetails?: (lead: Lead) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  });

  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  const productTypeInfo = {
    fitness_product: { label: 'Producto', icon: '🏋️', color: 'bg-orange-100 text-orange-700' },
    membership: { label: 'Membresía', icon: '🎟️', color: 'bg-blue-100 text-blue-700' },
    personal_training: { label: 'Entrenamiento', icon: '👨‍🏫', color: 'bg-purple-100 text-purple-700' },
    combo: { label: 'Combo', icon: '📦', color: 'bg-green-100 text-green-700' },
  }[lead.productType] || { label: 'Producto', icon: '📦', color: 'bg-gray-100 text-gray-700' };

  const getRelevantInfo = () => {
    const details = lead.productDetails;
    if (!details) return null;

    switch (lead.productType) {
      case 'membership':
        return `${(details as MembershipDetails).membershipType} - $${(details as MembershipDetails).pricePerPeriod}`;
      case 'personal_training':
        return `${(details as PersonalTrainingDetails).numberOfSessions} sesiones - ${(details as PersonalTrainingDetails).serviceType}`;
      case 'fitness_product':
        return `${(details as FitnessProductDetails).productName} - $${(details as FitnessProductDetails).unitPrice}`;
      case 'combo':
        return `${(details as ComboDetails).comboType}`;
      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onViewDetails?.(lead)}
      className={`cursor-grab rounded-2xl border border-[#E5EAF3] bg-white p-4 shadow-[0_2px_12px_-4px_rgba(10,23,51,0.06)] transition hover:shadow-[0_8px_24px_-8px_rgba(10,23,51,0.1)] ${
        isDragging ? 'opacity-50 active:cursor-grabbing' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-[#0A1733] flex-1">{lead.name}</h4>
      </div>
      
      <div className={`mt-2 rounded-lg px-2 py-1.5 text-xs font-medium ${productTypeInfo.color}`}>
        {productTypeInfo.icon} {productTypeInfo.label}
      </div>

      {getRelevantInfo() && (
        <p className="mt-2 text-xs text-[#5B6475] line-clamp-2 font-medium">{getRelevantInfo()}</p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <span className="rounded-lg bg-[#F5F7FB] px-2 py-1 text-xs font-medium text-[#5B6475]">
          {lead.status}
        </span>
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
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

function DroppableColumn({ stageId, stageName, leads, onEdit, onDelete, onViewDetails }: { stageId: string; stageName: string; leads: Lead[]; onEdit: (lead: Lead) => void; onDelete: (id: string) => void; onViewDetails?: (lead: Lead) => void }) {
  const { setNodeRef, isOver } = useDroppable({
    id: stageId,
  });

  return (
    <div
      ref={setNodeRef}
      id={stageId}
      className={`flex h-full min-h-0 flex-col rounded-[1.25rem] border border-[#E5EAF3] bg-[#EEF2F8]/60 p-4 transition ${
        isOver ? 'ring-2 ring-[#0B57F0]/20' : ''
      }`}
    >
      <div className="mb-4 flex shrink-0 items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[#0A1733]">{stageName}</h3>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0B57F0] text-xs font-bold text-white">
          {leads?.length || 0}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-x-hidden overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {(leads || []).map((lead) => (
          <DraggableCard key={lead.id} lead={lead} onEdit={onEdit} onDelete={onDelete} onViewDetails={onViewDetails} />
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
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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
        const data = await getLeads() as LeadsApiResponse;
        setLeads(normalizeLeadsResponse(data));
      } catch {
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
      toast.success(newStatus === 'cerrado_ganado' ? '🎉 ¡Nueva venta completada!' : 'Lead movido');
    } catch {
      setLeads(previousLeads);
      toast.error('Error al mover lead');
    }
  };

  const handleFormSubmit = async (data: LeadFormData) => {
    try {
      if (editingLead) {
        await updateLeadApi(editingLead.id, data as Record<string, unknown>);
        setLeads(leads.map(l => l.id === editingLead.id ? {...l, ...data} as Lead : l));
        toast.success('Lead actualizado');
      } else {
        const response = await createLead(data as Record<string, unknown>) as LeadMutationResponse;
        const newLead = normalizeLeadMutationResponse(response);
        setLeads([...leads, newLead]);
        toast.success('Lead creado');
      }
      setIsFormOpen(false);
      setEditingLead(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar lead';
      toast.error(errorMessage);
    }
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setIsFormOpen(true);
  };

  const handleViewDetails = (lead: Lead) => {
    setViewingLead(lead);
    setIsDetailOpen(true);
  };

  const handleDeleteLead = async (id: string) => {
    try {
      await deleteLeadApi(id);
      setLeads(leads.filter(l => l.id !== id));
      toast.success('Lead eliminado');
      setDeleteConfirmId(null);
    } catch {
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
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 [&_header]:!mb-4">
        <PageHeader
          title="Sales Pipeline"
          headerActions={
            <div className="flex items-center gap-3">
              <ExcelButtons onImportComplete={() => {
                const loadLeads = async () => {
                  try {
                    const data = await getLeads() as LeadsApiResponse;
                    setLeads(normalizeLeadsResponse(data));
                  } catch {
                    setError('Error al cargar leads');
                  }
                };
                loadLeads();
              }} />
              <button
                type="button"
                onClick={() => { setEditingLead(null); setIsFormOpen(true); }}
                className={premium.pillBtn}
              >
                <Plus className="h-4 w-4" /> Nuevo Lead
              </button>
            </div>
          }
        />
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden overscroll-x-contain">
          <div className="grid h-full min-w-[1180px] grid-cols-6 items-stretch gap-4 xl:min-w-0">
          {stages.map((stage) => (
            <div key={stage.id} className="h-full min-w-[180px]">
              <DroppableColumn
                stageId={stage.id}
                stageName={stage.label}
                leads={leadsByStage[stage.id] || []}
                onEdit={handleEditLead}
                onDelete={(id) => setDeleteConfirmId(id)}
                onViewDetails={handleViewDetails}
              />
            </div>
          ))}
          </div>
        </div>
      </DndContext>

      <LeadFormModal
        isOpen={isFormOpen}
        lead={editingLead}
        onClose={() => {
          setIsFormOpen(false);
          setEditingLead(null);
        }}
        onSubmit={handleFormSubmit}
      />

      <LeadDetailModal
        isOpen={isDetailOpen}
        lead={viewingLead}
        onClose={() => {
          setIsDetailOpen(false);
          setViewingLead(null);
        }}
      />

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">¿Eliminar lead?</h3>
            <p className="text-sm text-slate-600 mb-4">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">Cancelar</button>
              <button onClick={() => handleDeleteLead(deleteConfirmId)} className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
