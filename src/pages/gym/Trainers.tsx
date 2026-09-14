import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { Trainer, Member } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatDate } from '../../utils/formatters';
import { useToast } from '../../components/common/Toast';
import {
  Dumbbell,
  Plus,
  Edit3,
  Trash2,
  Users,
  Phone,
  Mail,
  Calendar,
  Clock,
  UserCheck,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface TrainersPageProps {
  onSelectMember: (memberId: string) => void;
}

export function Trainers({ onSelectMember }: TrainersPageProps) {
  const { store } = useStore();
  const { success, error } = useToast();

  const trainers = store.getTrainers();
  const members = store.getMembers();

  const [showModal, setShowModal] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [selectedTrainerDetail, setSelectedTrainerDetail] = useState<Trainer | null>(null);
  const [deleteTrainerId, setDeleteTrainerId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [specialization, setSpecialization] = useState('Strength & Conditioning');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [shiftTiming, setShiftTiming] = useState('06:00 AM - 02:00 PM');
  const [notes, setNotes] = useState('');

  const openCreateModal = () => {
    setEditingTrainer(null);
    setName('');
    setPhone('');
    setEmail('');
    setSpecialization('Strength & Conditioning');
    setJoiningDate(new Date().toISOString().split('T')[0]);
    setShiftTiming('06:00 AM - 02:00 PM');
    setNotes('');
    setShowModal(true);
  };

  const openEditModal = (t: Trainer) => {
    setEditingTrainer(t);
    setName(t.name);
    setPhone(t.phone);
    setEmail(t.email);
    setSpecialization(t.specialization);
    setJoiningDate(t.joiningDate);
    setShiftTiming(t.shiftTiming || '06:00 AM - 02:00 PM');
    setNotes(t.notes || '');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Error', 'Trainer name is required.');
      return;
    }

    try {
      if (editingTrainer) {
        store.updateTrainer(editingTrainer.id, {
          name,
          phone,
          email,
          specialization,
          joiningDate,
          shiftTiming,
          notes,
        });
        success('Trainer Updated', `${name}'s profile has been updated.`);
      } else {
        store.createTrainer({
          name,
          phone,
          email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          specialization,
          joiningDate,
          shiftTiming,
          notes,
          status: 'active',
        });
        success('Trainer Added', `${name} joined the fitness staff.`);
      }
      setShowModal(false);
    } catch (err: any) {
      error('Failed to save', err.message);
    }
  };

  const handleDelete = () => {
    if (!deleteTrainerId) return;
    store.deleteTrainer(deleteTrainerId);
    success('Trainer Removed', 'Staff trainer record archived.');
    setDeleteTrainerId(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Personal Trainers & Coaches
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage fitness trainers, client member rosters, specialties, and schedules.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Trainer</span>
        </button>
      </div>

      {/* Trainers Grid - Section 22 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainers.map(trainer => {
          const assignedMembers = members.filter(m => m.primaryTrainerId === trainer.id);

          return (
            <div
              key={trainer.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col justify-between shadow-2xs transition-all hover:border-emerald-500/40"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-lg flex items-center justify-center shrink-0 overflow-hidden">
                      {trainer.avatarUrl ? (
                        <img src={trainer.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        trainer.name[0]
                      )}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                        {trainer.name}
                      </h3>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold block">
                        {trainer.specialization}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      trainer.status === 'active'
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {trainer.status}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2 py-3 border-y border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{trainer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{trainer.shiftTiming || 'Morning / Evening Split'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Joined: {formatDate(trainer.joiningDate)}</span>
                  </div>
                </div>

                {/* Assigned Member Count Badge */}
                <div
                  onClick={() => setSelectedTrainerDetail(trainer)}
                  className="mt-4 p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between cursor-pointer hover:bg-emerald-100/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {assignedMembers.length} Assigned Clients
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-600" />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => openEditModal(trainer)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteTrainerId(trainer.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Remove Trainer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trainer Assigned Client List Drawer / Modal - Section 24 */}
      {selectedTrainerDetail && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedTrainerDetail(null)}
          title={`${selectedTrainerDetail.name}'s Client Roster`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-bold block">Specialty</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedTrainerDetail.specialization}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 uppercase text-[10px] font-bold block">Total Active Clients</span>
                <span className="font-bold text-emerald-600">
                  {members.filter(m => m.primaryTrainerId === selectedTrainerDetail.id).length} Members
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
              {members
                .filter(m => m.primaryTrainerId === selectedTrainerDetail.id)
                .map(m => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setSelectedTrainerDetail(null);
                      onSelectMember(m.id);
                    }}
                    className="py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 px-2 rounded-xl cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-600 font-bold flex items-center justify-center text-xs">
                        {m.firstName[0]}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-900 dark:text-white">
                          {m.firstName} {m.lastName}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {m.memberCode} • Plan: {m.currentPlanName}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-emerald-600 font-semibold hover:underline">
                      View Profile →
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Trainer Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingTrainer ? 'Edit Trainer Details' : 'Add Personal Trainer'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Trainer Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Vikram Singh"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98711 55667"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vikram@gym.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Specialization / Discipline
            </label>
            <select
              value={specialization}
              onChange={e => setSpecialization(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
            >
              <option value="Strength & Conditioning">Strength & Conditioning</option>
              <option value="Fat Loss & Functional">Fat Loss & Functional Fitness</option>
              <option value="Bodybuilding & Hypertrophy">Bodybuilding & Hypertrophy</option>
              <option value="CrossFit & Endurance">CrossFit & High Intensity</option>
              <option value="Yoga & Mobility">Yoga & Mobility</option>
              <option value="Rehab & Posture">Postural Rehab & Kinesiology</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Joining Date
              </label>
              <input
                type="date"
                value={joiningDate}
                onChange={e => setJoiningDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Daily Shift Timing
              </label>
              <input
                type="text"
                value={shiftTiming}
                onChange={e => setShiftTiming(e.target.value)}
                placeholder="e.g. 06:00 AM - 02:00 PM"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
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
              {editingTrainer ? 'Update Trainer' : 'Add Trainer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteTrainerId}
        onClose={() => setDeleteTrainerId(null)}
        onConfirm={handleDelete}
        title="Remove Personal Trainer"
        message="Are you sure you want to remove this trainer? Their clients will remain active on the gym roster without an assigned trainer."
        confirmText="Remove Trainer"
        variant="danger"
      />
    </div>
  );
}
