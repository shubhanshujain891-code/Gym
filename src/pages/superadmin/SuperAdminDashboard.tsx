import React from 'react';
import { useStore } from '../../hooks/useStore';
import { ShieldCheck, Building2, Users, Database, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const SuperAdminDashboard: React.FC = () => {
  const store = useStore();
  const gyms = store.getAllGyms();
  const allUsers = store.getAllUsers();
  const activeGymId = store.getActiveGymId();

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-purple-700 font-bold text-xs uppercase mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>SaaS Platform SuperAdmin Control</span>
        </div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Multi-Tenant Gym Branches
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage all gym branches connected to the centralized Hostinger MySQL database
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {gyms.map((g) => {
          const isSelected = g.id === activeGymId;
          return (
            <div
              key={g.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition flex flex-col justify-between ${
                isSelected ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{g.name}</h3>
                    <p className="text-xs text-slate-400">{g.address}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200">
                    {g.planTier} Tier
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Domain Slug</span>
                    <span className="font-mono text-slate-700">{g.slug}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact</span>
                    <span className="text-slate-700">{g.phone}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-600">
                  Status: {g.status.toUpperCase()}
                </span>
                <button
                  onClick={() => store.setActiveGymId(g.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{isSelected ? 'Active Branch' : 'Switch to this Gym'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
