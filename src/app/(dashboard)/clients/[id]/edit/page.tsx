"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ClientForm } from "@/components/clients/client-form";
import { useClients } from "@/context/clients-context";

export default function EditClientPage() {
  const params = useParams<{ id: string }>();
  const { getClientById } = useClients();
  const client = getClientById(params.id);

  if (!client) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Client not found</h2>
        <p className="mt-2 text-sm text-slate-500">
          Unable to edit this record because it does not exist.
        </p>
        <Link
          href="/clients"
          className="mt-4 inline-flex rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Back to Clients
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Edit Client</h2>
        <p className="mt-1 text-sm text-slate-500">
          Update profile details and attendance records.
        </p>
      </section>

      <ClientForm mode="edit" initialClient={client} />
    </div>
  );
}
