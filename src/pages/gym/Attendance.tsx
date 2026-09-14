import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { QRScannerMock } from '../../components/qr/QRComponents';
import { formatDate } from '../../utils/formatters';
import {
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  Search,
} from 'lucide-react';

export const Attendance: React.FC = () => {
  const store = useStore();
  const gym = store.getActiveGym();
  const members = store.getMembers();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const attendanceList = store.getAttendance(selectedDate);

  const [scanMessage, setScanMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleScanOrVerify = (token: string) => {
    // Search member by code, qrToken, or phone
    const cleaned = token.trim().toUpperCase();
    const member = members.find(
      (m) =>
        m.memberCode.toUpperCase() === cleaned ||
        (m.qrToken && m.qrToken.toUpperCase().includes(cleaned)) ||
        m.phone === cleaned
    );

    if (!member) {
      setScanMessage({
        type: 'error',
        text: `No member found matching "${token}". Please check the member code.`,
      });
      return;
    }

    if (member.status === 'expired') {
      setScanMessage({
        type: 'error',
        text: `Access Denied: ${member.firstName}'s membership expired on ${formatDate(member.membershipEndDate)}. Please renew first.`,
      });
      return;
    }

    const rec = store.recordAttendance(member.id, 'qr_code');
    setScanMessage({
      type: 'success',
      text: `Access Granted! Welcome ${member.firstName} ${member.lastName} (${rec.checkInTime || rec.time}).`,
    });

    setTimeout(() => setScanMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Attendance Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time biometric & QR check-in log for <span className="font-semibold">{gym.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-500 uppercase">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
          />
        </div>
      </div>

      {/* QR Scanner & Manual Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <QRScannerMock onScan={handleScanOrVerify} />

          {/* Feedback banner */}
          {scanMessage && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 text-xs animate-in fade-in ${
                scanMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {scanMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold">{scanMessage.type === 'success' ? 'Verified' : 'Verification Issue'}</p>
                <p className="mt-0.5 leading-relaxed">{scanMessage.text}</p>
              </div>
            </div>
          )}

          {/* Quick Stats Box */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Date Summary</h4>
            <div className="flex justify-between text-xs py-1 border-b border-slate-100">
              <span className="text-slate-600">Total Check-ins</span>
              <span className="font-bold text-slate-900">{attendanceList.length}</span>
            </div>
            <div className="flex justify-between text-xs py-1">
              <span className="text-slate-600">Active Gym Members</span>
              <span className="font-bold text-emerald-600">{members.filter(m => m.status === 'active').length}</span>
            </div>
          </div>
        </div>

        {/* Live Attendance List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Check-in Log ({formatDate(selectedDate)})
            </h3>
            <span className="text-xs px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full font-semibold border border-blue-200">
              {attendanceList.length} present
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Member</th>
                  <th className="px-4 py-3">Check-in Time</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Staff / Gate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-slate-400">
                      No check-ins logged for {formatDate(selectedDate)}.
                    </td>
                  </tr>
                ) : (
                  attendanceList.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-800">{record.memberName}</div>
                        <div className="text-[11px] text-slate-400">{record.memberCode}</div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{record.time || record.checkInTime}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px] uppercase border border-slate-200">
                          {record.method || record.checkInMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {record.staffName || 'Reception Scanner'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
