'use client';

import { Controller, UseFormReturn } from 'react-hook-form';
import { PersonalTrainingDetails } from '@/types/client';
import { premium } from '@/lib/premium-ui';

interface PersonalTrainingFormProps {
  form: UseFormReturn;
  defaultValues?: PersonalTrainingDetails;
}

export function PersonalTrainingForm({ form, defaultValues }: PersonalTrainingFormProps) {
  const { control } = form;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className={premium.formLabel}>Tipo de Servicio</span>
          <Controller control={control} name="productDetails.serviceType" render={({ field }) => (
            <select {...field} className={premium.formInput}>
              <option value="">Seleccionar</option>
              <option value="individual">Individual</option>
              <option value="group">Grupal</option>
              <option value="functional">Funcional</option>
            </select>
          )} />
        </label>

        <label className="block">
          <span className={premium.formLabel}>Entrenador Asignado</span>
          <Controller control={control} name="productDetails.assignedTrainer" render={({ field }) => (
            <input {...field} type="text" placeholder="Nombre del entrenador" className={premium.formInput} />
          )} />
        </label>

        <label className="block">
          <span className={premium.formLabel}>Número de Sesiones</span>
          <Controller control={control} name="productDetails.numberOfSessions" render={({ field }) => (
            <input {...field} type="number" min="1" onChange={(e) => field.onChange(e.target.valueAsNumber)} className={premium.formInput} />
          )} />
        </label>

        <label className="block">
          <span className={premium.formLabel}>Duración por Sesión (min)</span>
          <Controller control={control} name="productDetails.sessionDurationMinutes" render={({ field }) => (
            <input {...field} type="number" min="15" step="15" onChange={(e) => field.onChange(e.target.valueAsNumber)} className={premium.formInput} />
          )} />
        </label>

        <label className="block">
          <span className={premium.formLabel}>Modalidad</span>
          <Controller control={control} name="productDetails.modality" render={({ field }) => (
            <select {...field} className={premium.formInput}>
              <option value="">Seleccionar</option>
              <option value="in-person">Presencial</option>
              <option value="virtual">Virtual</option>
              <option value="hybrid">Híbrida</option>
            </select>
          )} />
        </label>

        <label className="block">
          <span className={premium.formLabel}>Precio por Sesión</span>
          <Controller control={control} name="productDetails.pricePerSession" render={({ field }) => (
            <input {...field} type="number" min="0" step="0.01" onChange={(e) => field.onChange(e.target.valueAsNumber)} className={premium.formInput} />
          )} />
        </label>

        <label className="block">
          <span className={premium.formLabel}>Precio del Pack</span>
          <Controller control={control} name="productDetails.packagePrice" render={({ field }) => (
            <input {...field} type="number" min="0" step="0.01" onChange={(e) => field.onChange(e.target.valueAsNumber)} className={premium.formInput} />
          )} />
        </label>

        <label className="block">
          <span className={premium.formLabel}>Fecha Primera Sesión</span>
          <Controller control={control} name="productDetails.firstSessionDate" render={({ field }) => (
            <input {...field} type="date" className={premium.formInput} />
          )} />
        </label>
      </div>

      <div>
        <span className={premium.formLabel}>Objetivo del Cliente</span>
        <Controller control={control} name="productDetails.clientObjective" render={({ field }) => (
          <textarea {...field} placeholder="Describe el objetivo del cliente" rows={3} className={premium.formTextarea} />
        )} />
      </div>

      <div className="flex items-center">
        <Controller control={control} name="productDetails.initialEvaluationRequired" render={({ field }) => (
          <label className="flex items-center cursor-pointer">
            <input type="checkbox" checked={field.value} onChange={field.onChange} className="w-4 h-4 rounded border-[#E5EAF3] text-[#0B57F0] focus:ring-[#0B57F0]" />
            <span className="ml-2 text-sm font-medium text-[#5B6475]">Evaluación Inicial Requerida</span>
          </label>
        )} />
      </div>
    </div>
  );
}
