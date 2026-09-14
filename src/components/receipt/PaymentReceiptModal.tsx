import React, { useRef } from 'react';
import { PaymentRecord, Gym } from '../../types';
import { Modal } from '../common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Printer, Download, Share2, CheckCircle2 } from 'lucide-react';
import { useToast } from '../common/Toast';

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentRecord | null;
  gym: Gym;
}

export function PaymentReceiptModal({
  isOpen,
  onClose,
  payment,
  gym,
}: PaymentReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const { success } = useToast();

  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Payment Receipt - ${payment.receiptNumber}`,
        text: `FitManage Payment Receipt ${payment.receiptNumber} of ${formatCurrency(payment.amount, gym.settings.currencySymbol)} for ${payment.memberName}`,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `FitManage Receipt ${payment.receiptNumber}\nMember: ${payment.memberName} (${payment.memberCode})\nAmount: ${formatCurrency(payment.amount, gym.settings.currencySymbol)}\nPlan: ${payment.planName}\nDate: ${formatDate(payment.paymentDate)}\nBalance Remaining: ${formatCurrency(payment.balanceRemaining, gym.settings.currencySymbol)}`
      );
      success('Receipt copied to clipboard!');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment Receipt" maxWidth="md">
      <div className="space-y-6">
        {/* Printable Paper Card */}
        <div
          ref={receiptRef}
          id="printable-receipt"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs text-slate-800 dark:text-slate-100"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
            <div className="space-y-1">
              <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                {gym.name}
              </h2>
              <p className="text-xs text-slate-500 max-w-xs">{gym.settings.address}</p>
              <p className="text-xs text-slate-500">Phone: {gym.settings.phone}</p>
              {gym.settings.gstNumber && (
                <p className="text-[11px] text-slate-400">GSTIN: {gym.settings.gstNumber}</p>
              )}
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
                Paid Receipt
              </span>
              <p className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mt-2">
                {payment.receiptNumber}
              </p>
              <p className="text-[11px] text-slate-400">{formatDate(payment.paymentDate)}</p>
            </div>
          </div>

          {/* Member Details */}
          <div className="py-4 border-b border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 uppercase text-[10px] tracking-wider block">Billed To</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{payment.memberName}</p>
              <p className="text-slate-500 font-mono text-[11px]">{payment.memberCode}</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase text-[10px] tracking-wider block">Payment Details</span>
              <p className="font-semibold capitalize mt-0.5 text-slate-800 dark:text-slate-200">
                Method: {(payment.paymentMethod || 'cash').replace('_', ' ')}
              </p>
              {payment.referenceNumber && (
                <p className="text-slate-500 text-[11px] font-mono">Ref: {payment.referenceNumber}</p>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="py-4 border-b border-slate-100 dark:border-slate-800">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-400 uppercase text-[10px] border-b border-slate-100 dark:border-slate-800 pb-2">
                  <th className="text-left font-semibold pb-2">Description</th>
                  <th className="text-right font-semibold pb-2">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                <tr>
                  <td className="py-3 font-medium text-slate-900 dark:text-white">
                    {payment.planName} Membership
                    {payment.notes && (
                      <span className="block text-[11px] text-slate-400 font-normal mt-0.5">
                        {payment.notes}
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right font-bold text-slate-900 dark:text-white">
                    {formatCurrency(payment.amount, gym.settings.currencySymbol)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="pt-4 space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-slate-500">
              <span>Amount Paid</span>
              <span className="font-bold text-base text-emerald-600 dark:text-emerald-400">
                {formatCurrency(payment.amount, gym.settings.currencySymbol)}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span>Balance Remaining</span>
              <span className={`font-semibold ${payment.balanceRemaining > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                {formatCurrency(payment.balanceRemaining, gym.settings.currencySymbol)}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-400 text-[11px] pt-1">
              <span>Collected By</span>
              <span>{payment.collectedByUserName}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-dashed border-slate-200 dark:border-slate-800 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-emerald-600 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Official Computer Generated Receipt</span>
            </div>
            <p className="text-xs text-slate-500">Thank you for choosing our gym.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-medium text-sm transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-sm transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
