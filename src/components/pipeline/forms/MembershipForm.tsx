'use client';

import { Controller, UseFormReturn } from 'react-hook-form';
import { MembershipDetails } from '@/types/client';

interface MembershipFormProps {
  form: UseFormReturn;
  defaultValues?: MembershipDetails;
}

export function MembershipForm({ form, defaultValues }: MembershipFormProps) {
  const { control, formState: { errors } } = form;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#0A1733]">Detalles de Membresía</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#5B6475] mb-1">Tipo de Membresía</label>
          <Controller
            control={control}
            name="productDetails.membershipType"
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="ej: Básica, Premium, VIP"
                className="w-full rounded-lg border border-[#E5EAF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B57F0]"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#5B6475] mb-1">Duración (meses)</label>
          <Controller
            control={control}
            name="productDetails.durationMonths"
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
          <label className="block text-sm font-medium text-[#5B6475] mb-1">Precio por Período</label>
          <Controller
            control={control}
            name="productDetails.pricePerPeriod"
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
          <label className="block text-sm font-medium text-[#5B6475] mb-1">Periodicidad</label>
          <Controller
            control={control}
            name="productDetails.periodicity"
            render={({ field }) => (
              <select
                {...field}
                className="w-full rounded-lg border border-[#E5EAF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B57F0]"
              >
                <option value="">Seleccionar</option>
                <option value="monthly">Mensual</option>
                <option value="quarterly">Trimestral</option>
                <option value="annual">Anual</option>
              </select>
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#5B6475] mb-1">Fecha de Inicio</label>
          <Controller
            control={control}
            name="productDetails.startDate"
            render={({ field }) => (
              <input
                {...field}
                type="date"
                className="w-full rounded-lg border border-[#E5EAF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B57F0]"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#5B6475] mb-1">Fecha de Fin (opcional)</label>
          <Controller
            control={control}
            name="productDetails.endDate"
            render={({ field }) => (
              <input
                {...field}
                type="date"
                className="w-full rounded-lg border border-[#E5EAF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B57F0]"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#5B6475] mb-1">Cuota de Inscripción</label>
          <Controller
            control={control}
            name="productDetails.enrollmentFee"
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

        <div className="flex items-center">
          <Controller
            control={control}
            name="productDetails.autoRenewal"
            render={({ field }) => (
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="w-4 h-4 rounded border-[#E5EAF3]"
                />
                <span className="ml-2 text-sm font-medium text-[#5B6475]">Renovación Automática</span>
              </label>
            )}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#5B6475] mb-2">Acceso Incluido</label>
        <div className="grid grid-cols-2 gap-2">
          {['Gym', 'Piscina', 'Sauna', 'Clases'].map((access) => (
            <Controller
              key={access}
              control={control}
              name="productDetails.includedAccess"
              render={({ field }) => (
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.value?.includes(access) || false}
                    onChange={(e) => {
                      const current = field.value || [];
                      field.onChange(
                        e.target.checked
                          ? [...current, access]
                          : current.filter((a: any) => a !== access)
                      );
                    }}
                    className="w-4 h-4 rounded border-[#E5EAF3]"
                  />
                  <span className="ml-2 text-sm text-[#5B6475]">{access}</span>
                </label>
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

