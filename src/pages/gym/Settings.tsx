import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { useToast } from '../../components/common/Toast';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  Building2,
  Clock,
  MessageSquare,
  Users,
  Database,
  Save,
  Download,
  Upload,
  RefreshCw,
  DollarSign,
  Globe,
  FileText,
} from 'lucide-react';

export function Settings() {
  const { store, currentGym } = useStore();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'hours' | 'whatsapp' | 'staff' | 'data'>('profile');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Form states for profile
  const [gymName, setGymName] = useState(currentGym.name);
  const [phone, setPhone] = useState(currentGym.phone);
  const [email, setEmail] = useState(currentGym.email);
  const [address, setAddress] = useState(currentGym.address);
  const [currencySymbol, setCurrencySymbol] = useState(currentGym.settings.currencySymbol || '₹');
  const [currencyCode, setCurrencyCode] = useState(currentGym.settings.currencyCode || 'INR');
  const [taxNumber, setTaxNumber] = useState(currentGym.settings.taxNumber || '27AADCB2230M1ZT');
  const [upiId, setUpiId] = useState(currentGym.settings.upiId || 'fitmanage@upi');

  // WhatsApp states
  const [autoReminderDays, setAutoReminderDays] = useState(currentGym.settings.autoReminderDays || 7);
  const [whatsappTemplate, setWhatsappTemplate] = useState(
    currentGym.settings.whatsappTemplate ||
      'Hi {{name}}, your {{plan}} membership at {{gym}} expires on {{date}}. Please renew to continue your training uninterrupted!'
  );

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateGymSettings({
      currencySymbol,
      currencyCode,
      taxNumber,
      upiId,
      autoReminderDays: Number(autoReminderDays),
      whatsappTemplate,
    });
    // Also update gym main entity
    store.updateGym(currentGym.id, {
      name: gymName,
      phone,
      email,
      address,
    });
    success('Settings Saved', 'Gym profile and configuration successfully updated.');
  };

  const handleExportBackup = () => {
    const backupJson = store.exportStateJson();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitmanage_backup_${currentGym.slug}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    success('Backup Exported', 'Full database snapshot downloaded.');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const json = event.target?.result as string;
        store.importStateJson(json);
        success('Backup Restored', 'Database restored successfully.');
      } catch (err: any) {
        error('Restore Failed', 'Invalid JSON backup format.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    store.resetToMockData();
    success('Demo Data Reset', 'Initial sample records reloaded.');
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Gym Configuration & Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage gym business credentials, receipt templates, WhatsApp rules, and database exports.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            activeTab === 'profile'
              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Gym Profile & Tax</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('hours')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            activeTab === 'hours'
              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Operating Hours</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('whatsapp')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            activeTab === 'whatsapp'
              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>WhatsApp Reminders</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            activeTab === 'data'
              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Data & Backups</span>
        </button>
      </div>

      {/* Tab 1: Profile & Tax */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Business Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Gym Business Name
              </label>
              <input
                type="text"
                required
                value={gymName}
                onChange={e => setGymName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                GST / Business Tax ID
              </label>
              <input
                type="text"
                value={taxNumber}
                onChange={e => setTaxNumber(e.target.value)}
                placeholder="e.g. 27AADCB2230M1ZT"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono focus:outline-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Official Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Official Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Gym UPI ID (For Receipt QR)
              </label>
              <input
                type="text"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                placeholder="e.g. ironfitness@okhdfcbank"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono focus:outline-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Physical Street Address
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Currency Symbol
              </label>
              <select
                value={currencySymbol}
                onChange={e => {
                  setCurrencySymbol(e.target.value);
                  if (e.target.value === '₹') setCurrencyCode('INR');
                  else if (e.target.value === '$') setCurrencyCode('USD');
                  else if (e.target.value === '€') setCurrencyCode('EUR');
                  else if (e.target.value === '£') setCurrencyCode('GBP');
                  else if (e.target.value === 'AED') setCurrencyCode('AED');
                }}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
              >
                <option value="₹">₹ (Indian Rupee - INR)</option>
                <option value="$">$ (US Dollar - USD)</option>
                <option value="€">€ (Euro - EUR)</option>
                <option value="£">£ (British Pound - GBP)</option>
                <option value="AED">AED (Emirati Dirham)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Timezone
              </label>
              <select className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500">
                <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT/BST)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST +4:00)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Hours */}
      {activeTab === 'hours' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Gym Floor Operating Hours</h2>
          <p className="text-xs text-slate-400">Timings reflected on member app and guest passes.</p>

          <div className="space-y-3 pt-2">
            {[
              { day: 'Monday – Friday', open: '05:30 AM', close: '10:30 PM', isOpen: true },
              { day: 'Saturday', open: '06:00 AM', close: '09:00 PM', isOpen: true },
              { day: 'Sunday', open: '07:00 AM', close: '02:00 PM', isOpen: true },
            ].map((schedule, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs">
                <span className="font-bold text-slate-900 dark:text-white">{schedule.day}</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  {schedule.open} – {schedule.close}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: WhatsApp Settings */}
      {activeTab === 'whatsapp' && (
        <form onSubmit={handleSaveProfile} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Automated WhatsApp Reminders</h2>
          <p className="text-xs text-slate-400">Configure renewal alerts and notification templates.</p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Advance Expiry Notice Window
            </label>
            <select
              value={autoReminderDays}
              onChange={e => setAutoReminderDays(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-emerald-500"
            >
              <option value={7}>Send reminder 7 days before expiry</option>
              <option value={5}>Send reminder 5 days before expiry</option>
              <option value={3}>Send reminder 3 days before expiry</option>
              <option value={1}>Send reminder 1 day before expiry</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Default Renewal Message Template
            </label>
            <textarea
              rows={4}
              value={whatsappTemplate}
              onChange={e => setWhatsappTemplate(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono focus:outline-emerald-500"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Available variables: {'{{name}}'}, {'{{plan}}'}, {'{{date}}'}, {'{{gym}}'}
            </span>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Save WhatsApp Template</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 4: Data & Backups */}
      {activeTab === 'data' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Local Data Management</h2>
            <p className="text-xs text-slate-400">
              Export offline database backups, import existing archives, or reset sample demo records.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Export Full Backup</h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Save all members, payments, check-ins and plans into a single JSON file.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportBackup}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download JSON</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Restore Backup</h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Upload a previously exported FitManage JSON backup file.
                </p>
              </div>
              <label className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-slate-500" />
                <span>Upload JSON</span>
                <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
              </label>
            </div>

            <div className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-xs font-bold text-rose-700 dark:text-rose-400">Reset Demo Data</h3>
                <p className="text-[11px] text-rose-600/70 dark:text-rose-400/60 mt-1">
                  Reload fresh sample members, payments, and attendance logs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-2xs"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset Store</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset confirmation */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetData}
        title="Reset to Initial Demo State"
        message="This will clear custom additions and reset all members, payments, and attendance to default sample fixtures. Are you sure?"
        confirmText="Yes, Reset Everything"
        variant="danger"
      />
    </div>
  );
}
