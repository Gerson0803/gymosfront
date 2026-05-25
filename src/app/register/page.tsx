'use client';

import Link from 'next/link';
import { AuthMarketingPanel } from '@/components/auth/auth-marketing-panel';
import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F7FB] px-4 py-10">
      <div className="grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-[2rem] border border-[#E5EAF3] bg-white shadow-[0_8px_40px_-8px_rgba(10,23,51,0.12)] sm:grid-cols-[1.4fr_1fr]">
        <AuthMarketingPanel
          title="Únete a GymOS"
          description="Crea tu cuenta y empieza a gestionar miembros, check-ins y ventas con una plataforma diseñada para gimnasios premium."
        />

        <div className="p-8 sm:p-10">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#5B6475]">Registro</p>
            <h2 className="mt-4 text-3xl font-bold text-[#0A1733]">Crea tu cuenta</h2>
            <p className="mt-2 text-sm text-[#5B6475]">Completa el formulario para empezar a usar GymOS.</p>
          </div>

          <RegisterForm />

          <div className="mt-8 rounded-3xl border border-[#E5EAF3] bg-[#F5F7FB] p-5 text-center text-sm text-[#5B6475]">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="font-semibold text-[#0B57F0] transition hover:text-[#0948c9]">
              Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
