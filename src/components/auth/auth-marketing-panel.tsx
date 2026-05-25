type AuthMarketingPanelProps = {
  title: string;
  description: string;
};

export function AuthMarketingPanel({ title, description }: AuthMarketingPanelProps) {
  return (
    <div className="relative overflow-hidden bg-[#0A1733] p-10 text-white">
      <div className="absolute inset-0 opacity-30">
        <img
          src="/Imagen Login.png"
          alt="GymOS"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="relative z-10 flex h-full flex-col justify-between gap-8">
        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-sky-300/80">GymOS</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">{title}</h1>
          </div>
          <p className="max-w-md text-sm text-slate-200">{description}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/15 bg-white/10 px-4 py-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-100">Gestión integral de miembros</p>
              <p className="mt-2 text-xs text-slate-200/90">Control de membresías, check-ins con QR y biometría, historial de asistencia, y pipeline de ventas con leads segmentados por producto.</p>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/10 px-4 py-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-100">Operaciones inteligentes</p>
              <p className="mt-2 text-xs text-slate-200/90">Alertas automáticas de retención, dashboard de métricas en tiempo real, mantenimiento de equipos, y módulo de empleados con roles personalizados.</p>
            </div>
          </div>
        </div>
        <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 px-5 py-4">
          <p className="text-sm font-semibold text-sky-300/90">¿Por qué GymOS?</p>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">• Plataforma todo-en-uno diseñada para gimnasios modernos</li>
            <li className="flex items-start gap-2">• Interfaz intuitiva con modo oscuro y personalización completa</li>
            <li className="flex items-start gap-2">• Sin límite de miembros ni costos ocultos</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
