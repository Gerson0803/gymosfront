'use client';

import { useState, useMemo } from 'react';
import { useMembers } from '@/context/members-context';
import { checkinMember } from '@/lib/api';
import { Search, Download, AlertTriangle, Loader, Plus, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { premium } from '@/lib/premium-ui';
import { ProfileAvatar } from '@/components/ui/profile-avatar';

function formatLastCheckIn(date?: string) {
  if (!date) return 'Never';
  const d = new Date(date);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return isToday ? `Today, ${time}` : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function tierLabel(type: string) {
  const map: Record<string, string> = {
    basica: 'Basic',
    premium: 'Premium',
    vip: 'VIP Elite',
    estudiante: 'Student',
  };
  return map[type] ?? type;
}

function churnLabel(level: string) {
  if (level === 'bajo') return { text: 'Low', dot: 'bg-emerald-500' };
  if (level === 'medio') return { text: 'Medium', dot: 'bg-amber-500' };
  if (level === 'alto') return { text: 'High', dot: 'bg-red-500' };
  return { text: 'Critical', dot: 'bg-red-600' };
}

export default function EnhancedClientsTable() {
  const { members, loading, error, deleteMember, refreshMembers, updateMember } = useMembers();
  const [search, setSearch] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [checkinLoading, setCheckinLoading] = useState<string | null>(null);

  const filteredMembers = useMemo(() => {
    const q = search.toLowerCase();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q),
    );
  }, [members, search]);

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Tier', 'Plan', 'Risk', 'Last Check-in'];
    const rows = filteredMembers.map((m) => [
      m.name,
      m.email,
      m.membershipType,
      m.monthlyPrice,
      m.churnRiskLevel,
      m.lastCheckIn ?? '',
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `members_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Export complete');
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMember(id);
      toast.success('Member removed');
      setDeleteConfirmId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleCheckIn = async (memberId: string) => {
    setCheckinLoading(memberId);
    try {
      await checkinMember(memberId);
      toast.success('Check-in registered');
      await refreshMembers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Check-in failed');
    } finally {
      setCheckinLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader className="h-10 w-10 animate-spin text-[#0B57F0]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${premium.card} border-red-200 bg-red-50 p-6`}>
        <AlertTriangle className="h-6 w-6 text-red-600" />
        <p className="mt-2 text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      <PageHeader
        title="Members"
        search={
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5B6475]" />
            <input
              type="text"
              placeholder="Search members by name, email, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={premium.searchInput}
            />
          </div>
        }
        actions={
          <>
            <Link href="/clients/new" className={premium.pillBtn}>
              <Plus className="h-4 w-4" />
              Nuevo Miembro
            </Link>
            <button type="button" onClick={exportToCSV} className={premium.pillBtnOutline}>
              <Download className="h-4 w-4" />
              Export
            </button>
          </>
        }
      />

      <div className="space-y-4">
        {filteredMembers.map((member) => {
          const churn = churnLabel(member.churnRiskLevel);
          const isActive =
            member.status === 'active' || member.membershipStatus === 'activo';
          return (
            <article
              key={member.id}
              className="relative overflow-hidden rounded-[1.75rem] border border-[#E5EAF3] bg-white shadow-[0_4px_24px_-4px_rgba(10,23,51,0.06)] transition hover:shadow-[0_8px_32px_-8px_rgba(10,23,51,0.1)]"
            >
              <span
                className="absolute bottom-0 left-0 top-0 w-1.5 rounded-l-[1.75rem] bg-emerald-500"
                aria-hidden
              />
              <div className="grid grid-cols-1 items-center gap-6 p-5 pl-7 sm:p-6 sm:pl-8 md:grid-cols-[minmax(0,1.4fr)_repeat(5,minmax(0,1fr))]">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative shrink-0">
                    <ProfileAvatar
                      photoUrl={member.photoUrl}
                      name={member.name}
                      size="sm"
                      className="!rounded-full"
                    />
                    {isActive && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#0A1733]">{member.name}</p>
                    <p className="truncate text-sm text-[#5B6475]">{member.email}</p>
                  </div>
                </div>

                <div>
                  <p className={premium.labelCaps}>Tier</p>
                  <span className="mt-1.5 inline-flex rounded-lg bg-[#0B57F0]/10 px-2.5 py-1 text-xs font-semibold text-[#0B57F0]">
                    {tierLabel(member.membershipType)}
                  </span>
                </div>

                <div>
                  <p className={premium.labelCaps}>Plan Cost</p>
                  <p className="mt-1.5 text-sm font-semibold text-[#0A1733]">
                    ${((member.monthlyPrice || 0) / 1000).toFixed(0)}/mo
                  </p>
                </div>

                <div>
                  <p className={premium.labelCaps}>Frequency</p>
                  <p className="mt-1.5 text-sm font-semibold text-[#0A1733]">
                    {member.averageCheckInsPerWeek ?? 0}x/week
                  </p>
                </div>

                <div>
                  <p className={premium.labelCaps}>Last Check-in</p>
                  <p className="mt-1.5 text-sm font-semibold text-[#0A1733]">
                    {formatLastCheckIn(member.lastCheckIn)}
                  </p>
                </div>

                <div>
                  <p className={premium.labelCaps}>Churn Risk</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${churn.dot}`} />
                    <span className="text-sm font-semibold text-[#0A1733]">{churn.text}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#E5EAF3] px-5 py-3 sm:px-6">
                <button
                  type="button"
                  onClick={() => handleCheckIn(member.id)}
                  disabled={checkinLoading === member.id}
                  className="rounded-full px-4 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                >
                  {checkinLoading === member.id ? (
                    <span className="flex items-center gap-1">
                      <Loader className="h-3 w-3 animate-spin" />
                      Checking in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <QrCode className="h-3 w-3" />
                      Check-in
                    </span>
                  )}
                </button>
                <Link
                  href={`/clients/${member.id}/edit`}
                  className="rounded-full px-4 py-1.5 text-xs font-semibold text-[#0B57F0] hover:bg-[#0B57F0]/5"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(member.id)}
                  className="rounded-full px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            </article>
          );
        })}

        {filteredMembers.length === 0 && (
          <p className="py-12 text-center text-sm text-[#5B6475]">No members match your search.</p>
        )}
      </div>

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className={`${premium.card} max-w-md w-full p-6`}>
            <h3 className="text-lg font-semibold text-[#0A1733]">Remove member?</h3>
            <p className="mt-2 text-sm text-[#5B6475]">This action cannot be undone.</p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className={`flex-1 ${premium.pillBtnOutline}`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
