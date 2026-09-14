import React, { useState } from 'react';
import { Member, Gym, PaymentRecord, AttendanceRecord } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { RiskBadge } from '../../components/common/RiskBadge';
import { formatCurrency, formatDate, calculateMemberRiskScore, getDaysRemaining } from '../../utils/formatters';
import { store } from '../../services/store';
import { useToast } from '../../components/common/Toast';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Dumbbell,
  Utensils,
  TrendingUp,
  Clock,
  UserCheck,
  MessageSquare,
  Edit3,
  Receipt,
  Plus,
  ShieldAlert,
  Flame,
  User,
  Phone,
  Mail,
  MapPin,
  HeartPulse,
} from 'lucide-react';
import { MemberQRCodeCard } from '../../components/qr/QRComponents';
import { AddMeasurementModal } from './AddMeasurementModal';

interface MemberProfileViewProps {
  memberId: string;
  onBack: () => void;
  onOpenWhatsApp: (member: Member) => void;
  onCollectPayment: (member: Member) => void;
  onEditMember: (member: Member) => void;
  onViewReceipt: (payment: PaymentRecord) => void;
}

type ProfileTab = 'overview' | 'attendance' | 'payments' | 'workout' | 'diet' | 'progress' | 'memberships';

export function MemberProfileView({
  memberId,
  onBack,
  onOpenWhatsApp,
  onCollectPayment,
  onEditMember,
  onViewReceipt,
}: MemberProfileViewProps) {
  const { success, warning } = useToast();
  const gym = store.getCurrentGym();
  const member = store.getMemberById(memberId);
  const payments = store.getPaymentsByMember(memberId);
  const attendanceRecords = store.getAttendanceByMember(memberId);
  const measurements = store.getMeasurementsByMember(memberId);
  const workouts = store.getWorkouts();
  const dietPlans = store.getDietPlans();

  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);

  if (!member) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Member not found.</p>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Members
        </button>
      </div>
    );
  }

  const risk = calculateMemberRiskScore(member);
  const daysLeft = getDaysRemaining(member.membershipEndDate);
  const assignedWorkout = workouts.find(w => w.id === member.assignedWorkoutPlanId) || workouts[0];
  const assignedDiet = dietPlans.find(d => d.id === member.assignedDietPlanId) || dietPlans[0];

  const handleQuickCheckIn = () => {
    const res = store.markAttendance(member.id, 'manual');
    if (res.success) {
      success('Checked In', `${member.firstName} checked in successfully.`);
    } else {
      warning('Attendance Alert', res.message);
    }
  };

  const handleRenewMembership = () => {
    // Extend by 1 month or open payment collection
    onCollectPayment(member);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Back bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Member Directory</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenWhatsApp(member)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>
          <button
            type="button"
            onClick={handleQuickCheckIn}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-sky-500" />
            <span>Mark Attendance</span>
          </button>
          <button
            type="button"
            onClick={() => onCollectPayment(member)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Header Profile Summary Card - Section 13 */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-emerald-600 text-white font-black text-2xl flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
              {member.avatarUrl ? (
                <img src={member.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                `${member.firstName[0]}${member.lastName[0]}`
              )}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {member.firstName} {member.lastName}
                </h1>
                <StatusBadge status={member.status} />
                <RiskBadge risk={risk} />
              </div>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                ID: {member.memberCode} • Joined: {formatDate(member.createdAt)}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300 pt-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {member.phone}
                </span>
                {member.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {member.email}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Dumbbell className="w-3.5 h-3.5 text-slate-400" />
                  Trainer: {member.primaryTrainerName || 'None assigned'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics on Header */}
          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
            <div className="text-right sm:text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Active Plan
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {member.currentPlanName}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                Expires: {formatDate(member.membershipEndDate)} ({daysLeft > 0 ? `${daysLeft}d left` : 'Expired'})
              </p>
            </div>
            <div className="text-right sm:text-left pl-4 border-l border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Balance Due
              </span>
              <p className={`text-sm font-black mt-0.5 ${member.balanceDue > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {formatCurrency(member.balanceDue, gym.settings.currencySymbol)}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                Total Paid: {formatCurrency(member.totalPaid, gym.settings.currencySymbol)}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Tabs Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto border-t border-slate-100 dark:border-slate-800 mt-6 pt-3">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'attendance', label: `Attendance (${attendanceRecords.length})`, icon: Calendar },
            { id: 'payments', label: `Payments & Receipts (${payments.length})`, icon: Receipt },
            { id: 'workout', label: 'Workout Plan', icon: Dumbbell },
            { id: 'diet', label: 'Diet Plan', icon: Utensils },
            { id: 'progress', label: `Measurements (${measurements.length})`, icon: TrendingUp },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
          {/* Member Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Personal & Membership Information
                </h3>
                <button
                  type="button"
                  onClick={() => onEditMember(member)}
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold hover:underline"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block">Gender</span>
                  <span className="font-semibold capitalize text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {member.gender}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Date of Birth</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {member.dateOfBirth ? formatDate(member.dateOfBirth) : 'Not specified'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Total Gym Visits</span>
                  <span className="font-bold text-emerald-600 mt-0.5 block">
                    {member.totalVisitsCount} sessions
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Start Date</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {formatDate(member.membershipStartDate)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">End Date</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {formatDate(member.membershipEndDate)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Last Floor Visit</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {member.lastVisitDate ? formatDate(member.lastVisitDate) : 'Never checked in'}
                  </span>
                </div>
              </div>

              {member.address && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-400 block">Home Address</span>
                  <p className="font-medium text-slate-700 dark:text-slate-300 mt-0.5">{member.address}</p>
                </div>
              )}
            </div>

            {/* Emergency Contact & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Emergency Contact
                </h4>
                {member.emergencyContactName ? (
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-slate-900 dark:text-white">{member.emergencyContactName}</p>
                    <p className="text-slate-500">Relation: {member.emergencyContactRelation || 'Not specified'}</p>
                    <p className="text-slate-700 dark:text-slate-300 font-mono">{member.emergencyContactPhone || 'No phone'}</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No emergency contact provided.</p>
                )}
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Staff Notes & Medical Alerts
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {member.notes || 'No medical conditions or special notes recorded.'}
                </p>
              </div>
            </div>
          </div>

          {/* Digital Access QR Card */}
          <div>
            <MemberQRCodeCard member={member} gym={gym} />
          </div>
        </div>
      )}

      {/* Tab 2: Attendance History */}
      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Attendance Records</h3>
              <p className="text-xs text-slate-400">Total verified check-ins: {attendanceRecords.length}</p>
            </div>
            <button
              type="button"
              onClick={handleQuickCheckIn}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Mark Visit Now</span>
            </button>
          </div>

          {attendanceRecords.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No recorded visits yet. Scan member QR code at reception to check in.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {attendanceRecords.map(a => (
                <div key={a.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{formatDate(a.date)}</p>
                      <p className="text-slate-400 text-[11px]">
                        Check-in at {a.checkInTime || a.time || 'Logged'} • via {(a.checkInMethod || a.method || 'manual').replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-medium capitalize">
                    {a.status || 'present'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Payment History & Receipts */}
      {activeTab === 'payments' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Payment & Billing History</h3>
              <p className="text-xs text-slate-400">All generated receipts and transaction logs</p>
            </div>
            <button
              type="button"
              onClick={() => onCollectPayment(member)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Collect Payment</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {payments.map(p => (
              <div key={p.id} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {p.receiptNumber}
                    </span>
                    <p className="text-slate-400 text-[11px]">
                      {formatDate(p.paymentDate)} • Paid via {(p.paymentMethod || 'cash').toUpperCase()}
                      {p.referenceNumber && ` (Ref: ${p.referenceNumber})`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-black text-sm text-emerald-600 dark:text-emerald-400 block">
                      {formatCurrency(p.amount, gym.settings.currencySymbol)}
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Balance: {formatCurrency(p.balanceRemaining, gym.settings.currencySymbol)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onViewReceipt(p)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    View Receipt
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Workout Plan */}
      {activeTab === 'workout' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Assigned Workout Plan
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {assignedWorkout.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1">{assignedWorkout.description}</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold capitalize">
              {assignedWorkout.level} • {assignedWorkout.goal.replace('_', ' ')}
            </span>
          </div>

          {/* Daily split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedWorkout.days.map((day, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">{day.dayName}</span>
                  <span className="text-[11px] font-semibold text-emerald-600">{day.focus}</span>
                </div>
                <div className="space-y-1.5 divide-y divide-slate-100 dark:divide-slate-800">
                  {day.exercises.map((ex, eIdx) => (
                    <div key={eIdx} className="pt-1.5 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{ex.name}</span>
                      <span className="font-mono text-slate-500 text-[11px]">
                        {ex.sets} sets × {ex.reps} ({ex.restSeconds}s rest)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Diet Plan */}
      {activeTab === 'diet' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Assigned Nutrition Protocol
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {assignedDiet.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1">{assignedDiet.description}</p>
            </div>
            <div className="text-right">
              <span className="text-base font-black text-slate-900 dark:text-white block">
                {assignedDiet.caloriesTarget} kcal
              </span>
              <span className="text-[11px] text-slate-400 block font-mono">
                P: {assignedDiet.proteinGrams}g | C: {assignedDiet.carbsGrams}g | F: {assignedDiet.fatsGrams}g
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {assignedDiet.meals.map((meal, mIdx) => (
              <div key={mIdx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 dark:text-white">{meal.name}</span>
                  <span className="text-slate-500 font-mono text-[11px]">{meal.time} • {meal.calories} kcal</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {meal.items.map((item, iIdx) => (
                    <span key={iIdx} className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px]">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Body Measurements & Progress */}
      {activeTab === 'progress' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Body Progress & Transformation</h3>
              <p className="text-xs text-slate-400">Weight, BMI, and body part circumference log</p>
            </div>
            <button
              type="button"
              onClick={() => setShowMeasurementModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Log New Measurements</span>
            </button>
          </div>

          {measurements.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No measurements logged yet. Click "Log New Measurements" to track member progress.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5">Weight (kg)</th>
                    <th className="py-2.5">BMI</th>
                    <th className="py-2.5">Chest (in)</th>
                    <th className="py-2.5">Waist (in)</th>
                    <th className="py-2.5">Biceps (in)</th>
                    <th className="py-2.5">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {measurements.map(m => (
                    <tr key={m.id}>
                      <td className="py-3 font-semibold text-slate-900 dark:text-white">{formatDate(m.date)}</td>
                      <td className="py-3 font-bold text-emerald-600">{m.weightKg} kg</td>
                      <td className="py-3">{m.bmi ? m.bmi.toFixed(1) : '-'}</td>
                      <td className="py-3">{m.chestInches || '-'}</td>
                      <td className="py-3">{m.waistInches || '-'}</td>
                      <td className="py-3">{m.bicepsInches || '-'}</td>
                      <td className="py-3 text-slate-400 text-[11px]">{m.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add Measurement Modal */}
          <AddMeasurementModal
            isOpen={showMeasurementModal}
            onClose={() => setShowMeasurementModal(false)}
            memberId={member.id}
          />
        </div>
      )}
    </div>
  );
}
