import React, { useState } from 'react';
import { YgosLogo } from '../../components/brand/YgosLogo';
import { useStore } from '../../hooks/useStore';
import { formatCurrency } from '../../utils/formatters';
import {
  Users,
  CreditCard,
  CalendarCheck,
  Dumbbell,
  ShieldCheck,
  QrCode,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
  BarChart3,
  UserCheck,
  Utensils,
  Clock,
  Layers,
  ChevronRight,
  Server,
  Lock,
  Smartphone,
  Flame,
  Check,
  Sliders,
  Play,
  FileText,
  HelpCircle,
  Mail,
  Phone,
  Building,
  Star,
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: (view?: string) => void;
  onOpenAddMember?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onOpenAddMember }) => {
  const store = useStore();
  const gym = store.getActiveGym();
  const members = store.getMembers();
  const payments = store.getPayments();
  const attendance = store.getAttendance();

  // Active showcase tab
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<
    'dashboard' | 'members' | 'attendance' | 'payments' | 'trainers' | 'portal'
  >('dashboard');

  // Interactive Book a Demo modal state
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoFormSubmitted, setDemoFormSubmitted] = useState(false);
  const [demoFormData, setDemoFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gymName: '',
    memberCount: '100-300',
  });

  // Calculate live stats from store for realism
  const activeCount = members.filter((m) => m.status === 'active').length;
  const expiringCount = members.filter((m) => m.status === 'expiring_soon').length;
  const totalRev = payments.reduce((acc, p) => acc + p.amount, 0);

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoFormSubmitted(true);
    setTimeout(() => {
      setIsDemoModalOpen(false);
      setDemoFormSubmitted(false);
      onEnterApp('dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-lime-400 selection:text-slate-950 flex flex-col">
      {/* =========================================================================
          1. NAVBAR
      ========================================================================= */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo Lockup */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-left focus:outline-hidden"
          >
            <YgosLogo size="md" />
          </button>

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <a href="#product" className="hover:text-slate-950 transition">
              Product
            </a>
            <a href="#features" className="hover:text-slate-950 transition">
              Features
            </a>
            <a href="#workflow" className="hover:text-slate-950 transition">
              Workflow
            </a>
            <a href="#member-experience" className="hover:text-slate-950 transition">
              Member Pass
            </a>
            <a href="#owner-insights" className="hover:text-slate-950 transition">
              Owner OS
            </a>
            <a href="#pricing" className="hover:text-slate-950 transition">
              Pricing
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onEnterApp('dashboard')}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-950 transition rounded-lg hover:bg-slate-100"
            >
              Sign In
            </button>

            <button
              onClick={() => onEnterApp('dashboard')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold transition shadow-xs group border border-slate-800"
            >
              <span>Get Started</span>
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400 group-hover:scale-125 transition" />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. HERO SECTION
      ========================================================================= */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-white border-b border-slate-200/60">
        {/* Subtle Ambient Lime Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-lime-200/30 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Eyebrow Brand Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-semibold mb-6 shadow-xs">
            <span className="flex h-2 w-2 rounded-full bg-lime-500 animate-pulse" />
            <span className="text-slate-950 font-bold">Your Gym OS</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 font-medium">Run Better. Grow Faster.</span>
            <span className="text-[9px] uppercase tracking-wider text-slate-500 bg-white px-1.5 py-0.5 rounded-md border border-slate-200/80">
              by YBGP
            </span>
          </div>

          {/* Primary Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-950 tracking-tight leading-[1.08] max-w-4xl mx-auto">
            Your Gym. <br className="hidden sm:inline" />
            <span className="relative inline-block">
              One Operating System.
              <span className="absolute -bottom-1 left-0 right-0 h-2 bg-lime-300/60 -z-10 rounded-sm" />
            </span>
          </h1>

          {/* Supporting Copy */}
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Manage members, attendance, payments, trainers and everyday gym operations from one powerful platform.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => onEnterApp('dashboard')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white text-sm font-bold transition shadow-md shadow-slate-900/10 group border border-slate-800"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 text-lime-400 group-hover:translate-x-1 transition" />
            </button>

            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold border border-slate-200 transition shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-slate-700 text-slate-700" />
              <span>Book a Demo</span>
            </button>
          </div>

          <div className="mt-4 text-[11px] text-slate-500 font-medium">
            Includes multi-role access • Real-time QR attendance • Hostinger MySQL native
          </div>

          {/* Hero Visual: Polished Real YGOS Dashboard Interface Preview */}
          <div className="mt-14 relative mx-auto max-w-5xl rounded-2xl bg-white p-2.5 sm:p-4 border border-slate-200/90 shadow-2xl shadow-slate-200/60">
            {/* Window chrome header */}
            <div className="flex items-center justify-between pb-3 px-2 border-b border-slate-100 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-200" />
                <span className="w-3 h-3 rounded-full bg-slate-200" />
                <span className="w-3 h-3 rounded-full bg-slate-200" />
                <span className="ml-2 font-mono text-[11px] text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                  app.ygos.io/{gym.slug || 'powerfit'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-lime-50 text-lime-800 border border-lime-200/70 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse" />
                  YGOS Engine Online
                </span>
                <span className="hidden sm:inline text-slate-400 text-[11px]">
                  Database: Hostinger MySQL
                </span>
              </div>
            </div>

            {/* Embedded Live Snapshot of Gym OS */}
            <div className="pt-3 bg-slate-50/50 rounded-xl p-3 sm:p-5 text-left">
              {/* Internal Mini Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center font-black text-sm">
                    YG
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                      {gym.name}
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Live Operations • Branch 01 (Sector 29)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEnterApp('attendance')}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs flex items-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5 text-slate-600" />
                    <span>Live Scanner</span>
                  </button>
                  <button
                    onClick={() => onEnterApp('dashboard')}
                    className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5 text-lime-400" />
                    <span>Launch OS</span>
                  </button>
                </div>
              </div>

              {/* Real-time KPI Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Active Members</span>
                    <Users className="w-4 h-4 text-lime-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900">{activeCount}</div>
                  <div className="text-[10px] text-lime-700 font-semibold mt-0.5 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +14% this month
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Today's Check-ins</span>
                    <CalendarCheck className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900">{attendance.length}</div>
                  <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                    Live via Kiosk & QR
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Revenue</span>
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900">
                    {formatCurrency(totalRev, gym.settings.currencySymbol)}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                    UPI, Cards, Cash
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Expiring Soon</span>
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900">{expiringCount}</div>
                  <div className="text-[10px] text-amber-700 font-medium mt-0.5">
                    Auto-WhatsApp renewal
                  </div>
                </div>
              </div>

              {/* Sample Members Activity preview inside hero */}
              <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-slate-800">Recent Member Check-ins</span>
                  <span className="text-[11px] text-slate-500 font-medium">Real-time sync</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {members.slice(0, 3).map((m) => (
                    <div key={m.id} className="py-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[11px]">
                          {m.firstName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{m.firstName} {m.lastName}</p>
                          <p className="text-[10px] text-slate-500">{m.memberCode} • {m.currentPlanName || 'Quarterly Plan'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-lime-50 text-lime-800 text-[10px] font-bold border border-lime-200">
                          {m.status.replace('_', ' ')}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">08:30 AM</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. TRUST / VALUE STRIP
      ========================================================================= */}
      <section className="bg-slate-950 text-white py-6 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center items-center">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-300">
              <Users className="w-4 h-4 text-lime-400 shrink-0" />
              <span>Member Management</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-300">
              <QrCode className="w-4 h-4 text-lime-400 shrink-0" />
              <span>Smart Attendance</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-300">
              <CreditCard className="w-4 h-4 text-lime-400 shrink-0" />
              <span>Payments & Billing</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-300">
              <UserCheck className="w-4 h-4 text-lime-400 shrink-0" />
              <span>Trainer Management</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-300">
              <Dumbbell className="w-4 h-4 text-lime-400 shrink-0" />
              <span>Workout & Diet Plans</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-300">
              <BarChart3 className="w-4 h-4 text-lime-400 shrink-0" />
              <span>Reports & Insights</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. PRODUCT SHOWCASE (Interactive Tabs showing real product UI)
      ========================================================================= */}
      <section id="product" className="py-20 bg-slate-50/70 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Product Tour
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Crafted specifically for the modern fitness business
            </h3>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Every feature in YGOS is built directly around actual gym operations—from the front-desk turnstile to the owner's financial statement.
            </p>

            {/* Showcase Navigation Tabs */}
            <div className="mt-8 inline-flex flex-wrap justify-center p-1.5 bg-white border border-slate-200/80 rounded-2xl shadow-xs gap-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { id: 'members', label: 'Members', icon: Users },
                { id: 'attendance', label: 'Attendance', icon: QrCode },
                { id: 'payments', label: 'Payments', icon: CreditCard },
                { id: 'trainers', label: 'Trainers', icon: UserCheck },
                { id: 'portal', label: 'Member Portal', icon: Smartphone },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeShowcaseTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveShowcaseTab(tab.id as any)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-slate-950 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-lime-400' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Screen Preview Container */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xl max-w-5xl mx-auto transition-all">
            {/* 1. Dashboard Tab */}
            {activeShowcaseTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Module: Executive Dashboard
                    </span>
                    <h4 className="text-lg font-black text-slate-900">
                      Live Pulse of Your Gym Facility
                    </h4>
                  </div>
                  <button
                    onClick={() => onEnterApp('dashboard')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 text-white text-xs font-bold rounded-lg hover:bg-slate-900 transition"
                  >
                    <span>Open Live Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5 text-lime-400" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-xs text-slate-500 font-semibold block">Total Revenue</span>
                    <span className="text-2xl font-black text-slate-900 mt-1 block">
                      {formatCurrency(totalRev, gym.settings.currencySymbol)}
                    </span>
                    <span className="text-[11px] text-lime-700 font-bold mt-1 inline-block">
                      100% reconciled in Hostinger MySQL
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-xs text-slate-500 font-semibold block">Active Roster</span>
                    <span className="text-2xl font-black text-slate-900 mt-1 block">
                      {activeCount} Members
                    </span>
                    <span className="text-[11px] text-blue-700 font-bold mt-1 inline-block">
                      {expiringCount} requiring renewal
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-xs text-slate-500 font-semibold block">Facility Check-ins</span>
                    <span className="text-2xl font-black text-slate-900 mt-1 block">
                      {attendance.length} Today
                    </span>
                    <span className="text-[11px] text-slate-600 font-bold mt-1 inline-block">
                      Peak hours: 06:00 - 09:30 AM
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500">
                  The executive dashboard calculates cash vs online payments, pending balances, expiring memberships, and staff check-in logs in real time.
                </p>
              </div>
            )}

            {/* 2. Members Tab */}
            {activeShowcaseTab === 'members' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Module: Member Directory
                    </span>
                    <h4 className="text-lg font-black text-slate-900">
                      Complete Member Lifecycle Management
                    </h4>
                  </div>
                  <button
                    onClick={() => onEnterApp('members')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 text-white text-xs font-bold rounded-lg hover:bg-slate-900 transition"
                  >
                    <span>View Members List</span>
                    <ArrowRight className="w-3.5 h-3.5 text-lime-400" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200">
                        <th className="p-3">Member</th>
                        <th className="p-3">Plan</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Balance</th>
                        <th className="p-3">Trainer</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {members.slice(0, 4).map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50/50">
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{m.firstName} {m.lastName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{m.memberCode}</div>
                          </td>
                          <td className="p-3 text-slate-600">{m.currentPlanName || 'Annual Elite VIP'}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full bg-lime-50 text-lime-800 text-[10px] font-bold border border-lime-200">
                              {m.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-slate-800">
                            {m.balanceDue > 0 ? (
                              <span className="text-rose-600 font-bold">
                                {formatCurrency(m.balanceDue, gym.settings.currencySymbol)} due
                              </span>
                            ) : (
                              <span className="text-emerald-600 font-bold">Paid in full</span>
                            )}
                          </td>
                          <td className="p-3 text-slate-600">{m.primaryTrainerName || 'Arjun Kapoor'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. Attendance Tab */}
            {activeShowcaseTab === 'attendance' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Module: Smart Attendance
                    </span>
                    <h4 className="text-lg font-black text-slate-900">
                      Fast Turnstile & Kiosk QR Verification
                    </h4>
                  </div>
                  <button
                    onClick={() => onEnterApp('attendance')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 text-white text-xs font-bold rounded-lg hover:bg-slate-900 transition"
                  >
                    <span>Launch Camera Scanner</span>
                    <ArrowRight className="w-3.5 h-3.5 text-lime-400" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-lime-400 text-xs font-bold mb-2">
                        <QrCode className="w-4 h-4" />
                        <span>Instant Verification Terminal</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Members present their unique encrypted digital QR pass on mobile. YGOS checks plan validity, warns on unpaid dues, and blocks duplicate punch-ins within 45 minutes automatically.
                      </p>
                    </div>
                    <div className="mt-4 p-3 bg-slate-800/80 rounded-lg text-[11px] font-mono text-lime-300 border border-slate-700">
                      ✓ PASS: FIT-0001 (Rahul Mehta) • ACTIVE • 08:30 AM
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <span className="text-xs font-bold text-slate-800 block">Attendance Capabilities</span>
                    <ul className="text-xs text-slate-600 space-y-2">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-lime-600" />
                        <span>High-speed USB Barcode / QR hardware gun support</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-lime-600" />
                        <span>Front-facing iPad/Tablet kiosk scan mode</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-lime-600" />
                        <span>Manual search override by phone, code, or name</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-lime-600" />
                        <span>Automated duplicate check-in suppression rules</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Payments Tab */}
            {activeShowcaseTab === 'payments' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Module: Payments & Billing
                    </span>
                    <h4 className="text-lg font-black text-slate-900">
                      Collect Payments & Print Branded Receipts
                    </h4>
                  </div>
                  <button
                    onClick={() => onEnterApp('payments')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 text-white text-xs font-bold rounded-lg hover:bg-slate-900 transition"
                  >
                    <span>View Financials</span>
                    <ArrowRight className="w-3.5 h-3.5 text-lime-400" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 font-bold block">UPI & QR Collection</span>
                    <p className="text-xs text-slate-700 mt-1">Instant QR generation for GPay, PhonePe, and Paytm counter payments.</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 font-bold block">Partial Due Tracking</span>
                    <p className="text-xs text-slate-700 mt-1">Record deposits, split payments, and track outstanding balances per member.</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 font-bold block">Printable GST Receipts</span>
                    <p className="text-xs text-slate-700 mt-1">Thermal 80mm POS or A4 invoice format with gym logo and tax details.</p>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Trainers Tab */}
            {activeShowcaseTab === 'trainers' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Module: Trainer Allocation
                    </span>
                    <h4 className="text-lg font-black text-slate-900">
                      Staff Shifts, PT Clients & Performance
                    </h4>
                  </div>
                  <button
                    onClick={() => onEnterApp('trainers')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 text-white text-xs font-bold rounded-lg hover:bg-slate-900 transition"
                  >
                    <span>Manage Staff & Trainers</span>
                    <ArrowRight className="w-3.5 h-3.5 text-lime-400" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      AK
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">Arjun Kapoor</h5>
                      <span className="text-[10px] text-slate-500 block">CrossFit & Hypertrophy • Morning Shift</span>
                      <div className="mt-2 text-[11px] text-slate-700 font-medium">
                        Assigned: 8 Active PT Clients • Rating 4.9 ★
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      SP
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">Sneha Patel</h5>
                      <span className="text-[10px] text-slate-500 block">Yoga & Core Mobility • Evening Shift</span>
                      <div className="mt-2 text-[11px] text-slate-700 font-medium">
                        Assigned: 12 Active PT Clients • Rating 4.8 ★
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 6. Member Portal Tab */}
            {activeShowcaseTab === 'portal' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Module: Digital Member Pass
                    </span>
                    <h4 className="text-lg font-black text-slate-900">
                      Frictionless Self-Service Member Portal
                    </h4>
                  </div>
                  <button
                    onClick={() => onEnterApp('portal')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 text-white text-xs font-bold rounded-lg hover:bg-slate-900 transition"
                  >
                    <span>Preview Member Portal</span>
                    <ArrowRight className="w-3.5 h-3.5 text-lime-400" />
                  </button>
                </div>

                <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-lime-400 tracking-wider">
                      Digital Member Pass • No plastic cards needed
                    </span>
                    <h5 className="text-base font-black mt-1">Ananya Iyer (FIT-0002)</h5>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Quarterly Transformation • 5 Days Remaining • Trainer: Sneha Patel
                    </p>
                  </div>
                  <div className="p-2 bg-white rounded-lg shrink-0">
                    <QrCode className="w-16 h-16 text-slate-950" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. WHY YGOS
      ========================================================================= */}
      <section className="py-20 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
              Why Fitness Businesses Choose Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Designed to eliminate friction from every corner of your gym
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Say goodbye to messy spreadsheets, lost membership cards, manual registers, and unaccounted cash collections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-slate-950 text-lime-400 flex items-center justify-center font-bold mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-950">Less Manual Work</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Automate attendance tracking, renewal follow-ups, fee calculations, and receipt generation so your team can focus on member satisfaction.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-slate-950 text-lime-400 flex items-center justify-center font-bold mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-950">Better Member Management</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Maintain single-source-of-truth profiles with attendance history, emergency contacts, assigned trainers, and payment audit logs.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-slate-950 text-lime-400 flex items-center justify-center font-bold mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-950">Faster Daily Operations</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Front desk check-ins happen in under 0.8 seconds. Register new members and collect admission fees in a clean, 30-second workflow.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-slate-950 text-lime-400 flex items-center justify-center font-bold mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-950">Better Visibility</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Clear dashboards show exactly how much revenue was collected today, who checked in, and which memberships expire this week.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-slate-950 text-lime-400 flex items-center justify-center font-bold mb-4">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-950">Professional Member Experience</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Impress your gym clientele with instant digital QR passes, clean printable payment vouchers, and structured workout schedules.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-slate-950 text-lime-400 flex items-center justify-center font-bold mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-950">Business Growth</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Cut member churn with automated expiration alerts and upsell personal training and annual transformations with transparent data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. FEATURE GRID (Clean icon-based cards)
      ========================================================================= */}
      <section id="features" className="py-20 bg-slate-50/70 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
              Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Every tool required to run a high-performing gym
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Built for single-location studios and multi-branch fitness chains alike.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-lime-50 text-lime-700 flex items-center justify-center mb-3">
                <Users className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-950">Member Profiles</h4>
              <p className="text-xs text-slate-600 mt-1">
                Store member codes, contact info, blood group, emergency contacts, and active plan details.
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
                <QrCode className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-950">QR Turnstile Check-in</h4>
              <p className="text-xs text-slate-600 mt-1">
                Fast turnstile check-in with camera scanner, barcode support, and anti-duplicate logic.
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                <CreditCard className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-950">Payments & Receipts</h4>
              <p className="text-xs text-slate-600 mt-1">
                Record UPI, card, and cash collections with printable tax receipts and balance tracking.
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
                <UserCheck className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-950">Trainer Management</h4>
              <p className="text-xs text-slate-600 mt-1">
                Assign members to certified personal trainers and track shift schedules and client ratings.
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                <Dumbbell className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-950">Workout Programming</h4>
              <p className="text-xs text-slate-600 mt-1">
                Design custom exercise routines, reps, sets, and rest intervals tailored for each member goal.
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center mb-3">
                <Utensils className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-950">Diet & Nutrition</h4>
              <p className="text-xs text-slate-600 mt-1">
                Assign meal plans with macronutrient breakdowns, calorie targets, and hydration reminders.
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center mb-3">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-950">Body Measurements</h4>
              <p className="text-xs text-slate-600 mt-1">
                Track weight, chest, waist, biceps, and body fat percent across every transformation milestone.
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3">
                <Server className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-950">Hostinger MySQL Native</h4>
              <p className="text-xs text-slate-600 mt-1">
                Zero proprietary lock-in. Connect directly to your Hostinger MySQL database via phpMyAdmin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. WORKFLOW SECTION
      ========================================================================= */}
      <section id="workflow" className="py-20 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
              Operational Pipeline
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              How YGOS powers your gym day after day
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              From the moment a lead walks through the door to ongoing membership renewal and gym expansion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 relative">
            {[
              { step: '01', title: 'Add Member', desc: 'Capture name, photo, phone, and emergency contact in seconds.' },
              { step: '02', title: 'Manage Membership', desc: 'Assign monthly, quarterly, or annual plans with discount rules.' },
              { step: '03', title: 'Track Attendance', desc: 'Members scan their pass via turnstile camera or reception kiosk.' },
              { step: '04', title: 'Collect Payment', desc: 'Accept UPI, cash, card; instantly print or WhatsApp receipt.' },
              { step: '05', title: 'Engage Member', desc: 'Assign workout & diet charts and monitor body progress gains.' },
              { step: '06', title: 'Grow Gym', desc: 'Track renewals, optimize peak hours, and scale to multiple branches.' },
            ].map((st, i) => (
              <div
                key={st.step}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left flex flex-col justify-between relative group hover:border-slate-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black font-mono text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded-md">
                      {st.step}
                    </span>
                    {i < 5 && (
                      <ChevronRight className="w-4 h-4 text-slate-300 hidden md:block" />
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">{st.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. MEMBER EXPERIENCE SECTION
      ========================================================================= */}
      <section id="member-experience" className="py-20 bg-slate-950 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-lime-400 text-xs font-bold mb-4 border border-slate-700">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Member-Facing Experience</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Give your members a digital experience they love
              </h2>
              <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
                Gym members get immediate access to their personal digital pass, eliminating physical card printing costs and replacement hassles forever.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-lg bg-lime-400/20 text-lime-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Digital Member Pass</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Encrypted personal QR entry token available right on their mobile browser.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-lg bg-lime-400/20 text-lime-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Live Attendance & Streaks</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Members track total visits, workout streaks, and see monthly gym regularity.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-lg bg-lime-400/20 text-lime-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Workout & Diet Plans</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Assigned workout days, target muscle groups, and calorie charts from their trainer.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-lg bg-lime-400/20 text-lime-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Body Progress Records</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Logged body weight, body fat %, and tape measurements over time.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => onEnterApp('portal')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs transition"
                >
                  <span>Experience Member Pass View</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Member Pass Mockup Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md mx-auto w-full shadow-2xl relative">
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <YgosLogo size="sm" variant="light" showSubtitle={false} showParentBrand={false} />
                  <span className="text-xs font-bold text-slate-300">Member Pass</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-lime-400/20 text-lime-400 border border-lime-400/30">
                  ACTIVE
                </span>
              </div>

              <div className="text-center py-6">
                <div className="w-20 h-20 rounded-full bg-slate-800 text-white font-black text-2xl flex items-center justify-center mx-auto border-2 border-lime-400">
                  RM
                </div>
                <h3 className="text-lg font-bold text-white mt-3">Rahul Mehta</h3>
                <p className="text-xs text-slate-400 font-mono">FIT-0001 • PowerFit Arena</p>
                <div className="mt-4 p-4 bg-white rounded-2xl inline-block shadow-lg">
                  <QrCode className="w-28 h-28 text-slate-950" />
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-mono">Scan at gym turnstile to enter</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-800 text-left text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Valid Till</span>
                  <p className="font-bold text-white">Nov 23, 2026</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Visits</span>
                  <p className="font-bold text-lime-400">14 Workouts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. GYM OWNER SECTION
      ========================================================================= */}
      <section id="owner-insights" className="py-20 bg-slate-50/70 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
              For Gym Owners
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Know what's happening in your gym — at a glance.
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Complete oversight over your revenue, active members, trainer productivity, and upcoming expirations from any phone, laptop, or tablet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center font-bold mb-4">
                <CreditCard className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-base font-bold text-slate-950">Revenue & Cash Flow</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Breakdown of daily collections via UPI, cash, card, and bank transfers with exact cashier and staff audit timestamps.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Total Collected:</span>
                <span className="text-slate-950 font-black">{formatCurrency(totalRev, gym.settings.currencySymbol)}</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center font-bold mb-4">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-base font-bold text-slate-950">Expiring Memberships</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Identify accounts expiring in the next 7 to 15 days before they drop off. Send one-click WhatsApp renewal links directly.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Requires Renewal:</span>
                <span className="text-amber-600 font-black">{expiringCount} Members</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center font-bold mb-4">
                <UserCheck className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-base font-bold text-slate-950">Staff & Trainer Activity</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Track personal trainer client rosters, morning vs evening shift attendance, and receptionist cashier performance.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Active Trainers:</span>
                <span className="text-blue-600 font-black">2 Certified Staff</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PRICING STRIP (Included as part of SaaS requirements)
      ========================================================================= */}
      <section id="pricing" className="py-20 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
              Transparent Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Predictable plans that scale with your gym
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              No hidden fees, no per-member penalties. Connect your own Hostinger MySQL database anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between shadow-xs">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Starter</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-950">₹999</span>
                  <span className="text-xs text-slate-500">/month</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">For boutique fitness studios and personal trainers.</p>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2">✓ Up to 150 Active Members</li>
                  <li className="flex items-center gap-2">✓ QR Turnstile & Attendance</li>
                  <li className="flex items-center gap-2">✓ Payment Receipts & GST</li>
                  <li className="flex items-center gap-2">✓ 1 Branch Location</li>
                </ul>
              </div>
              <button
                onClick={() => onEnterApp('dashboard')}
                className="mt-6 w-full py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-900 text-xs font-bold transition"
              >
                Choose Starter
              </button>
            </div>

            {/* Growth / Popular */}
            <div className="p-6 rounded-2xl bg-slate-950 text-white border-2 border-slate-950 flex flex-col justify-between shadow-xl relative">
              <span className="absolute -top-3 right-6 bg-lime-400 text-slate-950 font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Most Popular
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-lime-400">Growth OS</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">₹1,999</span>
                  <span className="text-xs text-slate-400">/month</span>
                </div>
                <p className="mt-2 text-xs text-slate-400">For high-traffic commercial gyms and health clubs.</p>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">✓ Unlimited Active Members</li>
                  <li className="flex items-center gap-2">✓ High-speed USB/Tablet Scanner</li>
                  <li className="flex items-center gap-2">✓ Trainer Shifts & PT Assessment</li>
                  <li className="flex items-center gap-2">✓ Workout & Diet Plan Modules</li>
                  <li className="flex items-center gap-2">✓ Hostinger MySQL Direct Access</li>
                </ul>
              </div>
              <button
                onClick={() => onEnterApp('dashboard')}
                className="mt-6 w-full py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-black transition"
              >
                Start with Growth
              </button>
            </div>

            {/* Pro / Multi-branch */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between shadow-xs">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pro Enterprise</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-950">₹3,999</span>
                  <span className="text-xs text-slate-500">/month</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">For multi-gym franchises and fitness chains.</p>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2">✓ Multi-Branch SuperAdmin</li>
                  <li className="flex items-center gap-2">✓ Dedicated MySQL Schema</li>
                  <li className="flex items-center gap-2">✓ Custom SMS & WhatsApp API</li>
                  <li className="flex items-center gap-2">✓ Priority SLA 24/7 Phone Support</li>
                </ul>
              </div>
              <button
                onClick={() => onEnterApp('superadmin')}
                className="mt-6 w-full py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-900 text-xs font-bold transition"
              >
                Contact Multi-Gym
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          10. FINAL CTA
      ========================================================================= */}
      <section className="py-20 bg-slate-50/70 border-b border-slate-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden border border-slate-800 shadow-2xl">
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-lime-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-lime-400 block mb-3">
                Run Better. Grow Faster.
              </span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Ready to run your gym better?
              </h2>
              <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                Start managing your gym with YGOS. Experience the difference of a modern, unified operating system designed specifically for fitness operators.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => onEnterApp('dashboard')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-sm transition shadow-lg"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsDemoModalOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold border border-slate-800 transition"
                >
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>Talk to Product Expert</span>
                </button>
              </div>

              <div className="mt-6 text-xs text-slate-400">
                Fast 2-minute setup • Connects to Hostinger phpMyAdmin in 1 click
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          11. FOOTER
      ========================================================================= */}
      <footer className="bg-white text-slate-900 pt-14 pb-10 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-slate-200">
            {/* Brand column */}
            <div className="col-span-2 space-y-4">
              <YgosLogo size="md" />
              <p className="text-xs text-slate-500 font-semibold tracking-wide">
                Run Better. Grow Faster.
              </p>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                YGOS is the modern operating system for gyms and fitness centers. Manage members, attendance, billing, trainers, and workflows under one unified ecosystem.
              </p>
              <div className="pt-2 text-[11px] text-slate-400 font-medium">
                Part of the <span className="font-bold text-slate-700">YBGP</span> (Your Business Growth Platform) family.
              </div>
            </div>

            {/* Column 1: Product */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Product</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>
                  <button onClick={() => onEnterApp('dashboard')} className="hover:text-slate-950 transition">
                    Executive Dashboard
                  </button>
                </li>
                <li>
                  <button onClick={() => onEnterApp('members')} className="hover:text-slate-950 transition">
                    Member Directory
                  </button>
                </li>
                <li>
                  <button onClick={() => onEnterApp('attendance')} className="hover:text-slate-950 transition">
                    Turnstile QR Scanner
                  </button>
                </li>
                <li>
                  <button onClick={() => onEnterApp('payments')} className="hover:text-slate-950 transition">
                    Payments & GST Receipts
                  </button>
                </li>
                <li>
                  <button onClick={() => onEnterApp('portal')} className="hover:text-slate-950 transition">
                    Digital Member Pass
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: Solutions */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Solutions</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>
                  <button onClick={() => onEnterApp('trainers')} className="hover:text-slate-950 transition">
                    Personal Trainers
                  </button>
                </li>
                <li>
                  <button onClick={() => onEnterApp('workouts')} className="hover:text-slate-950 transition">
                    Workouts & Diet Plans
                  </button>
                </li>
                <li>
                  <button onClick={() => onEnterApp('superadmin')} className="hover:text-slate-950 transition">
                    Multi-Gym Franchises
                  </button>
                </li>
                <li>
                  <button onClick={() => onEnterApp('settings')} className="hover:text-slate-950 transition">
                    Hostinger MySQL Integration
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Company & Support */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Company</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li><a href="#product" className="hover:text-slate-950 transition">About YGOS</a></li>
                <li><a href="#features" className="hover:text-slate-950 transition">YBGP Ecosystem</a></li>
                <li><a href="#pricing" className="hover:text-slate-950 transition">Pricing Plans</a></li>
                <li>
                  <button onClick={() => setIsDemoModalOpen(true)} className="hover:text-slate-950 transition">
                    Contact & Demo
                  </button>
                </li>
                <li><span className="text-slate-400">Privacy Policy</span></li>
                <li><span className="text-slate-400">Terms of Service</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} YGOS (Your Gym OS). A product by YBGP. All rights reserved.</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onEnterApp('settings')}
                className="text-slate-600 hover:text-slate-900 transition font-medium flex items-center gap-1.5"
              >
                <Server className="w-3.5 h-3.5 text-blue-600" />
                <span>Hostinger MySQL Diagnostics</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          BOOK A DEMO MODAL
      ========================================================================= */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <YgosLogo size="sm" showSubtitle={false} showParentBrand={false} />
                <span className="text-sm font-bold text-slate-900">Book a Live YGOS Demo</span>
              </div>
              <button
                onClick={() => setIsDemoModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {demoFormSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 bg-lime-100 text-lime-700 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Demo Scheduled!</h4>
                <p className="text-xs text-slate-600">
                  Launching your sandbox environment now with preloaded members, check-ins, and payments...
                </p>
              </div>
            ) : (
              <form onSubmit={handleDemoSubmit} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={demoFormData.name}
                    onChange={(e) => setDemoFormData({ ...demoFormData, name: e.target.value })}
                    placeholder="e.g. Vikram Sharma"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gym / Fitness Center Name</label>
                  <input
                    type="text"
                    required
                    value={demoFormData.gymName}
                    onChange={(e) => setDemoFormData({ ...demoFormData, gymName: e.target.value })}
                    placeholder="e.g. PowerFit Arena"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-950"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email</label>
                    <input
                      type="email"
                      required
                      value={demoFormData.email}
                      onChange={(e) => setDemoFormData({ ...demoFormData, email: e.target.value })}
                      placeholder="owner@gym.com"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={demoFormData.phone}
                      onChange={(e) => setDemoFormData({ ...demoFormData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-950"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Active Member Count</label>
                  <select
                    value={demoFormData.memberCount}
                    onChange={(e) => setDemoFormData({ ...demoFormData, memberCount: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-950 bg-white"
                  >
                    <option value="1-100">1 - 100 Members (Starter)</option>
                    <option value="100-300">100 - 300 Members (Growth)</option>
                    <option value="300-1000">300 - 1,000 Members (High-Traffic)</option>
                    <option value="1000+">1,000+ Members (Multi-Branch Chain)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs transition shadow-xs"
                  >
                    Confirm & Launch Interactive Sandbox
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
