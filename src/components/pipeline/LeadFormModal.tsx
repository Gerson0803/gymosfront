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
import toast from 'react-hot-toast';

interface LeadFormModalProps {
  isOpen: boolean;
  lead?: Lead | null;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export function LeadFormModal({ isOpen, lead, onClose, onSubmit }: LeadFormModalProps) {
  const [selectedProductType, setSelectedProductType] = useState<ProductType>('fitness_product');

  const form = useForm<any>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      productType: 'fitness_product',
      productDetails: {},
    },
  });

  const { register, handleSubmit, formState: { errors }, watch, reset, control } = form;
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
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E5EAF3] px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#0A1733]">
            {lead ? 'Editar Lead' : 'Nuevo Lead'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-[#5B6475] hover:bg-[#F5F7FB] rounded-lg transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-sm font-semibold text-[#0A1733] mb-4 uppercase tracking-wide">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#5B6475] mb-1">Nombre Completo *</label>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="Juan García"
                  className="w-full rounded-lg border border-[#E5EAF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B57F0]"
                />
                {errors.name && <p className="text-xs text-red-600 mt-1">{String(errors.name.message)}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5B6475] mb-1">Email *</label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="juan@email.com"
                  className="w-full rounded-lg border border-[#E5EAF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B57F0]"
                />
                {errors.email && <p className="text-xs text-red-600 mt-1">{String(errors.email.message)}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5B6475] mb-1">Teléfono *</label>
                <input
                  {...register('phone')}
                  type="tel"
                  placeholder="+57 300 123 4567"
                  className="w-full rounded-lg border border-[#E5EAF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B57F0]"
                />
                {errors.phone && <p className="text-xs text-red-600 mt-1">{String(errors.phone.message)}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5B6475] mb-1">Fuente *</label>
                <select
                  {...register('source')}
                  className="w-full rounded-lg border border-[#E5EAF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B57F0]"
                >
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="google">Google</option>
                  <option value="referido">Referido</option>
                  <option value="walk_in">Walk-in</option>
                </select>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-[#E5EAF3]" />

          {/* Product Type Selection */}
          <div>
            <h3 className="text-sm font-semibold text-[#0A1733] mb-4 uppercase tracking-wide">Tipo de Producto/Servicio</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { value: 'membership' as const, label: '🎟️ Membresía', emoji: '🎟️' },
                { value: 'personal_training' as const, label: '👨‍🏫 Entrenamiento', emoji: '👨‍🏫' },
                { value: 'fitness_product' as const, label: '🏋️ Producto', emoji: '🏋️' },
                { value: 'combo' as const, label: '📦 Combo', emoji: '📦' },
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    form.setValue('productType', type.value);
                    setSelectedProductType(type.value);
                  }}
                  className={`p-3 rounded-lg border-2 transition text-sm font-medium ${
                    productType === type.value
                      ? 'border-[#0B57F0] bg-[#0B57F0]/5 text-[#0B57F0]'
                      : 'border-[#E5EAF3] bg-white text-[#5B6475] hover:border-[#0B57F0]/30'
                  }`}
                >
                  <div className="text-xl mb-1">{type.emoji}</div>
                  <div className="text-xs">{type.label.split(' ')[1]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Product-Specific Form */}
          <div className="border border-[#E5EAF3] rounded-lg p-4 bg-[#F9FAFB]">
            {productType === 'membership' && <MembershipForm form={form} />}
            {productType === 'personal_training' && <PersonalTrainingForm form={form} />}
            {productType === 'fitness_product' && <FitnessProductForm form={form} />}
            {productType === 'combo' && <ComboForm form={form} />}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-[#5B6475] mb-1">Notas Adicionales</label>
            <textarea
              {...register('notes')}
              placeholder="Información adicional sobre el lead..."
              rows={3}
              className="w-full rounded-lg border border-[#E5EAF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B57F0]"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 sticky bottom-0 bg-white pt-4 border-t border-[#E5EAF3]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-[#E5EAF3] text-[#5B6475] font-medium hover:bg-[#F5F7FB] transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg bg-[#0B57F0] text-white font-medium hover:bg-[#0B57F0]/90 transition"
            >
              {lead ? 'Actualizar Lead' : 'Crear Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

