import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { store } from '../../services/store';
import { Search, User, CreditCard, Dumbbell, ArrowRight } from 'lucide-react';
import { StatusBadge } from '../common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMember: (memberId: string) => void;
  onSelectPayment?: (paymentId: string) => void;
  onSelectTrainer?: (trainerId: string) => void;
}

export function GlobalSearchModal({
  isOpen,
  onClose,
  onSelectMember,
  onSelectPayment,
  onSelectTrainer,
}: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const members = store.getMembers();
  const payments = store.getPayments();
  const trainers = store.getTrainers();
  const gym = store.getCurrentGym();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  const cleanQ = query.trim().toLowerCase();

  const matchingMembers = cleanQ
    ? members.filter(
        m =>
          `${m.firstName} ${m.lastName}`.toLowerCase().includes(cleanQ) ||
          m.memberCode.toLowerCase().includes(cleanQ) ||
          m.phone.includes(cleanQ) ||
          m.email.toLowerCase().includes(cleanQ)
      ).slice(0, 6)
    : [];

  const matchingPayments = cleanQ
    ? payments.filter(
        p =>
          p.receiptNumber.toLowerCase().includes(cleanQ) ||
          p.memberName.toLowerCase().includes(cleanQ) ||
          (p.referenceNumber && p.referenceNumber.toLowerCase().includes(cleanQ))
      ).slice(0, 4)
    : [];

  const matchingTrainers = cleanQ
    ? trainers.filter(
        t =>
          t.name.toLowerCase().includes(cleanQ) ||
          t.specialization.toLowerCase().includes(cleanQ) ||
          t.phone.includes(cleanQ)
      ).slice(0, 4)
    : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Global Search" maxWidth="lg">
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            autoFocus
            placeholder="Search members, phone, ID, payments, trainers... (e.g. Rahul, FIT-000001, UPI)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
          />
        </div>

        {!cleanQ ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Type to search immediately across all members, receipts, and trainers.
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            {/* Members results */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Members ({matchingMembers.length})
              </span>
              {matchingMembers.length === 0 ? (
                <p className="text-xs text-slate-400 py-1">No members found</p>
              ) : (
                <div className="space-y-1.5">
                  {matchingMembers.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        onSelectMember(m.id);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-left bg-slate-50 dark:bg-slate-800/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-100 dark:border-slate-800 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold text-xs">
                          {m.firstName[0]}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {m.firstName} {m.lastName}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {m.memberCode} • {m.phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={m.status} />
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Payments results */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Payments & Receipts ({matchingPayments.length})
              </span>
              {matchingPayments.length > 0 && (
                <div className="space-y-1.5">
                  {matchingPayments.map(p => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <CreditCard className="w-4 h-4 text-emerald-500" />
                        <div>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {p.receiptNumber}
                          </span>
                          <p className="text-[11px] text-slate-400">
                            {p.memberName} • {formatDate(p.paymentDate)}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(p.amount, gym.settings.currencySymbol)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Trainers results */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Trainers ({matchingTrainers.length})
              </span>
              {matchingTrainers.length > 0 && (
                <div className="space-y-1.5">
                  {matchingTrainers.map(t => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <Dumbbell className="w-4 h-4 text-sky-500" />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {t.name}
                          </span>
                          <p className="text-[11px] text-slate-400">{t.specialization}</p>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">{t.phone}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
