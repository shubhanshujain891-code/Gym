import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { YgosLogo } from '../../components/brand/YgosLogo';
import { formatCurrency } from '../../utils/formatters';
import {
  Users,
  CreditCard,
  QrCode,
  Dumbbell,
  Utensils,
  BarChart3,
  TrendingUp,
  Clock,
  Check,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Phone,
  Calendar,
  Layers,
  Award,
  Zap,
  CheckCircle2,
  Lock,
  Building2,
  Smartphone,
  UserCheck,
  Menu,
  X,
  Compass,
  FileText,
  DollarSign,
  HeartHandshake,
  Activity,
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

  // Metrics
  const activeCount = members.filter((m) => m.status === 'active').length;
  const expiringCount = members.filter((m) => m.status === 'expiring_soon').length;
  const totalRev = payments.reduce((acc, p) => acc + p.amount, 0);

  // Navigation and showcase state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<
    'dashboard' | 'members' | 'attendance' | 'payments' | 'trainers' | 'portal'
  >('dashboard');

  // Modals state
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoFormSubmitted, setDemoFormSubmitted] = useState(false);
  const [demoFormData, setDemoFormData] = useState({
    name: '',
    gymName: '',
    email: '',
    phone: '',
    memberCount: '100-300',
    primaryGoal: 'Automate attendance & stop payment leakage',
  });

  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [signInEmail, setSignInEmail] = useState('owner@ygos.com');
  const [signInPassword, setSignInPassword] = useState('••••••••');

  const [isGetStartedModalOpen, setIsGetStartedModalOpen] = useState(false);
  const [getStartedData, setGetStartedData] = useState({
    gymName: gym.name || 'PowerFit Arena',
    ownerName: 'Vikram Sharma',
    phone: '+91 98765 43210',
    city: 'Mumbai, MH',
    currencySymbol: gym.settings?.currencySymbol || '₹',
    planTier: 'Growth OS',
  });
  const [getStartedSuccess, setGetStartedSuccess] = useState(false);

  // Handlers
  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const existing = JSON.parse(localStorage.getItem('ygos_demo_leads') || '[]');
      existing.unshift({ ...demoFormData, submittedAt: new Date().toISOString() });
      localStorage.setItem('ygos_demo_leads', JSON.stringify(existing));
    } catch {
      // ignore
    }
    setDemoFormSubmitted(true);
  };

  const handleRoleSignIn = (role: 'gym_owner' | 'staff' | 'trainer' | 'member') => {
    const allUsers = store.getAllUsers();
    const targetUser = allUsers.find((u) => u.role === role);
    if (targetUser) {
      store.setCurrentUser(targetUser.id);
    }
    setIsSignInModalOpen(false);
    if (role === 'member') {
      onEnterApp('portal');
    } else if (role === 'trainer') {
      onEnterApp('trainers');
    } else if (role === 'staff') {
      onEnterApp('attendance');
    } else {
      onEnterApp('dashboard');
    }
  };

  const handleCreateGym = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateGym(gym.id, {
      name: getStartedData.gymName,
      address: `${getStartedData.city}, India`,
      settings: {
        ...gym.settings,
        currencySymbol: getStartedData.currencySymbol,
      },
    });
    setGetStartedSuccess(true);
    setTimeout(() => {
      setIsGetStartedModalOpen(false);
      setGetStartedSuccess(false);
      onEnterApp('dashboard');
    }, 900);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-lime-300 selection:text-slate-950 font-sans antialiased">
      {/* =========================================================================
          1. NAVIGATION BAR
      ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-18 flex items-center justify-between">
            {/* Brand Logo Lockup: YGOS / Your Gym OS */}
            <div className="flex items-center gap-8">
              <a href="#" className="flex items-center focus:outline-hidden">
                <YgosLogo size="md" showParentBrand={false} />
              </a>

              {/* Desktop Nav Links */}
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
                <a href="#solutions" className="hover:text-slate-950 transition">
                  Solutions
                </a>
                <a href="#pricing" className="hover:text-slate-950 transition">
                  Pricing
                </a>
              </nav>
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={() => setIsSignInModalOpen(true)}
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition"
              >
                Sign In
              </button>

              <button
                onClick={() => setIsGetStartedModalOpen(true)}
                className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-lg bg-slate-950 text-white hover:bg-slate-800 text-xs font-bold shadow-xs hover:shadow-md transition"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5 text-lime-400" />
              </button>
            </div>

            {/* Mobile Hamburger */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setIsGetStartedModalOpen(true)}
                className="px-3 py-1.5 rounded-md bg-slate-950 text-white text-xs font-bold"
              >
                Get Started
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 hover:text-slate-900"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg animate-in slide-in-from-top-2">
            <a
              href="#product"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-700"
            >
              Product
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-700"
            >
              Features
            </a>
            <a
              href="#workflow"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-700"
            >
              Workflow
            </a>
            <a
              href="#solutions"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-700"
            >
              Solutions
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-700"
            >
              Pricing
            </a>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsSignInModalOpen(true);
                }}
                className="w-full py-2 text-center text-xs font-bold text-slate-700 bg-slate-100 rounded-lg"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsDemoModalOpen(true);
                }}
                className="w-full py-2 text-center text-xs font-bold text-slate-900 border border-slate-300 rounded-lg"
              >
                Book a Live Demo
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          2. HERO SECTION
      ========================================================================= */}
      <section className="pt-16 pb-20 md:pt-24 md:pb-28 bg-gradient-to-b from-slate-50/60 via-white to-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200/80 text-slate-800 text-xs font-semibold mb-7 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse" />
            <span className="font-extrabold text-slate-950">YGOS</span>
            <span className="text-slate-300 font-normal">|</span>
            <span className="text-slate-600 font-medium">Your Gym OS</span>
          </div>

          {/* Primary Bold Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-950 tracking-tight leading-[1.05] max-w-4xl mx-auto">
            Run Your Gym. <br />
            <span className="text-slate-900">Grow Your Business.</span>
          </h1>

          {/* Brand Identity & Core Value Proposition */}
          <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            <strong className="font-bold text-slate-900">YGOS — Your Gym OS</strong>. Manage members, attendance, payments, trainers and everyday gym operations from one powerful platform.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <button
              onClick={() => setIsGetStartedModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 text-lime-400" />
            </button>

            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-xs transition"
            >
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>Book a Demo</span>
            </button>
          </div>

          {/* Brand Tagline */}
          <div className="mt-5 text-xs font-bold uppercase tracking-wider text-slate-500">
            Run Better. Grow Faster.
          </div>

          {/* Value Pills Strip (Clean, Authentic SaaS Trust Indicators) */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-slate-600 font-medium max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100/90 border border-slate-200 text-slate-800">
              <Check className="w-3.5 h-3.5 text-lime-600 font-bold" />
              <span>Multi-gym ready</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100/90 border border-slate-200 text-slate-800">
              <Check className="w-3.5 h-3.5 text-lime-600 font-bold" />
              <span>QR & smart attendance</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100/90 border border-slate-200 text-slate-800">
              <Check className="w-3.5 h-3.5 text-lime-600 font-bold" />
              <span>Payments & memberships</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100/90 border border-slate-200 text-slate-800">
              <Check className="w-3.5 h-3.5 text-lime-600 font-bold" />
              <span>Built for gym owners</span>
            </span>
          </div>

          {/* =========================================================================
              3. STAR HERO VISUAL: AUTHENTIC SAAS PRODUCT DASHBOARD SCREENSHOT
          ========================================================================= */}
          <div className="mt-14 max-w-6xl mx-auto text-left">
            <div className="rounded-2xl border border-slate-300/80 bg-slate-900/5 p-2 sm:p-3 shadow-2xl">
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                {/* Browser/OS Window Chrome */}
                <div className="h-10 bg-slate-100/90 border-b border-slate-200 px-4 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-slate-300" />
                      <div className="w-3 h-3 rounded-full bg-slate-300" />
                      <div className="w-3 h-3 rounded-full bg-slate-300" />
                    </div>
                    <span className="ml-3 font-mono text-[11px] text-slate-400 hidden sm:inline">
                      ygos.com/dashboard
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse" />
                    <span className="font-semibold text-slate-700 text-[11px]">{gym.name}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-700">
                      Live
                    </span>
                  </div>
                </div>

                {/* Dashboard Interface Simulation */}
                <div className="grid grid-cols-12 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 bg-slate-50/40">
                  {/* Left Mini Sidebar */}
                  <div className="col-span-12 sm:col-span-3 lg:col-span-2 bg-white p-3 sm:p-4 space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                      <div className="w-6 h-6 rounded-md bg-slate-950 text-lime-400 flex items-center justify-center font-black text-xs">
                        Y
                      </div>
                      <span className="font-black text-xs text-slate-900 tracking-tight">YGOS</span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-slate-950 text-white font-bold">
                        <BarChart3 className="w-3.5 h-3.5 text-lime-400" />
                        <span>Dashboard</span>
                      </div>
                      <div
                        onClick={() => onEnterApp('members')}
                        className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-medium cursor-pointer transition"
                      >
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Members</span>
                      </div>
                      <div
                        onClick={() => onEnterApp('attendance')}
                        className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-medium cursor-pointer transition"
                      >
                        <QrCode className="w-3.5 h-3.5 text-slate-400" />
                        <span>Attendance</span>
                      </div>
                      <div
                        onClick={() => onEnterApp('payments')}
                        className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-medium cursor-pointer transition"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        <span>Payments</span>
                      </div>
                      <div
                        onClick={() => onEnterApp('trainers')}
                        className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-medium cursor-pointer transition"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>Trainers</span>
                      </div>
                      <div
                        onClick={() => onEnterApp('portal')}
                        className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-medium cursor-pointer transition"
                      >
                        <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                        <span>Member Pass</span>
                      </div>
                    </div>
                  </div>

                  {/* Main Work Area */}
                  <div className="col-span-12 sm:col-span-9 lg:col-span-10 p-4 sm:p-6 bg-white space-y-5">
                    {/* Top Status Bar inside app */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <h2 className="text-base font-bold text-slate-950 flex items-center gap-2">
                          <span>Good morning, Rahul</span>
                          <span className="text-sm font-normal text-slate-400">👋</span>
                        </h2>
                        <span className="text-[11px] text-slate-500">
                          Active Facility Control Center • Real-time synchronization
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (onOpenAddMember) onOpenAddMember();
                            else onEnterApp('members');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 shadow-2xs transition"
                        >
                          <span>+ Register Member</span>
                        </button>
                        <button
                          onClick={() => onEnterApp('dashboard')}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition"
                        >
                          Open Live View
                        </button>
                      </div>
                    </div>

                    {/* 4 Core Metric KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          Active Members
                        </span>
                        <div className="text-2xl font-black text-slate-950 mt-1">{activeCount}</div>
                        <span className="text-[10px] text-emerald-700 font-bold mt-1 inline-block">
                          Enrolled & Verified
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          Revenue Collected
                        </span>
                        <div className="text-2xl font-black text-slate-950 mt-1">
                          {formatCurrency(totalRev, gym.settings.currencySymbol)}
                        </div>
                        <span className="text-[10px] text-slate-600 font-medium mt-1 inline-block">
                          Reconciled this month
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          Today's Check-ins
                        </span>
                        <div className="text-2xl font-black text-slate-950 mt-1">{attendance.length}</div>
                        <span className="text-[10px] text-lime-700 font-bold mt-1 inline-block">
                          Via QR & Turnstile
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          Expiring Soon
                        </span>
                        <div className="text-2xl font-black text-amber-600 mt-1">{expiringCount}</div>
                        <span className="text-[10px] text-amber-700 font-bold mt-1 inline-block">
                          Within next 7 days
                        </span>
                      </div>
                    </div>

                    {/* Simulation Activity Stream */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-1">
                      {/* Check-in feed */}
                      <div className="lg:col-span-2 border border-slate-200/90 rounded-xl p-3.5 bg-white">
                        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-900">Live Turnstile Activity</span>
                          <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            ● Hardware Connected
                          </span>
                        </div>
                        <div className="mt-2 space-y-2 text-xs">
                          {members.slice(0, 3).map((m, idx) => (
                            <div
                              key={m.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-slate-50/70 border border-slate-100"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                                  {m.firstName[0]}
                                  {m.lastName[0]}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900 leading-snug">
                                    {m.firstName} {m.lastName}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono">{m.memberCode}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-lime-100 text-lime-900">
                                  VERIFIED ENTRY
                                </span>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  {idx === 0 ? 'Just now' : `${idx * 14 + 5} min ago`}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right Quick Summary */}
                      <div className="border border-slate-200/90 rounded-xl p-3.5 bg-slate-50/60 flex flex-col justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-900 block mb-1">Facility Operations</span>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            Full audit log recorded. Uncollected balances, pending waivers, and trainer shift rosters update automatically across all devices.
                          </p>
                        </div>
                        <button
                          onClick={() => onEnterApp('dashboard')}
                          className="mt-3 w-full py-2 bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition"
                        >
                          Explore Full Dashboard →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. VALUE PILLARS STRIP
      ========================================================================= */}
      <section className="py-12 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-6">
            Everything your gym needs to run better
          </span>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-center">
              <div className="text-lg font-black text-slate-950">Members</div>
              <div className="text-xs text-slate-500 mt-1">Directory, Plans & Status</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-center">
              <div className="text-lg font-black text-slate-950">Attendance</div>
              <div className="text-xs text-slate-500 mt-1">Sub-second QR Check-in</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-center">
              <div className="text-lg font-black text-slate-950">Payments</div>
              <div className="text-xs text-slate-500 mt-1">UPI, Cash, GST Receipts</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-center">
              <div className="text-lg font-black text-slate-950">Trainers</div>
              <div className="text-xs text-slate-500 mt-1">Assignments & Schedules</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-center col-span-2 md:col-span-1">
              <div className="text-lg font-black text-slate-950">Progress</div>
              <div className="text-xs text-slate-500 mt-1">Workouts, Diets & Logs</div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. PROBLEM VS SOLUTION SECTION
      ========================================================================= */}
      <section className="py-20 bg-slate-50/70 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              The Reality Check
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Still managing your gym across spreadsheets, paper registers and disconnected tools?
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Running a modern fitness business with fragmented tools burns time, loses money, and creates front-desk chaos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* The Old Disconnected Way */}
            <div className="p-8 rounded-2xl bg-white border border-rose-200/80 shadow-xs space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  ✕
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-950">The Disconnected Tool Trap</h3>
                  <span className="text-xs text-slate-500">How most gyms struggle day-to-day</span>
                </div>
              </div>

              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 font-bold shrink-0 mt-0.5">•</span>
                  <span>Unrecorded cash payments and manual receipts create revenue leakage.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 font-bold shrink-0 mt-0.5">•</span>
                  <span>Members with expired plans slip past front desk during busy morning rush.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 font-bold shrink-0 mt-0.5">•</span>
                  <span>Member contact details, blood groups, and medical histories scattered across paper files.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 font-bold shrink-0 mt-0.5">•</span>
                  <span>Trainers track workout charts on handwritten notes that get lost or discarded.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 font-bold shrink-0 mt-0.5">•</span>
                  <span>No single screen to answer: <em>"How much money did our gym collect today?"</em></span>
                </li>
              </ul>
            </div>

            {/* The YGOS Unified Way */}
            <div className="p-8 rounded-2xl bg-white border-2 border-slate-950 shadow-md space-y-5 relative">
              <span className="absolute -top-3 right-6 bg-lime-400 text-slate-950 font-black text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow-2xs">
                The YGOS Solution
              </span>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-950 text-lime-400 flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-950">One System. One View. One Smarter Gym.</h3>
                  <span className="text-xs text-slate-500">Unified operational excellence</span>
                </div>
              </div>

              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-lime-600 font-bold shrink-0 mt-0.5" />
                  <span>Real-time reconciliation of UPI, cash, and card payments with instant GST receipts.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-lime-600 font-bold shrink-0 mt-0.5" />
                  <span>Sub-second camera and hardware turnstile QR verification blocks unauthorized entries.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-lime-600 font-bold shrink-0 mt-0.5" />
                  <span>Single member directory with complete membership, payment, and trainer history.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-lime-600 font-bold shrink-0 mt-0.5" />
                  <span>Structured digital workout and diet programs accessible directly on member phones.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-lime-600 font-bold shrink-0 mt-0.5" />
                  <span>Executive dashboards give owners total visibility into revenue, check-ins, and renewals.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. INTERACTIVE PRODUCT SHOWCASE SECTION
      ========================================================================= */}
      <section id="product" className="py-20 bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Inside The Platform
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              A comprehensive operating system built for every gym workflow
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Click any module below to preview the interface and test live interactions.
            </p>
          </div>

          {/* Module Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'members', label: 'Member Directory', icon: Users },
              { id: 'attendance', label: 'Turnstile Scanner', icon: QrCode },
              { id: 'payments', label: 'Payments & Billing', icon: CreditCard },
              { id: 'trainers', label: 'Trainers & Staff', icon: UserCheck },
              { id: 'portal', label: 'Digital Member Pass', icon: Smartphone },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeShowcaseTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveShowcaseTab(tab.id as any)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-slate-950 text-white shadow-sm'
                      : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-lime-400' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Showcase Display Card */}
          <div className="max-w-5xl mx-auto rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            {/* 1. Dashboard Tab */}
            {activeShowcaseTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Module: Executive Overview
                    </span>
                    <h4 className="text-lg font-black text-slate-950">
                      Real-time revenue, renewals, and live occupancy
                    </h4>
                  </div>
                  <button
                    onClick={() => onEnterApp('dashboard')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-950 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition"
                  >
                    <span>Launch Live Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5 text-lime-400" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-xs text-slate-500 font-semibold block">Total Revenue (Month)</span>
                    <span className="text-2xl font-black text-slate-950 mt-1 block">
                      {formatCurrency(totalRev, gym.settings.currencySymbol)}
                    </span>
                    <span className="text-[11px] text-emerald-700 font-bold mt-1 inline-block">
                      100% Reconciled
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-xs text-slate-500 font-semibold block">Active Membership Base</span>
                    <span className="text-2xl font-black text-slate-950 mt-1 block">{activeCount} Members</span>
                    <span className="text-[11px] text-amber-700 font-bold mt-1 inline-block">
                      {expiringCount} requiring renewal
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-xs text-slate-500 font-semibold block">Facility Check-ins</span>
                    <span className="text-2xl font-black text-slate-950 mt-1 block">
                      {attendance.length} Today
                    </span>
                    <span className="text-[11px] text-slate-600 font-medium mt-1 inline-block">
                      Peak hours: 06:00 - 09:30 AM
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  The executive dashboard calculates cash vs online payments, pending balances, expiring memberships, and staff check-in logs in real time.
                </p>
              </div>
            )}

            {/* 2. Members Tab */}
            {activeShowcaseTab === 'members' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Module: Member Directory
                    </span>
                    <h4 className="text-lg font-black text-slate-950">Complete Member Lifecycle Management</h4>
                  </div>
                  <button
                    onClick={() => onEnterApp('members')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-950 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition"
                  >
                    <span>View Members List</span>
                    <ArrowRight className="w-3.5 h-3.5 text-lime-400" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200">
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
                            <div className="font-bold text-slate-950">{m.firstName} {m.lastName}</div>
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
                    <h4 className="text-lg font-black text-slate-950">Fast Turnstile & Kiosk QR Verification</h4>
                  </div>
                  <button
                    onClick={() => onEnterApp('attendance')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-950 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition"
                  >
                    <span>Launch Scanner</span>
                    <ArrowRight className="w-3.5 h-3.5 text-lime-400" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 bg-slate-950 text-white rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-lime-400 text-xs font-bold mb-2">
                        <QrCode className="w-4 h-4" />
                        <span>Instant Verification Terminal</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Members present their unique encrypted digital QR pass on mobile. YGOS checks plan validity, warns on unpaid dues, and blocks duplicate punch-ins automatically.
                      </p>
                    </div>
                    <div className="mt-4 p-3 bg-slate-900 rounded-lg text-[11px] font-mono text-lime-300 border border-slate-800">
                      ✓ PASS: FIT-0001 (Rahul Mehta) • ACTIVE • 08:30 AM
                    </div>
                  </div>

                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <span className="text-xs font-bold text-slate-900 block">Attendance Capabilities</span>
                    <ul className="text-xs text-slate-600 space-y-2">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-lime-600 font-bold" />
                        <span>High-speed USB Barcode / QR hardware scanner support</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-lime-600 font-bold" />
                        <span>Front-facing iPad and Android tablet kiosk scan mode</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-lime-600 font-bold" />
                        <span>Manual search override by phone, code, or name</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-lime-600 font-bold" />
                        <span>Automated duplicate check-in suppression rules</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Payments Tab */}
            {activeShowcaseTab === 'payments' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Module: Payments & Billing
                    </span>
                    <h4 className="text-lg font-black text-slate-950">Collect Payments & Print Branded Receipts</h4>
                  </div>
                  <button
                    onClick={() => onEnterApp('payments')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-950 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition"
                  >
                    <span>View Financials</span>
                    <ArrowRight className="w-3.5 h-3.5 text-lime-400" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-900 font-bold block">UPI & QR Collection</span>
                    <p className="text-xs text-slate-600 mt-1">
                      Dynamic QR generation for GPay, PhonePe, and Paytm counter payments.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-900 font-bold block">Partial Due Tracking</span>
                    <p className="text-xs text-slate-600 mt-1">
                      Record deposits, split payments, and track outstanding balances per member.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-900 font-bold block">Printable GST Receipts</span>
                    <p className="text-xs text-slate-600 mt-1">
                      Thermal 80mm POS or A4 invoice format with gym logo and tax details.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Trainers Tab */}
            {activeShowcaseTab === 'trainers' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Module: Trainer Allocation
                    </span>
                    <h4 className="text-lg font-black text-slate-950">Staff Shifts, PT Clients & Performance</h4>
                  </div>
                  <button
                    onClick={() => onEnterApp('trainers')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-950 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition"
                  >
                    <span>Manage Staff & Trainers</span>
                    <ArrowRight className="w-3.5 h-3.5 text-lime-400" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-slate-950 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      AK
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-950">Arjun Kapoor</h5>
                      <span className="text-[11px] text-slate-500 block">CrossFit & Strength • Morning Shift</span>
                      <div className="mt-2 text-[11px] text-slate-700 font-medium">
                        Assigned: 8 Active PT Clients • Rating 4.9 ★
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-slate-950 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      SP
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-950">Sneha Patel</h5>
                      <span className="text-[11px] text-slate-500 block">Yoga & Mobility • Evening Shift</span>
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
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Module: Digital Member Pass
                    </span>
                    <h4 className="text-lg font-black text-slate-950">Frictionless Self-Service Member Portal</h4>
                  </div>
                  <button
                    onClick={() => onEnterApp('portal')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-950 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition"
                  >
                    <span>Preview Member Portal</span>
                    <ArrowRight className="w-3.5 h-3.5 text-lime-400" />
                  </button>
                </div>

                <div className="p-6 bg-slate-950 text-white rounded-xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-lime-400 tracking-wider">
                      Digital Member Pass • No plastic cards required
                    </span>
                    <h5 className="text-base font-black mt-1">Rahul Mehta (FIT-0001)</h5>
                    <p className="text-xs text-slate-400 mt-1">
                      Annual Elite VIP • 184 Days Remaining • Assigned Trainer: Arjun Kapoor
                    </p>
                  </div>
                  <div className="p-2 bg-white rounded-xl shrink-0 shadow-md">
                    <QrCode className="w-16 h-16 text-slate-950" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. THE SIGNATURE WORKFLOW SECTION
      ========================================================================= */}
      <section id="workflow" className="py-20 bg-slate-50/70 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              From First Visit to Long-Term Member
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              How YGOS powers the complete gym journey
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Every step is connected. No redundant data entry, no dropped follow-ups.
            </p>
          </div>

          {/* 8-Stage Pipeline Visualization */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {[
              {
                step: '01',
                title: 'New Member',
                desc: 'Quick 30-sec profile setup with photo and contacts.',
              },
              {
                step: '02',
                title: 'Membership',
                desc: 'Assign plan, validity dates, and payment terms.',
              },
              {
                step: '03',
                title: 'Check-in',
                desc: 'Sub-second QR scan at door with anti-duplicate logic.',
              },
              {
                step: '04',
                title: 'Trainer',
                desc: 'Assign trainer for personal coaching and guidance.',
              },
              {
                step: '05',
                title: 'Workout / Diet',
                desc: 'Prescribe weekly exercise splits and meal targets.',
              },
              {
                step: '06',
                title: 'Progress',
                desc: 'Track body fat, weight, and tape measurements.',
              },
              {
                step: '07',
                title: 'Renewal',
                desc: 'Automated expiration alerts before membership lapses.',
              },
              {
                step: '08',
                title: 'Retention',
                desc: 'Maintain member loyalty and maximize lifetime value.',
              },
            ].map((item, idx) => (
              <div
                key={item.step}
                className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
                      {item.step}
                    </span>
                    {idx < 7 && (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden lg:block" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-950 leading-snug">{item.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center text-xs font-semibold text-slate-500">
            YGOS connects the entire gym journey.
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. BUILT FOR EVERY PART OF YOUR GYM SECTION
      ========================================================================= */}
      <section id="solutions" className="py-20 bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Role-Based Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Built for every part of your gym
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Tailored workspaces for owners, front desk, trainers, and members.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Gym Owners */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-950 text-lime-400 flex items-center justify-center font-bold mb-4">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-950">Gym Owners</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5 mb-3">
                  Know your numbers. Control your operations.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Real-time visibility into revenue, pending balances, member retention, and staff accountability across single or multi-branch facilities.
                </p>
              </div>
              <button
                onClick={() => handleRoleSignIn('gym_owner')}
                className="mt-6 text-xs font-bold text-slate-900 hover:text-slate-700 inline-flex items-center gap-1.5"
              >
                <span>Owner Dashboard</span>
                <ArrowRight className="w-3 h-3 text-lime-600" />
              </button>
            </div>

            {/* Front Desk / Staff */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-950 text-lime-400 flex items-center justify-center font-bold mb-4">
                  <QrCode className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-950">Front Desk / Staff</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5 mb-3">
                  Check members in. Collect payments. Stay organized.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Lightning-fast QR verification, 30-second new registrations, and instant POS receipt printing with zero front-desk bottlenecks.
                </p>
              </div>
              <button
                onClick={() => handleRoleSignIn('staff')}
                className="mt-6 text-xs font-bold text-slate-900 hover:text-slate-700 inline-flex items-center gap-1.5"
              >
                <span>Staff View</span>
                <ArrowRight className="w-3 h-3 text-lime-600" />
              </button>
            </div>

            {/* Trainers */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-950 text-lime-400 flex items-center justify-center font-bold mb-4">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-950">Trainers</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5 mb-3">
                  Manage assigned members, workouts and progress.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Create customized workout splits, assign target calorie and diet templates, and track client transformation milestones.
                </p>
              </div>
              <button
                onClick={() => handleRoleSignIn('trainer')}
                className="mt-6 text-xs font-bold text-slate-900 hover:text-slate-700 inline-flex items-center gap-1.5"
              >
                <span>Trainer View</span>
                <ArrowRight className="w-3 h-3 text-lime-600" />
              </button>
            </div>

            {/* Members */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-950 text-lime-400 flex items-center justify-center font-bold mb-4">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-950">Members</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5 mb-3">
                  Access membership, digital pass, workouts and progress.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Zero app install required. Members open their unique pass on their mobile browser to enter the gym and view their trainer programs.
                </p>
              </div>
              <button
                onClick={() => handleRoleSignIn('member')}
                className="mt-6 text-xs font-bold text-slate-900 hover:text-slate-700 inline-flex items-center gap-1.5"
              >
                <span>Member Portal</span>
                <ArrowRight className="w-3 h-3 text-lime-600" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. OUTCOME-BASED FEATURES GRID
      ========================================================================= */}
      <section id="features" className="py-20 bg-slate-50/70 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Everything your gym needs. Nothing scattered.
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Engineered specifically for the demands of commercial gyms, fitness clubs, and boutique studios.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-lime-100 text-lime-800 flex items-center justify-center mb-3 font-bold">
                <Users className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-950">Member Management</h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                One place for member profiles, memberships, payment history, emergency contacts, and active status.
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center mb-3 font-bold">
                <QrCode className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-950">Attendance</h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Fast QR, barcode, and manual check-ins with anti-duplicate logic and real-time turnstile verification.
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3 font-bold">
                <CreditCard className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-950">Payments & Billing</h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Track collections, balance dues, UPI transactions, and print professional thermal and A4 GST receipts.
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center mb-3 font-bold">
                <UserCheck className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-950">Trainer Management</h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Assignments, PT client rosters, shift timings, client ratings, and staff performance records.
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mb-3 font-bold">
                <Dumbbell className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-950">Workout Plans</h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Prescribe structured exercise splits, sets, reps, and rest intervals tailored for each member's goal.
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center mb-3 font-bold">
                <Utensils className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-950">Diet & Nutrition</h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Assign meal plans with macronutrient targets, calorie budgets, and hydration recommendations.
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center mb-3 font-bold">
                <Activity className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-950">Progress Tracking</h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Log body weight, body fat %, chest, waist, and biceps measurements across transformation phases.
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center mb-3 font-bold">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-950">Reports & Insights</h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Real-time collection reports, peak-hour occupancy analytics, and automated renewal forecasting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          10. MEMBER-FACING EXPERIENCE SECTION
      ========================================================================= */}
      <section className="py-20 bg-slate-950 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-lime-400 text-xs font-bold mb-4 border border-slate-700">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Member-Facing Experience</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Give your members a digital experience they appreciate
              </h2>
              <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
                Eliminate physical card printing costs, lost credentials, and front-desk friction. Every member gets an encrypted digital pass accessible from their smartphone browser.
              </p>

              <div className="mt-8 space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-lime-400/20 text-lime-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <strong className="text-white block font-bold">Instant Digital QR Pass</strong>
                    <span className="text-slate-400 text-xs">
                      Always with them on their mobile. Sub-second scan at entrance turnstile.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-lime-400/20 text-lime-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <strong className="text-white block font-bold">Workout Streaks & Attendance Logs</strong>
                    <span className="text-slate-400 text-xs">
                      Members view total visits, workout regularity, and stay motivated.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-lime-400/20 text-lime-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <strong className="text-white block font-bold">Assigned Workout & Diet Charts</strong>
                    <span className="text-slate-400 text-xs">
                      Personal training clients see their daily routines and meal guidance.
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => onEnterApp('portal')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs transition shadow-sm"
                >
                  <span>Experience Member Pass View</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mobile Pass Mockup Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-sm mx-auto w-full shadow-2xl">
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
                <p className="text-xs text-slate-400 font-mono">{gym.name}</p>
                <div className="mt-4 p-4 bg-white rounded-2xl inline-block shadow-lg">
                  <QrCode className="w-28 h-28 text-slate-950" />
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-mono">Present at reception or turnstile</p>
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
          11. WHY FITNESS BUSINESSES CHOOSE YGOS
      ========================================================================= */}
      <section className="py-20 bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              The YGOS Advantage
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Why gym owners trust YGOS
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Built specifically for gym operators, not generic office management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-10 h-10 rounded-xl bg-slate-950 text-lime-400 flex items-center justify-center font-bold mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-950">Simple & Fast</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Zero clutter, intuitive interface. Your reception staff and trainers can master daily workflows in under 10 minutes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-10 h-10 rounded-xl bg-slate-950 text-lime-400 flex items-center justify-center font-bold mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-950">Fully Connected</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Attendance, billing, member profiles, and renewals seamlessly talk to each other without duplicate entries.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-10 h-10 rounded-xl bg-slate-950 text-lime-400 flex items-center justify-center font-bold mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-950">Scalable Architecture</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Engineered to handle single studios with 50 members or multi-gym enterprise chains with thousands of daily visits.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-10 h-10 rounded-xl bg-slate-950 text-lime-400 flex items-center justify-center font-bold mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-950">Built for Gyms</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Every screen, button, and report is purpose-crafted around actual fitness center operations and member retention.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          12. PRICING SECTION
      ========================================================================= */}
      <section id="pricing" className="py-20 bg-slate-50/70 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Predictable Plans
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Simple pricing that scales with your gym
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              No hidden fees, no per-member penalties. Everything you need to operate smoothly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between shadow-2xs">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Starter</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-950">₹999</span>
                  <span className="text-xs text-slate-500">/month</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">For boutique fitness studios and independent gyms.</p>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2">✓ Up to 150 Active Members</li>
                  <li className="flex items-center gap-2">✓ QR Turnstile & Attendance</li>
                  <li className="flex items-center gap-2">✓ Payment Receipts & GST</li>
                  <li className="flex items-center gap-2">✓ Digital Member Pass</li>
                </ul>
              </div>
              <button
                onClick={() => setIsGetStartedModalOpen(true)}
                className="mt-6 w-full py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-900 text-xs font-bold transition"
              >
                Choose Starter
              </button>
            </div>

            {/* Growth OS (Popular) */}
            <div className="p-6 rounded-2xl bg-slate-950 text-white border-2 border-slate-950 flex flex-col justify-between shadow-xl relative">
              <span className="absolute -top-3 right-6 bg-lime-400 text-slate-950 font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs">
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
                  <li className="flex items-center gap-2">✓ High-speed USB/Tablet Scanner Mode</li>
                  <li className="flex items-center gap-2">✓ Trainer Shifts & PT Assessment</li>
                  <li className="flex items-center gap-2">✓ Workout & Diet Plan Modules</li>
                  <li className="flex items-center gap-2">✓ Advanced Retention Insights</li>
                </ul>
              </div>
              <button
                onClick={() => setIsGetStartedModalOpen(true)}
                className="mt-6 w-full py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-black transition"
              >
                Start with Growth OS
              </button>
            </div>

            {/* Pro / Multi-Location */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between shadow-2xs">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pro Enterprise</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-950">₹3,999</span>
                  <span className="text-xs text-slate-500">/month</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">For multi-location gym chains and franchises.</p>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2">✓ Multi-Branch SuperAdmin Console</li>
                  <li className="flex items-center gap-2">✓ Cross-Facility Member Access</li>
                  <li className="flex items-center gap-2">✓ Centralized Financial Reporting</li>
                  <li className="flex items-center gap-2">✓ Priority SLA 24/7 Phone Support</li>
                </ul>
              </div>
              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="mt-6 w-full py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-900 text-xs font-bold transition"
              >
                Contact Multi-Gym
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          13. FINAL CALL TO ACTION
      ========================================================================= */}
      <section className="py-20 bg-white border-b border-slate-200/70">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl border border-slate-800">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-lime-400/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-lime-400 block mb-3">
                YGOS • Your Gym OS
              </span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Ready to run your gym better?
              </h2>
              <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                Join forward-thinking gym owners who manage members, attendance, billing, and trainers with one unified operating system.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setIsGetStartedModalOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-sm transition shadow-lg"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsDemoModalOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold border border-slate-800 transition"
                >
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>Talk to Product Specialist</span>
                </button>
              </div>

              <div className="mt-6 text-xs font-bold tracking-wider uppercase text-slate-400">
                Run Better. Grow Faster.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          14. FOOTER
      ========================================================================= */}
      <footer className="bg-white text-slate-900 pt-14 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-slate-200">
            {/* Brand column */}
            <div className="col-span-2 space-y-4">
              <YgosLogo size="md" showParentBrand={false} />
              <p className="text-xs font-bold text-slate-900 tracking-wide">
                Run Better. Grow Faster.
              </p>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                YGOS is the modern operating system for gyms and fitness centers. Manage members, attendance, billing, trainers, and workflows under one unified ecosystem.
              </p>
              <div className="pt-2 text-[11px] text-slate-400 font-medium">
                A <span className="font-bold text-slate-700">YBGP</span> product • Your Business Growth Platform.
              </div>
            </div>

            {/* Column 1: Product */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-950">Product</h4>
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
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-950">Solutions</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>
                  <button onClick={() => handleRoleSignIn('gym_owner')} className="hover:text-slate-950 transition">
                    Gym Owners
                  </button>
                </li>
                <li>
                  <button onClick={() => handleRoleSignIn('staff')} className="hover:text-slate-950 transition">
                    Front Desk / Staff
                  </button>
                </li>
                <li>
                  <button onClick={() => handleRoleSignIn('trainer')} className="hover:text-slate-950 transition">
                    Personal Trainers
                  </button>
                </li>
                <li>
                  <button onClick={() => onEnterApp('superadmin')} className="hover:text-slate-950 transition">
                    Multi-Gym Chains
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-950">Company</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>
                  <a href="#product" className="hover:text-slate-950 transition">
                    About YGOS
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-slate-950 transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-slate-950 transition">
                    Pricing Plans
                  </a>
                </li>
                <li>
                  <button onClick={() => setIsDemoModalOpen(true)} className="hover:text-slate-950 transition">
                    Book a Demo
                  </button>
                </li>
                <li>
                  <span className="text-slate-400">Privacy & Terms</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} YGOS (Your Gym OS). A product by YBGP. All rights reserved.</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSignInModalOpen(true)}
                className="text-slate-600 hover:text-slate-950 transition font-semibold"
              >
                Sign In to Platform
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          MODAL 1: SIGN IN MODAL
      ========================================================================= */}
      {isSignInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <YgosLogo size="sm" showSubtitle={false} showParentBrand={false} />
                <span className="text-sm font-bold text-slate-900">Sign in to YGOS</span>
              </div>
              <button
                onClick={() => setIsSignInModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Quick Access by Workspace Role
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleRoleSignIn('gym_owner')}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-950 bg-slate-50 hover:bg-slate-100 text-left transition"
                  >
                    <div className="text-xs font-bold text-slate-900">Gym Owner</div>
                    <div className="text-[10px] text-slate-500">Full control & financials</div>
                  </button>
                  <button
                    onClick={() => handleRoleSignIn('staff')}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-950 bg-slate-50 hover:bg-slate-100 text-left transition"
                  >
                    <div className="text-xs font-bold text-slate-900">Front Desk</div>
                    <div className="text-[10px] text-slate-500">Scanner & cashier</div>
                  </button>
                  <button
                    onClick={() => handleRoleSignIn('trainer')}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-950 bg-slate-50 hover:bg-slate-100 text-left transition"
                  >
                    <div className="text-xs font-bold text-slate-900">Trainer</div>
                    <div className="text-[10px] text-slate-500">Workouts & clients</div>
                  </button>
                  <button
                    onClick={() => handleRoleSignIn('member')}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-950 bg-slate-50 hover:bg-slate-100 text-left transition"
                  >
                    <div className="text-xs font-bold text-slate-900">Gym Member</div>
                    <div className="text-[10px] text-slate-500">Digital pass & plans</div>
                  </button>
                </div>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="grow border-t border-slate-200" />
                <span className="shrink mx-3 text-[10px] uppercase font-bold text-slate-400">or credentials</span>
                <div className="grow border-t border-slate-200" />
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleRoleSignIn('gym_owner');
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-950"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs transition"
                >
                  Sign In
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: GET STARTED / ONBOARDING MODAL
      ========================================================================= */}
      {isGetStartedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <YgosLogo size="sm" showSubtitle={false} showParentBrand={false} />
                <span className="text-sm font-bold text-slate-900">Start with YGOS</span>
              </div>
              <button
                onClick={() => setIsGetStartedModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {getStartedSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 bg-lime-100 text-lime-800 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Workspace Configured!</h4>
                <p className="text-xs text-slate-600">Launching your YGOS Control Center...</p>
              </div>
            ) : (
              <form onSubmit={handleCreateGym} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gym Name</label>
                  <input
                    type="text"
                    required
                    value={getStartedData.gymName}
                    onChange={(e) => setGetStartedData({ ...getStartedData, gymName: e.target.value })}
                    placeholder="e.g. IronVault Fitness"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-950"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Owner Name</label>
                    <input
                      type="text"
                      required
                      value={getStartedData.ownerName}
                      onChange={(e) => setGetStartedData({ ...getStartedData, ownerName: e.target.value })}
                      placeholder="Vikram Sharma"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">City / Location</label>
                    <input
                      type="text"
                      required
                      value={getStartedData.city}
                      onChange={(e) => setGetStartedData({ ...getStartedData, city: e.target.value })}
                      placeholder="Mumbai, MH"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-950"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={getStartedData.phone}
                      onChange={(e) => setGetStartedData({ ...getStartedData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Currency Symbol</label>
                    <select
                      value={getStartedData.currencySymbol}
                      onChange={(e) => setGetStartedData({ ...getStartedData, currencySymbol: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-950 bg-white"
                    >
                      <option value="₹">₹ (INR)</option>
                      <option value="$">$ (USD)</option>
                      <option value="€">€ (EUR)</option>
                      <option value="£">£ (GBP)</option>
                      <option value="AED">AED (Dirham)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Selected Plan</label>
                  <select
                    value={getStartedData.planTier}
                    onChange={(e) => setGetStartedData({ ...getStartedData, planTier: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-950 bg-white"
                  >
                    <option value="Starter">Starter (Single Studio - ₹999/mo)</option>
                    <option value="Growth OS">Growth OS (Unlimited Members - ₹1,999/mo)</option>
                    <option value="Pro Enterprise">Pro Enterprise (Multi-Gym Chain - ₹3,999/mo)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs shadow-md transition"
                  >
                    Launch Your Gym OS
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: BOOK A DEMO MODAL
      ========================================================================= */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <YgosLogo size="sm" showSubtitle={false} showParentBrand={false} />
                <span className="text-sm font-bold text-slate-900">Book a 1-on-1 Product Walkthrough</span>
              </div>
              <button
                onClick={() => setIsDemoModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {demoFormSubmitted ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 bg-lime-100 text-lime-800 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-950">Walkthrough Request Received!</h4>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                  Our fitness software specialist will connect with you via phone & WhatsApp within 2 hours.
                </p>
                <div className="pt-3 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setIsDemoModalOpen(false);
                      setDemoFormSubmitted(false);
                      onEnterApp('dashboard');
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs transition"
                  >
                    Explore Live Interactive Demo Sandbox
                  </button>
                </div>
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gym Name</label>
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Current Active Members</label>
                  <select
                    value={demoFormData.memberCount}
                    onChange={(e) => setDemoFormData({ ...demoFormData, memberCount: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-950 bg-white"
                  >
                    <option value="1-100">1 - 100 Members (Single Studio)</option>
                    <option value="100-300">100 - 300 Members (Growth Club)</option>
                    <option value="300-1000">300 - 1,000 Members (High-Traffic Gym)</option>
                    <option value="1000+">1,000+ Members (Multi-Branch Chain)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs transition shadow-sm"
                  >
                    Confirm Walkthrough Request
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
