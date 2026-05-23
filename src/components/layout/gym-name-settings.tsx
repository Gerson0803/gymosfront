'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useGymStore } from '@/store/useGymStore';
import toast from 'react-hot-toast';

interface GymNameSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GymNameSettings({ open, onOpenChange }: GymNameSettingsProps) {
  const { gymName, setGymName } = useGymStore();
  const [inputValue, setInputValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setInputValue(gymName);
  }, [gymName, open]);

  const handleSave = () => {
    const trimmedName = inputValue.trim();
    
    if (!trimmedName) {
      toast.error('El nombre del gimnasio no puede estar vacío');
      return;
    }

    if (trimmedName.length > 50) {
      toast.error('El nombre no debe exceder 50 caracteres');
      return;
    }

    setIsSaving(true);
    try {
      setGymName(trimmedName);
      toast.success('Nombre del gimnasio actualizado');
      onOpenChange(false);
    } catch (error) {
      toast.error('Error al actualizar el nombre');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 transition-opacity"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Configurar nombre del gimnasio
            </h2>
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-lg p-1 hover:bg-slate-100 transition"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nombre del gimnasio
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ingresa el nombre de tu gimnasio"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={50}
                autoFocus
              />
              <p className="mt-1 text-xs text-slate-500">
                {inputValue.length}/50 caracteres
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <span className="font-semibold">Anterior: </span>
                {gymName}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 p-6 flex gap-3 justify-end">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || inputValue.trim() === gymName}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
