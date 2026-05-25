'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppSettings } from '@/context/app-settings-context';
import { premium } from '@/lib/premium-ui';

const inputClass =
  'w-full rounded-2xl border border-[#E5EAF3] bg-[#F5F7FB] px-4 py-3 text-sm text-[#0A1733] outline-none transition focus:border-[#0B57F0] focus:ring-2 focus:ring-[#0B57F0]/15';

type GymNameEditorProps = {
  variant?: 'settings';
};

export function GymNameEditor(_props: GymNameEditorProps) {
  const { gymName, commitGymName } = useAppSettings();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(gymName);

  const handleOpen = () => {
    setDraft(gymName);
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      toast.error('El nombre no puede estar vacío');
      return;
    }
    commitGymName(trimmed);
    toast.success('Nombre del gimnasio actualizado');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(gymName);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="mt-4 space-y-4">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Nombre del gimnasio"
          className={inputClass}
          autoFocus
        />
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={handleSave} className={premium.pillBtn}>
            Guardar nombre
          </button>
          <button type="button" onClick={handleCancel} className={premium.pillBtnOutline}>
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <p className="rounded-2xl border border-[#E5EAF3] bg-[#F5F7FB] px-4 py-3 text-sm font-medium text-[#0A1733]">
        {gymName || 'GymOS'}
      </p>
      <button
        type="button"
        onClick={handleOpen}
        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0B57F0] transition hover:text-[#0948c9]"
      >
        <Pencil className="h-4 w-4" strokeWidth={1.75} />
        Cambiar nombre del gimnasio
      </button>
    </div>
  );
}
