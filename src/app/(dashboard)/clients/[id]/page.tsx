"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, PencilLine } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { useMembers } from \"@/context/members-context\";
import { getClientStatus, getLastAttendance, getRiskLabel } from \"@/lib/client-status\";
import { formatDate } from \"@/lib/utils\";

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const { getMemberById } = useMembers();
  const member = getMemberById(params.id);

  if (!member) {
    return (
      <section className=\"rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm\">
        <h2 className=\"text-xl font-semibold text-slate-900\">Member not found</h2>
        <p className=\"mt-2 text-sm text-slate-500\">
          The member record does not exist.
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

  const status = getClientStatus(member);
  const riskLabel = getRiskLabel(member);
  const lastAttendance = getLastAttendance(member);

  return (
    <div className=\"space-y-4\">
      <section className=\"flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm\">
        <div>
          <div className=\"mb-1 flex items-center gap-2\">
            <h2 className=\"text-2xl font-semibold text-slate-900\">{member.name}</h2>
            <StatusBadge status={status} />
          </div>
          <p className="text-sm text-slate-500">{riskLabel}</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/clients"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <ArrowLeft size={15} />
            Members
          </Link>
          <Link
            href={`/clients/${member.id}/edit`}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            <PencilLine size={15} />
            Edit
          </Link>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
          <h3 className="text-lg font-semibold text-slate-900">Client Profile</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Email</dt>
              <dd className="font-semibold text-slate-800">{client.email}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Phone</dt>
              <dd className="font-semibold text-slate-800">{client.phone}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Join Date</dt>
              <dd className="font-semibold text-slate-800">
                {formatDate(client.joinedAt)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Goal</dt>
              <dd className="font-semibold text-slate-800">{client.goal}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Last Attendance</dt>
              <dd className="font-semibold text-slate-800">
                {lastAttendance ? formatDate(lastAttendance) : "No attendance"}
              </dd>
            </div>
          </dl>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900">Attendance History</h3>
          <p className="mt-1 text-sm text-slate-500">
            Recent visits ordered by date.
          </p>

          <ul className="mt-4 space-y-3">
            {[...client.attendance]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((entry, index) => (
                <li
                  key={`${entry.date}-${index}`}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <p className="font-semibold text-slate-800">{formatDate(entry.date)}</p>
                  {entry.note ? (
                    <p className="text-sm text-slate-500">{entry.note}</p>
                  ) : null}
                </li>
              ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
