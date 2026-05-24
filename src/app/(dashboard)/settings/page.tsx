'use client';

import { useState, useEffect } from 'react';
import { useAppSettings } from '@/context/app-settings-context';
import { changePassword } from '@/lib/api';
import toast from 'react-hot-toast';
import { Save, Eye, EyeOff, User, Lock, Bell } from 'lucide-react';
import { premium } from '@/lib/premium-ui';
import { GymNameEditor } from '@/components/layout/gym-name-editor';

interface UserData {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
}

const inputClass =
  'w-full rounded-2xl border border-[#E5EAF3] bg-[#F5F7FB] px-4 py-3 text-sm text-[#0A1733] outline-none transition focus:border-[#0B57F0] focus:ring-2 focus:ring-[#0B57F0]/15';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8">
        <p className={premium.labelCaps}>Configuracion</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#0A1733] sm:text-4xl">
          Ajustes
        </h1>
        <p className="mt-2 text-sm text-[#5B6475]">Administra tu cuenta y preferencias de GymOS.</p>
      </header>
      <SettingsTabs activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

function SettingsTabs({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'security', label: 'Seguridad', icon: Lock },
    { id: 'preferences', label: 'Preferencias', icon: Bell },
  ];

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2 border-b border-[#E5EAF3]">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
              activeTab === id
                ? 'border-[#0B57F0] text-[#0B57F0]'
                : 'border-transparent text-[#5B6475] hover:text-[#0A1733]'
            }`}
          >
            <Icon className="h-4 w-4" strokeWidth={1.75} />
            {label}
          </button>
        ))}
      </div>
      {activeTab === 'profile' && <ProfileTab />}
      {activeTab === 'security' && <SecurityTab />}
      {activeTab === 'preferences' && <PreferencesTab />}
    </>
  );
}

function ProfileTab() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const data = JSON.parse(storedUserData) as UserData;
        setName(data.name || '');
        setEmail(data.email || '');
      } catch {
        /* ignore */
      }
    }
  }, []);

  return (
    <div className="space-y-6">
      <section className={`${premium.card} p-6 sm:p-8`}>
        <h2 className="text-lg font-semibold text-[#0A1733]">Información de cuenta</h2>
        <p className="mt-1 text-sm text-[#5B6475]">Datos asociados a tu sesión.</p>
        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#0A1733]">Nombre</label>
            <input
              type="text"
              value={name}
              disabled
              className={`${inputClass} cursor-not-allowed opacity-70`}
            />
            <p className="mt-1 text-xs text-[#5B6475]">El nombre no se puede modificar desde aquí.</p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#0A1733]">Correo electrónico</label>
            <input
              type="email"
              value={email}
              disabled
              className={`${inputClass} cursor-not-allowed opacity-70`}
            />
            <p className="mt-1 text-xs text-[#5B6475]">El correo no se puede modificar desde aquí.</p>
          </div>
        </div>
      </section>

      <section className={`${premium.card} p-6 sm:p-8`}>
        <h2 className="text-lg font-semibold text-[#0A1733]">Información del gimnasio</h2>
        <p className="mt-1 text-sm text-[#5B6475]">
          Personaliza el nombre de tu centro. Los cambios se aplican al guardar.
        </p>
        <GymNameEditor variant="settings" />
      </section>
    </div>
  );
}

function SecurityTab() {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetPasswordForm = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordForm(false);
  };

  const handleChangePassword = async () => {
    if (!oldPassword) {
      toast.error('Ingresa tu contraseña actual');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (oldPassword === newPassword) {
      toast.error('La nueva contraseña debe ser diferente a la actual');
      return;
    }

    setLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      toast.success('Contraseña actualizada correctamente');
      resetPasswordForm();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al cambiar la contraseña';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={`${premium.card} p-6 sm:p-8`}>
      <h2 className="text-lg font-semibold text-[#0A1733]">Cambiar contraseña</h2>
      <p className="mt-1 text-sm text-[#5B6475]">
        La actualización se guarda en tu cuenta del servidor.
      </p>
      {!showPasswordForm ? (
        <button
          type="button"
          onClick={() => setShowPasswordForm(true)}
          className={`${premium.pillBtnOutline} mt-6`}
          disabled={loading}
        >
          Cambiar contraseña
        </button>
      ) : (
        <div className="mt-6 space-y-4">
          <PasswordField
            id="old-password"
            label="Contraseña actual"
            value={oldPassword}
            onChange={setOldPassword}
            visible={showPassword}
            onToggle={() => setShowPassword(!showPassword)}
            disabled={loading}
          />
          <PasswordField
            id="new-password"
            label="Nueva contraseña"
            value={newPassword}
            onChange={setNewPassword}
            visible={showNewPassword}
            onToggle={() => setShowNewPassword(!showNewPassword)}
            hint="Mínimo 6 caracteres"
            disabled={loading}
          />
          <PasswordField
            id="confirm-password"
            label="Confirmar nueva contraseña"
            value={confirmPassword}
            onChange={setConfirmPassword}
            visible={showConfirmPassword}
            onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={loading}
          />
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleChangePassword}
              disabled={loading}
              className={`${premium.pillBtn} flex-1 disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {loading ? 'Guardando...' : 'Cambiar contraseña'}
            </button>
            <button
              type="button"
              onClick={resetPasswordForm}
              disabled={loading}
              className={`${premium.pillBtnOutline} flex-1 disabled:cursor-not-allowed disabled:opacity-50`}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function PreferencesTab() {
  const { notifications, setNotifications, emailNotifications, setEmailNotifications } = useAppSettings();

  return (
    <section className={`${premium.card} p-6 sm:p-8`}>
      <h2 className="text-lg font-semibold text-[#0A1733]">Preferencias</h2>
      <div className="mt-6 space-y-5">
        <ToggleRow
          id="notifications"
          label="Notificaciones en la aplicacion"
          description="Recibe alertas dentro de GymOS"
          checked={notifications}
          onChange={setNotifications}
        />
        <ToggleRow
          id="email-notifications"
          label="Notificaciones por email"
          description="Recibe alertas importantes por correo"
          checked={emailNotifications}
          onChange={setEmailNotifications}
        />
      </div>
      <button
        type="button"
        onClick={() => toast.success('Preferencias guardadas')}
        className={`${premium.pillBtn} mt-6`}
      >
        <Save className="h-4 w-4" />
        Guardar preferencias
      </button>
    </section>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  visible,
  onToggle,
  hint,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-[#0A1733]">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="********"
          className={`${inputClass} pr-11`}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5B6475] hover:text-[#0A1733]"
        >
          {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      {hint ? <p className="mt-1 text-xs text-[#5B6475]">{hint}</p> : null}
    </div>
  );
}

function ToggleRow({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#E5EAF3] pb-5 last:border-0 last:pb-0">
      <div>
        <label htmlFor={id} className="text-sm font-medium text-[#0A1733]">
          {label}
        </label>
        <p className="mt-1 text-xs text-[#5B6475]">{description}</p>
      </div>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 rounded border-[#E5EAF3] text-[#0B57F0] focus:ring-[#0B57F0]"
      />
    </div>
  );
}
