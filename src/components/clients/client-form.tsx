"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import toast from \"react-hot-toast\";
import { useMembers } from \"@/context/members-context\";
import type { AttendanceRecord, Member } from \"@/types/member\";

type ClientFormProps = {
  mode: \"create\" | \"edit\";
  initialMember?: Member;
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

export function ClientForm({ mode, initialMember }: ClientFormProps) {
  const router = useRouter();
  const { addMember, updateMember } = useMembers();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultState = useMemo<FormState>(
    () => ({
      name: initialMember?.name ?? "",
      email: initialMember?.email ?? "",
      phone: initialMember?.phone ?? "",
      joinedAt:
        initialMember?.joinedAt ?? new Date().toISOString().slice(0, 10),
      goal: initialMember?.goal ?? "",
      notes: initialMember?.notes ?? "",
      attendance: initialMember ? toAttendanceText(initialMember.attendance) : "",
    }),
    [initialMember],
  );

  const [form, setForm] = useState<FormState>(defaultState);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        joinedAt: form.joinedAt,
        goal: form.goal as any,
        notes: form.notes,
        attendance: parseAttendance(form.attendance),
        status: "active" as const,
        membershipStatus: "activo" as const,
        membershipType: "basica" as const,
        experienceLevel: "principiante" as const,
        checkInsLast30Days: 0,
        averageCheckInsPerWeek: 0,
        churnRiskScore: 0,
        churnRiskLevel: "bajo" as const,
        monthlyPrice: 0,
      };

      if (mode === "create") {
        const member = await addMember(payload);
        toast.success("Member created successfully");
        router.push(`/clients/${member.id}`);
        return;
      }

      if (!initialMember) {
        return;
      }

      const member = await updateMember(initialMember.id, payload);
      if (member) {
        toast.success("Member updated successfully");
        router.push(`/clients/${member.id}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error(message);
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
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
          disabled={isSubmitting}
          className=\"rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed\"
        >
          {isSubmitting ? \"Saving...\" : mode === \"create\" ? \"Create Member\" : \"Save Changes\"}
        </button>
        <button
          type=\"button\"
          disabled={isSubmitting}
          className=\"rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed\"
          onClick={() => router.back()}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}\n\n// Export with original name for backward compatibility\nexport const MemberForm = ClientForm;
