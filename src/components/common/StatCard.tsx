import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'lime' | 'emerald' | 'blue' | 'amber' | 'purple' | 'rose' | 'slate';
  trend?: { value: number; isPositive: boolean };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'lime',
  trend,
}) => {
  const colorMap = {
    lime: 'bg-lime-50 text-lime-700 border border-lime-200/80',
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    blue: 'bg-blue-50 text-blue-700 border border-blue-200/80',
    amber: 'bg-amber-50 text-amber-700 border border-amber-200/80',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200/80',
    rose: 'bg-rose-50 text-rose-700 border border-rose-200/80',
    slate: 'bg-slate-100 text-slate-700 border border-slate-200/80',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition hover:shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {(subtitle || trend) && (
        <div className="mt-3 flex items-center text-xs text-slate-500 gap-1.5">
          {trend && (
            <span
              className={`font-semibold ${
                trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
            </span>
          )}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
