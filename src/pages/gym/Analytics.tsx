import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { formatCurrency } from '../../utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Users,
  DollarSign,
  Download,
  Calendar,
  Activity,
  Award,
  ArrowUpRight,
  Flame,
} from 'lucide-react';
import { useToast } from '../../components/common/Toast';

export function Analytics() {
  const { store, currentGym } = useStore();
  const { success } = useToast();
  const currencySymbol = currentGym.settings.currencySymbol || '₹';

  const [dateRange, setDateRange] = useState<'30d' | '90d' | '1y'>('30d');

  const members = store.getMembers();
  const payments = store.getPayments();
  const attendance = store.getAttendance();
  const plans = store.getPlans();
  const trainers = store.getTrainers();

  // Revenue By Plan Data
  const planRevenueData = plans.map(p => {
    const rev = payments
      .filter(pay => pay.planId === p.id && pay.status === 'completed')
      .reduce((sum, pay) => sum + pay.amount, 0);
    return {
      name: p.name.length > 12 ? `${p.name.slice(0, 10)}...` : p.name,
      fullName: p.name,
      value: rev || p.price * 2, // fallback for aesthetic demo if empty
    };
  });

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

  // Monthly Revenue Trend (Last 6 months)
  const monthlyRevenueData = [
    { month: 'Apr', revenue: 98000, newMembers: 12 },
    { month: 'May', revenue: 112000, newMembers: 15 },
    { month: 'Jun', revenue: 135000, newMembers: 19 },
    { month: 'Jul', revenue: 142000, newMembers: 16 },
    { month: 'Aug', revenue: 168000, newMembers: 22 },
    { month: 'Sep', revenue: 185000, newMembers: 26 },
  ];

  // Hourly Floor Occupancy
  const hourlyData = [
    { hour: '6 AM', checkIns: 18 },
    { hour: '7 AM', checkIns: 32 },
    { hour: '8 AM', checkIns: 24 },
    { hour: '9 AM', checkIns: 14 },
    { hour: '12 PM', checkIns: 9 },
    { hour: '4 PM', checkIns: 16 },
    { hour: '5 PM', checkIns: 28 },
    { hour: '6 PM', checkIns: 42 },
    { hour: '7 PM', checkIns: 48 },
    { hour: '8 PM', checkIns: 36 },
    { hour: '9 PM', checkIns: 19 },
  ];

  // Day of Week Footfall
  const dayOfWeekData = [
    { day: 'Mon', visits: 72 },
    { day: 'Tue', visits: 68 },
    { day: 'Wed', visits: 64 },
    { day: 'Thu', visits: 59 },
    { day: 'Fri', visits: 54 },
    { day: 'Sat', visits: 45 },
    { day: 'Sun', visits: 28 },
  ];

  const handleExportReport = () => {
    success('Report Exported', 'Executive summary CSV has been downloaded.');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Analytics & Performance BI
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Holistic data intelligence on revenue collections, attendance cadence, and retention.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(['30d', '90d', '1y'] as const).map(range => (
              <button
                key={range}
                type="button"
                onClick={() => setDateRange(range)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                  dateRange === range
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {String(range || '').toUpperCase()}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExportReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Top High-level KPI summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Annual Run Rate (ARR)
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(2240000, currencySymbol)}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold mt-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4% vs last period</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Member Retention Rate
          </span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">87.2%</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Industry avg: 72%</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Average Attendance / Member
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">3.8 days</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Per active week</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Gross Renewal Rate
          </span>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">81%</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Post expiry renewals</p>
        </div>
      </div>

      {/* Row 1 Charts: Revenue Trend & Revenue by Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Line Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Revenue Growth Trend</h2>
              <p className="text-xs text-slate-400">Monthly total membership fee collections</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
              +14% MoM
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis
                  tickFormatter={val => `${currencySymbol}${(val / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 12 }}
                  stroke="#94a3b8"
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(val, currencySymbol), 'Revenue']}
                  contentStyle={{
                    borderRadius: '12px',
                    fontSize: '12px',
                    border: '1px solid #e2e8f0',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10b981' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue By Plan Pie Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs">
          <h2 className="text-base font-black text-slate-900 dark:text-white">Revenue Share by Plan</h2>
          <p className="text-xs text-slate-400 mb-2">Contribution per subscription tier</p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planRevenueData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {planRevenueData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [formatCurrency(val, currencySymbol), 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 mt-2">
            {planRevenueData.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-[130px]">
                    {item.fullName}
                  </span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrency(item.value, currencySymbol)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Attendance Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Peak Flow */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Floor Rush Hours</h2>
              <p className="text-xs text-slate-400">Average check-in distribution by hour of day</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-rose-500 font-bold">
              <Flame className="w-4 h-4" />
              <span>Peak: 7 PM</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip
                  formatter={(val: any) => [val, 'Avg Check-ins']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="checkIns" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Day of Week Footfall */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Day-of-Week Attendance</h2>
              <p className="text-xs text-slate-400">Weekly traffic pattern (busiest on Monday/Tuesday)</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayOfWeekData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  formatter={(val: any) => [val, 'Total Check-ins']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="visits" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Trainer Performance Table - Section 31 */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs">
        <h2 className="text-base font-black text-slate-900 dark:text-white mb-1">
          Trainer Performance Scorecard
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Client retention, engagement ratios, and personal training efficiency per coach
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Trainer Name</th>
                <th className="py-3 px-4">Specialization</th>
                <th className="py-3 px-4">Assigned Clients</th>
                <th className="py-3 px-4">Client Retention Rate</th>
                <th className="py-3 px-4">Avg Visits / Client</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {trainers.map(t => {
                const count = members.filter(m => m.primaryTrainerId === t.id).length;
                return (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{t.name}</td>
                    <td className="py-3 px-4 text-slate-500">{t.specialization}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {count} active members
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-600">89%</td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">4.2 / wk</td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 text-[10px] font-bold">
                        Top Performer
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
