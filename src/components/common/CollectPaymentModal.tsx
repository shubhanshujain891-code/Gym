import React, { useState, useEffect } from 'react';
import { Member, PaymentMethod, PaymentRecord } from '../../types';
import { Modal } from './Modal';
import { store } from '../../services/store';
import { useToast } from './Toast';
import { formatCurrency, createWhatsAppLink, formatDate } from '../../utils/formatters';
import { CreditCard, CheckCircle2, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CollectPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  member?: Member | null;
  onPaymentSuccess?: (payment: PaymentRecord) => void;
}

export function CollectPaymentModal({
  isOpen,
  onClose,
  member: initialMember,
  onPaymentSuccess,
}: CollectPaymentModalProps) {
  const { success, error } = useToast();
  const gym = store.getCurrentGym();
  const members = store.getMembers();
  const currencySymbol = gym.settings.currencySymbol || '₹';

  const [selectedMemberId, setSelectedMemberId] = useState<string>(initialMember?.id || '');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [sendWhatsApp, setSendWhatsApp] = useState(true);

  const activeMember = members.find(m => m.id === selectedMemberId) || initialMember || null;

  useEffect(() => {
    if (initialMember) {
      setSelectedMemberId(initialMember.id);
      setAmount(initialMember.balanceDue > 0 ? initialMember.balanceDue : 1500);
    } else if (members.length > 0 && !selectedMemberId) {
      setSelectedMemberId(members[0].id);
      setAmount(members[0].balanceDue > 0 ? members[0].balanceDue : 1500);
    }
  }, [initialMember, isOpen]);

  useEffect(() => {
    if (activeMember) {
      setAmount(activeMember.balanceDue > 0 ? activeMember.balanceDue : 1500);
    }
  }, [selectedMemberId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMember) {
      error('Error', 'Please select a member.');
      return;
    }
    if (amount <= 0) {
      error('Error', 'Payment amount must be greater than zero.');
      return;
    }

    try {
      const payment = store.recordPayment({
        memberId: activeMember.id,
        amount: Number(amount),
        paymentMethod,
        referenceNumber,
        notes,
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });

      success('Payment Recorded!', `Receipt ${payment.receiptNumber} created for ${formatCurrency(amount, currencySymbol)}`);

      if (sendWhatsApp && activeMember.phone) {
        const msg = `Hi ${activeMember.firstName}! We received your payment of ${formatCurrency(payment.amount, currencySymbol)} for ${payment.planName} at ${gym.name}. Receipt: ${payment.receiptNumber}. Remaining balance: ${formatCurrency(payment.balanceRemaining, currencySymbol)}. Thank you!`;
        const link = createWhatsAppLink(activeMember.whatsappNumber || activeMember.phone, msg);
        window.open(link, '_blank');
      }

      if (onPaymentSuccess) {
        onPaymentSuccess(payment);
      }
      onClose();
    } catch (err: any) {
      error('Payment Failed', err.message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Collect Member Payment" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Member selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Member *
          </label>
          {initialMember ? (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 dark:text-white">
                  {initialMember.firstName} {initialMember.lastName}
                </span>
                <span className="font-mono text-slate-400 block text-[11px]">{initialMember.memberCode}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 text-[11px]">Outstanding Due</span>
                <span className="font-bold text-amber-600 block">
                  {formatCurrency(initialMember.balanceDue, currencySymbol)}
                </span>
              </div>
            </div>
          ) : (
            <select
              value={selectedMemberId}
              onChange={e => setSelectedMemberId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.firstName} {m.lastName} ({m.memberCode}) — Due: {formatCurrency(m.balanceDue, currencySymbol)}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Amount */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Payment Amount ({currencySymbol}) *
            </label>
            {activeMember && activeMember.balanceDue > 0 && (
              <button
                type="button"
                onClick={() => setAmount(activeMember.balanceDue)}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                Clear Full Balance ({formatCurrency(activeMember.balanceDue, currencySymbol)})
              </button>
            )}
          </div>
          <input
            type="number"
            min="1"
            required
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-emerald-600 dark:text-emerald-400 focus:outline-emerald-500"
          />
        </div>

        {/* Method */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Payment Mode *
          </label>
          <select
            value={paymentMethod}
            onChange={e => setPaymentMethod(e.target.value as any)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
          >
            <option value="upi">UPI (GPay / PhonePe / Paytm / QR)</option>
            <option value="cash">Cash</option>
            <option value="card">Card (POS / Debit / Credit)</option>
            <option value="bank_transfer">Net Banking / IMPS / NEFT</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Reference */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Transaction Reference / UTR Number
          </label>
          <input
            type="text"
            value={referenceNumber}
            onChange={e => setReferenceNumber(e.target.value)}
            placeholder="e.g. UPI Ref: 31248912389"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500 font-mono"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Receipt Notes
          </label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Installment 1 of 2 or Renewed with bonus session"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
          />
        </div>

        {/* WhatsApp checkbox */}
        <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={sendWhatsApp}
            onChange={e => setSendWhatsApp(e.target.checked)}
            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
          />
          <div className="text-xs">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
              Send instant receipt to member on WhatsApp
            </span>
            <span className="text-slate-400 block text-[11px]">
              Opens WhatsApp with pre-filled payment confirmation
            </span>
          </div>
        </label>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <CreditCard className="w-4 h-4" />
            <span>RECORD PAYMENT</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
