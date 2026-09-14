import React, { useState } from 'react';
import { Member, Gym } from '../../types';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/Badge';
import { QrCode, Scan, CheckCircle2, AlertTriangle, UserCheck, RefreshCw } from 'lucide-react';
import { store } from '../../services/store';
import { useToast } from '../common/Toast';
import confetti from 'canvas-confetti';

export function QRCodeSVG({ value, size = 140 }: { value: string; size?: number }) {
  // Deterministic SVG QR pattern generator
  const modulesCount = 21; // Standard Version 1 QR code 21x21
  const cellSize = size / modulesCount;

  // Generate deterministic binary pattern from string
  const hash = value.split('').reduce((acc, char, idx) => acc + char.charCodeAt(0) * (idx + 1), 0);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="rounded-lg select-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width={size} height={size} fill="#ffffff" />
      {/* 3 Finder patterns at top-left, top-right, bottom-left */}
      {/* Top Left Finder (7x7) */}
      <rect x={0} y={0} width={cellSize * 7} height={cellSize * 7} fill="#0f172a" />
      <rect x={cellSize} y={cellSize} width={cellSize * 5} height={cellSize * 5} fill="#ffffff" />
      <rect x={cellSize * 2} y={cellSize * 2} width={cellSize * 3} height={cellSize * 3} fill="#0f172a" />

      {/* Top Right Finder (7x7) */}
      <rect x={cellSize * 14} y={0} width={cellSize * 7} height={cellSize * 7} fill="#0f172a" />
      <rect x={cellSize * 15} y={cellSize} width={cellSize * 5} height={cellSize * 5} fill="#ffffff" />
      <rect x={cellSize * 16} y={cellSize * 2} width={cellSize * 3} height={cellSize * 3} fill="#0f172a" />

      {/* Bottom Left Finder (7x7) */}
      <rect x={0} y={cellSize * 14} width={cellSize * 7} height={cellSize * 7} fill="#0f172a" />
      <rect x={cellSize} y={cellSize * 15} width={cellSize * 5} height={cellSize * 5} fill="#ffffff" />
      <rect x={cellSize * 2} y={cellSize * 16} width={cellSize * 3} height={cellSize * 3} fill="#0f172a" />

      {/* Timing and data cells */}
      {Array.from({ length: modulesCount }).map((_, r) =>
        Array.from({ length: modulesCount }).map((_, c) => {
          // Skip the 3 finders
          const inTL = r < 8 && c < 8;
          const inTR = r < 8 && c >= 13;
          const inBL = r >= 13 && c < 8;
          if (inTL || inTR || inBL) return null;

          // Deterministic pattern
          const isFilled = ((r * 13 + c * 17 + hash) % 3 === 0) || ((r + c) % 2 === 0 && (r * c) % 5 !== 0);
          if (!isFilled) return null;

          return (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#0f172a"
            />
          );
        })
      )}
    </svg>
  );
}

