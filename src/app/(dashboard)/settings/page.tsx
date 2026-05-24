'use client';

import { useState, useEffect } from 'react';
import { useAppSettings } from '@/context/app-settings-context';
import toast from 'react-hot-toast';
import { Save, Eye, EyeOff, User, Lock, Bell } from 'lucide-react';
import { premium } from '@/lib/premium-ui';

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
  const { gymName, setGymName, userDisplayName, setUserDisplayName } = useAppSettings();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const data = JSON.parse(storedUserData) as UserData;
        setUserData(data);
        setName(data.name || '');
        setEmail(data.email || '');
        setRole(data.role || 'user');
      } catch {
        /* ignore */
      }
    }
  }, []);

  const handleSaveProfile = () => {
    if (!name.trim()) {
      toast.error('El nombre no puede estar vacio');
      return;
    }
    const updatedData = { ...userData, name: name.trim(), email, role };
    localStorage.setItem('userData', JSON.stringify(updatedData));
    setUserData(updatedData);
    toast.success('Perfil actualizado');
  };

  return (
    <div className="space-y-6">
      <section className={`${premium.card} p-6 sm:p-8`}>
        <h2 className="text-lg font-semibold text-[#0A1733]">Informacion de cuenta</h2>
        <p className="mt-1 text-sm text-[#5B6475]">Datos asociados a tu sesion.</p>
        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#0A1733]">Email</label>
            <input type="email" value={email} disabled className={`${inputClass} cursor-not-allowed opacity-70`} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#0A1733]">Nombre completo</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#0A1733]">Rol</label>
            <select value={role} disabled className={`${inputClass} cursor-not-allowed opacity-70`}>
              <option value="admin">Administrador</option>
              <option value="trainer">Entrenador</option>
              <option value="staff">Personal</option>
              <option value="user">Usuario</option>
            </select>
          </div>
          <button type="button" onClick={handleSaveProfile} className={premium.pillBtn}>
            <Save className="h-4 w-4" />
            Guardar cambios
          </button>
        </div>
      </section>

      <section className={`${premium.card} p-6 sm:p-8`}>
        <h2 className="text-lg font-semibold text-[#0A1733]">Nombre personalizado</h2>
        <p className="mt-1 text-sm text-[#5B6475]">Se muestra en la barra lateral de la aplicacion.</p>
        <div className="mt-4">
          <input
            type="text"
            value={userDisplayName}
            onChange={(e) => setUserDisplayName(e.target.value)}
            placeholder="Tu nombre personalizado"
            className={inputClass}
          />
        </div>
      </section>

      <section className={`${premium.card} p-6 sm:p-8`}>
        <h2 className="text-lg font-semibold text-[#0A1733]">Informacion del gimnasio</h2>
        <p className="mt-1 text-sm text-[#5B6475]">Personaliza el nombre de tu centro fitness.</p>
        <div className="mt-4">
          <input
            type="text"
            value={gymName}
            onChange={(e) => setGymName(e.target.value)}
            placeholder="Nombre de tu gimnasio"
            className={inputClass}
          />
        </div>
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

  const handleChangePassword = () => {
    if (!oldPassword) {
      toast.error('Ingresa tu contrasena actual');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error('La nueva contrasena debe tener al menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Las contrasenas no coinciden');
      return;
    }
    toast.success('Contrasena cambiada exitosamente');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordForm(false);
  };

  return (
    <section className={`${premium.card} p-6 sm:p-8`}>
      <h2 className="text-lg font-semibold text-[#0A1733]">Cambiar contrasena</h2>
      {!showPasswordForm ? (
        <button type="button" onClick={() => setShowPasswordForm(true)} className={`${premium.pillBtnOutline} mt-6`}>
          Cambiar contrasena
        </button>
      ) : (
        <div className="mt-6 space-y-4">
          <PasswordField
            id="old-password"
            label="Contrasena actual"
            value={oldPassword}
            onChange={setOldPassword}
            visible={showPassword}
            onToggle={() => setShowPassword(!showPassword)}
          />
          <PasswordField
            id="new-password"
            label="Nueva contrasena"
            value={newPassword}
            onChange={setNewPassword}
            visible={showNewPassword}
            onToggle={() => setShowNewPassword(!showNewPassword)}
            hint="Minimo 6 caracteres"
          />
          <PasswordField
            id="confirm-password"
            label="Confirmar nueva contrasena"
            value={confirmPassword}
            onChange={setConfirmPassword}
            visible={showConfirmPassword}
            onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
          />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleChangePassword} className={`${premium.pillBtn} flex-1`}>
              Cambiar contrasena
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPasswordForm(false);
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
              }}
              className={`${premium.pillBtnOutline} flex-1`}
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
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  hint?: string;
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
