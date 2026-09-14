import React, { useState } from 'react';
import { RiskScoreInfo } from '../../types';
import { ShieldCheck, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';

export function RiskBadge({ risk }: { risk: RiskScoreInfo }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const config = {
    healthy: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      icon: ShieldCheck,
      label: 'Healthy',
      dot: 'bg-emerald-500',
    },
    attention: {
      bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      icon: AlertTriangle,
      label: 'Needs Attention',
      dot: 'bg-amber-500',
    },
    at_risk: {
      bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      icon: AlertOctagon,
      label: 'At Risk',
      dot: 'bg-rose-500',
    },
  }[risk.level];

  const Icon = config.icon;

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer transition-all hover:scale-105 ${config.bg}`}
      >
        <span className={`w-2 h-2 rounded-full ${config.dot}`} />
        <Icon className="w-3.5 h-3.5" />
        <span>{config.label}</span>
        <HelpCircle className="w-3 h-3 opacity-60 ml-0.5" />
      </button>

      {showTooltip && (
        <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-2xl border border-slate-700 z-50 animate-in fade-in">
          <div className="flex items-center justify-between font-semibold border-b border-slate-700 pb-1.5 mb-2">
            <span>Engagement Health ({risk.score}/100)</span>
            <span className="capitalize">{risk.level.replace('_', ' ')}</span>
          </div>
          <p className="text-[11px] text-slate-300 mb-2">Calculated from attendance frequency, last visit date, and membership status:</p>
          <ul className="space-y-1">
            {risk.reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-1.5 text-slate-200 text-[11px]">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
