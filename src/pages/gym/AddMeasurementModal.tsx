import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { store } from '../../services/store';
import { useToast } from '../../components/common/Toast';
import { TrendingUp } from 'lucide-react';

interface AddMeasurementModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
}

export function AddMeasurementModal({ isOpen, onClose, memberId }: AddMeasurementModalProps) {
  const { success, error } = useToast();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weightKg, setWeightKg] = useState<number>(75);
  const [heightCm, setHeightCm] = useState<number>(175);
  const [chestInches, setChestInches] = useState<number>(38);
  const [waistInches, setWaistInches] = useState<number>(32);
  const [hipsInches, setHipsInches] = useState<number>(36);
  const [bicepsInches, setBicepsInches] = useState<number>(14);
  const [thighsInches, setThighsInches] = useState<number>(22);
  const [bodyFatPercentage, setBodyFatPercentage] = useState<number>(18);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightKg || weightKg <= 0) {
      error('Invalid Weight', 'Please enter a valid weight in kg.');
      return;
    }

    try {
      store.recordMeasurement({
        memberId,
        date,
        weightKg: Number(weightKg),
        heightCm: Number(heightCm),
        chestInches: Number(chestInches),
        waistInches: Number(waistInches),
        hipsInches: Number(hipsInches),
        bicepsInches: Number(bicepsInches),
        thighsInches: Number(thighsInches),
        bodyFatPercentage: Number(bodyFatPercentage),
        notes,
      });

      success('Measurements Saved!', 'Progress record added to member profile.');
      onClose();
    } catch (err: any) {
      error('Failed to save', err.message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Body Measurements" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Assessment Date *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Weight (kg) *
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={weightKg}
              onChange={e => setWeightKg(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-emerald-600 focus:outline-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Height (cm)
            </label>
            <input
              type="number"
              value={heightCm}
              onChange={e => setHeightCm(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Chest (in)
            </label>
            <input
              type="number"
              step="0.1"
              value={chestInches}
              onChange={e => setChestInches(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Waist (in)
            </label>
            <input
              type="number"
              step="0.1"
              value={waistInches}
              onChange={e => setWaistInches(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Biceps (in)
            </label>
            <input
              type="number"
              step="0.1"
              value={bicepsInches}
              onChange={e => setBicepsInches(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Thighs (in)
            </label>
            <input
              type="number"
              step="0.1"
              value={thighsInches}
              onChange={e => setThighsInches(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Body Fat %
            </label>
            <input
              type="number"
              step="0.1"
              value={bodyFatPercentage}
              onChange={e => setBodyFatPercentage(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Trainer Notes
          </label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Good progress on body recomposition"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Save Measurements</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
