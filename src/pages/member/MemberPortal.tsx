import React from 'react';
import { useStore } from '../../hooks/useStore';
import { MemberQRCode } from '../../components/qr/QRComponents';
import { Badge } from '../../components/common/Badge';
import { formatDate, formatCurrency, getDaysRemaining } from '../../utils/formatters';
import {
  Calendar,
  Clock,
  Dumbbell,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  UserCheck,
} from 'lucide-react';

export const MemberPortal: React.FC = () => {
  const store = useStore();
  const currentUser = store.getCurrentUser();
  const members = store.getMembers();
  const gym = store.getActiveGym();

  // Find member corresponding to current user
  const member = members.find((m) => m.email === currentUser.email) || members[0];
  const daysLeft = member ? getDaysRemaining(member.membershipEndDate) : 0;
  const workouts = store.getWorkouts();
  const attendance = store.getAttendance().filter((a) => a.memberId === member?.id);

  if (!member) {
    return <div className="p-8 text-center text-slate-500">Member profile not found.</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-black text-xl flex items-center justify-center shadow-xs">
            {member.firstName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">
                Welcome, {member.firstName} {member.lastName}!
              </h1>
              <Badge status={member.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Member Code: <span className="font-mono font-bold text-slate-700">{member.memberCode}</span> • {gym.name}
            </p>
          </div>
        </div>

        <div className="text-right bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 self-stretch sm:self-auto text-center sm:text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Validity</span>
          <span className={`text-base font-black ${daysLeft <= 7 ? 'text-rose-600' : 'text-emerald-700'}`}>
            {daysLeft > 0 ? `${daysLeft} Days Remaining` : 'Membership Expired'}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Ends on {formatDate(member.membershipEndDate)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Digital QR Entry Pass */}
        <div className="md:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Your Gym Access Pass</h3>
          <p className="text-[11px] text-slate-500 mb-4">
            Show this digital pass at the entrance scanner to enter
          </p>
          <MemberQRCode member={member} />
          <div className="mt-4 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-3 py-1 rounded-full">
            Plan: {member.currentPlanName || 'Active Membership'}
          </div>
        </div>

        {/* Member Stats & Workout Schedule */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Membership Overview</h3>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Workouts</span>
                <span className="text-xl font-black text-slate-900 mt-1 block">{member.totalVisits}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Personal Coach</span>
                <span className="text-xs font-bold text-slate-800 mt-1 block truncate">
                  {member.primaryTrainerName || 'Floor Trainer'}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Balance Due</span>
                <span className={`text-base font-bold mt-1 block ${member.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {formatCurrency(member.balanceDue, gym.settings.currencySymbol)}
                </span>
              </div>
            </div>
          </div>

          {/* Assigned Workout Plan */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-emerald-600" />
                <span>Your Training Program</span>
              </h3>
            </div>
            {workouts.length > 0 ? (
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-800">{workouts[0].name}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                    {workouts[0].level}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] mb-2">{workouts[0].description}</p>
                <div className="text-[10px] text-slate-400">
                  Frequency: {workouts[0].daysPerWeek} days per week
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No workout program assigned yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
