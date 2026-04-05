"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getClientStatus, getLastAttendance } from "@/lib/client-status";
import { formatDate } from "@/lib/utils";
import type { Client, ClientStatus } from "@/types/client";
import { StatusBadge } from "@/components/ui/status-badge";

type ClientsTableProps = {
  clients: Client[];
};

type FilterStatus = "all" | ClientStatus;

export function ClientsTable({ clients }: ClientsTableProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<FilterStatus>("all");

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesQuery = client.name
        .toLowerCase()
        .includes(query.trim().toLowerCase());
      const clientStatus = getClientStatus(client);
      const matchesStatus = status === "all" ? true : clientStatus === status;

      return matchesQuery && matchesStatus;
    });
  }, [clients, query, status]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Client Directory</h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as FilterStatus)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="at-risk">At Risk</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead>
            <tr className="text-slate-500">
              <th className="px-3 py-2 font-semibold">Name</th>
              <th className="px-3 py-2 font-semibold">Status</th>
              <th className="px-3 py-2 font-semibold">Last Attendance</th>
              <th className="px-3 py-2 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredClients.map((client) => {
              const clientStatus = getClientStatus(client);
              const lastAttendance = getLastAttendance(client);

              return (
                <tr key={client.id} className="hover:bg-slate-50/70">
                  <td className="px-3 py-3 font-semibold text-slate-800">{client.name}</td>
                  <td className="px-3 py-3">
                    <StatusBadge status={clientStatus} />
                  </td>
                  <td className="px-3 py-3 text-slate-600">
                    {lastAttendance ? formatDate(lastAttendance) : "No attendance"}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/clients/${client.id}`}
                        className="rounded-lg border border-slate-200 px-2.5 py-1.5 font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        View
                      </Link>
                      <Link
                        href={`/clients/${client.id}/edit`}
                        className="rounded-lg border border-slate-900 px-2.5 py-1.5 font-semibold text-slate-900 hover:bg-slate-900 hover:text-white"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredClients.length === 0 ? (
        <p className="mt-4 rounded-xl bg-slate-100 p-3 text-sm text-slate-500">
          No clients match your filters.
        </p>
      ) : null}
    </section>
  );
}
