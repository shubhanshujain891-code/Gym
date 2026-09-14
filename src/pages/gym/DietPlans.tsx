import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { DietPlan, Member } from '../../types';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';
import { Utensils, Plus, UserPlus, Flame, Apple, Sparkles } from 'lucide-react';

interface DietPlansProps {
  onSelectMember: (memberId: string) => void;
}

export function DietPlans({ onSelectMember }: DietPlansProps) {
  const { store } = useStore();
  const { success } = useToast();

  const diets = store.getDietPlans();
  const members = store.getMembers();

  const [showAssignModal, setShowAssignModal] = useState<DietPlan | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Simple create diet form
  const [name, setName] = useState('');
  const [goal, setGoal] = useState<DietPlan['goal']>('fat_loss');
  const [calories, setCalories] = useState(2000);
  const [protein, setProtein] = useState(160);
  const [carbs, setCarbs] = useState(180);
  const [fats, setFats] = useState(60);

  const handleAssign = () => {
    if (!showAssignModal || !selectedMemberId) return;
    store.updateMember(selectedMemberId, {
      assignedDietPlanId: showAssignModal.id,
    });
    const m = members.find(mem => mem.id === selectedMemberId);
    success('Diet Assigned', `${showAssignModal.name} assigned to ${m?.firstName} ${m?.lastName}`);
    setShowAssignModal(null);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    store.createDietPlan({
      name,
      goal,
      caloriesTarget: Number(calories),
      proteinGrams: Number(protein),
      carbsGrams: Number(carbs),
      fatsGrams: Number(fats),
      description: 'Balanced macronutrient protocol tailored for fitness goal.',
      meals: [
        {
          name: 'Breakfast',
          time: '08:00 AM',
          items: ['Oatmeal (60g) with Whey Protein', 'Almonds (10pcs)', '1 Banana'],
          calories: 450,
          protein: 35,
          carbs: 55,
          fats: 12,
        },
        {
          name: 'Lunch',
          time: '01:00 PM',
          items: ['Brown Rice (150g)', 'Grilled Chicken Breast or Paneer (150g)', 'Mixed Greens Salad'],
          calories: 650,
          protein: 48,
          carbs: 65,
          fats: 18,
        },
        {
          name: 'Pre-Workout Snack',
          time: '05:00 PM',
          items: ['Whole Wheat Toast (2 slices) with Peanut Butter', 'Black Coffee'],
          calories: 300,
          protein: 12,
          carbs: 35,
          fats: 14,
        },
        {
          name: 'Dinner',
          time: '08:30 PM',
          items: ['Grilled Fish or Tofu (150g)', 'Steamed Broccoli and Veggies', 'Olive Oil Dressing'],
          calories: 400,
          protein: 40,
          carbs: 20,
          fats: 16,
        },
      ],
    });

    success('Diet Plan Created', `${name} added to nutritional templates.`);
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Diet & Nutrition Protocols
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Macronutrient targets, meal timing splits, and member nutrition assignments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Diet Plan</span>
        </button>
      </div>

      {/* Diets Grid - Section 28 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {diets.map(diet => {
          const assignedCount = members.filter(m => m.assignedDietPlanId === diet.id).length;
          const totalMacroGrams = diet.proteinGrams + diet.carbsGrams + diet.fatsGrams;
          const pPct = Math.round((diet.proteinGrams / totalMacroGrams) * 100);
          const cPct = Math.round((diet.carbsGrams / totalMacroGrams) * 100);
          const fPct = Math.round((diet.fatsGrams / totalMacroGrams) * 100);

          return (
            <div
              key={diet.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col justify-between shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                    {diet.goal.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {diet.caloriesTarget} kcal / day
                  </span>
                </div>

                <h3 className="text-lg font-black text-slate-900 dark:text-white">{diet.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{diet.description}</p>

                {/* Macro Distribution Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-emerald-600">P: {diet.proteinGrams}g ({pPct}%)</span>
                    <span className="text-sky-500">C: {diet.carbsGrams}g ({cPct}%)</span>
                    <span className="text-amber-500">F: {diet.fatsGrams}g ({fPct}%)</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
                    <div style={{ width: `${pPct}%` }} className="bg-emerald-500 h-full" />
                    <div style={{ width: `${cPct}%` }} className="bg-sky-500 h-full" />
                    <div style={{ width: `${fPct}%` }} className="bg-amber-500 h-full" />
                  </div>
                </div>

                {/* Meals overview */}
                <div className="py-4 my-4 border-y border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Daily Schedule ({diet.meals.length} Meals)
                  </span>
                  {diet.meals.map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span className="font-semibold">{m.name}</span>
                      <span className="text-slate-400 text-[11px] font-mono">{m.time} • {m.calories} kcal</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(diet);
                    setSelectedMemberId(members[0]?.id || '');
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Assign to Member ({assignedCount} active)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowAssignModal(null)}
          title={`Assign "${showAssignModal.name}"`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              The member will be able to follow this meal breakdown directly in their Member App.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Choose Member
              </label>
              <select
                value={selectedMemberId}
                onChange={e => setSelectedMemberId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.firstName} {m.lastName} ({m.memberCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAssignModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssign}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
              >
                Confirm Diet Assignment
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Diet Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Nutrition Protocol"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Diet Plan Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Vegetarian Lean Bulking (High Protein)"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Goal Category
              </label>
              <select
                value={goal}
                onChange={e => setGoal(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
              >
                <option value="fat_loss">Fat Loss</option>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="maintenance">Maintenance</option>
                <option value="keto">Keto</option>
                <option value="vegetarian">Vegetarian / Vegan</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Calories (kcal)
              </label>
              <input
                type="number"
                value={calories}
                onChange={e => setCalories(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Protein (g)
              </label>
              <input
                type="number"
                value={protein}
                onChange={e => setProtein(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Carbs (g)
              </label>
              <input
                type="number"
                value={carbs}
                onChange={e => setCarbs(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fats (g)
              </label>
              <input
                type="number"
                value={fats}
                onChange={e => setFats(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
            >
              Save Diet Plan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
