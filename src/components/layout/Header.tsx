import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import {
  Bell,
  Database,
  User,
  ChevronDown,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Server,
  Plus,
  QrCode,
} from 'lucide-react';
import { UserRole } from '../../types';

interface HeaderProps {
  onOpenAddMember: () => void;
  onNavigate: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddMember, onNavigate }) => {
  const store = useStore();
  const currentUser = store.getCurrentUser();
  const currentGym = store.getActiveGym();
  const allUsers = store.getAllUsers();
  const mysqlStatus = store.getMySQLStatus();
  const notifications = store.getNotifications();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const rolesDisplay: Record<UserRole, string> = {
    super_admin: 'Super Admin',
    gym_owner: 'Gym Owner',
    staff: 'Front Desk / Staff',
    trainer: 'Head Trainer',
    member: 'Gym Member',
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Gym context & Brand */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-xs">
          FM
        </div>
        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm">{currentGym.name}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {currentGym.planTier}
            </span>
          </div>
          <span className="text-xs text-slate-500 block -mt-0.5">
            {currentGym.address?.split(',')[0] || 'Gym Management SaaS'}
          </span>
        </div>
      </div>

      {/* Center: Hostinger MySQL Status Indicator */}
      <button
        onClick={() => onNavigate('settings')}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition text-xs font-medium text-slate-700"
        title="Click to view Hostinger MySQL configuration"
      >
        <Server className="w-3.5 h-3.5 text-blue-600" />
        <span className="text-slate-500">Database:</span>
        <span className="font-semibold text-slate-800">Hostinger MySQL</span>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      </button>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add Member button */}
        {(currentUser.role === 'gym_owner' || currentUser.role === 'staff') && (
          <button
            onClick={onOpenAddMember}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Member</span>
          </button>
        )}

        {/* Quick Attendance */}
        {(currentUser.role === 'gym_owner' || currentUser.role === 'staff') && (
          <button
            onClick={() => onNavigate('attendance')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Attendance</span>
          </button>
        )}

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg p-3 z-50 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => store.markAllNotificationsAsRead()}
                    className="text-[11px] text-emerald-600 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto mt-2">
                {notifications.map((n) => (
                  <div key={n.id} className="py-2 text-xs">
                    <p className="font-semibold text-slate-800">{n.title}</p>
                    <p className="text-slate-500 mt-0.5">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher & Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200 transition text-left"
          >
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden md:block">
              <span className="text-xs font-bold text-slate-800 block leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-slate-500 block leading-tight">
                {rolesDisplay[currentUser.role]}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50 animate-in fade-in">
              <div className="px-3 py-2 border-b border-slate-100">
                <span className="text-xs text-slate-400 block font-semibold uppercase">
                  Switch Persona / Role
                </span>
                <span className="text-xs text-slate-500">Test different permission levels</span>
              </div>
              <div className="py-1">
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      store.setCurrentUser(u.id);
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition ${
                      u.id === currentUser.id
                        ? 'bg-emerald-50 text-emerald-800 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p>{u.name}</p>
                      <p className="text-[10px] text-slate-400">{rolesDisplay[u.role]}</p>
                    </div>
                    {u.id === currentUser.id && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
