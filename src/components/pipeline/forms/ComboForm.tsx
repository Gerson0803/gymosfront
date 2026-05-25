'use client';

import { Controller, UseFormReturn } from 'react-hook-form';
import { ComboDetails } from '@/types/client';
import { Trash2, Plus } from 'lucide-react';
import { premium } from '@/lib/premium-ui';

interface ComboFormProps {
  form: UseFormReturn;
  defaultValues?: ComboDetails;
}

export function ComboForm({ form, defaultValues }: ComboFormProps) {
  const { control, watch } = form;
  const components = watch('productDetails.components') || [];

  const addComponent = () => {
    const current = form.getValues('productDetails.components') || [];
    form.setValue('productDetails.components', [
      ...current,
      { type: 'membership' as const, description: '', value: undefined }
    ]);
  };

  const removeComponent = (index: number) => {
    const current = form.getValues('productDetails.components') || [];
    form.setValue('productDetails.components', current.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Controller control={control} name="productDetails.comboType" render={({ field }) => (
            <label className="block">
              <span className={premium.formLabel}>Tipo de Combo</span>
              <input {...field} type="text" placeholder="Gym + Entrenador Personal" className={premium.formInput} />
            </label>
          )} />
        </div>

        <label className="block">
          <span className={premium.formLabel}>Precio Normal</span>
          <Controller control={control} name="productDetails.normalPrice" render={({ field }) => (
            <input {...field} type="number" min="0" step="0.01" onChange={(e) => field.onChange(e.target.valueAsNumber)} className={premium.formInput} />
          )} />
        </label>

        <label className="block">
          <span className={premium.formLabel}>Precio con Descuento</span>
          <Controller control={control} name="productDetails.discountedPrice" render={({ field }) => (
            <input {...field} type="number" min="0" step="0.01" onChange={(e) => field.onChange(e.target.valueAsNumber)} className={premium.formInput} />
          )} />
        </label>

        <label className="block">
          <span className={premium.formLabel}>Descuento (%)</span>
          <Controller control={control} name="productDetails.discountPercentage" render={({ field }) => (
            <input {...field} type="number" min="0" max="100" step="0.01" onChange={(e) => field.onChange(e.target.valueAsNumber)} className={premium.formInput} />
          )} />
        </label>

        <div className="flex items-end pb-3">
          <Controller control={control} name="productDetails.isRecurring" render={({ field }) => (
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" checked={field.value} onChange={field.onChange} className="w-4 h-4 rounded border-[#E5EAF3] text-[#0B57F0] focus:ring-[#0B57F0]" />
              <span className="ml-2 text-sm font-medium text-[#5B6475]">Recurrente o Único</span>
            </label>
          )} />
        </div>
      </div>

      <div className="mt-2">
        <div className="flex items-center justify-between mb-3">
          <span className={premium.formLabel}>Componentes del Combo</span>
          <button
            type="button"
            onClick={addComponent}
            className="flex items-center gap-1 text-xs font-medium text-[#0B57F0] hover:text-[#0B57F0]/80 transition"
          >
            <Plus className="h-4 w-4" />
            Agregar
          </button>
        </div>

        <div className="space-y-3">
          {components?.map((component: any, index: number) => (
            <div key={index} className="rounded-xl border border-[#E5EAF3] bg-white p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-[#5B6475] mb-1">Tipo</label>
                  <Controller control={control} name={`productDetails.components.${index}.type`} render={({ field }) => (
                    <select {...field} className={premium.formInput}>
                      <option value="membership">Membresía</option>
                      <option value="product">Producto</option>
                      <option value="training">Entrenamiento</option>
                    </select>
                  )} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5B6475] mb-1">Valor</label>
                  <Controller control={control} name={`productDetails.components.${index}.value`} render={({ field }) => (
                    <input {...field} type="number" step="0.01" onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)} className={premium.formInput} />
                  )} />
                </div>
              </div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-[#5B6475] mb-1">Descripción</label>
                  <Controller control={control} name={`productDetails.components.${index}.description`} render={({ field }) => (
                    <input {...field} type="text" placeholder="Describe este componente" className={premium.formInput} />
                  )} />
                </div>
                <button
                  type="button"
                  onClick={() => removeComponent(index)}
                  className="mt-5 p-1.5 text-[#5B6475] hover:bg-red-50 hover:text-red-600 rounded-lg transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
