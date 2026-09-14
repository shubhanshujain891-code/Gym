import React from 'react';
import { MembershipStatus } from '../../types';

interface BadgeProps {
  status: MembershipStatus | string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'expiring_soon':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'expired':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'paused':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'super_admin':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'gym_owner':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatText = (text: string) => {
    return text.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle()} ${className}`}
    >
      {formatText(status)}
    </span>
  );
};
