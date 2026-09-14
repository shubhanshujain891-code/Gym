import React, { useState, useMemo } from 'react';
import { useStore } from '../../hooks/useStore';
import { PaymentRecord, PaymentMethod, Member } from '../../types';
import { formatCurrency, formatDate, createWhatsAppLink } from '../../utils/formatters';
import { CollectPaymentModal } from '../../components/common/CollectPaymentModal';
import { PaymentReceiptModal } from '../../components/receipt/PaymentReceiptModal';
import { useToast } from '../../components/common/Toast';
import {
  CreditCard,
  Search,
  Download,
  Receipt,
  MessageSquare,
  Plus,
  DollarSign,
  TrendingUp,
  Clock,
  Printer,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface PaymentsPageProps {
  onSelectMember: (memberId: string) => void;
}

export function Payments({ onSelectMember }: PaymentsPageProps) {
  const { store, currentGym } = useStore();
  const { success } = useToast();
  const currencySymbol = currentGym.settings.currencySymbol || '₹';

  const payments = store.getPayments();
  const members = store.getMembers();

  // Modals
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Metrics
  const totalRevenue = useMemo(() => {
    return payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const totalPendingFees = useMemo(() => {
    return members.reduce((sum, m) => sum + (m.balanceDue || 0), 0);
  }, [members]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayCollections = useMemo(() => {
    return payments
      .filter(p => p.paymentDate === todayStr && p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments, todayStr]);

  // Filtered payments
  const filteredPayments = useMemo(() => {
    let list = [...payments];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        p =>
          p.receiptNumber.toLowerCase().includes(q) ||
          p.memberName.toLowerCase().includes(q) ||
          (p.referenceNumber && p.referenceNumber.toLowerCase().includes(q))
      );
    }

    if (methodFilter !== 'all') {
      list = list.filter(p => p.paymentMethod === methodFilter);
    }

    return list.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  }, [payments, searchQuery, methodFilter]);

  const totalPages = Math.ceil(filteredPayments.length / pageSize) || 1;
  const paginatedPayments = filteredPayments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExportCSV = () => {
    const header = 'Receipt No,Member ID,Member Name,Plan,Amount,Method,Reference,Date,Balance Remaining\n';
    const rows = filteredPayments
      .map(
        p =>
          `"${p.receiptNumber}","${p.memberCode}","${p.memberName}","${p.planName}",${p.amount},"${p.paymentMethod}","${p.referenceNumber || ''}","${p.paymentDate}",${p.balanceRemaining}`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitmanage_payments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    success('Exported Payments', `Downloaded ${filteredPayments.length} payment records.`);
  };

  const handleSendWhatsAppReceipt = (p: PaymentRecord) => {
    const mem = members.find(m => m.id === p.memberId);
    if (!mem || !mem.phone) {
      success('Receipt copied to clipboard!');
      return;
    }
    const msg = `Hi ${p.memberName}! Payment receipt ${p.receiptNumber} of ${formatCurrency(p.amount, currencySymbol)} confirmed for ${p.planName} at ${currentGym.name}. Remaining balance: ${formatCurrency(p.balanceRemaining, currencySymbol)}. Thank you!`;
    const link = createWhatsAppLink(mem.whatsappNumber || mem.phone, msg);
    window.open(link, '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Payments & Receipts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit trail of membership fees, payment receipts, outstanding balances, and daily collections.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
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
            onClick={() => setShowCollectModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Collect Payment</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards - Section 16 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Revenue
          </span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(totalRevenue, currencySymbol)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">{payments.length} transactions recorded</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Pending Due
          </span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {formatCurrency(totalPendingFees, currencySymbol)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Across all member balances</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Today's Inflow
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(todayCollections, currencySymbol)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(todayStr)}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Average Ticket
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(
              payments.length > 0 ? Math.round(totalRevenue / payments.length) : 0,
              currencySymbol
            )}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Per membership receipt</p>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search receipt number, member name, or UPI reference..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-emerald-500"
            />
          </div>

          <div>
            <select
              value={methodFilter}
              onChange={e => {
                setMethodFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-emerald-500"
            >
              <option value="all">All Payment Methods</option>
              <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
              <option value="cash">Cash</option>
              <option value="card">Card (POS)</option>
              <option value="bank_transfer">Net Banking / IMPS</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment Records Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Receipt #</th>
                <th className="py-3.5 px-3">Member</th>
                <th className="py-3.5 px-3">Plan</th>
                <th className="py-3.5 px-3">Amount</th>
                <th className="py-3.5 px-3">Payment Mode</th>
                <th className="py-3.5 px-3">Date</th>
                <th className="py-3.5 px-3">Remaining Balance</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                paginatedPayments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {p.receiptNumber}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        onClick={() => onSelectMember(p.memberId)}
                        className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 cursor-pointer block"
                      >
                        {p.memberName}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{p.memberCode}</span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300">{p.planName}</td>
                    <td className="py-3.5 px-3 font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatCurrency(p.amount, currencySymbol)}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase font-mono text-[10px] font-bold">
                        {(p.paymentMethod || 'cash').replace('_', ' ')}
                      </span>
                      {p.referenceNumber && (
                        <span className="block text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[120px]">
                          Ref: {p.referenceNumber}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500">{formatDate(p.paymentDate)}</td>
                    <td className="py-3.5 px-3">
                      {p.balanceRemaining > 0 ? (
                        <span className="font-bold text-amber-600">
                          {formatCurrency(p.balanceRemaining, currencySymbol)}
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-medium">Nil</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedReceipt(p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                        >
                          <Receipt className="w-3.5 h-3.5 text-slate-500" />
                          <span>Receipt</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendWhatsAppReceipt(p)}
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                          title="Share via WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredPayments.length)} of {filteredPayments.length} receipts
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Collect payment modal */}
      <CollectPaymentModal
        isOpen={showCollectModal}
        onClose={() => setShowCollectModal(false)}
        onPaymentSuccess={payment => {
          setSelectedReceipt(payment);
        }}
      />

      {/* Receipt View Modal */}
      <PaymentReceiptModal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        payment={selectedReceipt}
        gym={currentGym}
      />
    </div>
  );
}