export function MemberQRCodeCard({ member, gym }: { member: Member; gym: Gym }) {
  // Generate visual SVG QR-like pattern based on memberCode
  const qrData = `FITMANAGE:${gym.id}:${member.id}:${member.memberCode}`;
  
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center shadow-xs">
      <div className="flex items-center justify-between gap-2 mb-4">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Digital Access Pass</span>
        <StatusBadge status={member.status} />
      </div>

      <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl border-2 border-slate-900/10 shadow-inner flex flex-col items-center justify-center relative group">
        {/* Crisp vector QR code mockup rendering data payload */}
        <div className="w-full h-full grid grid-cols-6 grid-rows-6 gap-1 p-2 bg-slate-950 rounded-lg">
          {Array.from({ length: 36 }).map((_, i) => {
            const isCornerFinder = 
              (i < 3 || (i >= 6 && i < 9) || (i >= 12 && i < 15)) ||
              (i % 6 >= 3 && i < 18 && (i % 6 >= 4)) ||
              (i >= 24 && i % 6 < 3);
            const isFilled = isCornerFinder || (i * 7 + member.memberCode.charCodeAt(member.memberCode.length - 1)) % 2 === 0;

            return (
              <div
                key={i}
                className={`rounded-[2px] transition-all ${
                  isFilled ? 'bg-white' : 'bg-slate-950'
                }`}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        <p className="font-mono text-base font-bold text-slate-900 dark:text-white tracking-widest">
          {member.memberCode}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">{member.firstName} {member.lastName}</p>
        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
          Scan at reception for instant check-in
        </p>
      </div>
    </div>
  );
}

export function QRScannerModal({
  isOpen,
  onClose,
  onCheckInSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCheckInSuccess?: (member: Member) => void;
}) {
  const [searchInput, setSearchInput] = useState('');
  const [scannedMember, setScannedMember] = useState<Member | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const { success, error, warning } = useToast();

  const members = store.getMembers();

  const handleSimulateScan = (member: Member) => {
    setScannedMember(member);
    setIsScanning(false);
  };

  const handleConfirmCheckIn = () => {
    if (!scannedMember) return;
    const result = store.markAttendance(scannedMember.id, 'qr_code');

    if (result.success) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
      success('Check-In Successful!', result.message);
      if (onCheckInSuccess) onCheckInSuccess(scannedMember);
      onClose();
    } else {
      warning('Check-In Blocked', result.message);
    }
  };

  const filteredMembers = members.filter(m =>
    `${m.firstName} ${m.lastName} ${m.memberCode} ${m.phone}`
      .toLowerCase()
      .includes(searchInput.toLowerCase())
  ).slice(0, 5);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Scan QR Code Check-In" maxWidth="md">
      <div className="space-y-6">
        {/* Scanner Viewfinder */}
        <div className="relative aspect-square max-w-xs mx-auto rounded-2xl overflow-hidden bg-slate-950 border-2 border-emerald-500/50 flex flex-col items-center justify-center p-6 text-white shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
          
          {/* Animated Scanning Laser */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />

          <div className="relative z-10 w-44 h-44 border-2 border-dashed border-emerald-400/70 rounded-2xl flex flex-col items-center justify-center text-center p-4">
            <Scan className="w-12 h-12 text-emerald-400 mb-2 animate-bounce" />
            <span className="text-xs font-medium text-slate-300">
              Align member pass QR inside the frame
            </span>
          </div>

          <div className="absolute bottom-3 text-center">
            <span className="text-[11px] text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30">
              Live Optical Camera Ready
            </span>
          </div>
        </div>

        {/* Scanned Result Card */}
        {scannedMember ? (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-base shrink-0 overflow-hidden">
                {scannedMember.avatarUrl ? (
                  <img src={scannedMember.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  `${scannedMember.firstName[0]}${scannedMember.lastName[0]}`
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {scannedMember.firstName} {scannedMember.lastName}
                  </h4>
                  <StatusBadge status={scannedMember.status} />
                </div>
                <p className="text-xs font-mono text-slate-500">{scannedMember.memberCode}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Plan: {scannedMember.currentPlanName}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setScannedMember(null)}
                className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
              >
                Scan Another
              </button>
              <button
                type="button"
                onClick={handleConfirmCheckIn}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <UserCheck className="w-4 h-4" />
                <span>CONFIRM CHECK IN</span>
              </button>
            </div>
          </div>
        ) : (
          /* Quick Demo Click-To-Scan Selector */
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold uppercase tracking-wider">Or Select Member to Test Scan</span>
              <span>{members.length} members</span>
            </div>
            <input
              type="text"
              placeholder="Search member name, phone or code to test scan..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-emerald-500"
            />
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {filteredMembers.map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSimulateScan(m)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-100 dark:border-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {m.firstName} {m.lastName}
                    </span>
                    <span className="font-mono text-slate-400 text-[11px]">{m.memberCode}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={m.status} />
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                      Select QR →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
