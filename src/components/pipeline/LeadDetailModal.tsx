'use client';

import type { Lead, ProductType, MembershipDetails, PersonalTrainingDetails, FitnessProductDetails, ComboDetails } from '@/types/client';
import { X } from 'lucide-react';

interface LeadDetailModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
}

const productTypeLabels: Record<ProductType, { label: string; icon: string; color: string }> = {
  membership: { label: 'Membresía', icon: '🎟️', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  personal_training: { label: 'Entrenamiento', icon: '👨‍🏫', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  fitness_product: { label: 'Producto', icon: '🏋️', color: 'bg-orange-50 border-orange-200 text-orange-700' },
  combo: { label: 'Combo', icon: '📦', color: 'bg-green-50 border-green-200 text-green-700' },
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function MembershipDetails({ details }: { details: MembershipDetails }) {
  return (
    <div className="space-y-3">
      <DetailRow label="Tipo de Membresía" value={details.membershipType} />
      <DetailRow label="Duración" value={`${details.durationMonths} meses`} />
      <DetailRow label="Precio por Período" value={`$${details.pricePerPeriod.toLocaleString()}`} />
      <DetailRow label="Periodicidad" value={
        {
          monthly: 'Mensual',
          quarterly: 'Trimestral',
          annual: 'Anual',
        }[details.periodicity]
      } />
      <DetailRow label="Fecha de Inicio" value={formatDate(details.startDate)} />
      {details.endDate && <DetailRow label="Fecha de Fin" value={formatDate(details.endDate)} />}
      <DetailRow label="Renovación Automática" value={details.autoRenewal ? 'Sí' : 'No'} />
      <DetailRow label="Acceso Incluido" value={details.includedAccess.join(', ')} />
      <DetailRow label="Cuota de Inscripción" value={`$${details.enrollmentFee.toLocaleString()}`} />
    </div>
  );
}

function PersonalTrainingDetailsComponent({ details }: { details: PersonalTrainingDetails }) {
  return (
    <div className="space-y-3">
      <DetailRow label="Tipo de Servicio" value={
        {
          individual: 'Individual',
          group: 'Grupal',
          functional: 'Funcional',
        }[details.serviceType]
      } />
      {details.assignedTrainer && <DetailRow label="Entrenador Asignado" value={details.assignedTrainer} />}
      <DetailRow label="Número de Sesiones" value={details.numberOfSessions.toString()} />
      <DetailRow label="Duración por Sesión" value={`${details.sessionDurationMinutes} minutos`} />
      <DetailRow label="Modalidad" value={
        {
          'in-person': 'Presencial',
          virtual: 'Virtual',
          hybrid: 'Híbrida',
        }[details.modality]
      } />
      <DetailRow label="Precio por Sesión" value={`$${details.pricePerSession.toLocaleString()}`} />
      {details.packagePrice && <DetailRow label="Precio del Pack" value={`$${details.packagePrice.toLocaleString()}`} />}
      <DetailRow label="Fecha Primera Sesión" value={formatDate(details.firstSessionDate)} />
      <DetailRow label="Objetivo del Cliente" value={details.clientObjective} />
      <DetailRow label="Evaluación Inicial" value={details.initialEvaluationRequired ? 'Requerida' : 'No requerida'} />
    </div>
  );
}

function FitnessProductDetailsComponent({ details }: { details: FitnessProductDetails }) {
  return (
    <div className="space-y-3">
      <DetailRow label="Nombre del Producto" value={details.productName} />
      <DetailRow label="SKU" value={details.sku} />
      <DetailRow label="Marca" value={details.brand} />
      <DetailRow label="Categoría" value={
        {
          equipment: 'Equipamiento',
          supplements: 'Suplementos',
          clothing: 'Ropa',
        }[details.category]
      } />
      <DetailRow label="Cantidad" value={details.quantity.toString()} />
      <DetailRow label="Precio Unitario" value={`$${details.unitPrice.toLocaleString()}`} />
      {details.size && <DetailRow label="Talla" value={details.size} />}
      {details.color && <DetailRow label="Color" value={details.color} />}
      <DetailRow label="Stock Disponible" value={details.availableStock.toString()} />
    </div>
  );
}

function ComboDetailsComponent({ details }: { details: ComboDetails }) {
  return (
    <div className="space-y-3">
      <DetailRow label="Tipo de Combo" value={details.comboType} />
      <DetailRow label="Precio Normal" value={`$${details.normalPrice.toLocaleString()}`} />
      <DetailRow label="Precio con Descuento" value={`$${details.discountedPrice.toLocaleString()}`} />
      <DetailRow label="Descuento" value={`${details.discountPercentage}%`} />
      <DetailRow label="Es Recurrente" value={details.isRecurring ? 'Sí' : 'No'} />
      <div>
        <h4 className="text-sm font-medium text-[#5B6475] mb-2">Componentes</h4>
        <ul className="space-y-1">
          {details.components.map((component, idx) => (
            <li key={idx} className="text-sm text-[#0A1733] pl-3 border-l-2 border-[#0B57F0]">
              {component.description} {component.value && `($${component.value.toLocaleString()})`}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-sm font-medium text-[#5B6475]">{label}</span>
      <span className="text-sm text-[#0A1733] font-medium text-right">{value}</span>
    </div>
  );
}

export function LeadDetailModal({ isOpen, lead, onClose }: LeadDetailModalProps) {
  if (!isOpen || !lead) return null;

  const productTypeInfo = productTypeLabels[lead.productType];

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E5EAF3] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-[#0A1733]">{lead.name}</h2>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg border ${productTypeInfo.color} text-sm font-medium`}>
              {productTypeInfo.icon} {productTypeInfo.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#5B6475] hover:bg-[#F5F7FB] rounded-lg transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-semibold text-[#0A1733] mb-3 uppercase tracking-wide">Información de Contacto</h3>
            <div className="space-y-2 text-sm">
              <DetailRow label="Email" value={lead.email} />
              <DetailRow label="Teléfono" value={lead.phone} />
              <DetailRow label="Fuente" value={lead.source} />
            </div>
          </div>

          <div className="h-px bg-[#E5EAF3]" />

          {/* Sales Information */}
          <div>
            <h3 className="text-sm font-semibold text-[#0A1733] mb-3 uppercase tracking-wide">Información de Venta</h3>
            <div className="space-y-2 text-sm">
              <DetailRow label="Estado" value={lead.status} />
              <DetailRow label="Asesor Asignado" value={lead.assignedAdvisor} />
            </div>
          </div>

          <div className="h-px bg-[#E5EAF3]" />

          {/* Product-Specific Details */}
          <div>
            <h3 className="text-sm font-semibold text-[#0A1733] mb-3 uppercase tracking-wide">
              Detalles de {productTypeInfo.label}
            </h3>
            <div className="bg-[#F9FAFB] rounded-lg p-4 space-y-3">
              {lead.productDetails && lead.productType === 'membership' && (
                <MembershipDetails details={lead.productDetails as MembershipDetails} />
              )}
              {lead.productDetails && lead.productType === 'personal_training' && (
                <PersonalTrainingDetailsComponent details={lead.productDetails as PersonalTrainingDetails} />
              )}
              {lead.productDetails && lead.productType === 'fitness_product' && (
                <FitnessProductDetailsComponent details={lead.productDetails as FitnessProductDetails} />
              )}
              {lead.productDetails && lead.productType === 'combo' && (
                <ComboDetailsComponent details={lead.productDetails as ComboDetails} />
              )}
            </div>
          </div>

          {/* Notes */}
          {lead.notes && (
            <>
              <div className="h-px bg-[#E5EAF3]" />
              <div>
                <h3 className="text-sm font-semibold text-[#0A1733] mb-2">Notas</h3>
                <p className="text-sm text-[#5B6475] bg-[#F9FAFB] p-3 rounded-lg">{lead.notes}</p>
              </div>
            </>
          )}

          {/* Timestamps */}
          <div className="h-px bg-[#E5EAF3]" />
          <div className="flex justify-between text-xs text-[#5B6475]">
            <span>Creado: {formatDate(lead.createdAt)}</span>
            {lead.updatedAt && <span>Actualizado: {formatDate(lead.updatedAt)}</span>}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-lg border border-[#E5EAF3] text-[#5B6475] font-medium hover:bg-[#F5F7FB] transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
