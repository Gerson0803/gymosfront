import { ClientForm } from "@/components/clients/client-form";

export default function NewClientPage() {
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Add New Client</h2>
        <p className="mt-1 text-sm text-slate-500">
          Create a new member profile and seed attendance history.
        </p>
      </section>

      <ClientForm mode="create" />
    </div>
  );
}
