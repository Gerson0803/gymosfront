'use client';

import { Controller, UseFormReturn } from 'react-hook-form';
import { FitnessProductDetails } from '@/types/client';

interface FitnessProductFormProps {
  form: UseFormReturn;
  defaultValues?: FitnessProductDetails;
}

export function FitnessProductForm({ form, defaultValues }: FitnessProductFormProps) {
  const { control, formState: { errors } } = form;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#0A1733]">Detalles del Producto Fitness</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-[#5B6475] mb-1">Nombre del Producto</label>
          <Controller
            control={control}
            name="productDetails.productName"
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="ej: Mancuerna 20kg, Proteína Whey"
                className="w-full rounded-lg border border-[#E5EAF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B57F0]"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#5B6475] mb-1">SKU</label>
          <Controller
            control={control}
            name="productDetails.sku"
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="ej: SKU-001"
                className="w-full rounded-lg border border-[#E5EAF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B57F0]"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#5B6475] mb-1">Marca</label>
          <Controller
            control={control}
            name="productDetails.brand"
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="ej: Nike, Optimum Nutrition"
                className="w-full rounded-lg border border-[#E5EAF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B57F0]"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#5B6475] mb-1">Categoría</label>
          <Controller
            control={control}
            name="productDetails.category"
            render={({ field }) => (
              <select
                {...field}
                className="w-full rounded-lg border border-[#E5EAF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B57F0]"
              >
                <option value="">Seleccionar</option>
                <option value="equipment">Equipamiento</option>
                <option value="supplements">Suplementos</option>
                <option value="clothing">Ropa</option>
              </select>
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#5B6475] mb-1">Cantidad</label>
          <Controller
            control={control}
            name="productDetails.quantity"
            render={({ field }) => (
              <input
                {...field}
                type="number"
                min="1"
                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                className="w-full rounded-lg border border-[#E5EAF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B57F0]"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#5B6475] mb-1">Precio Unitario</label>
          <Controller
            control={control}
            name="productDetails.unitPrice"
            render={({ field }) => (
              <input
                {...field}
                type="number"
                min="0"
                step="0.01"
                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                className="w-full rounded-lg border border-[#E5EAF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B57F0]"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#5B6475] mb-1">Stock Disponible</label>
          <Controller
            control={control}
            name="productDetails.availableStock"
            render={({ field }) => (
              <input
                {...field}
                type="number"
                min="0"
                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                className="w-full rounded-lg border border-[#E5EAF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B57F0]"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#5B6475] mb-1">Talla (opcional)</label>
          <Controller
            control={control}
            name="productDetails.size"
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="ej: M, L, XL, 10kg"
                className="w-full rounded-lg border border-[#E5EAF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B57F0]"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#5B6475] mb-1">Color (opcional)</label>
          <Controller
            control={control}
            name="productDetails.color"
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="ej: Negro, Rojo, Azul"
                className="w-full rounded-lg border border-[#E5EAF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B57F0]"
              />
            )}
          />
        </div>
      </div>
    </div>
  );
}

