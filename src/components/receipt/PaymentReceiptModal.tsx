import React from 'react';
import { Modal } from '../common/Modal';
import { PaymentRecord, Gym } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Printer, CheckCircle2, Download } from 'lucide-react';

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentRecord | null;
  gym: Gym;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  isOpen,
  onClose,
  payment,
  gym,
}) => {
  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment Receipt" maxWidth="lg">
      <div className="space-y-6" id="printable-receipt">
        {/* Header */}
        <div className="text-center pb-4 border-b border-slate-100">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mb-2">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">{gym.name}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{gym.address}</p>
          <p className="text-xs text-slate-500">Phone: {gym.phone} | Email: {gym.email}</p>
          <div className="mt-3 inline-block px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-700">
            Receipt: {payment.receiptNumber}
          </div>
        </div>

        {/* Member & Details */}
        <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <span className="text-xs text-slate-400 block uppercase font-medium">Billed To</span>
            <p className="font-semibold text-slate-800 mt-0.5">{payment.memberName}</p>
            <p className="text-xs text-slate-500">ID: {payment.memberCode}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 block uppercase font-medium">Payment Info</span>
            <p className="font-semibold text-slate-800 mt-0.5">Date: {formatDate(payment.paymentDate)}</p>
            <p className="text-xs text-slate-500">Mode: {payment.paymentMethod.toUpperCase()}</p>
          </div>
        </div>

        {/* Breakdown */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-600 text-xs font-semibold">
              <tr>
                <th className="px-4 py-2.5 text-left">Description</th>
                <th className="px-4 py-2.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800">{payment.planName || 'Gym Membership Fee'}</div>
                  {payment.notes && <div className="text-xs text-slate-400">{payment.notes}</div>}
                </td>
                <td className="px-4 py-3 text-right font-bold text-slate-900">
                  {formatCurrency(payment.amount, gym.settings.currencySymbol)}
                </td>
              </tr>
              {payment.balanceRemaining > 0 && (
                <tr className="bg-rose-50/50 text-rose-700">
                  <td className="px-4 py-2 text-xs font-medium">Remaining Balance Due</td>
                  <td className="px-4 py-2 text-right text-xs font-bold">
                    {formatCurrency(payment.balanceRemaining, gym.settings.currencySymbol)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="text-center text-xs text-slate-400">
          Collected By: {payment.collectedByUserName || 'Staff'} • Computer Generated Receipt
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
