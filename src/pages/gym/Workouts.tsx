import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { Dumbbell, Utensils, Plus } from 'lucide-react';

export const Workouts: React.FC = () => {
  const store = useStore();
  const workouts = store.getWorkouts();
  const diets = store.getDiets();

  const [activeTab, setActiveTab] = useState<'workouts' | 'diets'>('workouts');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Workouts & Nutrition Plans
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Assign custom hypertrophy schedules, calorie goals, and meal templates
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('workouts')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'workouts'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Workout Splits</span>
          </button>
          <button
            onClick={() => setActiveTab('diets')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'diets'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Diet & Nutrition</span>
          </button>
        </div>
      </div>

      {activeTab === 'workouts' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workouts.map((w) => (
            <div key={w.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{w.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{w.goal}</p>
                </div>
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase rounded-full border border-blue-200">
                  {w.level}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">{w.description}</p>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-500 pt-3 border-t border-slate-100">
                <span>{w.daysPerWeek} Days / Week</span>
                <span>•</span>
                <span>{w.durationWeeks} Weeks Cycle</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {diets.map((d) => (
            <div key={d.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{d.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{d.goal}</p>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase rounded-full border border-emerald-200">
                  {d.dailyCalories} kcal / day
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{d.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
