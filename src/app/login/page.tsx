'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { login } from '@/lib/api';
import toast from 'react-hot-toast';
import { RegisterForm } from '@/components/auth/register-form';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (window.location.hash === '#register') {
      document.getElementById('register')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

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
        <div className="relative overflow-hidden bg-[#0A1733] p-10 text-white">
          <div className="absolute inset-0 opacity-30">
            <img
              src="/Imagen Login.png"
              alt="GymOS Login Background"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="relative z-10 space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-sky-300/80">GymOS</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight">Bienvenido de nuevo</h1>
            </div>
            <p className="max-w-md text-sm text-slate-200">
              Accede a tu panel de control de alto rendimiento y gestiona miembros, check-ins y ventas de forma elegante.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/15 bg-white/10 px-4 py-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-100">Administra tu gimnasio</p>
                <p className="mt-2 text-xs text-slate-200/90">Miembros, equipos y operaciones centralizados.</p>
              </div>
              <div className="rounded-3xl border border-white/15 bg-white/10 px-4 py-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-100">Experiencia premium</p>
                <p className="mt-2 text-xs text-slate-200/90">Interfaz moderna y herramientas para equipos de alto rendimiento.</p>
              </div>
            </div>
          </div>
        </div>

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
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">Iniciar sesión</p>
            <h2 className="mt-4 text-3xl font-bold text-slate-900">Accede a GymOS</h2>
            <p className="mt-2 text-sm text-slate-500">Ingresa con tu correo y contraseña para continuar.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-3xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
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

          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
