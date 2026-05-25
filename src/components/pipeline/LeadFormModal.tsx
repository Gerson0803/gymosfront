'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { leadSchema, type LeadFormData } from '@/lib/validations';
import { Lead, ProductType } from '@/types/client';
import { X } from 'lucide-react';
import { MembershipForm } from './forms/MembershipForm';
import { PersonalTrainingForm } from './forms/PersonalTrainingForm';
import { FitnessProductForm } from './forms/FitnessProductForm';
import { ComboForm } from './forms/ComboForm';
import { premium } from '@/lib/premium-ui';

interface LeadFormModalProps {
  isOpen: boolean;
  lead?: Lead | null;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

const productTypes: { value: ProductType; label: string; emoji: string }[] = [
  { value: 'membership', label: 'Membresía', emoji: '🎟️' },
  { value: 'personal_training', label: 'Entrenamiento', emoji: '👨‍🏫' },
  { value: 'fitness_product', label: 'Producto', emoji: '🏋️' },
  { value: 'combo', label: 'Combo', emoji: '📦' },
];

export function LeadFormModal({ isOpen, lead, onClose, onSubmit }: LeadFormModalProps) {
  const [selectedProductType, setSelectedProductType] = useState<ProductType>('fitness_product');

  const form = useForm<any>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      productType: 'fitness_product',
      productDetails: {},
    },
  });

  const { register, handleSubmit, formState: { errors }, watch, reset } = form;
  const productType = watch('productType');

  useEffect(() => {
    if (lead) {
      reset({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        productType: lead.productType as ProductType,
        productDetails: lead.productDetails || {},
      });
      setSelectedProductType(lead.productType as ProductType);
    } else {
      reset({
        productType: 'fitness_product',
        productDetails: {},
      });
      setSelectedProductType('fitness_product');
    }
  }, [lead, isOpen, reset]);

  const handleFormSubmit = async (data: any) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/20 backdrop-blur-sm p-4">
      <div className={`${premium.formPanel} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E5EAF3] px-6 py-4 flex items-center justify-between rounded-[1.75rem_1.75rem_0_0]">
          <div>
            <h2 className="text-xl font-bold text-[#0A1733]">
              {lead ? 'Editar Lead' : 'Nuevo Lead'}
            </h2>
            <p className="text-sm text-[#5B6475] mt-0.5">
              {lead ? 'Actualiza los datos del prospecto' : 'Registra un nuevo prospecto en el pipeline'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 text-[#5B6475] hover:bg-[#F5F7FB] rounded-xl transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-5">
          {/* Basic Information */}
          <div className={premium.formSection}>
            <h3 className="text-lg font-bold text-[#0A1733] mb-4">Información Básica</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className={premium.formLabel}>Nombre Completo *</span>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="Juan García"
                  className={premium.formInput}
                />
                {errors.name && <p className={premium.formError}>{String(errors.name.message)}</p>}
              </label>
              <label className="block">
                <span className={premium.formLabel}>Email *</span>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="juan@email.com"
                  className={premium.formInput}
                />
                {errors.email && <p className={premium.formError}>{String(errors.email.message)}</p>}
              </label>
              <label className="block">
                <span className={premium.formLabel}>Teléfono *</span>
                <input
                  {...register('phone')}
                  type="tel"
                  placeholder="+57 300 123 4567"
                  className={premium.formInput}
                />
                {errors.phone && <p className={premium.formError}>{String(errors.phone.message)}</p>}
              </label>
              <label className="block">
                <span className={premium.formLabel}>Fuente *</span>
                <select
                  {...register('source')}
                  className={premium.formInput}
                >
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="google">Google</option>
                  <option value="referido">Referido</option>
                  <option value="walk_in">Walk-in</option>
                </select>
              </label>
            </div>
          </div>

          {/* Product Type Selection */}
          <div className={premium.formSection}>
            <h3 className="text-lg font-bold text-[#0A1733] mb-4">Tipo de Producto / Servicio</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {productTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    form.setValue('productType', type.value);
                    setSelectedProductType(type.value);
                  }}
                  className={`rounded-xl border-2 p-4 transition text-sm font-medium ${
                    productType === type.value
                      ? 'border-[#0B57F0] bg-[#0B57F0]/5 text-[#0B57F0] shadow-[0_2px_12px_-4px_rgba(11,87,240,0.15)]'
                      : 'border-[#E5EAF3] bg-white text-[#5B6475] hover:border-[#0B57F0]/30 hover:bg-[#F8FAFD]'
                  }`}
                >
                  <div className="text-2xl mb-2">{type.emoji}</div>
                  <div className="text-xs font-semibold">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Product-Specific Form */}
          <div className={premium.formSection}>
            <h3 className="text-lg font-bold text-[#0A1733] mb-4">Detalles del Producto</h3>
            {productType === 'membership' && <MembershipForm form={form} />}
            {productType === 'personal_training' && <PersonalTrainingForm form={form} />}
            {productType === 'fitness_product' && <FitnessProductForm form={form} />}
            {productType === 'combo' && <ComboForm form={form} />}
          </div>

          {/* Notes */}
          <div className={premium.formSection}>
            <h3 className="text-lg font-bold text-[#0A1733] mb-4">Notas</h3>
            <textarea
              {...register('notes')}
              placeholder="Información adicional sobre el lead..."
              rows={3}
              className={premium.formTextarea}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 sticky bottom-0 bg-white pt-4 border-t border-[#E5EAF3] -mx-2 px-2">
            <button
              type="button"
              onClick={onClose}
              className={`${premium.formSecondaryBtn} flex-1`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`${premium.pillBtn} flex-1`}
            >
              {lead ? 'Actualizar Lead' : 'Crear Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
