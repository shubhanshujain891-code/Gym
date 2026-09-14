import React, { useState, useMemo } from 'react';
import { useStore } from '../../hooks/useStore';
import { Member, MemberStatus, PaymentRecord } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { RiskBadge } from '../../components/common/RiskBadge';
import { formatCurrency, formatDate, calculateMemberRiskScore } from '../../utils/formatters';
import { AddMemberModal } from './AddMemberModal';
import { BulkImportModal } from '../../components/common/BulkImportModal';
import { CollectPaymentModal } from '../../components/common/CollectPaymentModal';
import { WhatsAppModal } from '../../components/whatsapp/WhatsAppModal';
import { PaymentReceiptModal } from '../../components/receipt/PaymentReceiptModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../components/common/Toast';
import {
  Search,
  Filter,
  UserPlus,
  UploadCloud,
  Download,
  MoreVertical,
  MessageSquare,
  CreditCard,
  Eye,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Phone,
  CheckCircle2,
} from 'lucide-react';

interface MembersPageProps {
  onSelectMember: (memberId: string) => void;
  initialFilter?: string;
}

export function Members({ onSelectMember, initialFilter }: MembersPageProps) {
  const { store, currentGym } = useStore();
  const { success } = useToast();
  const currencySymbol = currentGym.settings.currencySymbol || '₹';

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [collectPaymentMember, setCollectPaymentMember] = useState<Member | null>(null);
  const [whatsAppMember, setWhatsAppMember] = useState<Member | null>(null);
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null);
  const [viewReceiptPayment, setViewReceiptPayment] = useState<PaymentRecord | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter || 'all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [trainerFilter, setTrainerFilter] = useState<string>('all');
  const [balanceFilter, setBalanceFilter] = useState<'all' | 'pending' | 'cleared'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'expiry' | 'join' | 'balance'>('join');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const members = store.getMembers();
  const plans = store.getPlans();
  const trainers = store.getTrainers();

  // Filter and sort members
  const filteredMembers = useMemo(() => {
    let result = [...members];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        m =>
          `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) ||
          m.memberCode.toLowerCase().includes(q) ||
          m.phone.includes(q) ||
          m.email.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(m => m.status === statusFilter);
    }

    // Plan filter
    if (planFilter !== 'all') {
      result = result.filter(m => m.currentPlanId === planFilter);
    }

    // Trainer filter
    if (trainerFilter !== 'all') {
      result = result.filter(m => m.primaryTrainerId === trainerFilter);
    }

    // Balance filter
    if (balanceFilter === 'pending') {
      result = result.filter(m => m.balanceDue > 0);
    } else if (balanceFilter === 'cleared') {
      result = result.filter(m => m.balanceDue === 0);
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      } else if (sortBy === 'expiry') {
        comparison = new Date(a.membershipEndDate).getTime() - new Date(b.membershipEndDate).getTime();
      } else if (sortBy === 'balance') {
        comparison = (a.balanceDue || 0) - (b.balanceDue || 0);
      } else {
        // join date
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [members, searchQuery, statusFilter, planFilter, trainerFilter, balanceFilter, sortBy, sortOrder]);

  // Paginated records
  const totalPages = Math.ceil(filteredMembers.length / pageSize) || 1;
  const paginatedMembers = filteredMembers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // CSV Export
  const handleExportCSV = () => {
    const headers = 'Member ID,First Name,Last Name,Phone,Email,Status,Plan,Start Date,End Date,Total Paid,Balance Due\n';
    const rows = filteredMembers
      .map(
        m =>
          `"${m.memberCode}","${m.firstName}","${m.lastName}","${m.phone}","${m.email}","${m.status}","${m.currentPlanName}","${m.membershipStartDate}","${m.membershipEndDate}",${m.totalPaid},${m.balanceDue}`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitmanage_members_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    success('CSV Exported', `Exported ${filteredMembers.length} members.`);
  };

  const handleDeleteMember = () => {
    if (!deleteMemberId) return;
    store.deleteMember(deleteMemberId);
    success('Member Archived', 'Member record removed from active roster.');
    setDeleteMemberId(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Member Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage profiles, active subscriptions, attendance health, and fee collection.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <UploadCloud className="w-4 h-4 text-slate-500" />
            <span>Bulk CSV Import</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setEditMember(null);
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add New Member</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar - Section 11 */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search member name, ID, phone, or email..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-emerald-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-emerald-500"
            >
              <option value="all">All Statuses ({members.length})</option>
              <option value="active">Active Members</option>
              <option value="expiring_soon">Expiring Soon (7d)</option>
              <option value="expired">Expired Members</option>
              <option value="paused">Paused / Frozen</option>
            </select>
          </div>

          {/* Plan Filter */}
          <div>
            <select
              value={planFilter}
              onChange={e => {
                setPlanFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-emerald-500"
            >
              <option value="all">All Plans</option>
              {plans.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Balance Filter */}
          <div>
            <select
              value={balanceFilter}
              onChange={e => {
                setBalanceFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-emerald-500"
            >
              <option value="all">All Balances</option>
              <option value="pending">Pending Fees Only</option>
              <option value="cleared">Zero Balance (Paid)</option>
            </select>
          </div>
        </div>

        {/* Sorting and Active Count Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>
            Showing <strong className="text-slate-900 dark:text-white">{filteredMembers.length}</strong> matching members
          </span>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Sort By:</span>
            <button
              type="button"
              onClick={() => {
                setSortBy('name');
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              }}
              className={`px-2 py-1 rounded-lg border text-xs font-semibold ${
                sortBy === 'name' ? 'border-emerald-500 text-emerald-600' : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              type="button"
              onClick={() => {
                setSortBy('expiry');
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              }}
              className={`px-2 py-1 rounded-lg border text-xs font-semibold ${
                sortBy === 'expiry' ? 'border-emerald-500 text-emerald-600' : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              Expiry {sortBy === 'expiry' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              type="button"
              onClick={() => {
                setSortBy('balance');
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              }}
              className={`px-2 py-1 rounded-lg border text-xs font-semibold ${
                sortBy === 'balance' ? 'border-emerald-500 text-emerald-600' : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              Balance Due {sortBy === 'balance' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Member</th>
                <th className="py-3.5 px-3">Contact</th>
                <th className="py-3.5 px-3">Plan / Validity</th>
                <th className="py-3.5 px-3">Trainer</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Engagement</th>
                <th className="py-3.5 px-3">Balance</th>
                <th className="py-3.5 px-4 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedMembers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No members match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedMembers.map(member => {
                  const risk = calculateMemberRiskScore(member);
                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Member Info */}
                      <td className="py-3.5 px-4">
                        <div
                          onClick={() => onSelectMember(member.id)}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 font-black text-xs flex items-center justify-center shrink-0">
                            {member.avatarUrl ? (
                              <img src={member.avatarUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              `${member.firstName[0]}${member.lastName[0]}`
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors block">
                              {member.firstName} {member.lastName}
                            </span>
                            <span className="font-mono text-slate-400 text-[11px] block">
                              {member.memberCode}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-3">
                        <span className="font-mono text-slate-700 dark:text-slate-300 block">
                          {member.phone}
                        </span>
                        <span className="text-slate-400 text-[11px] truncate block max-w-[140px]">
                          {member.email}
                        </span>
                      </td>

                      {/* Plan / Validity */}
                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-slate-900 dark:text-white block">
                          {member.currentPlanName}
                        </span>
                        <span className="text-slate-400 text-[11px] block">
                          Expires: {formatDate(member.membershipEndDate)}
                        </span>
                      </td>

                      {/* Trainer */}
                      <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">
                        {member.primaryTrainerName || (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <StatusBadge status={member.status} />
                      </td>

                      {/* Risk / Engagement */}
                      <td className="py-3.5 px-3">
                        <RiskBadge risk={risk} />
                      </td>

                      {/* Balance Due */}
                      <td className="py-3.5 px-3">
                        {member.balanceDue > 0 ? (
                          <span className="font-bold text-amber-600 dark:text-amber-400 block">
                            {formatCurrency(member.balanceDue, currencySymbol)}
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-medium text-[11px]">Paid Full</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* WhatsApp trigger */}
                          <button
                            type="button"
                            onClick={() => setWhatsAppMember(member)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                            title="Send WhatsApp Message"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>

                          {/* Collect payment trigger */}
                          <button
                            type="button"
                            onClick={() => setCollectPaymentMember(member)}
                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
                            title="Record Payment"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>

                          {/* View profile */}
                          <button
                            type="button"
                            onClick={() => onSelectMember(member.id)}
                            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="View Full Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit member */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditMember(member);
                              setShowAddModal(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit Member"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete / Archive */}
                          <button
                            type="button"
                            onClick={() => setDeleteMemberId(member.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title="Archive Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddMemberModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditMember(null);
        }}
        editMember={editMember}
        onSuccess={member => {
          // Open receipt if newly registered with payment
          const lastPayment = store.getPaymentsByMember(member.id)[0];
          if (lastPayment && !editMember) {
            setViewReceiptPayment(lastPayment);
          }
        }}
      />

      <BulkImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportCompleted={() => {
          // refresh handled automatically by useStore reactivity
        }}
      />

      <CollectPaymentModal
        isOpen={!!collectPaymentMember}
        onClose={() => setCollectPaymentMember(null)}
        member={collectPaymentMember}
        onPaymentSuccess={payment => {
          setViewReceiptPayment(payment);
        }}
      />

      <WhatsAppModal
        isOpen={!!whatsAppMember}
        onClose={() => setWhatsAppMember(null)}
        member={whatsAppMember}
      />

      <PaymentReceiptModal
        isOpen={!!viewReceiptPayment}
        onClose={() => setViewReceiptPayment(null)}
        payment={viewReceiptPayment}
        gym={currentGym}
      />

      <ConfirmDialog
        isOpen={!!deleteMemberId}
        onClose={() => setDeleteMemberId(null)}
        onConfirm={handleDeleteMember}
        title="Archive Member"
        message="Are you sure you want to archive this member? Their attendance and payment records will be preserved."
        confirmText="Archive Member"
        variant="danger"
      />
    </div>
  );
}
