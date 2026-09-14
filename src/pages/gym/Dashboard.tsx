import React from 'react';
import { useStore } from '../../hooks/useStore';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Users,
  CreditCard,
  CalendarCheck,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  UserPlus,
  QrCode,
  Dumbbell,
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: string) => void;
  onOpenAddMember: () => void;
  onSelectMemberForPayment?: (member: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onOpenAddMember,
  onSelectMemberForPayment,
}) => {
  const store = useStore();
  const gym = store.getActiveGym();
  const members = store.getMembers();
  const payments = store.getPayments();
  const attendanceToday = store.getAttendance();

  // Metrics
  const activeMembers = members.filter((m) => m.status === 'active').length;
  const expiringSoonMembers = members.filter((m) => m.status === 'expiring_soon');
  const expiredMembers = members.filter((m) => m.status === 'expired');

  const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);
  const pendingBalance = members.reduce((acc, m) => acc + (m.balanceDue || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time management for <span className="font-semibold text-slate-700">{gym.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddMember}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Member</span>
          </button>
          <button
            onClick={() => onNavigate('attendance')}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
          >
            <QrCode className="w-4 h-4" />
            <span>Scanner & Check-in</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Members"
          value={activeMembers}
          subtitle={`${members.length} total enrolled`}
          icon={Users}
          color="emerald"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Today's Check-ins"
          value={attendanceToday.length}
          subtitle="Gym attendance today"
          icon={CalendarCheck}
          color="blue"
        />
        <StatCard
          title="Collected Revenue"
          value={formatCurrency(totalRevenue, gym.settings.currencySymbol)}
          subtitle={`${payments.length} transactions recorded`}
          icon={CreditCard}
          color="purple"
        />
        <StatCard
          title="Expiring / Pending"
          value={expiringSoonMembers.length}
          subtitle={`Balance due: ${formatCurrency(pendingBalance, gym.settings.currencySymbol)}`}
          icon={AlertTriangle}
          color="amber"
        />
      </div>

      {/* Two Columns: Expiring Members & Recent Check-ins */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiring Soon Attention Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900">
                Action Required ({expiringSoonMembers.length + expiredMembers.length})
              </h2>
            </div>
            <button
              onClick={() => onNavigate('members')}
              className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          {expiringSoonMembers.length === 0 && expiredMembers.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              All active memberships are up-to-date!
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {[...expiringSoonMembers, ...expiredMembers].slice(0, 4).map((m) => (
                <div key={m.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800 block">
                      {m.firstName} {m.lastName}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {m.memberCode} • Ends: {formatDate(m.membershipEndDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge status={m.status} />
                    {onSelectMemberForPayment && (
                      <button
                        onClick={() => onSelectMemberForPayment(m)}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg text-[11px] transition"
                      >
                        Renew
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's Check-ins Feed */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-bold text-slate-900">
                Today's Attendance ({attendanceToday.length})
              </h2>
            </div>
            <button
              onClick={() => onNavigate('attendance')}
              className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1"
            >
              Live Log <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          {attendanceToday.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No check-ins recorded yet today. Scan QR to begin!
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {attendanceToday.slice(0, 4).map((att) => (
                <div key={att.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                      {att.memberName.charAt(0)}
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 block">{att.memberName}</span>
                      <span className="text-slate-400 text-[11px]">
                        {att.memberCode} • Check-in: {att.time || att.checkInTime}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-[10px] uppercase">
                    {att.method}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
