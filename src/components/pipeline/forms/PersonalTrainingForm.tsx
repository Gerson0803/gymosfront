'use client';

import { Controller, UseFormReturn } from 'react-hook-form';
import { PersonalTrainingDetails } from '@/types/client';

interface PersonalTrainingFormProps {
  form: UseFormReturn;
  defaultValues?: PersonalTrainingDetails;
}

export function PersonalTrainingForm({ form, defaultValues }: PersonalTrainingFormProps) {
  const { control, formState: { errors } } = form;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#0A1733]">Detalles de Entrenamiento Personalizado</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#5B6475] mb-1">Tipo de Servicio</label>
          <Controller
            control={control}
            name="productDetails.serviceType"
            render={({ field }) => (
              <select
                {...field}
                className="w-full rounded-lg border border-[#E5EAF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B57F0]"
              >
                <option value="">Seleccionar</option>
                <option value="individual">Individual</option>
                <option value="group">Grupal</option>
                <option value="functional">Funcional</option>
              </select>
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#5B6475] mb-1">Entrenador Asignado</label>
          <Controller
            control={control}
            name="productDetails.assignedTrainer"
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="Nombre del entrenador"
                className="w-full rounded-lg border border-[#E5EAF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B57F0]"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#5B6475] mb-1">Número de Sesiones</label>
          <Controller
            control={control}
            name="productDetails.numberOfSessions"
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
          <label className="block text-sm font-medium text-[#5B6475] mb-1">Duración por Sesión (minutos)</label>
          <Controller
            control={control}
            name="productDetails.sessionDurationMinutes"
            render={({ field }) => (
              <input
                {...field}
                type="number"
                min="15"
                step="15"
                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                className="w-full rounded-lg border border-[#E5EAF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B57F0]"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#5B6475] mb-1">Modalidad</label>
          <Controller
            control={control}
            name="productDetails.modality"
            render={({ field }) => (
              <select
                {...field}
                className="w-full rounded-lg border border-[#E5EAF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B57F0]"
              >
                <option value="">Seleccionar</option>
                <option value="in-person">Presencial</option>
                <option value="virtual">Virtual</option>
                <option value="hybrid">Híbrida</option>
              </select>
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#5B6475] mb-1">Precio por Sesión</label>
          <Controller
            control={control}
            name="productDetails.pricePerSession"
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
          <label className="block text-sm font-medium text-[#5B6475] mb-1">Precio del Pack (opcional)</label>
          <Controller
            control={control}
            name="productDetails.packagePrice"
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
          <label className="block text-sm font-medium text-[#5B6475] mb-1">Fecha Primera Sesión</label>
          <Controller
            control={control}
            name="productDetails.firstSessionDate"
            render={({ field }) => (
              <input
                {...field}
                type="date"
                className="w-full rounded-lg border border-[#E5EAF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B57F0]"
              />
            )}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#5B6475] mb-1">Objetivo del Cliente</label>
        <Controller
          control={control}
          name="productDetails.clientObjective"
          render={({ field }) => (
            <textarea
              {...field}
              placeholder="Describe el objetivo del cliente"
              rows={3}
              className="w-full rounded-lg border border-[#E5EAF3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B57F0]"
            />
          )}
        />
      </div>

      <div className="flex items-center">
        <Controller
          control={control}
          name="productDetails.initialEvaluationRequired"
          render={({ field }) => (
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={field.value}
                onChange={field.onChange}
                className="w-4 h-4 rounded border-[#E5EAF3]"
              />
              <span className="ml-2 text-sm font-medium text-[#5B6475]">Evaluación Inicial Requerida</span>
            </label>
          )}
        />
      </div>
    </div>
  );
}

