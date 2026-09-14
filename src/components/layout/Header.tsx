import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../hooks/useStore';
import { UserRole } from '../../types';
import {
  Search,
  Plus,
  Bell,
  Sun,
  Moon,
  Building2,
  ChevronDown,
  User,
  LogOut,
  UserPlus,
  UserCheck,
  CreditCard,
  Dumbbell,
  Layers,
  CheckCheck,
  ShieldAlert,
} from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';

interface HeaderProps {
  onOpenSearch: () => void;
  onQuickAction: (action: 'add_member' | 'check_in' | 'collect_payment' | 'add_trainer' | 'create_plan') => void;
  onNavigateToMember?: (memberId: string) => void;
}

export function Header({ onOpenSearch, onQuickAction, onNavigateToMember }: HeaderProps) {
  const { store, currentUser, currentGym, gymSettings, isSuperAdmin, isGymOwner, isStaff, isMember } = useStore();
  
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showGymMenu, setShowGymMenu] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications = store.getNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const allGyms = store.getAllGyms();

  // Theme toggle
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    store.updateGymSettings({ theme: next ? 'dark' : 'light' });
  };

  const roleLabels: Record<UserRole, { label: string; color: string }> = {
    super_admin: { label: 'Super Admin', color: 'bg-indigo-500 text-white' },
    gym_owner: { label: 'Gym Owner', color: 'bg-emerald-600 text-white' },
    staff: { label: 'Staff / Reception', color: 'bg-amber-600 text-white' },
    member: { label: 'Member Portal', color: 'bg-sky-600 text-white' },
  };

  const handleSwitchRole = (role: UserRole) => {
    store.loginAsRole(role);
    setShowRoleMenu(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Left branding / Active gym indicator */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-lg shadow-sm shrink-0">
              F
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white leading-none block">
                {gymSettings?.name || 'FitManage'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                {gymSettings?.tagline || 'Gym Management SaaS'}
              </span>
            </div>
          </div>

          {/* Super Admin or Gym Switcher */}
          {allGyms.length > 1 && (isSuperAdmin || isGymOwner) && (
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setShowGymMenu(!showGymMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 transition-colors"
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-medium max-w-[140px] truncate">{currentGym.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showGymMenu && (
                <div className="absolute left-0 mt-1.5 w-60 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 z-50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 py-1 block">
                    Switch Active Gym
                  </span>
                  {allGyms.map(g => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => {
                        store.setActiveGymId(g.id);
                        setShowGymMenu(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-xs text-left transition-colors ${
                        g.id === currentGym.id
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="truncate">{g.name}</span>
                      <span className="text-[10px] uppercase font-mono px-1 rounded bg-slate-200 dark:bg-slate-800">
                        {g.subscription.tier}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center / Global Search Button */}
        <div className="flex-1 max-w-md mx-4 hidden lg:block">
          <button
            type="button"
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs transition-colors"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span>Search members, payments, trainers...</span>
            </div>
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile search trigger */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Quick Action (+) Button - Section 46 */}
          {!isMember && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowQuickMenu(!showQuickMenu)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Quick Action</span>
              </button>

              {showQuickMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95">
                  <button
                    type="button"
                    onClick={() => {
                      onQuickAction('add_member');
                      setShowQuickMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 transition-colors"
                  >
                    <UserPlus className="w-4 h-4 text-emerald-500" />
                    <span>Add Member</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onQuickAction('check_in');
                      setShowQuickMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 transition-colors"
                  >
                    <UserCheck className="w-4 h-4 text-sky-500" />
                    <span>Check In Member</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onQuickAction('collect_payment');
                      setShowQuickMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 transition-colors"
                  >
                    <CreditCard className="w-4 h-4 text-amber-500" />
                    <span>Collect Payment</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onQuickAction('add_trainer');
                      setShowQuickMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 transition-colors"
                  >
                    <Dumbbell className="w-4 h-4 text-purple-500" />
                    <span>Add Trainer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onQuickAction('create_plan');
                      setShowQuickMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 transition-colors"
                  >
                    <Layers className="w-4 h-4 text-indigo-500" />
                    <span>Create Plan</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Quick Role Switcher Pill (For Immediate Dev & Testing Inspection) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 transition-colors"
            >
              <span className={`w-2 h-2 rounded-full ${currentUser?.role === 'super_admin' ? 'bg-indigo-500' : currentUser?.role === 'gym_owner' ? 'bg-emerald-500' : currentUser?.role === 'staff' ? 'bg-amber-500' : 'bg-sky-500'}`} />
              <span className="hidden md:inline">{roleLabels[currentUser?.role || 'gym_owner'].label}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block">
                  Switch Demo Persona
                </span>
                {(['super_admin', 'gym_owner', 'staff', 'member'] as UserRole[]).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleSwitchRole(r)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs text-left transition-colors ${
                      currentUser?.role === r
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{roleLabels[r].label}</span>
                    {currentUser?.role === r && <span className="text-emerald-500 text-xs font-bold">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Light / Dark Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Notifications Popover (Section 33 & 73) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => store.markAllNotificationsAsRead()}
                    className="text-[11px] text-emerald-600 hover:underline font-medium flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                </div>

                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No notifications</p>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          store.markNotificationAsRead(notif.id);
                          if (notif.entityId && onNavigateToMember) {
                            onNavigateToMember(notif.entityId);
                            setShowNotifications(false);
                          }
                        }}
                        className={`p-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                          notif.isRead
                            ? 'bg-slate-50 dark:bg-slate-800/40 text-slate-500 opacity-75'
                            : 'bg-emerald-50/70 dark:bg-emerald-950/40 text-slate-900 dark:text-white font-medium border border-emerald-100 dark:border-emerald-900/40'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-bold">{notif.title}</span>
                          {!notif.isRead && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                          {notif.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center overflow-hidden">
              {currentUser?.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                currentUser?.name?.[0] || 'U'
              )}
            </div>
            <div className="hidden xl:block text-left">
              <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                {currentUser?.name}
              </span>
              <span className="text-[10px] text-slate-400 capitalize block">
                {currentUser?.role ? currentUser.role.replace('_', ' ') : 'User'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
