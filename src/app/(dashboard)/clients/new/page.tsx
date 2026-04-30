import { ClientForm } from '@/components/clients/client-form';

export const metadata = {
  title: 'Crear nuevo miembro | GymOS',
};

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Crear Nuevo Miembro</h1>
        <p className="mt-2 text-slate-600">Agrega un nuevo miembro a tu gimnasio</p>
      </div>
      <ClientForm mode="create" />
    </div>
  );
}
