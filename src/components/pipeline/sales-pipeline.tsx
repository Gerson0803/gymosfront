"use client";

import { useState, useMemo, useEffect } from "react";
import toast from "react-hot-toast";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { type LeadFormData } from "@/lib/validations";

import type {
  ComboDetails,
  FitnessProductDetails,
  Lead,
  LeadStatus,
  MembershipDetails,
  PersonalTrainingDetails,
} from "@/types/client";
import { Plus, Edit, Trash2, Loader } from "lucide-react";
import {
  getLeads,
  createLead,
  updateLeadApi,
  deleteLeadApi,
  moveLeadStage,
} from "@/lib/api";
import { LeadFormModal } from "./LeadFormModal";
import { LeadDetailModal } from "./LeadDetailModal";
import { ExcelButtons } from "./ExcelButtons";

import { PageHeader } from "@/components/layout/page-header";

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
  if ("data" in response && response.data) return response.data;
  return response as Lead;
}

const stages: { id: LeadStatus; label: string }[] = [
  { id: "nuevo", label: "Prospección" },
  { id: "contactado", label: "Contacto inicial" },
  { id: "tour_agendado", label: "Diagnóstico" },
  { id: "propuesta", label: "Propuesta enviada" },
  { id: "negociacion", label: "Negociación" },
  { id: "cerrado_ganado", label: "Cierre" },
];

