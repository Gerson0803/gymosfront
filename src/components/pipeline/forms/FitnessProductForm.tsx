'use client';

import { Controller, UseFormReturn } from 'react-hook-form';
import { FitnessProductDetails } from '@/types/client';
import { premium } from '@/lib/premium-ui';

interface FitnessProductFormProps {
  form: UseFormReturn;
  defaultValues?: FitnessProductDetails;
}

export function FitnessProductForm({ form, defaultValues }: FitnessProductFormProps) {
  const { control } = form;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Controller control={control} name="productDetails.productName" render={({ field }) => (
            <label className="block">
              <span className={premium.formLabel}>Nombre del Producto</span>
              <input {...field} type="text" placeholder="Mancuerna 20kg, Proteína Whey" className={premium.formInput} />
            </label>
          )} />
        </div>

        <label className="block">
          <span className={premium.formLabel}>SKU</span>
          <Controller control={control} name="productDetails.sku" render={({ field }) => (
            <input {...field} type="text" placeholder="SKU-001" className={premium.formInput} />
          )} />
        </label>

        <label className="block">
          <span className={premium.formLabel}>Marca</span>
          <Controller control={control} name="productDetails.brand" render={({ field }) => (
            <input {...field} type="text" placeholder="Nike, Optimum Nutrition" className={premium.formInput} />
          )} />
        </label>

        <label className="block">
          <span className={premium.formLabel}>Categoría</span>
          <Controller control={control} name="productDetails.category" render={({ field }) => (
            <select {...field} className={premium.formInput}>
              <option value="">Seleccionar</option>
              <option value="equipment">Equipamiento</option>
              <option value="supplements">Suplementos</option>
              <option value="clothing">Ropa</option>
            </select>
          )} />
        </label>

        <label className="block">
          <span className={premium.formLabel}>Cantidad</span>
          <Controller control={control} name="productDetails.quantity" render={({ field }) => (
            <input {...field} type="number" min="1" onChange={(e) => field.onChange(e.target.valueAsNumber)} className={premium.formInput} />
          )} />
        </label>

        <label className="block">
          <span className={premium.formLabel}>Precio Unitario</span>
          <Controller control={control} name="productDetails.unitPrice" render={({ field }) => (
            <input {...field} type="number" min="0" step="0.01" onChange={(e) => field.onChange(e.target.valueAsNumber)} className={premium.formInput} />
          )} />
        </label>

        <label className="block">
          <span className={premium.formLabel}>Stock Disponible</span>
          <Controller control={control} name="productDetails.availableStock" render={({ field }) => (
            <input {...field} type="number" min="0" onChange={(e) => field.onChange(e.target.valueAsNumber)} className={premium.formInput} />
          )} />
        </label>

        <label className="block">
          <span className={premium.formLabel}>Talla</span>
          <Controller control={control} name="productDetails.size" render={({ field }) => (
            <input {...field} type="text" placeholder="M, L, XL, 10kg" className={premium.formInput} />
          )} />
        </label>

        <label className="block">
          <span className={premium.formLabel}>Color</span>
          <Controller control={control} name="productDetails.color" render={({ field }) => (
            <input {...field} type="text" placeholder="Negro, Rojo, Azul" className={premium.formInput} />
          )} />
        </label>
      </div>
    </div>
  );
}
