import React from 'react';
import { useStore } from '../../hooks/useStore';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CreditCard,
  Dumbbell,
  Layers,
  Utensils,
  TrendingUp,
  Clock,
  BarChart3,
  MessageSquare,
  ShieldCheck,
  Settings,
  Building2,
  Receipt,
  FileText,
  User,
  HeartPulse,
} from 'lucide-react';

export type GymOwnerTab =
  | 'dashboard'
  | 'members'
  | 'attendance'
  | 'memberships'
  | 'payments'
  | 'trainers'
  | 'workouts'
  | 'diet-plans'
  | 'progress'
  | 'expiry'
  | 'reports'
  | 'messages'
  | 'staff'
  | 'settings';

export type MemberTab =
  | 'dashboard'
  | 'membership'
  | 'attendance'
  | 'workout'
  | 'diet'
  | 'progress'
  | 'payments'
  | 'profile';

export type SuperAdminTab =
  | 'dashboard'
  | 'gyms'
  | 'subscriptions'
  | 'users'
  | 'revenue'
  | 'reports'
  | 'audit-logs'
  | 'settings';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function GymOwnerSidebar({ currentTab, onSelectTab, isMobileOpen, onCloseMobile }: SidebarProps) {
  const { currentUser } = useStore();
  const permissions = currentUser?.permissions || [];
  const isStaff = currentUser?.role === 'staff';

  const menuItems: { id: GymOwnerTab; label: string; icon: React.ElementType; permission?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'members', label: 'Members', icon: Users, permission: 'members_view' },
    { id: 'attendance', label: 'Attendance', icon: UserCheck, permission: 'attendance' },
    { id: 'memberships', label: 'Memberships', icon: Layers, permission: 'memberships' },
    { id: 'payments', label: 'Payments', icon: CreditCard, permission: 'payments' },
    { id: 'trainers', label: 'Trainers', icon: Dumbbell, permission: 'trainers' },
    { id: 'workouts', label: 'Workouts', icon: HeartPulse },
    { id: 'diet-plans', label: 'Diet Plans', icon: Utensils },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'expiry', label: 'Expiry & Renewals', icon: Clock, permission: 'memberships' },
    { id: 'reports', label: 'Reports', icon: BarChart3, permission: 'reports' },
    { id: 'messages', label: 'WhatsApp Hub', icon: MessageSquare, permission: 'whatsapp' },
    { id: 'staff', label: 'Staff Management', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: Settings, permission: 'settings' },
  ];

  // Filter if staff has restricted permissions
  const visibleItems = menuItems.filter(item => {
    if (!isStaff) return true;
    if (item.id === 'staff' || item.id === 'settings') return false; // staff cannot manage staff or settings
    if (!item.permission) return true;
    return permissions.includes(item.permission as any);
  });

  const content = (
    <div className="flex flex-col h-full py-4">
      <div className="px-4 mb-3">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">
          Management
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 overflow-y-auto">
        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              id={`nav-${item.id}`}
              onClick={() => {
                onSelectTab(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Subscription quick badge at bottom */}
      <div className="px-4 pt-3 border-t border-slate-200 dark:border-slate-800">
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 text-[11px]">
          <p className="font-bold text-emerald-800 dark:text-emerald-300">Growth Plan Active</p>
          <p className="text-slate-500 dark:text-slate-400 text-[10px]">Up to 2,000 members</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-[calc(100vh-4rem)]">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 shadow-2xl border-r border-slate-200 dark:border-slate-800 z-10">
            {content}
          </div>
        </div>
      )}
    </>
  );
}

export function MemberSidebar({ currentTab, onSelectTab, isMobileOpen, onCloseMobile }: SidebarProps) {
  const memberItems: { id: MemberTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'membership', label: 'My Membership', icon: Layers },
    { id: 'attendance', label: 'Attendance Pass', icon: UserCheck },
    { id: 'workout', label: 'Today Workout', icon: Dumbbell },
    { id: 'diet', label: 'Diet & Nutrition', icon: Utensils },
    { id: 'progress', label: 'Body Progress', icon: TrendingUp },
    { id: 'payments', label: 'Payment Receipts', icon: Receipt },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  const content = (
    <div className="flex flex-col h-full py-4">
      <div className="px-4 mb-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
          Member Portal
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {memberItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              id={`member-nav-${item.id}`}
              onClick={() => {
                onSelectTab(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-[calc(100vh-4rem)]">
        {content}
      </aside>
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 shadow-2xl border-r border-slate-200 dark:border-slate-800 z-10">
            {content}
          </div>
        </div>
      )}
    </>
  );
}

export function SuperAdminSidebar({ currentTab, onSelectTab, isMobileOpen, onCloseMobile }: SidebarProps) {
  const adminItems: { id: SuperAdminTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Platform Dashboard', icon: LayoutDashboard },
    { id: 'gyms', label: 'All Gyms', icon: Building2 },
    { id: 'subscriptions', label: 'SaaS Plans', icon: Layers },
    { id: 'users', label: 'Platform Users', icon: Users },
    { id: 'revenue', label: 'SaaS Revenue', icon: CreditCard },
    { id: 'reports', label: 'Global Analytics', icon: BarChart3 },
    { id: 'audit-logs', label: 'Audit Logs', icon: FileText },
    { id: 'settings', label: 'Global Settings', icon: Settings },
  ];

  const content = (
    <div className="flex flex-col h-full py-4">
      <div className="px-4 mb-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
          SaaS Administration
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {adminItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              id={`admin-nav-${item.id}`}
              onClick={() => {
                onSelectTab(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-[calc(100vh-4rem)]">
        {content}
      </aside>
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 shadow-2xl border-r border-slate-200 dark:border-slate-800 z-10">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
