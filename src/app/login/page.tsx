'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { login } from '@/lib/api';
import toast from 'react-hot-toast';
import { AuthMarketingPanel } from '@/components/auth/auth-marketing-panel';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F7FB] px-4 py-10">
      <div className="grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-[2rem] border border-[#E5EAF3] bg-white shadow-[0_8px_40px_-8px_rgba(10,23,51,0.12)] sm:grid-cols-[1.4fr_1fr]">
        <AuthMarketingPanel
          title="Bienvenido de nuevo"
          description="Accede a tu panel de control de alto rendimiento y gestiona miembros, check-ins y ventas de forma elegante."
        />

        <div className="max-h-[90vh] overflow-y-auto p-6 sm:p-10">
          <Link
            href="/"
            aria-label="Volver al inicio"
            className="group mb-8 inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#E5EAF3] bg-white px-4 py-2 text-sm font-semibold text-[#5B6475] shadow-[0_2px_12px_-8px_rgba(10,23,51,0.22)] outline-none transition duration-200 hover:border-[#0B57F0]/30 hover:bg-[#0B57F0]/5 hover:text-[#0A1733] focus-visible:ring-4 focus-visible:ring-[#0B57F0]/10"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" aria-hidden="true" />
            Volver al inicio
          </Link>

          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#5B6475]">Iniciar sesión</p>
            <h2 className="mt-4 text-3xl font-bold text-[#0A1733]">Accede a GymOS</h2>
            <p className="mt-2 text-sm text-[#5B6475]">Ingresa con tu correo y contraseña para continuar.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gymos.com"
                className="w-full rounded-3xl border border-[#E5EAF3] bg-[#F5F7FB] px-4 py-3 text-[#0A1733] outline-none transition focus:border-[#0B57F0] focus:ring-2 focus:ring-[#0B57F0]/15"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-3xl border border-[#E5EAF3] bg-[#F5F7FB] px-4 py-3 text-[#0A1733] outline-none transition focus:border-[#0B57F0] focus:ring-2 focus:ring-[#0B57F0]/15"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#0B57F0] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0948c9] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="mt-8 rounded-3xl border border-[#E5EAF3] bg-[#F5F7FB] p-5 text-center text-sm text-[#5B6475]">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="font-semibold text-[#0B57F0] transition hover:text-[#0948c9]">
              Regístrate aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
