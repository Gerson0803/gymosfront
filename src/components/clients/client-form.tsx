'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useMembers } from '@/context/members-context';
import type { ExperienceLevel, FitnessGoal, Member, MembershipType } from '@/types/member';
import { PhotoUpload } from '@/components/ui/photo-upload';
import { premium } from '@/lib/premium-ui';
import { uploadToS3 } from '@/lib/s3';

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
    photoUrl: initialMember?.photoUrl ?? '',
  });

  const field = (label: string, children: React.ReactNode) => (
    <label className="block">
      <span className={premium.formLabel}>{label}</span>
      {children}
    </label>
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let finalPhotoUrl = form.photoUrl;

      if (form.photoUrl.startsWith('blob:')) {
        const response = await fetch(form.photoUrl);
        const blob = await response.blob();
        const file = new File([blob], 'photo.jpg', { type: blob.type });
        finalPhotoUrl = await uploadToS3(file);
      }

      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        goal: form.goal,
        experienceLevel: form.experienceLevel,
        membershipType: form.membershipType,
        monthlyPrice: Number(form.monthlyPrice),
        assignedTrainer: form.assignedTrainer,
        notes: form.notes,
        photoUrl: finalPhotoUrl,
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
    <form onSubmit={onSubmit} className={`${premium.formPanel} space-y-6 p-5 sm:p-6 lg:p-8`}>
      <div className={premium.formSection}>
        <div className="mb-5">
          <h2 className="text-lg font-bold text-[#0A1733]">Profile</h2>
          <p className="mt-1 text-sm text-[#5B6475]">Basic member identity and contact details.</p>
        </div>
        <PhotoUpload
          value={form.photoUrl}
          onChange={(photoUrl) => setForm({ ...form, photoUrl })}
          name={form.name || 'Miembro'}
        />
      </div>

      <div className={premium.formSection}>
        <div className="mb-5">
          <h2 className="text-lg font-bold text-[#0A1733]">Personal information</h2>
          <p className="mt-1 text-sm text-[#5B6475]">Keep this information accurate for member communications.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
        {field('Nombre completo',
          <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={premium.formInput} placeholder="Ej: Juan García" />
        )}
        {field('Email',
          <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={premium.formInput} placeholder="juan@email.com" />
        )}
        {field('Teléfono',
          <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className={premium.formInput} placeholder="+57 300 123 4567" />
        )}
        {field('Fecha de nacimiento',
          <input type="date" value={form.birthDate} onChange={e => setForm({...form, birthDate: e.target.value})} className={premium.formInput} />
        )}
        {field('Género',
          <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value as NonNullable<Member['gender']>})} className={premium.formInput}>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
        )}
        {field('Entrenador asignado',
          <input value={form.assignedTrainer} onChange={e => setForm({...form, assignedTrainer: e.target.value})} className={premium.formInput} placeholder="Nombre del entrenador" />
        )}
        </div>
      </div>

      <div className={premium.formSection}>
        <div className="mb-5">
          <h2 className="text-lg font-bold text-[#0A1733]">Membership details</h2>
          <p className="mt-1 text-sm text-[#5B6475]">Plan, goals and commercial information.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
        {field('Objetivo fitness',
          <select value={form.goal} onChange={e => setForm({...form, goal: e.target.value as FitnessGoal})} className={premium.formInput}>
            <option value="perder_peso">Perder peso</option>
            <option value="ganar_musculo">Ganar músculo</option>
            <option value="resistencia">Resistencia</option>
            <option value="salud_general">Salud general</option>
            <option value="rendimiento">Rendimiento</option>
          </select>
        )}
        {field('Nivel de experiencia',
          <select value={form.experienceLevel} onChange={e => setForm({...form, experienceLevel: e.target.value as ExperienceLevel})} className={premium.formInput}>
            <option value="principiante">Principiante</option>
            <option value="intermedio">Intermedio</option>
            <option value="avanzado">Avanzado</option>
          </select>
        )}
        {field('Tipo de membresía',
          <select value={form.membershipType} onChange={e => setForm({...form, membershipType: e.target.value as MembershipType})} className={premium.formInput}>
            <option value="basica">Básica</option>
            <option value="premium">Premium</option>
            <option value="vip">VIP</option>
            <option value="estudiante">Estudiante</option>
          </select>
        )}
        {field('Precio mensual (COP)',
          <input required type="number" min="0" value={form.monthlyPrice} onChange={e => setForm({...form, monthlyPrice: Number(e.target.value)})} className={premium.formInput} placeholder="80000" />
        )}
        </div>
      </div>

      {field('Notas',
        <textarea rows={4} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className={premium.formTextarea} placeholder="Observaciones sobre el miembro..." />
      )}
      <div className="flex flex-col-reverse gap-3 border-t border-[#E5EAF3] pt-6 sm:flex-row sm:justify-end">
        <button type="button" onClick={() => router.back()} disabled={isSubmitting} className={premium.formSecondaryBtn}>
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting} className={`${premium.pillBtn} disabled:cursor-not-allowed disabled:opacity-60`}>
          {isSubmitting ? 'Guardando...' : mode === 'create' ? 'Crear Miembro' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
}

export const MemberForm = ClientForm;
