import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { MembershipPlan } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Modal } from '../../components/common/Modal';
import { Layers, Plus, Check, Trash2, Star } from 'lucide-react';

export const MembershipPlans: React.FC = () => {
  const store = useStore();
  const gym = store.getActiveGym();
  const plans = store.getPlans();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [durationMonths, setDurationMonths] = useState(1);
  const [price, setPrice] = useState(1999);
  const [admissionFee, setAdmissionFee] = useState(0);
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState('Gym Floor Access, Locker Room, Steam Bath');

  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    store.addPlan({
      name: name.trim(),
      durationMonths,
      price,
      admissionFee,
      description: description.trim(),
      popular: false,
      isActive: true,
      features: features.split(',').map((f) => f.trim()).filter(Boolean),
    });

    setIsAddOpen(false);
    setName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Membership Packages</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure subscription tiers, group packages, and admission fees
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Package</span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-2xl border p-6 flex flex-col justify-between transition relative shadow-xs ${
              plan.popular
                ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 right-6 bg-emerald-600 text-white px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-xs">
                <Star className="w-3 h-3 fill-current" /> Most Popular
              </span>
            )}

            <div>
              <h3 className="text-base font-bold text-slate-900">{plan.name}</h3>
              <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.description}</p>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">
                  {formatCurrency(plan.price, gym.settings.currencySymbol)}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  / {plan.durationMonths} {plan.durationMonths === 1 ? 'Month' : 'Months'}
                </span>
              </div>

              {plan.admissionFee && plan.admissionFee > 0 ? (
                <p className="text-[11px] text-slate-500 mt-1">
                  + {formatCurrency(plan.admissionFee, gym.settings.currencySymbol)} Admission Fee
                </p>
              ) : null}

              {/* Features List */}
              <div className="mt-6 space-y-2.5">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Features</p>
                {plan.features?.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                    <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Duration: {plan.durationMonths} Mo
              </span>
              <button
                onClick={() => {
                  if (confirm(`Delete plan "${plan.name}"?`)) {
                    store.deletePlan(plan.id);
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Plan Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create Membership Plan">
        <form onSubmit={handleAddPlan} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Plan Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 6 Months Strength + Cardio"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Duration (Months)</label>
              <input
                type="number"
                min="1"
                max="36"
                value={durationMonths}
                onChange={(e) => setDurationMonths(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Price ({gym.settings.currencySymbol})
              </label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of what this plan includes..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Included Features (comma separated)
            </label>
            <input
              type="text"
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder="Gym Floor, Steam Bath, Locker"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="flex-1 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition shadow-xs"
            >
              Save Package
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
