'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken } from '@/lib/api';
import Link from 'next/link';
import { Check, Users, Kanban, Wrench, Menu, X, Loader } from 'lucide-react';

const avatars = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces"
];

export default function HomePage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      router.replace('/dashboard');
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center">
        <Loader className="h-8 w-8 text-[#0B57F0] animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#0A1733] font-sans antialiased selection:bg-[#0B57F0]/10 selection:text-[#0B57F0]">
      {/* 1. Navbar Fija */}
      <nav className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-[#E5EAF3] z-50 transition-all">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          {/* Logo izquierda */}
          <Link href="/" className="text-2xl font-bold text-[#0B57F0] tracking-tight hover:opacity-90 transition">
            GymOS
          </Link>

          {/* Links centro (Desktop) */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#control-total" className="text-sm font-semibold text-[#5B6475] hover:text-[#0A1733] transition-colors">
              Funcionalidades
            </a>
            <a href="#planes-flexibles" className="text-sm font-semibold text-[#5B6475] hover:text-[#0A1733] transition-colors">
              Planes
            </a>
          </div>

          {/* Botón derecha (Desktop) */}
          <div className="hidden md:block">
            <Link 
              href="/login" 
              className="rounded-full bg-[#0B57F0] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0B57F0]/90"
            >
              Login
            </Link>
          </div>

          {/* Hamburger (Mobile) */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#0A1733] focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 bg-white border-b border-[#E5EAF3] shadow-lg py-6 px-6 space-y-4 flex flex-col">
            <a 
              href="#control-total" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-[#5B6475] hover:text-[#0A1733] transition-colors"
            >
              Funcionalidades
            </a>
            <a 
              href="#planes-flexibles" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-[#5B6475] hover:text-[#0A1733] transition-colors"
            >
              Planes
            </a>
            <Link 
              href="/login" 
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-full bg-[#0B57F0] py-3 text-sm font-semibold text-white text-center transition hover:bg-[#0B57F0]/90 block"
            >
              Login
            </Link>
          </div>
        )}
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-36 overflow-hidden bg-white min-h-[85vh] flex items-center">
        {/* Imagen de gimnasio a la derecha con overlay translúcido */}
        <div className="absolute right-0 top-0 bottom-0 w-full md:w-1/2 h-full z-0 pointer-events-none opacity-20 md:opacity-100">
          <img 
            src="/Imagen Home.png" 
            alt="GymOS Hero Background" 
            className="h-full w-full object-cover object-center"
          />
          {/* Fades para que se mezcle con el fondo blanco de la izquierda y abajo */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-7 flex flex-col justify-center space-y-8">
            {/* Badge */}
            <div>
              <span className="inline-flex items-center rounded-full bg-[#0B57F0]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#0B57F0]">
                Plataforma Elite
              </span>
            </div>

            {/* Título */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#0A1733] leading-[1.1]">
              Gestión de gimnasios, <br />
              <span className="text-[#0B57F0]">llevada a la perfección.</span>
            </h1>

            {/* Descripción */}
            <p className="text-base md:text-lg text-[#5B6475] leading-relaxed max-w-xl">
              GymOS unifica el control de miembros, ventas y equipamiento en una interfaz minimalista y de alto rendimiento. Diseñado para centros fitness premium que exigen precisión.
            </p>

            {/* Botón */}
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/login" 
                className="rounded-full bg-[#0B57F0] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0B57F0]/90 shadow-sm"
              >
                Login
              </Link>
            </div>

            {/* Avatars */}
            <div className="flex items-center space-y-0">
              <div className="flex -space-x-3 overflow-hidden">
                {avatars.map((url, i) => (
                  <img
                    key={i}
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover"
                    src={url}
                    alt={`Avatar ${i + 1}`}
                  />
                ))}
                <div className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-[#0B57F0] ring-2 ring-white">
                  <span className="text-xs font-bold text-white font-sans">+5k</span>
                </div>
              </div>
              <p className="text-sm font-medium text-[#5B6475] ml-4">
                Confiado por más de 5,000 centros elite.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Sección Control Total */}
      <section id="control-total" className="py-24 bg-white border-t border-[#E5EAF3]">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0A1733]">
              Control Total
            </h2>
            <p className="text-base md:text-lg text-[#5B6475]">
              Herramientas de precisión diseñadas para optimizar la operación de tu centro fitness.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="relative overflow-hidden rounded-[2rem] border border-[#E5EAF3] bg-white p-8 md:p-10 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-100/80 transition-all duration-300 group cursor-pointer">
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-[#0B57F0]/5 to-transparent pointer-events-none" />
              <div className="w-12 h-12 rounded-full bg-[#0B57F0]/10 text-[#0B57F0] flex items-center justify-center mb-6">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0A1733] mb-4">
                Gestión de Miembros
              </h3>
              <p className="text-sm md:text-base text-[#5B6475] leading-relaxed">
                Perfiles detallados, control de accesos mediante código QR, y seguimiento de asistencias en tiempo real. Mantén a tu comunidad activa y comprometida.
              </p>
            </div>

            {/* Card 2 */}
            <div className="relative overflow-hidden rounded-[2rem] border border-[#E5EAF3] bg-white p-8 md:p-10 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-100/80 transition-all duration-300 group cursor-pointer">
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-6">
                <Kanban className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0A1733] mb-4">
                Sales Pipeline
              </h3>
              <p className="text-sm md:text-base text-[#5B6475] leading-relaxed">
                Visualiza y gestiona prospectos con un tablero Kanban intuitivo. Automatiza seguimientos y convierte leads en miembros activos con mayor eficiencia.
              </p>
            </div>

            {/* Card 3 */}
            <div className="relative overflow-hidden rounded-[2rem] border border-[#E5EAF3] bg-white p-8 md:p-10 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-100/80 transition-all duration-300 group cursor-pointer">
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-slate-500/5 to-transparent pointer-events-none" />
              <div className="w-12 h-12 rounded-full bg-slate-500/10 text-slate-600 flex items-center justify-center mb-6">
                <Wrench className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0A1733] mb-4">
                Mantenimiento
              </h3>
              <p className="text-sm md:text-base text-[#5B6475] leading-relaxed">
                Inventario de equipos, programación de mantenimientos preventivos y reportes de incidencias. Garantiza una experiencia premium sin interrupciones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Sección Planes */}
      <section id="planes-flexibles" className="py-24 bg-[#F5F7FB] border-t border-[#E5EAF3]">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0A1733]">
              Planes Flexibles
            </h2>
            <p className="text-base md:text-lg text-[#5B6475]">
              Elige la solución que mejor se adapte a la escala de tu centro.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Card 1: Básico */}
            <div className="flex flex-col justify-between bg-white border border-[#E5EAF3] rounded-[2rem] p-8 md:p-10 shadow-sm hover:shadow-md transition">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-[#0A1733]">Básico</h3>
                  <p className="text-xs text-[#5B6475] mt-1">Para centros en crecimiento.</p>
                </div>
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold text-[#0A1733] tracking-tight">$49</span>
                  <span className="text-sm font-medium text-[#5B6475] ml-1">/mes</span>
                </div>
                <div className="border-t border-[#E5EAF3] pt-6">
                  <ul className="space-y-4">
                    <li className="flex items-start space-x-3 text-sm text-[#5B6475]">
                      <div className="rounded-full bg-[#0B57F0]/10 p-0.5 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-[#0B57F0]" />
                      </div>
                      <span>Dashboard Principal</span>
                    </li>
                    <li className="flex items-start space-x-3 text-sm text-[#5B6475]">
                      <div className="rounded-full bg-[#0B57F0]/10 p-0.5 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-[#0B57F0]" />
                      </div>
                      <span>Gestión de Miembros (hasta 500)</span>
                    </li>
                    <li className="flex items-start space-x-3 text-sm text-[#5B6475]">
                      <div className="rounded-full bg-[#0B57F0]/10 p-0.5 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-[#0B57F0]" />
                      </div>
                      <span>Check-in básico</span>
                    </li>
                  </ul>
                </div>
              </div>
              <Link 
                href="/login" 
                className="w-full border border-[#0B57F0] text-[#0B57F0] rounded-full py-3.5 text-sm font-semibold hover:bg-[#0B57F0]/5 transition duration-200 mt-8 text-center block"
              >
                Login
              </Link>
            </div>

            {/* Card 2: Pro (Destacada Azul) */}
            <div className="flex flex-col justify-between bg-[#0B57F0] rounded-[2rem] p-8 md:p-10 shadow-lg relative text-white hover:scale-[1.01] transition-all duration-300">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">Pro</h3>
                    <p className="text-xs text-white/80 mt-1">Para gimnasios consolidados.</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                    Más Popular
                  </span>
                </div>
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold tracking-tight">$99</span>
                  <span className="text-sm font-medium text-white/80 ml-1">/mes</span>
                </div>
                <div className="border-t border-white/20 pt-6">
                  <ul className="space-y-4">
                    <li className="flex items-start space-x-3 text-sm text-white">
                      <div className="rounded-full bg-white/20 p-0.5 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span>Todo en Básico +</span>
                    </li>
                    <li className="flex items-start space-x-3 text-sm text-white">
                      <div className="rounded-full bg-white/20 p-0.5 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span>Miembros ilimitados</span>
                    </li>
                    <li className="flex items-start space-x-3 text-sm text-white">
                      <div className="rounded-full bg-white/20 p-0.5 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span>Sales Pipeline (Kanban)</span>
                    </li>
                    <li className="flex items-start space-x-3 text-sm text-white">
                      <div className="rounded-full bg-white/20 p-0.5 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span>Check-in por QR Scanner</span>
                    </li>
                  </ul>
                </div>
              </div>
              <Link 
                href="/login" 
                className="w-full bg-white text-[#0B57F0] rounded-full py-3.5 text-sm font-semibold hover:bg-white/95 transition duration-200 mt-8 text-center block"
              >
                Login
              </Link>
            </div>

            {/* Card 3: Premium */}
            <div className="flex flex-col justify-between bg-white border border-[#E5EAF3] rounded-[2rem] p-8 md:p-10 shadow-sm hover:shadow-md transition">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-[#0A1733]">Premium</h3>
                  <p className="text-xs text-[#5B6475] mt-1">Control elite y analíticas.</p>
                </div>
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold text-[#0A1733] tracking-tight">$199</span>
                  <span className="text-sm font-medium text-[#5B6475] ml-1">/mes</span>
                </div>
                <div className="border-t border-[#E5EAF3] pt-6">
                  <ul className="space-y-4">
                    <li className="flex items-start space-x-3 text-sm text-[#5B6475]">
                      <div className="rounded-full bg-[#0B57F0]/10 p-0.5 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-[#0B57F0]" />
                      </div>
                      <span>Todo en Pro +</span>
                    </li>
                    <li className="flex items-start space-x-3 text-sm text-[#5B6475]">
                      <div className="rounded-full bg-[#0B57F0]/10 p-0.5 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-[#0B57F0]" />
                      </div>
                      <span>Módulo de Equipamiento</span>
                    </li>
                    <li className="flex items-start space-x-3 text-sm text-[#5B6475]">
                      <div className="rounded-full bg-[#0B57F0]/10 p-0.5 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-[#0B57F0]" />
                      </div>
                      <span>Analíticas Avanzadas</span>
                    </li>
                    <li className="flex items-start space-x-3 text-sm text-[#5B6475]">
                      <div className="rounded-full bg-[#0B57F0]/10 p-0.5 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-[#0B57F0]" />
                      </div>
                      <span>Soporte Prioritario 24/7</span>
                    </li>
                  </ul>
                </div>
              </div>
              <Link 
                href="/login" 
                className="w-full border border-[#0B57F0] text-[#0B57F0] rounded-full py-3.5 text-sm font-semibold hover:bg-[#0B57F0]/5 transition duration-200 mt-8 text-center block"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Footer Minimalista */}
      <footer className="bg-white border-t border-[#E5EAF3] py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-[#0B57F0] tracking-tight hover:opacity-90 transition">
            GymOS
          </Link>

          {/* Copyright */}
          <p className="text-sm text-[#5B6475] text-center">
            © 2024 GymOS Elite Management. Todos los derechos reservados.
          </p>

          {/* Links */}
          <div className="flex space-x-6 text-sm text-[#5B6475]">
            <a href="#" className="hover:text-[#0B57F0] transition">Privacidad</a>
            <a href="#" className="hover:text-[#0B57F0] transition">Términos</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
