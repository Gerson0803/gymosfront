'use client';

import { useAppSettings } from '@/context/app-settings-context';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';

export default function SettingsPage() {
  const {
    userDisplayName,
    setUserDisplayName,
    notifications,
    setNotifications,
    emailNotifications,
    setEmailNotifications,
  } = useAppSettings();

  const handleSaveSettings = () => {
    if (!userDisplayName.trim()) {
      toast.error('El nombre personalizado no puede estar vacío');
      return;
    }

    toast.success('Ajustes guardados localmente');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Ajustes y Preferencias</h1>
        <p className="text-slate-600 mt-2">Personaliza tu experiencia en GymOS</p>
      </div>

      {/* Nombre Personalizado */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Nombre Personalizado</h2>
        <p className="text-sm text-slate-600 mb-4">
          Este nombre se mostrará en tu perfil dentro de la aplicación
        </p>
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-slate-700 mb-2">
            Nombre a Mostrar
          </label>
          <input
            id="displayName"
            type="text"
            value={userDisplayName}
            onChange={(e) => setUserDisplayName(e.target.value)}
            placeholder="Tu nombre personalizado"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
          <p className="text-xs text-slate-500 mt-1">Se guarda automáticamente en tu navegador</p>
        </div>
      </div>

      {/* Preferencias */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Preferencias</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="notifications" className="text-sm font-medium text-slate-700">
                Notificaciones en la Aplicación
              </label>
              <p className="text-xs text-slate-500 mt-1">Recibe notificaciones dentro de GymOS</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                id="notifications"
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="emailNotifications" className="text-sm font-medium text-slate-700">
                  Notificaciones por Email
                </label>
                <p className="text-xs text-slate-500 mt-1">Recibe alertas importantes por email</p>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  id="emailNotifications"
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Guardar Cambios */}
      <div className="mb-6">
        <button
          onClick={handleSaveSettings}
          className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
        >
          <Save className="h-5 w-5" />
          Guardar Cambios
        </button>
      </div>

      {/* Información */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💾 <strong>Nota:</strong> Todos los cambios se guardan localmente en tu navegador. 
          Si limpias los datos del navegador, se perderán.
        </p>
      </div>
    </div>
  );
}

