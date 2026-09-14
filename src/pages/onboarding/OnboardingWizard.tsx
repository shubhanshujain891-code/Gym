import React, { useState } from 'react';
import { store } from '../../services/store';
import { useToast } from '../../components/common/Toast';
import { Building2, User, MapPin, Phone, Image, Layers, Dumbbell, CheckCircle2, ArrowRight, ArrowLeft, SkipForward } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OnboardingWizardProps {
  onComplete: () => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const currentGym = store.getCurrentGym();
  const { success } = useToast();

  const [step, setStep] = useState(1);
  const totalSteps = 8;

  const [formData, setFormData] = useState({
    gymName: currentGym.name || 'IronPulse Fitness Club',
    tagline: currentGym.settings.tagline || 'Run Your Gym. Grow Your Members.',
    ownerName: currentGym.ownerName || 'Rajesh Patel',
    ownerEmail: currentGym.ownerEmail || 'owner@example.com',
    ownerPhone: currentGym.ownerPhone || '+91 98765 43210',
    address: currentGym.settings.address || 'Plot 42, 100ft Road, Indiranagar, Bengaluru',
    phone: currentGym.settings.phone || '+91 98765 43210',
    whatsapp: '+91 98765 43210',
    logoUrl: currentGym.settings.logoUrl || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150',
    firstPlanName: 'Monthly Starter',
    firstPlanPrice: 1500,
    firstPlanDuration: 1,
    trainerName: 'Vikram Singh',
    trainerSpecialization: 'Strength & Conditioning',
    trainerPhone: '+91 98711 55667',
  });

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      finishSetup();
    }
  };

  const handleSkip = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      finishSetup();
    }
  };

  const finishSetup = () => {
    store.updateGymSettings({
      name: formData.gymName,
      tagline: formData.tagline,
      address: formData.address,
      phone: formData.phone,
      logoUrl: formData.logoUrl,
    });

    // Create first plan if modified
    if (formData.firstPlanName && formData.firstPlanPrice > 0) {
      store.createPlan({
        name: formData.firstPlanName,
        durationMonths: formData.firstPlanDuration,
        price: Number(formData.firstPlanPrice),
        description: 'Primary onboarding plan',
        accessType: 'all_access',
        ptSessionsIncluded: 0,
        freezeDaysAllowed: 0,
        isActive: true,
      });
    }

    // Create trainer if modified
    if (formData.trainerName) {
      store.createTrainer({
        name: formData.trainerName,
        phone: formData.trainerPhone,
        email: 'trainer@example.com',
        specialization: formData.trainerSpecialization,
        joiningDate: new Date().toISOString().split('T')[0],
        status: 'active',
      });
    }

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    success('Welcome to FitManage!', 'Gym setup completed successfully.');
    onComplete();
  };

  const stepsHeader = [
    { num: 1, label: 'Gym Name' },
    { num: 2, label: 'Owner' },
    { num: 3, label: 'Address' },
    { num: 4, label: 'Phone' },
    { num: 5, label: 'Logo' },
    { num: 6, label: 'Plans' },
    { num: 7, label: 'Trainer' },
    { num: 8, label: 'Complete' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 text-slate-800 dark:text-slate-100">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Top Progress bar */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Gym Owner Setup Wizard
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Step {step} of {totalSteps}
            </span>
          </div>

          {/* Stepper bubbles */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
            {stepsHeader.map(s => (
              <div key={s.num} className="flex items-center gap-1.5 shrink-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    s.num === step
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950'
                      : s.num < step
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {s.num < step ? '✓' : s.num}
                </div>
                {s.num < totalSteps && (
                  <div className={`w-3 sm:w-6 h-0.5 ${s.num < step ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 sm:p-8 min-h-[320px] flex flex-col justify-center">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mb-2">
                <Building2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">What is your gym's name?</h2>
              <p className="text-xs text-slate-500">This will appear on all receipts, dashboards, and WhatsApp templates.</p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Gym Name *</label>
                <input
                  type="text"
                  value={formData.gymName}
                  onChange={e => setFormData({ ...formData, gymName: e.target.value })}
                  placeholder="e.g. IronPulse Fitness & Strength"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tagline / Slogan</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. Run Your Gym. Grow Your Members."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-emerald-500"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mb-2">
                <User className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Owner Information</h2>
              <p className="text-xs text-slate-500">Primary administrator details for account verification.</p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={formData.ownerEmail}
                    onChange={e => setFormData({ ...formData, ownerEmail: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Mobile Phone</label>
                  <input
                    type="text"
                    value={formData.ownerPhone}
                    onChange={e => setFormData({ ...formData, ownerPhone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mb-2">
                <MapPin className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Gym Address & Location</h2>
              <p className="text-xs text-slate-500">Printed on official payment receipts and member bills.</p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Physical Address</label>
                <textarea
                  rows={3}
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street, Landmark, City, State, PIN code"
                  className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-emerald-500"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mb-2">
                <Phone className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Gym Phone & WhatsApp</h2>
              <p className="text-xs text-slate-500">Members will receive automated and manual WhatsApp alerts from this number.</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Reception Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Official WhatsApp</label>
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mb-2">
                <Image className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Gym Logo</h2>
              <p className="text-xs text-slate-500">Add a direct URL to your gym's logo.</p>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                  <img src={formData.logoUrl} alt="Logo preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Logo URL</label>
                  <input
                    type="text"
                    value={formData.logoUrl}
                    onChange={e => setFormData({ ...formData, logoUrl: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mb-2">
                <Layers className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create First Membership Plan</h2>
              <p className="text-xs text-slate-500">Define your primary membership tier.</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Plan Name</label>
                  <input
                    type="text"
                    value={formData.firstPlanName}
                    onChange={e => setFormData({ ...formData, firstPlanName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Price (₹)</label>
                  <input
                    type="number"
                    value={formData.firstPlanPrice}
                    onChange={e => setFormData({ ...formData, firstPlanPrice: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mb-2">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add Your First Trainer</h2>
              <p className="text-xs text-slate-500">Optional: You can add more trainers later from the Trainers tab.</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Trainer Name</label>
                  <input
                    type="text"
                    value={formData.trainerName}
                    onChange={e => setFormData({ ...formData, trainerName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Specialization</label>
                  <input
                    type="text"
                    value={formData.trainerSpecialization}
                    onChange={e => setFormData({ ...formData, trainerSpecialization: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 8 && (
            <div className="text-center py-6 space-y-4 animate-in fade-in">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">You're All Set!</h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                {formData.gymName} is now configured and ready to run. You can manage members, collect fees, mark attendance, and track growth.
              </p>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {step < totalSteps && (
              <button
                type="button"
                onClick={handleSkip}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                <span>Skip</span>
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <span>{step === totalSteps ? 'Launch Gym SaaS' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
