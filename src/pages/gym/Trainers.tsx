import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { Trainer } from '../../types';
import { Modal } from '../../components/common/Modal';
import { UserCheck, Plus, Star, Phone, Mail, Clock, Trash2 } from 'lucide-react';

export const Trainers: React.FC = () => {
  const store = useStore();
  const trainers = store.getTrainers();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [specialization, setSpecialization] = useState('CrossFit & Hypertrophy');
  const [shift, setShift] = useState<'morning' | 'evening' | 'full_day'>('morning');
  const [experienceYears, setExperienceYears] = useState(3);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    store.addTrainer({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      specialization: specialization.trim(),
      shift,
      experienceYears,
      rating: 5.0,
      status: 'active',
    });

    setIsAddOpen(false);
    setName('');
    setPhone('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Fitness Trainers & Coaches</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your personal trainers, certifications, client rosters, and schedules
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition shadow-xs self-start sm:self-auto border border-slate-800"
        >
          <Plus className="w-4 h-4 text-lime-400" />
          <span>Add Trainer</span>
        </button>
      </div>

      {/* Trainers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainers.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-lg">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{t.name}</h3>
                    <p className="text-xs text-emerald-600 font-medium">{t.specialization}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-xs font-bold border border-amber-200">
                  <Star className="w-3 h-3 fill-current" />
                  <span>{t.rating || '5.0'}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.phone}</span>
                </div>
                {t.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="capitalize">{t.shift.replace('_', ' ')} Shift • {t.experienceYears} Yrs Exp</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase border border-emerald-200">
                Active Staff
              </span>
              <button
                onClick={() => {
                  if (confirm(`Remove trainer ${t.name}?`)) {
                    store.deleteTrainer(t.id);
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

      {/* Add Trainer Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Fitness Trainer">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Arjun Kapoor"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Phone *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98222 33445"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="trainer@gym.com"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Specialization</label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g. Strength & Conditioning"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Shift</label>
              <select
                value={shift}
                onChange={(e: any) => setShift(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="morning">Morning Shift</option>
                <option value="evening">Evening Shift</option>
                <option value="full_day">Full Day</option>
              </select>
            </div>
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
              Save Trainer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
