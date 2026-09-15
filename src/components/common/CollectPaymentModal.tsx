import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Member, Gym, PaymentMethod } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { useStore } from '../../hooks/useStore';
import { User, CreditCard } from 'lucide-react';

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
  const members = store.getMembers();

  const [selectedMemberId, setSelectedMemberId] = useState<string>(member?.id || members[0]?.id || '');
  const activeMember = members.find((m) => m.id === selectedMemberId) || member || members[0];

  const [amount, setAmount] = useState<number>(activeMember?.balanceDue || 1000);
  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  // Update selected member when prop changes
  useEffect(() => {
    if (member) {
      setSelectedMemberId(member.id);
      setAmount(member.balanceDue > 0 ? member.balanceDue : 1000);
    } else if (members.length > 0) {
      setSelectedMemberId(members[0].id);
      setAmount(members[0].balanceDue > 0 ? members[0].balanceDue : 1000);
    }
  }, [member, members]);

  // When selectedMemberId changes in dropdown
  const handleMemberChange = (id: string) => {
    setSelectedMemberId(id);
    const m = members.find((item) => item.id === id);
    if (m) {
      setAmount(m.balanceDue > 0 ? m.balanceDue : 1000);
    }
  };

  if (!isOpen) return null;
  if (!activeMember) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Collect Payment" maxWidth="md">
        <div className="p-6 text-center text-slate-500">
          No members registered yet. Please add a member first.
        </div>
      </Modal>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !activeMember) return;

    const payment = store.recordPayment({
      memberId: activeMember.id,
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
    <Modal isOpen={isOpen} onClose={onClose} title="Collect Payment & Issue Receipt" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Member Selector / Display */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
            Select Member
          </label>
          <select
            value={selectedMemberId}
            onChange={(e) => handleMemberChange(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white font-medium text-slate-800"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.firstName} {m.lastName} ({m.memberCode}) — Balance:{' '}
                {formatCurrency(m.balanceDue, gym.settings.currencySymbol)}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
          <div>
            <span className="font-bold text-slate-800">
              {activeMember.firstName} {activeMember.lastName}
            </span>
            <span className="text-[11px] text-slate-500 block">
              {activeMember.memberCode} • {activeMember.currentPlanName || 'Standard Plan'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Balance Due</span>
            <span className={`font-bold ${activeMember.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {formatCurrency(activeMember.balanceDue, gym.settings.currencySymbol)}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
            Amount to Collect ({gym.settings.currencySymbol}) *
          </label>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-base font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
            Payment Mode
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['upi', 'cash', 'card', 'bank_transfer'] as PaymentMethod[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`py-2 px-1 text-[11px] font-semibold rounded-lg border uppercase transition ${
                  method === m
                    ? 'bg-slate-950 text-lime-400 border-slate-950 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {m.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
            Reference / UTR / Transaction ID (Optional)
          </label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g. UPI-9876543210 or POS slip #"
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
            Notes / Receipt Narration
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Monthly renewal, cash at desk, etc."
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="pt-2 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition shadow-xs flex items-center justify-center gap-1.5"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Confirm & Generate Receipt</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
