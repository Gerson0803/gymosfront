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
      <div className="relative z-10 space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.32em] text-sky-300/80">GymOS</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">{title}</h1>
        </div>
        <p className="max-w-md text-sm text-slate-200">{description}</p>
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
  );
}
