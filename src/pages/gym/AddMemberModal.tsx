import React, { useState, useEffect } from 'react';
import { Member, MembershipPlan, Trainer, PaymentMethod } from '../../types';
import { Modal } from '../../components/common/Modal';
import { store } from '../../services/store';
import { useToast } from '../../components/common/Toast';
import { formatCurrency } from '../../utils/formatters';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (member: Member) => void;
  editMember?: Member | null;
}

export function AddMemberModal({
  isOpen,
  onClose,
  onSuccess,
  editMember,
}: AddMemberModalProps) {
  const { success, error } = useToast();
  const plans = store.getPlans().filter(p => p.isActive);
  const trainers = store.getTrainers().filter(t => t.status === 'active');
  const currentGym = store.getCurrentGym();
  const currencySymbol = currentGym.settings.currencySymbol || '₹';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [dateOfBirth, setDateOfBirth] = useState('1998-01-01');
  const [address, setAddress] = useState('');

  // Emergency contact
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Membership
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [discount, setDiscount] = useState<number>(0);
  const [totalPaid, setTotalPaid] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [paymentRef, setPaymentRef] = useState('');
  const [trainerId, setTrainerId] = useState('');
  const [notes, setNotes] = useState('');

  // Auto select plan
  useEffect(() => {
    if (plans.length > 0 && !selectedPlanId) {
      setSelectedPlanId(plans[0].id);
      setTotalPaid(plans[0].price);
    }
  }, [plans, selectedPlanId]);

  // Load existing member if editing
  useEffect(() => {
    if (editMember) {
      setFirstName(editMember.firstName);
      setLastName(editMember.lastName);
      setPhone(editMember.phone);
      setEmail(editMember.email);
      setGender(editMember.gender);
      setDateOfBirth(editMember.dateOfBirth || '1998-01-01');
      setAddress(editMember.address || '');
      setEmergencyName(editMember.emergencyContactName || '');
      setEmergencyRelation(editMember.emergencyContactRelation || '');
      setEmergencyPhone(editMember.emergencyContactPhone || '');
      setSelectedPlanId(editMember.currentPlanId || '');
      setStartDate(editMember.membershipStartDate);
      setDiscount(editMember.discount || 0);
      setTotalPaid(editMember.totalPaid);
      setTrainerId(editMember.primaryTrainerId || '');
      setNotes(editMember.notes || '');
    } else {
      // Reset form
      setFirstName('');
      setLastName('');
      setPhone('');
      setEmail('');
      setGender('male');
      setDateOfBirth('1998-01-01');
      setAddress('');
      setEmergencyName('');
      setEmergencyRelation('');
      setEmergencyPhone('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setDiscount(0);
      setPaymentRef('');
      setNotes('');
      if (plans.length > 0) {
        setSelectedPlanId(plans[0].id);
        setTotalPaid(plans[0].price);
      }
    }
  }, [editMember, isOpen]);

  const selectedPlan = plans.find(p => p.id === selectedPlanId);
  const planPrice = selectedPlan ? selectedPlan.price : 0;
  const finalAmount = Math.max(0, planPrice - discount);
  const balanceDue = Math.max(0, finalAmount - totalPaid);

  // Calculate expiry date automatically: START + DURATION
  const durationMonths = selectedPlan ? selectedPlan.durationMonths : 1;
  const calculatedExpiryDate = (() => {
    try {
      const d = new Date(startDate);
      d.setMonth(d.getMonth() + durationMonths);
      return d.toISOString().split('T')[0];
    } catch {
      return startDate;
    }
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      error('Validation error', 'Please enter member first and last name.');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      error('Validation error', 'Please enter a valid 10-digit phone number.');
      return;
    }
    if (!selectedPlan) {
      error('Validation error', 'Please select a valid membership plan.');
      return;
    }

    try {
      const selectedTrainer = trainers.find(t => t.id === trainerId);

      if (editMember) {
        const updated = store.updateMember(editMember.id, {
          firstName,
          lastName,
          phone,
          whatsappNumber: phone.replace(/\D/g, ''),
          email,
          gender,
          dateOfBirth,
          address,
          emergencyContactName: emergencyName,
          emergencyContactRelation: emergencyRelation,
          emergencyContactPhone: emergencyPhone,
          currentPlanId: selectedPlan.id,
          currentPlanName: selectedPlan.name,
          durationMonths: selectedPlan.durationMonths,
          membershipStartDate: startDate,
          membershipEndDate: calculatedExpiryDate,
          membershipPrice: planPrice,
          discount,
          finalAmount,
          totalPaid,
          balanceDue,
          primaryTrainerId: selectedTrainer?.id,
          primaryTrainerName: selectedTrainer?.name,
          notes,
        });
        success('Member Updated', `${firstName} ${lastName}'s profile has been updated.`);
        onSuccess(updated);
      } else {
        const created = store.createMember({
          firstName,
          lastName,
          gender,
          dateOfBirth,
          phone,
          whatsappNumber: phone.replace(/\D/g, ''),
          email: email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
          address,
          emergencyContactName: emergencyName,
          emergencyContactRelation: emergencyRelation,
          emergencyContactPhone: emergencyPhone,
          notes,
          referralSource: 'Direct / Walk-In',
          currentPlanId: selectedPlan.id,
          currentPlanName: selectedPlan.name,
          membershipStartDate: startDate,
          membershipEndDate: calculatedExpiryDate,
          durationMonths: selectedPlan.durationMonths,
          membershipPrice: planPrice,
          discount,
          finalAmount,
          totalPaid,
          balanceDue,
          primaryTrainerId: selectedTrainer?.id,
          primaryTrainerName: selectedTrainer?.name,
          status: 'active',
          initialPaymentMethod: paymentMethod,
          initialPaymentRef: paymentRef,
        });

        success('Member Registered!', `${created.firstName} ${created.lastName} registered with Member ID ${created.memberCode}`);
        onSuccess(created);
      }
      onClose();
    } catch (err: any) {
      error('Failed to save member', err.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editMember ? 'Edit Member Profile' : 'Register New Member'}
      subtitle="Complete member onboarding with auto-membership and receipt generation"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Personal Details */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            1. Personal Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="e.g. Rahul"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="e.g. Sharma"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mobile Phone *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98201 54321"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="rahul.sharma@example.com"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={e => setDateOfBirth(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Membership & Pricing */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            2. Membership Package & Dates
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Membership Plan *
              </label>
              <select
                value={selectedPlanId}
                onChange={e => {
                  setSelectedPlanId(e.target.value);
                  const p = plans.find(plan => plan.id === e.target.value);
                  if (p) setTotalPaid(p.price);
                }}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:outline-emerald-500"
              >
                {plans.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.durationMonths} Months) — {formatCurrency(p.price, currencySymbol)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
              />
            </div>
          </div>

          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500">Calculated Expiry Date:</span>
              <p className="font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                {calculatedExpiryDate} ({durationMonths} Months Duration)
              </p>
            </div>
            <div className="text-right">
              <span className="text-slate-500">Plan Base Price:</span>
              <p className="font-bold text-slate-900 dark:text-white">
                {formatCurrency(planPrice, currencySymbol)}
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Fee & Payment Collection */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            3. Fees & Initial Payment
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Discount ({currencySymbol})
              </label>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={e => setDiscount(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Amount Paid Today *
              </label>
              <input
                type="number"
                min="0"
                value={totalPaid}
                onChange={e => setTotalPaid(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-emerald-600 focus:outline-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
              >
                <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                <option value="cash">Cash</option>
                <option value="card">Card (POS / Debit / Credit)</option>
                <option value="bank_transfer">Bank Transfer (NEFT / IMPS)</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <span className="font-medium text-slate-600 dark:text-slate-300">Remaining Balance Due:</span>
            <span className={`font-bold text-sm ${balanceDue > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {formatCurrency(balanceDue, currencySymbol)}
            </span>
          </div>
        </div>

        {/* Section 4: Trainer Assignment & Emergency */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            4. Trainer & Emergency Contact
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assign Personal Trainer
              </label>
              <select
                value={trainerId}
                onChange={e => setTrainerId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
              >
                <option value="">No Trainer Assigned (Floor General)</option>
                {trainers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.specialization})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Emergency Contact Name
              </label>
              <input
                type="text"
                value={emergencyName}
                onChange={e => setEmergencyName(e.target.value)}
                placeholder="Parent / Spouse name"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            {editMember ? 'Update Member Profile' : 'Register & Generate Receipt'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
