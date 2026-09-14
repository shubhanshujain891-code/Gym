import React, { useState, useMemo } from 'react';
import { useStore } from '../../hooks/useStore';
import { AttendanceRecord, Member } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { formatDate } from '../../utils/formatters';
import { QRScannerModal } from '../../components/qr/QRComponents';
import { useToast } from '../../components/common/Toast';
import {
  UserCheck,
  QrCode,
  Calendar,
  Clock,
  Search,
  Download,
  Users,
  Sun,
  Moon,
  Flame,
  Plus,
} from 'lucide-react';

interface AttendancePageProps {
  onSelectMember: (memberId: string) => void;
}

export function Attendance({ onSelectMember }: AttendancePageProps) {
  const { store } = useStore();
  const { success, warning } = useToast();

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showScanner, setShowScanner] = useState(false);
  const [manualSearch, setManualSearch] = useState('');

  const attendance = store.getAttendance();
  const members = store.getMembers();

  // Records for selected date
  const dateRecords = useMemo(() => {
    return attendance
      .filter(a => a.date === selectedDate)
      .sort((a, b) => (b.checkInTime || b.time || '').localeCompare(a.checkInTime || a.time || ''));
  }, [attendance, selectedDate]);

  // Metric breakdown (Section 20)
  const totalCheckIns = dateRecords.length;

  const morningCheckIns = dateRecords.filter(r => {
    const timeStr = r.checkInTime || r.time || '00:00';
    const hour = parseInt(timeStr.split(':')[0], 10);
    return hour >= 5 && hour < 12;
  }).length;

  const eveningCheckIns = dateRecords.filter(r => {
    const timeStr = r.checkInTime || r.time || '00:00';
    const hour = parseInt(timeStr.split(':')[0], 10);
    return hour >= 16 && hour < 22;
  }).length;

  // Manual search candidates
  const manualCandidates = useMemo(() => {
    if (!manualSearch.trim()) return [];
    const q = manualSearch.toLowerCase();
    const checkedInMemberIds = new Set(dateRecords.map(r => r.memberId));

    return members
      .filter(
        m =>
          `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) ||
          m.memberCode.toLowerCase().includes(q) ||
          m.phone.includes(q)
      )
      .map(m => ({
        member: m,
        alreadyCheckedIn: checkedInMemberIds.has(m.id),
      }))
      .slice(0, 5);
  }, [manualSearch, members, dateRecords]);

  const handleManualCheckIn = (memberId: string) => {
    const res = store.markAttendance(memberId, 'manual');
    if (res.success) {
      success('Check-In Recorded', res.message);
      setManualSearch('');
    } else {
      warning('Attendance Alert', res.message);
    }
  };

  const handleExportAttendance = () => {
    const headers = 'Date,Time,Member ID,Member Name,Method,Status\n';
    const rows = dateRecords
      .map(
        r =>
          `"${r.date}","${r.checkInTime || r.time || ''}","${r.memberCode}","${r.memberName}","${(r.checkInMethod || r.method || 'manual').replace('_', ' ')}","${r.status || 'present'}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitmanage_attendance_${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    success('Attendance Exported', `Downloaded check-ins for ${selectedDate}`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Daily Attendance
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time floor check-ins, optical QR code verification, and visit trends.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs focus:outline-emerald-500"
          />

          <button
            type="button"
            onClick={handleExportAttendance}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            type="button"
            onClick={() => setShowScanner(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan QR Pass</span>
          </button>
        </div>
      </div>

      {/* Summary Cards - Section 20 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Check-Ins</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalCheckIns}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Recorded for {formatDate(selectedDate)}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Morning Slot</span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{morningCheckIns}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">06:00 AM – 12:00 PM</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Evening Slot</span>
            <Moon className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{eveningCheckIns}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">04:00 PM – 10:00 PM</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Peak Hour</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">7:00 PM</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Highest daily capacity</p>
        </div>
      </div>

      {/* Manual Mark Check-In Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          Manual Reception Check-In (Search Member)
        </label>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Type member name, phone or ID to check in immediately..."
            value={manualSearch}
            onChange={e => setManualSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-emerald-500"
          />
        </div>

        {manualCandidates.length > 0 && (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/40">
            {manualCandidates.map(({ member, alreadyCheckedIn }) => (
              <div key={member.id} className="p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-600 font-bold flex items-center justify-center">
                    {member.firstName[0]}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {member.firstName} {member.lastName}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px] block">
                      {member.memberCode} • {member.phone}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={member.status} />
                  {alreadyCheckedIn ? (
                    <span className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-500 text-[11px] font-semibold">
                      Already Checked In Today
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleManualCheckIn(member.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-2xs transition-colors"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Mark Present</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Real-Time Check-In Feed */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Check-In Stream ({totalCheckIns})
            </h2>
            <p className="text-xs text-slate-400">Reverse chronological order for {formatDate(selectedDate)}</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {dateRecords.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              No check-in records found for this date. Scan a QR pass or use manual check-in above.
            </div>
          ) : (
            dateRecords.map(record => {
              const m = members.find(mem => mem.id === record.memberId);
              return (
                <div
                  key={record.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div
                    onClick={() => onSelectMember(record.memberId)}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold text-xs">
                      {record.memberName[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                        {record.memberName}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {record.memberCode} • Plan: {m?.currentPlanName || 'Standard'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white block">
                        {record.checkInTime || record.time}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        via {(record.checkInMethod || record.method || 'manual').replace('_', ' ')}
                      </span>
                    </div>
                    {m && <StatusBadge status={m.status} />}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onCheckInSuccess={() => {
          // Handled via store reactivity
        }}
      />
    </div>
  );
}
