import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { MembershipPlan } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatCurrency } from '../../utils/formatters';
import { useToast } from '../../components/common/Toast';
import { Layers, Plus, Check, Edit3, Trash2, Users, ShieldCheck, Zap } from 'lucide-react';

export function MembershipPlans() {
  const { store, currentGym } = useStore();
  const { success, error } = useToast();
  const currencySymbol = currentGym.settings.currencySymbol || '₹';

  const plans = store.getPlans();
  const members = store.getMembers();

  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [deletePlanId, setDeletePlanId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [durationMonths, setDurationMonths] = useState(1);
  const [price, setPrice] = useState(1500);
  const [description, setDescription] = useState('');
  const [accessType, setAccessType] = useState<MembershipPlan['accessType']>('all_access');
  const [ptSessionsIncluded, setPtSessionsIncluded] = useState(0);
  const [freezeDaysAllowed, setFreezeDaysAllowed] = useState(0);
  const [featureInput, setFeatureInput] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);

  const openCreateModal = () => {
    setEditingPlan(null);
    setName('');
    setDurationMonths(1);
    setPrice(1500);
    setDescription('');
    setAccessType('all_access');
    setPtSessionsIncluded(0);
    setFreezeDaysAllowed(0);
    setFeatures([
      'Access to Gym Floor & Cardio Zone',
      'Free Locker & Shower Access',
      'Initial Fitness Assessment',
    ]);
    setIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setDurationMonths(plan.durationMonths);
    setPrice(plan.price);
    setDescription(plan.description);
    setAccessType(plan.accessType);
    setPtSessionsIncluded(plan.ptSessionsIncluded);
    setFreezeDaysAllowed(plan.freezeDaysAllowed);
    setFeatures([...plan.features]);
    setIsActive(plan.isActive);
    setShowModal(true);
  };

  const handleAddFeature = () => {
    if (!featureInput.trim()) return;
    setFeatures([...features, featureInput.trim()]);
    setFeatureInput('');
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Validation Error', 'Please enter a plan name.');
      return;
    }
    if (price <= 0) {
      error('Validation Error', 'Price must be greater than 0.');
      return;
    }

    try {
      if (editingPlan) {
        store.updatePlan(editingPlan.id, {
          name,
          durationMonths: Number(durationMonths),
          price: Number(price),
          description,
          accessType,
          ptSessionsIncluded: Number(ptSessionsIncluded),
          freezeDaysAllowed: Number(freezeDaysAllowed),
          features,
          isActive,
        });
        success('Plan Updated', `${name} plan updated successfully.`);
      } else {
        store.createPlan({
          name,
          durationMonths: Number(durationMonths),
          price: Number(price),
          description,
          accessType,
          ptSessionsIncluded: Number(ptSessionsIncluded),
          freezeDaysAllowed: Number(freezeDaysAllowed),
          features,
          isActive,
        });
        success('Plan Created', `${name} plan has been launched.`);
      }
      setShowModal(false);
    } catch (err: any) {
      error('Failed to save plan', err.message);
    }
  };

  const handleDelete = () => {
    if (!deletePlanId) return;
    store.deletePlan(deletePlanId);
    success('Plan Removed', 'Membership plan archived.');
    setDeletePlanId(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Membership Packages
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure subscription pricing tiers, durations, benefits, and personal training inclusions.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Membership Plan</span>
        </button>
      </div>

      {/* Plan Cards Grid - Section 14 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map(plan => {
          const subscriberCount = members.filter(m => m.currentPlanId === plan.id).length;

          return (
            <div
              key={plan.id}
              className={`rounded-3xl border p-6 flex flex-col justify-between transition-all ${
                plan.isActive
                  ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-2xs'
                  : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              <div>
                {/* Top badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                    {plan.durationMonths} {plan.durationMonths === 1 ? 'Month' : 'Months'}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{subscriberCount} members</span>
                  </div>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{plan.name}</h3>
                <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.description}</p>

                {/* Price Display */}
                <div className="mt-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    {formatCurrency(plan.price, currencySymbol)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium ml-1">
                    / {plan.durationMonths === 1 ? 'month' : `${plan.durationMonths} mos`}
                  </span>
                </div>

                {/* Highlights */}
                <div className="py-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800">
                  <span>PT Sessions:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {plan.ptSessionsIncluded > 0 ? `${plan.ptSessionsIncluded} sessions` : 'None'}
                  </span>
                </div>
                <div className="py-2.5 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800">
                  <span>Freeze Days Allowed:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {plan.freezeDaysAllowed > 0 ? `${plan.freezeDaysAllowed} days` : 'Not permitted'}
                  </span>
                </div>

                {/* Features List */}
                <div className="mt-4 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Included Benefits
                  </span>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => openEditModal(plan)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Plan</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeletePlanId(plan.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Archive Plan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Plan Modal (Create / Edit) - Section 15 */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingPlan ? 'Edit Membership Plan' : 'Create Membership Plan'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Plan Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Annual Elite Transformation"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Duration (Months) *
              </label>
              <select
                value={durationMonths}
                onChange={e => setDurationMonths(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
              >
                <option value={1}>1 Month (Monthly)</option>
                <option value={3}>3 Months (Quarterly)</option>
                <option value={6}>6 Months (Half-Yearly)</option>
                <option value={12}>12 Months (Annual)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Price ({currencySymbol}) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={price}
                onChange={e => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-emerald-600 focus:outline-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Access Type
              </label>
              <select
                value={accessType}
                onChange={e => setAccessType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
              >
                <option value="all_access">All Access (Gym + Cardio + Steam)</option>
                <option value="gym_cardio">Gym Floor & Cardio</option>
                <option value="gym_only">Weights Only</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Personal Training Sessions Included
              </label>
              <input
                type="number"
                min="0"
                value={ptSessionsIncluded}
                onChange={e => setPtSessionsIncluded(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Membership Freeze Days Allowed
              </label>
              <input
                type="number"
                min="0"
                value={freezeDaysAllowed}
                onChange={e => setFreezeDaysAllowed(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Short Description
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Best for dedicated individuals seeking long-term body transformation"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
            />
          </div>

          {/* Features Builder */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Features & Benefits
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={featureInput}
                onChange={e => setFeatureInput(e.target.value)}
                placeholder="e.g. Free Diet Consultation & InBody Scan"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {features.map((f, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs"
                >
                  <span>{f}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(i)}
                    className="text-slate-400 hover:text-rose-500 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
            >
              {editingPlan ? 'Update Plan' : 'Publish Plan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deletePlanId}
        onClose={() => setDeletePlanId(null)}
        onConfirm={handleDelete}
        title="Archive Membership Plan"
        message="Are you sure? Existing members on this plan will continue unaffected, but new registrations cannot choose it."
        confirmText="Archive Plan"
        variant="danger"
      />
    </div>
  );
}
