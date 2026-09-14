import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { WorkoutPlan, Member } from '../../types';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';
import { Dumbbell, Plus, UserPlus, Check, Flame, Award, Trash2 } from 'lucide-react';

interface WorkoutsProps {
  onSelectMember: (memberId: string) => void;
}

export function Workouts({ onSelectMember }: WorkoutsProps) {
  const { store } = useStore();
  const { success, error } = useToast();

  const workouts = store.getWorkouts();
  const members = store.getMembers();

  const [showAssignModal, setShowAssignModal] = useState<WorkoutPlan | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Simple create plan form
  const [planName, setPlanName] = useState('');
  const [goal, setGoal] = useState<WorkoutPlan['goal']>('muscle_building');
  const [level, setLevel] = useState<WorkoutPlan['level']>('intermediate');
  const [description, setDescription] = useState('');

  const handleAssign = () => {
    if (!showAssignModal || !selectedMemberId) return;
    store.updateMember(selectedMemberId, {
      assignedWorkoutPlanId: showAssignModal.id,
    });
    const m = members.find(mem => mem.id === selectedMemberId);
    const planTitle = showAssignModal.title || showAssignModal.name || 'Workout Plan';
    success('Workout Assigned', `${planTitle} assigned to ${m?.firstName} ${m?.lastName}`);
    setShowAssignModal(null);
  };

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim()) return;

    store.createWorkout({
      title: planName,
      name: planName,
      goal,
      level,
      durationWeeks: 8,
      description: description || 'Custom training program tailored for progressive overload.',
      assignedMemberIds: [],
      days: [
        {
          dayName: 'Day 1: Upper Body Push',
          focus: 'Chest, Shoulders & Triceps',
          exercises: [
            { id: 'ex-1', name: 'Barbell Flat Bench Press', muscleGroup: 'Chest', sets: 4, reps: '8-10', restSeconds: 90 },
            { id: 'ex-2', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', sets: 3, reps: '10-12', restSeconds: 60 },
            { id: 'ex-3', name: 'Standing Overhead Press', muscleGroup: 'Shoulders', sets: 3, reps: '8-10', restSeconds: 90 },
            { id: 'ex-4', name: 'Cable Tricep Pushdowns', muscleGroup: 'Arms', sets: 3, reps: '12-15', restSeconds: 45 },
          ],
        },
        {
          dayName: 'Day 2: Lower Body & Core',
          focus: 'Quads, Hamstrings & Calves',
          exercises: [
            { id: 'ex-5', name: 'Barbell Back Squats', muscleGroup: 'Legs', sets: 4, reps: '8-10', restSeconds: 120 },
            { id: 'ex-6', name: 'Romanian Deadlifts', muscleGroup: 'Legs', sets: 3, reps: '10-12', restSeconds: 90 },
            { id: 'ex-7', name: 'Leg Press', muscleGroup: 'Legs', sets: 3, reps: '12-15', restSeconds: 60 },
            { id: 'ex-8', name: 'Hanging Leg Raises', muscleGroup: 'Core', sets: 3, reps: '15-20', restSeconds: 45 },
          ],
        },
      ],
    });

    success('Workout Plan Created', `${planName} has been added to library.`);
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Workout Plans & Routines
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Exercise splits, training protocols, and personalized member assignments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Workout Plan</span>
        </button>
      </div>

      {/* Workout Plans Grid - Section 25 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workouts.map(plan => {
          const assignedCount = members.filter(m => m.assignedWorkoutPlanId === plan.id).length;
          const totalExercises = plan.days.reduce((sum, d) => sum + d.exercises.length, 0);

          return (
            <div
              key={plan.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col justify-between shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                    {plan.goal.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 capitalize">{plan.level}</span>
                </div>

                <h3 className="text-lg font-black text-slate-900 dark:text-white">{plan.title || plan.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{plan.description}</p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 py-4 my-4 border-y border-slate-100 dark:border-slate-800 text-center text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Days</span>
                    <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                      {plan.days.length} / week
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Exercises</span>
                    <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                      {totalExercises} total
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Active</span>
                    <span className="font-bold text-emerald-600 mt-0.5 block">{assignedCount} members</span>
                  </div>
                </div>

                {/* Day splits summary */}
                <div className="space-y-1.5 mb-4">
                  {plan.days.slice(0, 3).map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                      <span className="font-semibold">{d.dayName}</span>
                      <span className="text-slate-400 text-[11px]">{d.exercises.length} moves</span>
                    </div>
                  ))}
                  {plan.days.length > 3 && (
                    <span className="text-[11px] text-slate-400 block italic">
                      + {plan.days.length - 3} more training days
                    </span>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(plan);
                    setSelectedMemberId(members[0]?.id || '');
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Assign to Member</span>
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
              Select the member who will receive this training regimen on their member portal.
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
                Confirm Assignment
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Plan Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Workout Template"
        maxWidth="md"
      >
        <form onSubmit={handleCreatePlan} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Plan Title *
            </label>
            <input
              type="text"
              required
              value={planName}
              onChange={e => setPlanName(e.target.value)}
              placeholder="e.g. Powerlifting & Peaking 8-Week"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Goal
              </label>
              <select
                value={goal}
                onChange={e => setGoal(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
              >
                <option value="muscle_building">Muscle Building / Hypertrophy</option>
                <option value="weight_loss">Fat Loss & Conditioning</option>
                <option value="strength">Maximum Strength</option>
                <option value="endurance">Endurance & Cardio</option>
                <option value="general_fitness">General Health</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Level
              </label>
              <select
                value={level}
                onChange={e => setLevel(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced / Athlete</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Program notes and weekly progression structure..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
            />
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
              Create Workout
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
