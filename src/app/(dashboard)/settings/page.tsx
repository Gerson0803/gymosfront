'use client';

import { useState, useEffect } from 'react';
import { useAppSettings } from '@/context/app-settings-context';
import toast from 'react-hot-toast';
import { Save, Eye, EyeOff, User, Lock, Bell } from 'lucide-react';

interface UserData {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
}

export default function SettingsPage() {
  const {
    userDisplayName,
    setUserDisplayName,
    notifications,
    setNotifications,
    emailNotifications,
    setEmailNotifications,
  } = useAppSettings();

  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Simular carga de datos del usuario desde localStorage o contexto
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      const data = JSON.parse(storedUserData);
      setUserData(data);
      setName(data.name || '');
      setEmail(data.email || '');
      setRole(data.role || 'user');
    } else {
      // Valores por defecto
      setUserData({
        email: 'usuario@example.com',
        name: 'Usuario',
        role: 'user',
      });
      setEmail('usuario@example.com');
      setName('Usuario');
      setRole('user');
    }
  }, []);

  const handleSaveProfile = () => {
    if (!name.trim()) {
      toast.error('El nombre no puede estar vacío');
      return;
    }

    const updatedData = {
      ...userData,
      name: name.trim(),
      email,
      role,
    };

    localStorage.setItem('userData', JSON.stringify(updatedData));
    setUserData(updatedData);
    toast.success('Perfil actualizado exitosamente');
  };

  const handleChangePassword = () => {
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

    toast.success('Contraseña cambiada exitosamente');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordForm(false);
  };

  const handleSavePreferences = () => {
    toast.success('Preferencias guardadas localmente');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Ajustes</h1>
        <p className="text-slate-600 mt-2">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-3 font-medium border-b-2 transition ${
            activeTab === 'profile'
              ? 'text-blue-600 border-blue-600'
              : 'text-slate-600 border-transparent hover:text-slate-900'
          }`}
        >
          <User className="inline-block mr-2 h-4 w-4" />
          Perfil
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-3 font-medium border-b-2 transition ${
            activeTab === 'security'
              ? 'text-blue-600 border-blue-600'
              : 'text-slate-600 border-transparent hover:text-slate-900'
          }`}
        >
          <Lock className="inline-block mr-2 h-4 w-4" />
          Seguridad
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-4 py-3 font-medium border-b-2 transition ${
            activeTab === 'preferences'
              ? 'text-blue-600 border-blue-600'
              : 'text-slate-600 border-transparent hover:text-slate-900'
          }`}
        >
          <Bell className="inline-block mr-2 h-4 w-4" />
          Preferencias
        </button>
      </div>

      {/* Perfil Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Información básica */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Información de Cuenta</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 mt-1">No se puede cambiar el email</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre completo"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Rol
                </label>
                <select
                  value={role}
                  disabled
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
                >
                  <option value="admin">Administrador</option>
                  <option value="trainer">Entrenador</option>
                  <option value="staff">Personal</option>
                  <option value="user">Usuario</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">Rol asignado por un administrador</p>
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              className="mt-6 w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <Save className="h-5 w-5" />
              Guardar Cambios
            </button>
          </div>

          {/* Nombre personalizado */}
          <div className="bg-white rounded-lg shadow-md p-6">
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
        </div>
      )}

      {/* Seguridad Tab */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Cambiar Contraseña</h2>

          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition"
            >
              Cambiar Contraseña
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="oldPassword" className="block text-sm font-medium text-slate-700 mb-2">
                  Contraseña Actual
                </label>
                <div className="relative">
                  <input
                    id="oldPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-2">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">Mínimo 6 caracteres</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleChangePassword}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                >
                  Cambiar Contraseña
                </button>
                <button
                  onClick={() => {
                    setShowPasswordForm(false);
                    setOldPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preferencias Tab */}
      {activeTab === 'preferences' && (
        <div className="bg-white rounded-lg shadow-md p-6">
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

          <button
            onClick={handleSavePreferences}
            className="mt-6 w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <Save className="h-5 w-5" />
            Guardar Cambios
          </button>
        </div>
      )}
    </div>
  );
}

