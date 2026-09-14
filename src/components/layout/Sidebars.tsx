import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CreditCard,
  Layers,
  Dumbbell,
  Settings,
  ShieldCheck,
  UserCheck,
  Server,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { useStore } from '../../hooks/useStore';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const store = useStore();
  const currentUser = store.getCurrentUser();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['gym_owner', 'staff', 'super_admin'] },
    { id: 'members', label: 'Members', icon: Users, roles: ['gym_owner', 'staff', 'super_admin'] },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck, roles: ['gym_owner', 'staff', 'super_admin'] },
    { id: 'payments', label: 'Payments', icon: CreditCard, roles: ['gym_owner', 'staff', 'super_admin'] },
    { id: 'plans', label: 'Plans & Pricing', icon: Layers, roles: ['gym_owner', 'staff', 'super_admin'] },
    { id: 'trainers', label: 'Trainers', icon: UserCheck, roles: ['gym_owner', 'staff', 'super_admin'] },
    { id: 'workouts', label: 'Workouts & Diets', icon: Dumbbell, roles: ['gym_owner', 'staff', 'trainer', 'super_admin'] },
    { id: 'portal', label: 'My Member Pass', icon: Dumbbell, roles: ['member'] },
    { id: 'superadmin', label: 'Multi-Gym Network', icon: ShieldCheck, roles: ['super_admin'] },
    { id: 'settings', label: 'MySQL & Settings', icon: Settings, roles: ['gym_owner', 'super_admin'] },
  ];

  const allowedNav = navItems.filter((item) =>
    item.roles.includes(currentUser.role)
  );

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 hidden md:flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-6">
        {/* Navigation section header */}
        <div className="px-3 pt-1 flex items-center justify-between">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            YGOS Platform
          </p>
          <span className="text-[9px] font-bold text-lime-700 bg-lime-50 border border-lime-200/80 px-1.5 py-0.5 rounded-sm">
            v2.4 Live
          </span>
        </div>

        <nav className="space-y-1">
          {allowedNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-slate-950 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-lime-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-400" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom section: Website link & Database Quick Info Card */}
      <div className="space-y-3">
        <button
          onClick={() => onNavigate('website')}
          className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition group"
        >
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>Public Website</span>
          </div>
          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition" />
        </button>

        <div className="p-3 bg-slate-900 text-white border border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[11px] font-bold text-white">Hostinger MySQL</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Syncing active gym records with Hostinger database engine.
          </p>
          <button
            onClick={() => onNavigate('settings')}
            className="mt-2 text-[10px] font-bold text-lime-400 hover:underline block"
          >
            Manage MySQL Settings →
          </button>
        </div>
      </div>
    </aside>
  );
};
