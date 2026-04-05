"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useClients } from "@/context/clients-context";
import type { AttendanceRecord, Client } from "@/types/client";

type ClientFormProps = {
  mode: "create" | "edit";
  initialClient?: Client;
};

type FormState = {
  name: string;
  email: string;
  phone: string;
  joinedAt: string;
  goal: string;
  notes: string;
  attendance: string;
};

function parseAttendance(text: string): AttendanceRecord[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((date) => ({ date }));
}

function toAttendanceText(attendance: AttendanceRecord[]): string {
  return attendance.map((record) => record.date).join("\n");
}

export function ClientForm({ mode, initialClient }: ClientFormProps) {
  const router = useRouter();
  const { addClient, updateClient } = useClients();

  const defaultState = useMemo<FormState>(
    () => ({
      name: initialClient?.name ?? "",
      email: initialClient?.email ?? "",
      phone: initialClient?.phone ?? "",
      joinedAt:
        initialClient?.joinedAt ?? new Date().toISOString().slice(0, 10),
      goal: initialClient?.goal ?? "",
      notes: initialClient?.notes ?? "",
      attendance: initialClient ? toAttendanceText(initialClient.attendance) : "",
    }),
    [initialClient],
  );

  const [form, setForm] = useState<FormState>(defaultState);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      joinedAt: form.joinedAt,
      goal: form.goal,
      notes: form.notes,
      attendance: parseAttendance(form.attendance),
    };

    if (mode === "create") {
      const client = addClient(payload);
      router.push(`/clients/${client.id}`);
      return;
    }

    if (!initialClient) {
      return;
    }

    const client = updateClient(initialClient.id, payload);
    if (client) {
      router.push(`/clients/${client.id}`);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-sm font-semibold text-slate-700">Full Name</span>
          <input
            required
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-semibold text-slate-700">Email</span>
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-semibold text-slate-700">Phone</span>
          <input
            required
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-semibold text-slate-700">Join Date</span>
          <input
            required
            type="date"
            value={form.joinedAt}
            onChange={(event) => setForm({ ...form, joinedAt: event.target.value })}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none"
          />
        </label>
      </div>

      <label className="space-y-1.5">
        <span className="text-sm font-semibold text-slate-700">Primary Goal</span>
        <input
          required
          value={form.goal}
          onChange={(event) => setForm({ ...form, goal: event.target.value })}
          className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none"
        />
      </label>

      <label className="space-y-1.5">
        <span className="text-sm font-semibold text-slate-700">Notes</span>
        <textarea
          rows={3}
          value={form.notes}
          onChange={(event) => setForm({ ...form, notes: event.target.value })}
          className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none"
        />
      </label>

      <label className="space-y-1.5">
        <span className="text-sm font-semibold text-slate-700">
          Attendance Dates (YYYY-MM-DD, one per line)
        </span>
        <textarea
          rows={6}
          value={form.attendance}
          onChange={(event) =>
            setForm({
              ...form,
              attendance: event.target.value,
            })
          }
          className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono text-sm focus:border-slate-900 focus:outline-none"
        />
      </label>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="submit"
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          {mode === "create" ? "Create Client" : "Save Changes"}
        </button>
        <button
          type="button"
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          onClick={() => router.back()}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
