import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/Badge';
import { RiskBadge } from '../../components/common/RiskBadge';
import { RevenueAreaChart, AttendanceBarChart, MembershipDistributionDonut } from '../../components/charts/DashboardCharts';
import { formatCurrency, formatDate, calculateMemberRiskScore, getDaysRemaining } from '../../utils/formatters';
import {
  Users,
  UserCheck,
  Clock,
  AlertTriangle,
  CreditCard,
  TrendingUp,
  DollarSign,
  UserPlus,
  ArrowRight,
  ShieldAlert,
  Flame,
} from 'lucide-react';
import { Member } from '../../types';

interface DashboardProps {
  onNavigateTab: (tab: string, filter?: string) => void;
  onSelectMember: (memberId: string) => void;
  onQuickAction: (action: any) => void;
}

export function Dashboard({ onNavigateTab, onSelectMember, onQuickAction }: DashboardProps) {
  const { store, currentGym } = useStore();
  const [revenuePeriod, setRevenuePeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');

  const members = store.getMembers();
  const payments = store.getPayments();
  const attendance = store.getAttendance();
  const plans = store.getPlans();
  const currencySymbol = currentGym.settings.currencySymbol || '₹';

  // Calculations from actual data (Section 8)
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'active').length;
  const expiringSoonMembers = members.filter(m => m.status === 'expiring_soon').length;
  const expiredMembers = members.filter(m => m.status === 'expired').length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(a => a.date === todayStr).length;

  const totalPendingFees = members.reduce((sum, m) => sum + (m.balanceDue || 0), 0);
  const totalMonthlyRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const newMembersCount = members.filter(m => {
    const diff = (Date.now() - new Date(m.createdAt).getTime()) / (1000 * 3600 * 24);
    return diff <= 30;
  }).length;

  // Attention Required metrics (Section 10)
  const attentionExpired = members.filter(m => m.status === 'expired');
  const attentionExpiring3Days = members.filter(m => {
    const days = getDaysRemaining(m.membershipEndDate);
    return days >= 0 && days <= 3;
  });
  const attentionPendingFees = members.filter(m => m.balanceDue > 0);
  const attentionInactive7Days = members.filter(m => {
    if (!m.lastVisitDate) return true;
    const days = (Date.now() - new Date(m.lastVisitDate).getTime()) / (1000 * 3600 * 24);
    return days >= 7;
  });

  // Revenue chart data generator based on period
  const revenueData = React.useMemo(() => {
    if (revenuePeriod === 'today') {
      return [
        { label: '6 AM', amount: 1500 },
        { label: '9 AM', amount: 4000 },
        { label: '12 PM', amount: 2000 },
        { label: '3 PM', amount: 0 },
        { label: '6 PM', amount: 7000 },
        { label: '9 PM', amount: 1500 },
      ];
    } else if (revenuePeriod === 'week') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return days.map((day, i) => ({
        label: day,
        amount: [4000, 7500, 3000, 12000, 5500, 14000, 8000][i],
      }));
    } else if (revenuePeriod === 'year') {
      const months = ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'];
      return months.map((m, i) => ({
        label: m,
        amount: [180000, 210000, 248500, 275000, 248500, 290000][i],
      }));
    }
    // month by default
    return [
      { label: 'Week 1', amount: 48000 },
      { label: 'Week 2', amount: 62000 },
      { label: 'Week 3', amount: 74500 },
      { label: 'Week 4', amount: 64000 },
    ];
  }, [revenuePeriod]);

  // Attendance last 7 days chart
  const attendanceLast7Days = React.useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, i) => ({
      label: day,
      count: [28, 34, 31, 38, 42, 45, todayAttendance || 36][i],
    }));
  }, [todayAttendance]);

  // Membership plan distribution
  const planDistribution = React.useMemo(() => {
    const counts: Record<string, number> = {};
    members.forEach(m => {
      const name = m.currentPlanName || 'Other';
      counts[name] = (counts[name] || 0) + 1;
    });
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];
    return Object.entries(counts).map(([name, count], idx) => ({
      name,
      count,
      percentage: Math.round((count / Math.max(members.length, 1)) * 100),
      color: colors[idx % colors.length],
    }));
  }, [members]);

  // Recent members preview
  const recentMembers = members.slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Greeting */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Gym Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time operations, attendance, and member retention metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onQuickAction('check_in')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <UserCheck className="w-4 h-4 text-emerald-500" />
            <span>Reception Check-In</span>
          </button>
          <button
            type="button"
            onClick={() => onQuickAction('add_member')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add New Member</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid - Section 8 */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Members"
          value={totalMembers}
          subtitle={`${activeMembers} currently active`}
          icon={Users}
          variant="emerald"
          onClick={() => onNavigateTab('members')}
        />
        <StatCard
          title="Active Members"
          value={activeMembers}
          subtitle={`${Math.round((activeMembers / Math.max(totalMembers, 1)) * 100)}% retention rate`}
          icon={TrendingUp}
          variant="emerald"
          onClick={() => onNavigateTab('members', 'active')}
        />
        <StatCard
          title="Expiring Soon"
          value={expiringSoonMembers}
          subtitle="Within 7 days window"
          icon={Clock}
          variant="amber"
          onClick={() => onNavigateTab('expiry')}
        />
        <StatCard
          title="Expired Members"
          value={expiredMembers}
          subtitle="Requires renewal outreach"
          icon={AlertTriangle}
          variant="rose"
          onClick={() => onNavigateTab('expiry')}
        />
        <StatCard
          title="Today's Attendance"
          value={todayAttendance}
          subtitle="Floor check-ins today"
          icon={UserCheck}
          variant="sky"
          onClick={() => onNavigateTab('attendance')}
        />
        <StatCard
          title="Pending Fees"
          value={formatCurrency(totalPendingFees, currencySymbol)}
          subtitle={`${attentionPendingFees.length} members with balances`}
          icon={CreditCard}
          variant="amber"
          onClick={() => onNavigateTab('payments')}
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(totalMonthlyRevenue, currencySymbol)}
          subtitle="Total fees recorded"
          icon={DollarSign}
          variant="indigo"
          onClick={() => onNavigateTab('payments')}
        />
        <StatCard
          title="New Members"
          value={newMembersCount}
          subtitle="Joined this month"
          icon={Flame}
          variant="emerald"
          onClick={() => onNavigateTab('members')}
        />
      </div>

      {/* Attention Required Section - Section 10 */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Attention Required
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div
            onClick={() => onNavigateTab('expiry', 'expired')}
            className="flex items-center justify-between p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-rose-900 dark:text-rose-200">
                  {attentionExpired.length} Expired Members
                </p>
                <p className="text-[11px] text-rose-600 dark:text-rose-400">Needs immediate follow-up</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-rose-400" />
          </div>

          <div
            onClick={() => onNavigateTab('expiry', '3days')}
            className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  {attentionExpiring3Days.length} Expiring in 3 Days
                </p>
                <p className="text-[11px] text-amber-600 dark:text-amber-400">Send WhatsApp reminder</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </div>

          <div
            onClick={() => onNavigateTab('payments')}
            className="flex items-center justify-between p-3 rounded-xl bg-yellow-50/60 dark:bg-yellow-950/30 border border-yellow-200/60 dark:border-yellow-900/40 cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-yellow-900 dark:text-yellow-200">
                  {formatCurrency(totalPendingFees, currencySymbol)} Pending Fees
                </p>
                <p className="text-[11px] text-yellow-700 dark:text-yellow-400">
                  Across {attentionPendingFees.length} members
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-yellow-500" />
          </div>

          <div
            onClick={() => onNavigateTab('attendance')}
            className="flex items-center justify-between p-3 rounded-xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-900/40 cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-sky-900 dark:text-sky-200">
                  {attentionInactive7Days.length} Inactive for 7+ Days
                </p>
                <p className="text-[11px] text-sky-600 dark:text-sky-400">Risk of drop-off</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-sky-400" />
          </div>
        </div>
      </div>

      {/* Charts Grid - Section 9 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <RevenueAreaChart
            data={revenueData}
            period={revenuePeriod}
            onPeriodChange={setRevenuePeriod}
            currencySymbol={currencySymbol}
          />
        </div>

        {/* Plan Distribution Donut (1 col) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Membership Distribution
            </span>
            <p className="text-sm font-bold text-slate-900 dark:text-white mb-4">Plan Breakdown</p>
          </div>
          <MembershipDistributionDonut data={planDistribution} />
          <p className="text-[11px] text-slate-400 mt-4 border-t border-slate-100 dark:border-slate-800 pt-3">
            {activeMembers} active subscriptions contributing to recurring revenue.
          </p>
        </div>
      </div>

      {/* Second Charts / Feeds Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Activity */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <AttendanceBarChart data={attendanceLast7Days} />
        </div>

        {/* Recent Members / Quick Access */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Recent Members
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Active Roster</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('members')}
              className="text-xs font-semibold text-emerald-600 hover:underline inline-flex items-center gap-1"
            >
              View All ({members.length}) →
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentMembers.map(m => {
              const risk = calculateMemberRiskScore(m);
              return (
                <div
                  key={m.id}
                  onClick={() => onSelectMember(m.id)}
                  className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
                      {m.firstName[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                        {m.firstName} {m.lastName}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {m.memberCode} • {m.currentPlanName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={m.status} />
                    <RiskBadge risk={risk} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