function getLeadProductInfo(lead: Lead) {
  const productTypeInfo = {
    fitness_product: {
      label: "Producto",
      icon: "🏋️",
      color: "bg-orange-100 text-orange-700 border-orange-200",
    },
    membership: {
      label: "Membresía",
      icon: "🎟️",
      color: "bg-blue-100 text-blue-700 border-blue-200",
    },
    personal_training: {
      label: "Entrenamiento",
      icon: "👨‍🏫",
      color: "bg-purple-100 text-purple-700 border-purple-200",
    },
    combo: {
      label: "Combo",
      icon: "📦",
      color: "bg-green-100 text-green-700 border-green-200",
    },
  }[lead.productType] || {
    label: "Producto",
    icon: "📦",
    color: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const details = lead.productDetails as Record<string, unknown> | null;

  const info = (() => {
    if (!details) return null;

    switch (lead.productType) {
      case "membership":
        return {
          primary: (details as MembershipDetails).membershipType,
          secondary: `$${(details as MembershipDetails).pricePerPeriod}`,
        };
      case "personal_training":
        return {
          primary: `${(details as PersonalTrainingDetails).numberOfSessions} sesiones`,
          secondary: (details as PersonalTrainingDetails).serviceType,
        };
      case "fitness_product":
        return {
          primary: (details as FitnessProductDetails).productName,
          secondary: `$${(details as FitnessProductDetails).unitPrice}`,
        };
      case "combo":
        return {
          primary: (details as ComboDetails).comboType,
        };
      default:
        return null;
    }
  })();

  return { productTypeInfo, info };
}

function LeadCardContent({
  lead,
  onEdit,
  onDelete,
  onViewDetails,
  dragging = false,
}: {
  lead: Lead;
  onEdit?: (lead: Lead) => void;
  onDelete?: (id: string) => void;
  onViewDetails?: (lead: Lead) => void;
  dragging?: boolean;
}) {
  const { productTypeInfo, info } = getLeadProductInfo(lead);

  return (
    <div
      onClick={() => onViewDetails?.(lead)}
      className={`rounded-xl border border-[#E5EAF3] bg-white p-2.5 shadow-[0_2px_12px_-4px_rgba(10,23,51,0.06)] transition hover:shadow-[0_8px_24px_-8px_rgba(10,23,51,0.1)] ${
        dragging ? "cursor-grabbing opacity-50" : "cursor-pointer"
      }`}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-semibold text-[#0A1733]">
            {lead.name}
          </h4>
          <div
            className={`mt-1.5 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium ${productTypeInfo.color}`}
          >
            <span>{productTypeInfo.icon}</span>
            <span>{productTypeInfo.label}</span>
          </div>
        </div>
      </div>

      {info && (
        <div className="mt-1.5 flex items-center justify-between gap-2.5 text-xs">
          <p className="min-w-0 flex-1 truncate font-medium text-[#0A1733]">
            {info.primary}
          </p>
          {info.secondary && (
            <p className="shrink-0 truncate text-[#5B6475]">{info.secondary}</p>
          )}
        </div>
      )}

      {onEdit && onDelete ? (
        <div className="mt-2.5 flex items-center justify-end gap-1.5 border-t border-[#E5EAF3] pt-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => onEdit(lead)}
            className="rounded-lg p-1.5 text-[#5B6475] transition hover:bg-[#0B57F0]/5 hover:text-[#0B57F0]"
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(lead.id)}
            className="rounded-lg p-1.5 text-[#5B6475] transition hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function DraggableCard({
  lead,
  onEdit,
  onDelete,
  onViewDetails,
}: {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onViewDetails?: (lead: Lead) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: lead.id,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 9999,
        position: "relative" as const,
      }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <LeadCardContent
        lead={lead}
        onEdit={onEdit}
        onDelete={onDelete}
        onViewDetails={onViewDetails}
        dragging={isDragging}
      />
    </div>
  );
}

function DroppableColumn({
  stageId,
  stageName,
  leads,
  onEdit,
  onDelete,
  onViewDetails,
}: {
  stageId: string;
  stageName: string;
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onViewDetails?: (lead: Lead) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: stageId,
  });

  return (
    <div
      ref={setNodeRef}
      id={stageId}
      className={`flex flex-1 min-h-0 flex-col overflow-hidden rounded-[1.25rem] border border-[#E5EAF3] bg-[#EEF2F8]/60 p-4 transition ${
        isOver ? "ring-2 ring-[#0B57F0]/20" : ""
      }`}
    >
      <div className="mb-3 flex shrink-0 items-center justify-between gap-2 border-b border-[#DDE4F0] pb-2.5">
        <h3 className="text-sm font-semibold text-[#0A1733]">{stageName}</h3>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0B57F0] text-xs font-bold text-white">
          {leads?.length || 0}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-x-hidden overflow-y-auto pr-1 [scrollbar-width:thin] [-ms-overflow-style:auto] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#C8D2E3]">
        {(leads || []).map((lead) => (
          <DraggableCard
            key={lead.id}
            lead={lead}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewDetails={onViewDetails}
          />
        ))}
        {(!leads || leads.length === 0) && (
          <div className="flex flex-1 items-center justify-center rounded-2xl border-2 border-dashed border-[#E5EAF3] bg-white/50">
            <p className="text-xs font-medium text-[#5B6475]">
              Suelta los prospectos aquí
            </p>
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
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const leadsByStage = useMemo(() => {
    const grouped: Record<LeadStatus, Lead[]> = {
      nuevo: [],
      contactado: [],
      tour_agendado: [],
      tour_realizado: [],
      propuesta: [],
      negociacion: [],
      cerrado_ganado: [],
      cerrado_perdido: [],
    };
    leads.forEach((lead) => {
      if (grouped[lead.status]) grouped[lead.status].push(lead);
    });
    return grouped;
  }, [leads]);

  const activeLead = useMemo(
    () => leads.find((lead) => lead.id === activeLeadId) ?? null,
    [activeLeadId, leads],
  );

  useEffect(() => {
    const loadLeads = async () => {
      try {
        const data = (await getLeads()) as LeadsApiResponse;
        setLeads(normalizeLeadsResponse(data));
      } catch {
        setError("Error al cargar prospectos");
      } finally {
        setLoading(false);
      }
    };
    loadLeads();
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveLeadId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveLeadId(null);
    if (!over) return;
    const leadId = active.id as string;
    const newStatus = over.id as LeadStatus;
    if (!stages.find((s) => s.id === newStatus)) return;
    const previousLeads = [...leads];
    setLeads(
      leads.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)),
    );
    try {
      await moveLeadStage(leadId, newStatus);
      toast.success(
        newStatus === "cerrado_ganado"
          ? "🎉 ¡Nueva venta completada!"
          : "Prospecto movido",
      );
    } catch {
      setLeads(previousLeads);
      toast.error("Error al mover el prospecto");
    }
  };

  const handleFormSubmit = async (data: LeadFormData) => {
    try {
      if (editingLead) {
        await updateLeadApi(editingLead.id, data as Record<string, unknown>);
        setLeads(
          leads.map((l) =>
            l.id === editingLead.id ? ({ ...l, ...data } as Lead) : l,
          ),
        );
        toast.success("Prospecto actualizado");
      } else {
        const response = (await createLead(
          data as Record<string, unknown>,
        )) as LeadMutationResponse;
        const newLead = normalizeLeadMutationResponse(response);
        setLeads([...leads, newLead]);
        toast.success("Prospecto creado");
      }
      setIsFormOpen(false);
      setEditingLead(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al guardar el prospecto";
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
      setLeads(leads.filter((l) => l.id !== id));
      toast.success("Prospecto eliminado");
      setDeleteConfirmId(null);
    } catch {
      toast.error("Error al eliminar el prospecto");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center p-12">
        <Loader className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  if (error)
    return (
      <div className="text-red-600 p-4 rounded-lg bg-red-50 border border-red-200">
        {error}
      </div>
    );

  return (
    <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 [&_header]:!mb-4">
        <PageHeader
          title="Pipeline de ventas"
          headerActions={
            <div className="flex items-center gap-3 lg:mr-[180px] xl:mr-[200px]">
              <ExcelButtons
                onImportComplete={() => {
                  const loadLeads = async () => {
                    try {
                      const data = (await getLeads()) as LeadsApiResponse;
                      setLeads(normalizeLeadsResponse(data));
                    } catch {
                      setError("Error al cargar leads");
                    }
                  };
                  loadLeads();
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setEditingLead(null);
                  setIsFormOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-[#0B57F0] px-4 py-2 text-sm font-medium text-white hover:bg-[#0B57F0]/90 transition"
              >
                <Plus className="h-4 w-4" /> Nuevo prospecto
              </button>
            </div>
          }
        />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveLeadId(null)}
      >
        <div className="flex min-h-0 flex-1 overflow-x-scroll overflow-y-hidden overscroll-x-contain pb-2">
          <div className="flex flex-1 gap-6 min-w-[1680px] xl:min-w-0">
            {stages.map((stage) => (
              <div key={stage.id} className="flex flex-1 min-w-[260px]">
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

        <DragOverlay zIndex={9999}>
          {activeLead ? (
            <div className="w-[220px] max-w-[calc(100vw-2rem)] pointer-events-none">
              <LeadCardContent lead={activeLead} dragging />
            </div>
          ) : null}
        </DragOverlay>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">¿Eliminar lead?</h3>
            <p className="text-sm text-slate-600 mb-4">
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteLead(deleteConfirmId)}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
