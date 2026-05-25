'use client';

import { Controller, UseFormReturn } from 'react-hook-form';
import { MembershipDetails } from '@/types/client';
import { premium } from '@/lib/premium-ui';

interface MembershipFormProps {
  form: UseFormReturn;
  defaultValues?: MembershipDetails;
}

export function MembershipForm({ form, defaultValues }: MembershipFormProps) {
  const { control } = form;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Controller control={control} name="productDetails.membershipType" render={({ field }) => (
            <label className="block">
              <span className={premium.formLabel}>Tipo de Membresía</span>
              <input {...field} type="text" placeholder="Básica, Premium, VIP, Estudiante" className={premium.formInput} />
            </label>
          )} />
        </div>

        <label className="block">
          <span className={premium.formLabel}>Duración (meses)</span>
          <Controller control={control} name="productDetails.durationMonths" render={({ field }) => (
            <input {...field} type="number" min="1" onChange={(e) => field.onChange(e.target.valueAsNumber)} className={premium.formInput} />
          )} />
        </label>

        <label className="block">
          <span className={premium.formLabel}>Precio por Período</span>
          <Controller control={control} name="productDetails.pricePerPeriod" render={({ field }) => (
            <input {...field} type="number" min="0" step="0.01" onChange={(e) => field.onChange(e.target.valueAsNumber)} className={premium.formInput} />
          )} />
        </label>

        <label className="block">
          <span className={premium.formLabel}>Periodicidad</span>
          <Controller control={control} name="productDetails.periodicity" render={({ field }) => (
            <select {...field} className={premium.formInput}>
              <option value="">Seleccionar</option>
              <option value="monthly">Mensual</option>
              <option value="quarterly">Trimestral</option>
              <option value="annual">Anual</option>
            </select>
          )} />
        </label>

        <label className="block">
          <span className={premium.formLabel}>Fecha de Inicio</span>
          <Controller control={control} name="productDetails.startDate" render={({ field }) => (
            <input {...field} type="date" className={premium.formInput} />
          )} />
        </label>

        <label className="block">
          <span className={premium.formLabel}>Fecha de Fin</span>
          <Controller control={control} name="productDetails.endDate" render={({ field }) => (
            <input {...field} type="date" className={premium.formInput} />
          )} />
        </label>

        <label className="block">
          <span className={premium.formLabel}>Cuota de Inscripción</span>
          <Controller control={control} name="productDetails.enrollmentFee" render={({ field }) => (
            <input {...field} type="number" min="0" step="0.01" onChange={(e) => field.onChange(e.target.valueAsNumber)} className={premium.formInput} />
          )} />
        </label>

        <div className="flex items-end pb-3">
          <Controller control={control} name="productDetails.autoRenewal" render={({ field }) => (
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" checked={field.value} onChange={field.onChange} className="w-4 h-4 rounded border-[#E5EAF3] text-[#0B57F0] focus:ring-[#0B57F0]" />
              <span className="ml-2 text-sm font-medium text-[#5B6475]">Renovación Automática</span>
            </label>
          )} />
        </div>
      </div>

      <div>
        <span className={premium.formLabel}>Acceso Incluido</span>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {['Gym', 'Piscina', 'Sauna', 'Clases'].map((access) => (
            <Controller key={access} control={control} name="productDetails.includedAccess" render={({ field }) => (
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={field.value?.includes(access) || false}
                  onChange={(e) => {
                    const current = field.value || [];
                    field.onChange(e.target.checked ? [...current, access] : current.filter((a: any) => a !== access));
                  }}
                  className="w-4 h-4 rounded border-[#E5EAF3] text-[#0B57F0] focus:ring-[#0B57F0]"
                />
                <span className="ml-2 text-sm text-[#5B6475]">{access}</span>
              </label>
            )} />
          ))}
        </div>
      </div>
    </div>
  );
}
