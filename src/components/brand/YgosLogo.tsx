import React from 'react';

interface YgosLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  showParentBrand?: boolean;
  variant?: 'light' | 'dark';
}

export const YgosLogo: React.FC<YgosLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  showParentBrand = true,
  variant = 'dark',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
    xl: 'w-14 h-14 text-xl',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  const subSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-xs',
  };

  const isLight = variant === 'light';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Geometric SaaS Glyph with Lime Accent */}
      <div
        className={`${iconSizes[size]} rounded-xl bg-slate-950 text-white flex items-center justify-center font-black tracking-tighter relative shadow-sm border border-slate-800/80 group shrink-0`}
      >
        <span className="relative z-10 flex items-center font-black">
          <span className="text-white">Y</span>
          <span className="text-lime-400">G</span>
        </span>
        {/* Energetic Lime Accent Indicator */}
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-lime-400 ring-2 ring-white dark:ring-slate-900" />
      </div>

      {/* Brand Text Lockup */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-extrabold tracking-tight ${titleSizes[size]} ${
              isLight ? 'text-white' : 'text-slate-950'
            }`}
          >
            YGOS
          </span>

          {showParentBrand && (
            <span
              className={`text-[9px] font-semibold tracking-wide px-1.5 py-0.5 rounded-md border ${
                isLight
                  ? 'bg-slate-800/80 text-slate-300 border-slate-700'
                  : 'bg-slate-100 text-slate-500 border-slate-200/80'
              }`}
            >
              by YBGP
            </span>
          )}
        </div>

        {showSubtitle && (
          <span
            className={`font-semibold tracking-wider uppercase ${subSizes[size]} ${
              isLight ? 'text-slate-400' : 'text-slate-500'
            } mt-0.5`}
          >
            Your Gym OS
          </span>
        )}
      </div>
    </div>
  );
};
