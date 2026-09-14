import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { useStore } from '../../hooks/useStore';
import { Member } from '../../types';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (member: Member) => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const store = useStore();
  const plans = store.getPlans();
  const trainers = store.getTrainers();
  const gym = store.getActiveGym();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [address, setAddress] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [planId, setPlanId] = useState(plans[0]?.id || '');
  const [trainerId, setTrainerId] = useState('');
  const [discount, setDiscount] = useState(0);
  const [initialPaid, setInitialPaid] = useState(0);

  // Set default initial price when plan selected
  const selectedPlan = plans.find((p) => p.id === planId) || plans[0];
  const planPrice = selectedPlan ? selectedPlan.price : 0;
  const finalAmount = Math.max(0, planPrice - discount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !phone.trim()) return;

    const startDate = new Date();
    const duration = selectedPlan ? selectedPlan.durationMonths : 1;
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + duration);

    const trainer = trainers.find((t) => t.id === trainerId);
    const balanceDue = Math.max(0, finalAmount - initialPaid);

    const newMember = store.addMember({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      gender,
      address: address.trim() || undefined,
      emergencyContactName: emergencyName.trim() || undefined,
      emergencyContactPhone: emergencyPhone.trim() || undefined,
      currentPlanId: selectedPlan?.id,
      currentPlanName: selectedPlan?.name,
      membershipStartDate: startDate.toISOString().split('T')[0],
      membershipEndDate: endDate.toISOString().split('T')[0],
      durationMonths: duration,
      membershipPrice: planPrice,
      discount,
      finalAmount,
      totalPaid: initialPaid,
      balanceDue,
      primaryTrainerId: trainer?.id,
      primaryTrainerName: trainer?.name,
      status: 'active',
      isArchived: false,
    });

    if (onSuccess) onSuccess(newMember);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register New Member" maxWidth="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Personal Details */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">First Name *</label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. Rahul"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. Sharma"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Phone *</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="+91 98765 00000"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="member@example.com"
            />
          </div>
        </div>

        {/* Plan & Trainer */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Membership Plan</label>
            <select
              value={planId}
              onChange={(e) => {
                setPlanId(e.target.value);
                const pl = plans.find((p) => p.id === e.target.value);
                if (pl) setInitialPaid(pl.price);
              }}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.durationMonths} mo - {gym.settings.currencySymbol}{p.price})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Assign Trainer (Optional)</label>
            <select
              value={trainerId}
              onChange={(e) => setTrainerId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">No trainer assigned</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.specialization})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Financials */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-3 gap-3">
          <div>
            <span className="text-xs text-slate-500 block">Plan Price</span>
            <span className="text-sm font-bold text-slate-800">
              {gym.settings.currencySymbol}{planPrice}
            </span>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-0.5">Discount</label>
            <input
              type="number"
              min="0"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-0.5">Initial Payment</label>
            <input
              type="number"
              min="0"
              value={initialPaid}
              onChange={(e) => setInitialPaid(Number(e.target.value))}
              className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white font-bold text-emerald-700"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition shadow-xs"
          >
            Save & Generate Member Code
          </button>
        </div>
      </form>
    </Modal>
  );
};
