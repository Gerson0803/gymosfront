'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signup } from '@/lib/api';
import toast from 'react-hot-toast';

const inputClass =
  'w-full rounded-3xl border border-[#E5EAF3] bg-[#F5F7FB] px-4 py-3 text-[#0A1733] outline-none transition focus:border-[#0B57F0] focus:ring-2 focus:ring-[#0B57F0]/15';

const primaryBtnClass =
  'w-full rounded-full bg-[#0B57F0] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0948c9] disabled:cursor-not-allowed disabled:opacity-50';

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('El nombre es requerido');
      return;
    }
    if (name.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres');
      return;
    }
    if (!registerEmail.includes('@')) {
      setError('Por favor ingresa un email válido');
      return;
    }
    if (registerPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (registerPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      await signup(registerEmail, registerPassword, name.trim());
      toast.success('¡Cuenta creada exitosamente!');
      router.push('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la cuenta';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-5">
      {error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="space-y-3">
        <label htmlFor="register-name" className="block text-sm font-medium text-slate-700">
          Nombre completo
        </label>
        <input
          id="register-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Juan Pérez"
          className={inputClass}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-3">
        <label htmlFor="register-email" className="block text-sm font-medium text-slate-700">
          Correo electrónico
        </label>
        <input
          id="register-email"
          type="email"
          value={registerEmail}
          onChange={(e) => setRegisterEmail(e.target.value)}
          placeholder="tu@email.com"
          className={inputClass}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-3">
        <label htmlFor="register-password" className="block text-sm font-medium text-slate-700">
          Contraseña
        </label>
        <input
          id="register-password"
          type="password"
          value={registerPassword}
          onChange={(e) => setRegisterPassword(e.target.value)}
          placeholder="••••••••"
          className={inputClass}
          required
          disabled={loading}
        />
        <p className="text-xs text-[#5B6475]">Mínimo 6 caracteres</p>
      </div>

      <div className="space-y-3">
        <label htmlFor="register-confirm" className="block text-sm font-medium text-slate-700">
          Confirmar contraseña
        </label>
        <input
          id="register-confirm"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          className={inputClass}
          required
          disabled={loading}
        />
      </div>

      <button type="submit" disabled={loading} className={primaryBtnClass}>
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>
    </form>
  );
}
