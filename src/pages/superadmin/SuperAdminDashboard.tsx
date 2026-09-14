import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { Gym, SaasPlan } from '../../types';
import { Modal } from '../../components/common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useToast } from '../../components/common/Toast';
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
} from 'recharts';
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Search,
  ChevronRight,
} from 'lucide-react';

interface SuperAdminDashboardProps {
  onSwitchGym: (gymId: string) => void;
  onOpenOnboarding: () => void;
}

export function SuperAdminDashboard({ onSwitchGym, onOpenOnboarding }: SuperAdminDashboardProps) {
  const { store } = useStore();
  const { success, warning } = useToast();

  const gyms = store.getAllGyms();
  const saasPlans = store.getSaasPlans();
  const allMembers = store.getAllPlatformMembers();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddGymModal, setShowAddGymModal] = useState(false);

  // New gym form
  const [newGymName, setNewGymName] = useState('');
  const [newGymPhone, setNewGymPhone] = useState('');
  const [newGymEmail, setNewGymEmail] = useState('');
  const [newGymAddress, setNewGymAddress] = useState('');
  const [newGymPlanId, setNewGymPlanId] = useState(saasPlans[1]?.id || saasPlans[0]?.id);

  // MRR Trend
  const mrrData = [
    { month: 'Apr', mrr: 125000, gyms: 28 },
    { month: 'May', mrr: 168000, gyms: 35 },
    { month: 'Jun', mrr: 210000, gyms: 44 },
    { month: 'Jul', mrr: 275000, gyms: 58 },
    { month: 'Aug', mrr: 340000, gyms: 72 },
    { month: 'Sep', mrr: 412000, gyms: 89 },
  ];

  const totalMembersCount = allMembers.length;
  const activeGymsCount = gyms.filter(g => g.status === 'active').length;

  const filteredGyms = gyms.filter(
    g =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateGym = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGymName.trim()) return;

    const created = store.createGym({
      name: newGymName,
      phone: newGymPhone,
      email: newGymEmail,
      address: newGymAddress,
      saasPlanId: newGymPlanId,
      ownerId: 'owner_user_custom',
    });

    success('New Gym Tenant Provisioned', `${created.name} workspace created.`);
    setShowAddGymModal(false);
    onSwitchGym(created.id);
  };

  const handleToggleGymStatus = (g: Gym) => {
    const nextStatus = g.status === 'active' ? 'suspended' : 'active';
    store.updateGym(g.id, { status: nextStatus });
    if (nextStatus === 'suspended') {
      warning('Gym Suspended', `${g.name} tenant suspended.`);
    } else {
      success('Gym Activated', `${g.name} tenant activated.`);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-[10px] uppercase tracking-wider">
              Super Admin Console
            </span>
            <span className="text-xs text-slate-400">• Multi-Tenant Control</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
            FitManage Platform Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor tenant workspaces, SaaS subscription tiers, MRR analytics, and gym health.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenOnboarding}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <span>Launch Setup Wizard</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddGymModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Provision Gym Tenant</span>
          </button>
        </div>
      </div>

      {/* Top High-level Platform KPIs - Section 35 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Gyms
            </span>
            <Building2 className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{gyms.length}</p>
          <p className="text-[11px] text-emerald-600 font-bold mt-0.5">
            {activeGymsCount} Active • 0 Suspended
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Platform MRR
            </span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">₹4,12,000</p>
          <p className="text-[11px] text-emerald-600 font-bold mt-0.5">+21.2% MoM Expansion</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Gym Members
            </span>
            <Users className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalMembersCount + 1240}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Across all tenant databases</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Churn Rate
            </span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">1.2%</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Platform SaaS retention: 98.8%</p>
        </div>
      </div>

      {/* Platform MRR Chart & SaaS Plan Tier Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Platform MRR & Tenant Scaling
              </h2>
              <p className="text-xs text-slate-400">Monthly recurring subscription growth</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mrrData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis
                  tickFormatter={val => `₹${(val / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11 }}
                  stroke="#94a3b8"
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(val, '₹'), 'MRR']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="mrr" fill="#9333ea" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SaaS Subscription Plans - Section 37 */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">SaaS Pricing Tiers</h2>
            <p className="text-xs text-slate-400 mb-4">Available software tiers for gym owners</p>

            <div className="space-y-3">
              {saasPlans.map(sp => (
                <div
                  key={sp.id}
                  className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{sp.name}</span>
                    <span className="font-black text-purple-600 text-xs">
                      ₹{sp.monthlyPrice} / mo
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>Limit: {sp.maxMembers} members</span>
                    <span>{sp.maxStaff} staff logins</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 text-center">
            Automatic billing cycle on 1st of every month via Razorpay / Stripe
          </div>
        </div>
      </div>

      {/* Gym Tenants Table - Section 36 */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Registered Gym Workspaces ({gyms.length})
            </h2>
            <p className="text-xs text-slate-400">Complete multi-tenant database directory</p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search gym name or slug..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-purple-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Gym Tenant</th>
                <th className="py-3 px-3">Contact</th>
                <th className="py-3 px-3">SaaS Plan</th>
                <th className="py-3 px-3">Roster Count</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Joined</th>
                <th className="py-3 px-4 text-right">Impersonate / Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredGyms.map(g => {
                const plan = saasPlans.find(p => p.id === g.saasPlanId) || saasPlans[0];
                const count = store.getMembers().filter(m => m.gymId === g.id).length;

                return (
                  <tr key={g.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 font-bold flex items-center justify-center text-xs">
                          {g.name[0]}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {g.name}
                          </span>
                          <span className="font-mono text-slate-400 text-[11px] block">
                            slug: {g.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-mono text-slate-700 dark:text-slate-300 block">{g.phone}</span>
                      <span className="text-[11px] text-slate-400">{g.email}</span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-[11px]">
                        {plan.name}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-semibold text-slate-900 dark:text-white">
                      {count} / {plan.maxMembers}
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          g.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {g.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-slate-400">{formatDate(g.createdAt)}</td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onSwitchGym(g.id);
                            success('Tenant Switched', `Logged into ${g.name} as Gym Owner.`);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Login As</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleGymStatus(g)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 transition-colors"
                          title={g.status === 'active' ? 'Suspend Gym' : 'Activate Gym'}
                        >
                          {g.status === 'active' ? (
                            <Lock className="w-3.5 h-3.5" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision New Gym Modal */}
      <Modal
        isOpen={showAddGymModal}
        onClose={() => setShowAddGymModal(false)}
        title="Provision New Gym Tenant"
        maxWidth="md"
      >
        <form onSubmit={handleCreateGym} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Gym Brand Name *
            </label>
            <input
              type="text"
              required
              value={newGymName}
              onChange={e => setNewGymName(e.target.value)}
              placeholder="e.g. Apex Health & Fitness"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Owner Phone *
              </label>
              <input
                type="tel"
                required
                value={newGymPhone}
                onChange={e => setNewGymPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Owner Email *
              </label>
              <input
                type="email"
                required
                value={newGymEmail}
                onChange={e => setNewGymEmail(e.target.value)}
                placeholder="contact@apexgym.com"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              City / Address
            </label>
            <input
              type="text"
              value={newGymAddress}
              onChange={e => setNewGymAddress(e.target.value)}
              placeholder="e.g. Indiranagar, Bangalore"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Initial SaaS Subscription Tier
            </label>
            <select
              value={newGymPlanId}
              onChange={e => setNewGymPlanId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-purple-500"
            >
              {saasPlans.map(sp => (
                <option key={sp.id} value={sp.id}>
                  {sp.name} — ₹{sp.monthlyPrice}/mo (up to {sp.maxMembers} members)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowAddGymModal(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs"
            >
              Provision Workspace
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
