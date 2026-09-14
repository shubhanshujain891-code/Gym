import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { Member, MembershipStatus } from '../../types';
import { Badge } from '../../components/common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Modal } from '../../components/common/Modal';
import { MemberQRCode } from '../../components/qr/QRComponents';
import {
  Search,
  Filter,
  UserPlus,
  QrCode,
  CreditCard,
  Trash2,
  CalendarCheck,
  CheckCircle2,
  Phone,
  Mail,
} from 'lucide-react';

interface MembersProps {
  onOpenAddMember: () => void;
  onSelectMemberForPayment: (member: Member) => void;
}

export const Members: React.FC<MembersProps> = ({
  onOpenAddMember,
  onSelectMemberForPayment,
}) => {
  const store = useStore();
  const members = store.getMembers();
  const gym = store.getActiveGym();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedQrMember, setSelectedQrMember] = useState<Member | null>(null);
  const [checkInSuccessMember, setCheckInSuccessMember] = useState<string | null>(null);

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.memberCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleQuickCheckIn = (member: Member) => {
    store.recordAttendance(member.id, 'manual');
    setCheckInSuccessMember(member.id);
    setTimeout(() => setCheckInSuccessMember(null), 2500);
  };

  const handleDelete = (member: Member) => {
    if (confirm(`Are you sure you want to remove ${member.firstName} ${member.lastName}?`)) {
      store.deleteMember(member.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Member Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage registrations, renewals, and attendance for all {members.length} members
          </p>
        </div>
        <button
          onClick={onOpenAddMember}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition shadow-xs self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>New Member</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, phone or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['all', 'active', 'expiring_soon', 'expired'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
                statusFilter === filter
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {filter.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Membership Plan</th>
                <th className="px-4 py-3">Status & Expiry</th>
                <th className="px-4 py-3">Balance</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No members match your current filter.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                          {m.firstName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-sm">
                            {m.firstName} {m.lastName}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span>{m.memberCode}</span>
                            <span>•</span>
                            <span>{m.phone}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-700">{m.currentPlanName || 'Standard'}</div>
                      <div className="text-[11px] text-slate-400">
                        Visits: <span className="font-semibold text-slate-600">{m.totalVisits}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="mb-1">
                        <Badge status={m.status} />
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Expires: <span className="font-medium text-slate-700">{formatDate(m.membershipEndDate)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {m.balanceDue > 0 ? (
                        <div>
                          <span className="font-bold text-rose-600 block">
                            {formatCurrency(m.balanceDue, gym.settings.currencySymbol)}
                          </span>
                          <span className="text-[10px] text-rose-500 uppercase font-semibold">Pending</span>
                        </div>
                      ) : (
                        <span className="text-emerald-600 font-semibold text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick Check-In */}
                        <button
                          onClick={() => handleQuickCheckIn(m)}
                          title="Record Attendance"
                          className={`p-1.5 rounded-lg border transition ${
                            checkInSuccessMember === m.id
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <CalendarCheck className="w-4 h-4" />
                        </button>

                        {/* View QR */}
                        <button
                          onClick={() => setSelectedQrMember(m)}
                          title="View Member QR Code"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        {/* Collect Payment / Renew */}
                        <button
                          onClick={() => onSelectMemberForPayment(m)}
                          title="Collect Payment or Renew"
                          className="p-1.5 rounded-lg border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(m)}
                          title="Delete Member"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member QR Modal */}
      {selectedQrMember && (
        <Modal
          isOpen={Boolean(selectedQrMember)}
          onClose={() => setSelectedQrMember(null)}
          title={`Digital Member Pass - ${selectedQrMember.firstName}`}
          maxWidth="sm"
        >
          <div className="space-y-4">
            <MemberQRCode member={selectedQrMember} />
            <div className="text-center text-xs text-slate-500">
              Present this code at the reception scanner or front desk for express check-in.
            </div>
            <button
              onClick={() => setSelectedQrMember(null)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
