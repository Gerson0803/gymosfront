'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useMembers } from '@/context/members-context';
import type { Member } from '@/types/member';

type ClientFormProps = {
  mode: 'create' | 'edit';
  initialMember?: Member;
};

export function ClientForm({ mode, initialMember }: ClientFormProps) {
  const router = useRouter();
  const { addMember, updateMember } = useMembers();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: initialMember?.name ?? '',
    email: initialMember?.email ?? '',
    phone: initialMember?.phone ?? '',
    birthDate: initialMember?.birthDate ?? '',
    gender: initialMember?.gender ?? 'M',
    goal: initialMember?.goal ?? 'ganar_musculo',
    experienceLevel: initialMember?.experienceLevel ?? 'principiante',
    membershipType: initialMember?.membershipType ?? 'basica',
    monthlyPrice: initialMember?.monthlyPrice ?? 0,
    assignedTrainer: initialMember?.assignedTrainer ?? '',
    notes: initialMember?.notes ?? '',
  });

  const field = (label: string, children: React.ReactNode) => (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</span>
      {children}
    </label>
  );

  const inputClass = "w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        joinedAt: new Date().toISOString().split('T')[0],
        monthlyPrice: Number(form.monthlyPrice),
        status: 'active' as const,
        membershipStatus: 'activo' as const,
        checkInsLast30Days: 0,
        averageCheckInsPerWeek: 0,
        churnRiskScore: 0,
        churnRiskLevel: 'bajo' as const,
        attendance: [],
      };
      if (mode === 'create') {
        const member = await addMember(payload);
        toast.success('Miembro creado exitosamente');
        router.push(`/clients/${member.id}`);
      } else if (initialMember) {
        const member = await updateMember(initialMember.id, payload);
        if (member) {
          toast.success('Miembro actualizado exitosamente');
          router.push(`/clients/${member.id}`);
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        {field('Nombre completo',
          <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={inputClass} placeholder="Ej: Juan García" />
        )}
        {field('Email',
          <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={inputClass} placeholder="juan@email.com" />
        )}
        {field('Teléfono',
          <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className={inputClass} placeholder="+57 300 123 4567" />
        )}
        {field('Fecha de nacimiento',
          <input type="date" value={form.birthDate} onChange={e => setForm({...form, birthDate: e.target.value})} className={inputClass} />
        )}
        {field('Género',
          <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value as any})} className={inputClass}>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
        )}
        {field('Objetivo fitness',
          <select value={form.goal} onChange={e => setForm({...form, goal: e.target.value as any})} className={inputClass}>
            <option value="perder_peso">Perder peso</option>
            <option value="ganar_musculo">Ganar músculo</option>
            <option value="resistencia">Resistencia</option>
            <option value="salud_general">Salud general</option>
            <option value="rendimiento">Rendimiento</option>
          </select>
        )}
        {field('Nivel de experiencia',
          <select value={form.experienceLevel} onChange={e => setForm({...form, experienceLevel: e.target.value as any})} className={inputClass}>
            <option value="principiante">Principiante</option>
            <option value="intermedio">Intermedio</option>
            <option value="avanzado">Avanzado</option>
          </select>
        )}
        {field('Tipo de membresía',
          <select value={form.membershipType} onChange={e => setForm({...form, membershipType: e.target.value as any})} className={inputClass}>
            <option value="basica">Básica</option>
            <option value="premium">Premium</option>
            <option value="vip">VIP</option>
            <option value="estudiante">Estudiante</option>
          </select>
        )}
        {field('Precio mensual (COP)',
          <input required type="number" min="0" value={form.monthlyPrice} onChange={e => setForm({...form, monthlyPrice: Number(e.target.value)})} className={inputClass} placeholder="80000" />
        )}
        {field('Entrenador asignado',
          <input value={form.assignedTrainer} onChange={e => setForm({...form, assignedTrainer: e.target.value})} className={inputClass} placeholder="Nombre del entrenador" />
        )}
      </div>
      {field('Notas',
        <textarea rows={3} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className={inputClass} placeholder="Observaciones sobre el miembro..." />
      )}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isSubmitting} className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition">
          {isSubmitting ? 'Guardando...' : mode === 'create' ? 'Crear Miembro' : 'Guardar Cambios'}
        </button>
        <button type="button" onClick={() => router.back()} disabled={isSubmitting} className="rounded-xl border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition">
          Cancelar
        </button>
      </div>
    </form>
  );
}

export const MemberForm = ClientForm;
