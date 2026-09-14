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
    { id: 'superadmin', label: 'SaaS Multi-Gyms', icon: ShieldCheck, roles: ['super_admin'] },
    { id: 'settings', label: 'MySQL & Settings', icon: Settings, roles: ['gym_owner', 'super_admin'] },
  ];

  const allowedNav = navItems.filter((item) =>
    item.roles.includes(currentUser.role)
  );

  return (
    <aside className="w-60 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-6">
        <div className="px-3 py-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Main Menu</p>
        </div>

        <nav className="space-y-1">
          {allowedNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Database Quick Info Card */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex items-center gap-2 mb-1.5">
          <Server className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-[11px] font-bold text-slate-800">Hostinger MySQL</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-tight">
          Configured for Hostinger phpMyAdmin or Cloud MySQL 3306.
        </p>
        <button
          onClick={() => onNavigate('settings')}
          className="mt-2 text-[10px] font-semibold text-emerald-600 hover:underline block"
        >
          View Hostinger Setup Guide →
        </button>
      </div>
    </aside>
  );
};
