import React, { useState, useMemo } from 'react';
import { useStore } from '../../hooks/useStore';
import { Member, PaymentRecord } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { QRCodeSVG } from '../../components/qr/QRComponents';
import { PaymentReceiptModal } from '../../components/receipt/PaymentReceiptModal';
import { formatCurrency, formatDate, getDaysRemaining } from '../../utils/formatters';
import { useToast } from '../../components/common/Toast';
import {
  QrCode,
  Calendar,
  CreditCard,
  Dumbbell,
  Utensils,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Download,
  Share2,
  Flame,
  Check,
  Building2,
} from 'lucide-react';

interface MemberPortalProps {
  memberId?: string;
  onSwitchMember?: (id: string) => void;
}

export function MemberPortal({ memberId, onSwitchMember }: MemberPortalProps) {
  const { store, currentGym } = useStore();
  const { success } = useToast();
  const currencySymbol = currentGym.settings.currencySymbol || '₹';

  const members = store.getMembers();
  // Find current member or fallback to first active member
  const currentMember = useMemo(() => {
    if (memberId) {
      const found = members.find(m => m.id === memberId);
      if (found) return found;
    }
    return members.find(m => m.status === 'active') || members[0];
  }, [members, memberId]);

  const [activeTab, setActiveTab] = useState<'pass' | 'workout' | 'diet' | 'attendance' | 'payments' | 'progress'>('pass');
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null);
  const [checkedExercises, setCheckedExercises] = useState<Record<string, boolean>>({});

  if (!currentMember) {
    return (
      <div className="py-20 text-center text-slate-400">
        No active member records found. Please register a member first.
      </div>
    );
  }

  const payments = store.getPaymentsByMember(currentMember.id);
  const attendance = store.getAttendanceByMember(currentMember.id);
  const measurements = store.getMeasurements(currentMember.id);
  const workoutPlan = currentMember.assignedWorkoutPlanId
    ? store.getWorkoutById(currentMember.assignedWorkoutPlanId)
    : store.getWorkouts()[0];
  const dietPlan = currentMember.assignedDietPlanId
    ? store.getDietPlanById(currentMember.assignedDietPlanId)
    : store.getDietPlans()[0];

  const daysLeft = getDaysRemaining(currentMember.membershipEndDate);
  const attendancesThisMonth = attendance.length;

  const toggleExercise = (name: string) => {
    setCheckedExercises(prev => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleSimulatePayment = () => {
    if (currentMember.balanceDue <= 0) {
      success('No Balance Due', 'Your membership fees are fully settled!');
      return;
    }
    const rec = store.collectPayment({
      memberId: currentMember.id,
      amount: currentMember.balanceDue,
      paymentMethod: 'upi',
      referenceNumber: `UPI${Date.now().toString().slice(-8)}`,
      notes: 'Paid online via Member Pass Portal',
    });
    setSelectedReceipt(rec);
    success('Payment Confirmed!', `Received payment of ${formatCurrency(rec.amount, currencySymbol)}`);
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Top Switcher & Welcome Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-xs">
            {currentMember.avatarUrl ? (
              <img src={currentMember.avatarUrl} alt="" className="w-full h-full object-cover rounded-2xl" />
            ) : (
              `${currentMember.firstName[0]}${currentMember.lastName[0]}`
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 dark:text-white">
                Welcome back, {currentMember.firstName}!
              </h1>
              <StatusBadge status={currentMember.status} />
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Pass ID: {currentMember.memberCode} • Plan: {currentMember.currentPlanName}
            </p>
          </div>
        </div>

        {/* Member dropdown switcher for easy preview testing */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">View as:</span>
          <select
            value={currentMember.id}
            onChange={e => onSwitchMember?.(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
          >
            {members.map(m => (
              <option key={m.id} value={m.id}>
                {m.firstName} {m.lastName} ({m.memberCode})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expiry / Attention Notification */}
      {daysLeft <= 7 && daysLeft >= 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold">Membership Expiring Soon!</p>
              <p className="text-amber-700 dark:text-amber-300 text-[11px]">
                Your subscription ends in {daysLeft} days ({formatDate(currentMember.membershipEndDate)}).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSimulatePayment}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
          >
            Renew Now
          </button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('pass')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            activeTab === 'pass'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Digital Gym Pass</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('workout')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            activeTab === 'workout'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          <span>My Workout</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('diet')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            activeTab === 'diet'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>My Nutrition</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            activeTab === 'attendance'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Visits & Streak</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            activeTab === 'payments'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Receipts & Dues</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('progress')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            activeTab === 'progress'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Body Measurements</span>
        </button>
      </div>

      {/* Tab 1: Digital Membership Pass - Section 33 */}
      {activeTab === 'pass' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Component */}
          <div className="md:col-span-2">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-500/20 relative overflow-hidden">
              {/* Background ambient accents */}
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Gym branding */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div>
                  <h3 className="text-xl font-black tracking-tight">{currentGym.name}</h3>
                  <p className="text-[11px] text-emerald-400 font-medium">Official Digital Member Pass</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
              </div>

              {/* Main Pass Content */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* QR Code Container */}
                <div className="bg-white p-3.5 rounded-2xl shadow-lg shrink-0">
                  <QRCodeSVG value={currentMember.memberCode} size={140} />
                </div>

                {/* Member Meta */}
                <div className="flex-1 space-y-2.5 text-center sm:text-left">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Member Name
                    </span>
                    <h2 className="text-xl font-black">
                      {currentMember.firstName} {currentMember.lastName}
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Pass Code
                      </span>
                      <span className="font-mono font-bold text-emerald-300">
                        {currentMember.memberCode}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Plan Tier
                      </span>
                      <span className="font-semibold text-white">
                        {currentMember.currentPlanName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Validity Until
                      </span>
                      <span className="font-bold text-white">
                        {formatDate(currentMember.membershipEndDate)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Remaining
                      </span>
                      <span className="font-bold text-emerald-400">
                        {daysLeft} days active
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <span>Show this QR code at front desk optical scanner</span>
                <span className="font-mono">{currentGym.phone}</span>
              </div>
            </div>

            {/* Pass Actions */}
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => success('Pass Saved', 'Digital Pass downloaded to your device.')}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Save to Photos</span>
              </button>
              <button
                type="button"
                onClick={() => success('Pass Shared', 'Pass link generated.')}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <Share2 className="w-4 h-4 text-slate-500" />
                <span>Share Pass</span>
              </button>
            </div>
          </div>

          {/* Quick Member Overview Side Stats */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Fitness Snapshot
              </h4>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Current Streak
                  </span>
                </div>
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {attendance.length > 3 ? '4 Days 🔥' : '1 Day'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Visits This Month
                  </span>
                </div>
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {attendancesThisMonth} Sessions
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Fee Balance
                  </span>
                </div>
                <span
                  className={`text-sm font-black ${
                    currentMember.balanceDue > 0 ? 'text-amber-600' : 'text-emerald-600'
                  }`}
                >
                  {currentMember.balanceDue > 0
                    ? formatCurrency(currentMember.balanceDue, currencySymbol)
                    : 'Cleared'}
                </span>
              </div>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-3xl p-5 border border-emerald-100 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-200">
              <h4 className="font-bold flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                <Building2 className="w-4 h-4" />
                <span>Facility Access</span>
              </h4>
              <p className="mt-1.5 text-[11px] text-emerald-700 dark:text-emerald-400">
                You have unrestricted floor access to the Strength Area, Free Weights Zone, Cardio Deck, and Locker Rooms.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Assigned Workout Plan - Section 34 */}
      {activeTab === 'workout' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                  {workoutPlan?.goal.replace('_', ' ')}
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  {workoutPlan?.name || 'Full Body General Routine'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">{workoutPlan?.description}</p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block">Assigned Trainer</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {currentMember.primaryTrainerName || 'Floor Coach'}
                </span>
              </div>
            </div>

            {/* Daily Splits */}
            <div className="space-y-6 mt-6">
              {workoutPlan?.days.map((day, dIdx) => (
                <div
                  key={dIdx}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden"
                >
                  <div className="bg-slate-50 dark:bg-slate-800/60 px-4 py-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                        {day.dayName}
                      </h3>
                      <p className="text-[11px] text-slate-500">Focus: {day.focus}</p>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {day.exercises.length} Exercises
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {day.exercises.map((ex, eIdx) => {
                      const isChecked = !!checkedExercises[`${dIdx}-${eIdx}`];
                      return (
                        <div
                          key={eIdx}
                          onClick={() => toggleExercise(`${dIdx}-${eIdx}`)}
                          className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20'
                              : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                                isChecked
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'border-slate-300 dark:border-slate-600'
                              }`}
                            >
                              {isChecked && <Check className="w-3.5 h-3.5" />}
                            </div>
                            <div>
                              <p
                                className={`text-xs font-bold ${
                                  isChecked
                                    ? 'line-through text-slate-400'
                                    : 'text-slate-900 dark:text-white'
                                }`}
                              >
                                {ex.name}
                              </p>
                              <p className="text-[11px] text-slate-400 font-mono">
                                {ex.sets} Sets × {ex.reps} Reps • {ex.restSeconds}s rest
                              </p>
                            </div>
                          </div>

                          <span className="text-[11px] text-emerald-600 font-semibold">
                            {isChecked ? 'Completed' : 'Tap to Complete'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Diet Plan */}
      {activeTab === 'diet' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                  {dietPlan?.goal.replace('_', ' ')}
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  {dietPlan?.name || 'Custom Meal Plan'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">{dietPlan?.description}</p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block">Daily Target</span>
                <span className="font-black text-slate-900 dark:text-white text-lg">
                  {dietPlan?.caloriesTarget} kcal
                </span>
              </div>
            </div>

            {/* Macro summary */}
            <div className="grid grid-cols-3 gap-3 my-6">
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-600 block">Protein</span>
                <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5 block">
                  {dietPlan?.proteinGrams}g
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 text-center">
                <span className="text-[10px] uppercase font-bold text-sky-600 block">Carbohydrates</span>
                <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5 block">
                  {dietPlan?.carbsGrams}g
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 text-center">
                <span className="text-[10px] uppercase font-bold text-amber-600 block">Healthy Fats</span>
                <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5 block">
                  {dietPlan?.fatsGrams}g
                </span>
              </div>
            </div>

            {/* Meals List */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Daily Meal Timeline
              </h3>
              {dietPlan?.meals.map((meal, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{meal.name}</span>
                      <span className="font-mono text-[11px] text-slate-400">({meal.time})</span>
                    </div>
                    <ul className="mt-1 list-disc list-inside text-[11px] text-slate-600 dark:text-slate-300">
                      {meal.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-right sm:shrink-0 font-mono text-[11px]">
                    <span className="font-bold text-slate-900 dark:text-white block">{meal.calories} kcal</span>
                    <span className="text-slate-400 block">P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fats}g</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Attendance History */}
      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Attendance Log</h2>
              <p className="text-xs text-slate-400">Recorded gym visits and optical QR entries</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
              {attendance.length} Total Visits
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {attendance.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">No attendance logs found.</p>
            ) : (
              attendance.map(a => (
                <div key={a.id} className="py-3.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{formatDate(a.date)}</span>
                      <span className="text-[11px] text-slate-400 block">Check-in at {a.checkInTime || a.time || 'Logged'}</span>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold font-mono text-slate-600 dark:text-slate-300">
                    {(a.checkInMethod || a.method || 'manual').replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Payments */}
      {activeTab === 'payments' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Payment Receipts</h2>
              <p className="text-xs text-slate-400">Official tax invoices and transaction history</p>
            </div>
            {currentMember.balanceDue > 0 && (
              <button
                type="button"
                onClick={handleSimulatePayment}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
              >
                Pay Outstanding ({formatCurrency(currentMember.balanceDue, currencySymbol)})
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {payments.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">No payment receipts on record.</p>
            ) : (
              payments.map(p => (
                <div key={p.id} className="py-3.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{p.receiptNumber}</span>
                    <span className="text-[11px] text-slate-400 block">{p.planName} • {formatDate(p.paymentDate)}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatCurrency(p.amount, currencySymbol)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedReceipt(p)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs"
                    >
                      View Receipt
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Measurements */}
      {activeTab === 'progress' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Body Transformation Log</h2>
              <p className="text-xs text-slate-400">Periodic physical assessments logged by trainers</p>
            </div>
          </div>

          <div className="space-y-4">
            {measurements.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">
                No body measurements recorded yet. Ask your trainer to log your first assessment!
              </p>
            ) : (
              measurements.map(m => (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="font-bold text-slate-900 dark:text-white">
                      Assessment: {formatDate(m.date)}
                    </span>
                    <span className="text-emerald-600 font-black">{m.weightKg} kg</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                    <div>Chest: {m.chestInches}"</div>
                    <div>Waist: {m.waistInches}"</div>
                    <div>Biceps: {m.bicepsInches}"</div>
                    <div>Body Fat: {m.bodyFatPercentage}%</div>
                  </div>

                  {m.notes && (
                    <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-200 dark:border-slate-700">
                      Trainer Note: "{m.notes}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      <PaymentReceiptModal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        payment={selectedReceipt}
        gym={currentGym}
      />
    </div>
  );
}
