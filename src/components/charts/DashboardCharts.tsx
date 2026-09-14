import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';

interface RevenuePoint {
  label: string;
  amount: number;
}

export function RevenueAreaChart({
  data,
  period,
  onPeriodChange,
  currencySymbol = '₹',
}: {
  data: RevenuePoint[];
  period: 'today' | 'week' | 'month' | 'year';
  onPeriodChange: (period: 'today' | 'week' | 'month' | 'year') => void;
  currencySymbol?: string;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxVal = Math.max(...data.map(d => d.amount), 1000);
  const minVal = 0;
  const height = 180;
  const width = 600;
  const paddingX = 40;
  const paddingY = 20;

  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(data.length - 1, 1)) * (width - paddingX * 2);
    const y = height - paddingY - ((d.amount - minVal) / (maxVal - minVal)) * (height - paddingY * 2);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : '';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Revenue Trend</span>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {formatCurrency(data.reduce((sum, d) => sum + d.amount, 0), currencySymbol)}
          </p>
        </div>
        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium">
          {(['today', 'week', 'month', 'year'] as const).map(p => (
            <button
              key={p}
              type="button"
              onClick={() => onPeriodChange(p)}
              className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                period === p
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingY + ratio * (height - paddingY * 2);
            return (
              <line
                key={idx}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="currentColor"
                className="text-slate-100 dark:text-slate-800/80"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Area fill */}
          {areaD && <path d={areaD} fill="url(#revenueGradient)" />}

          {/* Line stroke */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points */}
          {points.map((p, idx) => (
            <g key={idx} onMouseEnter={() => setHoveredIdx(idx)} onMouseLeave={() => setHoveredIdx(null)}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === idx ? 6 : 4}
                fill="#10b981"
                className="transition-all cursor-pointer"
              />
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === idx ? 9 : 0}
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeOpacity="0.5"
              />
              <text
                x={p.x}
                y={height - 4}
                textAnchor="middle"
                className="text-[10px] fill-slate-400 font-medium select-none"
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>

        {hoveredIdx !== null && points[hoveredIdx] && (
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl border border-slate-700 pointer-events-none"
          >
            <span className="font-semibold text-emerald-400">
              {formatCurrency(points[hoveredIdx].amount, currencySymbol)}
            </span>{' '}
            ({points[hoveredIdx].label})
          </div>
        )}
      </div>
    </div>
  );
}

export function AttendanceBarChart({
  data,
}: {
  data: { label: string; count: number }[];
}) {
  const maxCount = Math.max(...data.map(d => d.count), 10);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendance Activity</span>
          <p className="text-sm font-bold text-slate-900 dark:text-white">Daily Check-ins</p>
        </div>
        <span className="text-xs text-slate-500">Last 7 Days</span>
      </div>

      <div className="flex items-end justify-between gap-2 h-36 pt-4 px-2">
        {data.map((item, idx) => {
          const heightPercent = Math.max(8, (item.count / maxCount) * 100);
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
              <div className="relative w-full flex justify-center items-end h-28">
                <span className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  {item.count}
                </span>
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full max-w-[28px] bg-emerald-500 hover:bg-emerald-400 rounded-t-md transition-all duration-300 group-hover:scale-y-105 origin-bottom"
                />
              </div>
              <span className="text-[11px] font-medium text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MembershipDistributionDonut({
  data,
}: {
  data: { name: string; percentage: number; color: string; count: number }[];
}) {
  let accumulatedAngle = 0;
  const size = 120;
  const radius = 45;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="w-full flex items-center gap-6">
      <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100 dark:text-slate-800"
          />
          {data.map((item, idx) => {
            const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedAngle;
            accumulatedAngle += (item.percentage / 100) * circumference;

            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs text-slate-400 font-medium">Plans</span>
        </div>
      </div>

      <div className="flex-1 space-y-2">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">
              {item.percentage}% ({item.count})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
