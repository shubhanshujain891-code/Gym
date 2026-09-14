import React, { useState } from 'react';
import { QrCode, CheckCircle2, AlertCircle } from 'lucide-react';
import { Member } from '../../types';

interface MemberQRCodeProps {
  member: Member;
}

export const MemberQRCode: React.FC<MemberQRCodeProps> = ({ member }) => {
  // Simple high-contrast SVG QR-like visual for member
  const code = member.qrToken || member.memberCode;
  
  return (
    <div className="flex flex-col items-center p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
      <div className="p-3 bg-slate-900 rounded-lg text-white mb-3">
        <QrCode className="w-28 h-28" />
      </div>
      <span className="font-mono text-xs font-bold text-slate-700">{member.memberCode}</span>
      <span className="text-xs text-slate-500 mt-1">{member.firstName} {member.lastName}</span>
    </div>
  );
};

interface QRScannerMockProps {
  onScan: (token: string) => void;
}

export const QRScannerMock: React.FC<QRScannerMockProps> = ({ onScan }) => {
  const [tokenInput, setTokenInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput.trim()) {
      onScan(tokenInput.trim());
      setTokenInput('');
    }
  };

  return (
    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
      <div className="flex items-center gap-2 mb-3">
        <QrCode className="w-5 h-5 text-emerald-600" />
        <h4 className="text-sm font-bold text-slate-800">Scan Member QR or Barcode</h4>
      </div>
      <p className="text-xs text-slate-500 mb-3">
        Supports hardware USB/Bluetooth barcode/QR scanners or direct token entry.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          placeholder="Scan or enter member code (e.g. FIT-000001)"
          className="flex-1 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          autoFocus
        />
        <button
          type="submit"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition"
        >
          Verify
        </button>
      </form>
    </div>
  );
};
