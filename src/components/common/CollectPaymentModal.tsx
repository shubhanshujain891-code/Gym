import React, { useState } from 'react';
import { Modal } from './Modal';
import { Member, Gym, PaymentMethod } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { useStore } from '../../hooks/useStore';

interface CollectPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onPaymentSuccess?: (payment: any) => void;
}

export const CollectPaymentModal: React.FC<CollectPaymentModalProps> = ({
  isOpen,
  onClose,
  member,
  onPaymentSuccess,
}) => {
  const store = useStore();
  const gym = store.getActiveGym();

  const [amount, setAmount] = useState<number>(member?.balanceDue || 0);
  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  // Update default amount when member changes
  React.useEffect(() => {
    if (member) {
      setAmount(member.balanceDue > 0 ? member.balanceDue : 1000);
    }
  }, [member]);

  if (!member) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    const payment = store.recordPayment({
      memberId: member.id,
      amount,
      paymentMethod: method,
      referenceNumber: reference.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    if (onPaymentSuccess) {
      onPaymentSuccess(payment);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Collect Payment" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex justify-between items-center text-sm">
          <div>
            <span className="font-semibold text-slate-800">{member.firstName} {member.lastName}</span>
            <span className="text-xs text-slate-500 block">{member.memberCode} • {member.currentPlanName || 'Standard Plan'}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Balance Due</span>
            <span className="font-bold text-rose-600">
              {formatCurrency(member.balanceDue, gym.settings.currencySymbol)}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Amount to Collect ({gym.settings.currencySymbol})</label>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-lg font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Payment Method</label>
          <div className="grid grid-cols-4 gap-2">
            {(['upi', 'cash', 'card', 'bank_transfer'] as PaymentMethod[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`py-2 px-1 text-xs font-semibold rounded-lg border uppercase transition ${
                  method === m
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Reference / UTR Number (Optional)</label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g. UPI-9876543210 or POS transaction ID"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Notes</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Renewal fee, partial advance, etc."
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="pt-3 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition shadow-xs"
          >
            Confirm & Issue Receipt
          </button>
        </div>
      </form>
    </Modal>
  );
};
