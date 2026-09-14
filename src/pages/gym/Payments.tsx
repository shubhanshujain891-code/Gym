import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { PaymentRecord, Member } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PaymentReceiptModal } from '../../components/receipt/PaymentReceiptModal';
import {
  CreditCard,
  Search,
  Printer,
  Plus,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

interface PaymentsProps {
  onOpenCollectModal?: () => void;
}

export const Payments: React.FC<PaymentsProps> = ({ onOpenCollectModal }) => {
  const store = useStore();
  const gym = store.getActiveGym();
  const payments = store.getPayments();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);

  const filtered = payments.filter((p) =>
    p.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.memberCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Billing & Receipts</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-ready receipts and payment records for <span className="font-semibold">{gym.name}</span>
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl flex items-center gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-700 block">Total Revenue</span>
            <span className="text-lg font-black text-emerald-900">
              {formatCurrency(totalCollected, gym.settings.currencySymbol)}
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search receipt #, member name, or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Receipt No.</th>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Plan / Purpose</th>
                <th className="px-4 py-3">Amount & Mode</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-md text-[11px]">
                        {p.receiptNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-800">{p.memberName}</div>
                      <div className="text-[11px] text-slate-400">{p.memberCode}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-medium">
                      {p.planName || 'Membership Fee'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-slate-900 text-sm block">
                        {formatCurrency(p.amount, gym.settings.currencySymbol)}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-500">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {formatDate(p.paymentDate)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedPayment(p)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        <span>Print</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt View Modal */}
      {selectedPayment && (
        <PaymentReceiptModal
          isOpen={Boolean(selectedPayment)}
          onClose={() => setSelectedPayment(null)}
          payment={selectedPayment}
          gym={gym}
        />
      )}
    </div>
  );
};
