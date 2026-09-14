import React, { useState } from 'react';
import { Modal } from './Modal';
import { store } from '../../services/store';
import { useToast } from './Toast';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Download, ArrowRight } from 'lucide-react';
import { Member } from '../../types';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportCompleted: () => void;
}

interface ParsedRow {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  gender: 'male' | 'female' | 'other';
  planName: string;
  startDate: string;
  isValid: boolean;
  error?: string;
}

export function BulkImportModal({ isOpen, onClose, onImportCompleted }: BulkImportModalProps) {
  const { success, error } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSummary, setImportSummary] = useState<{ imported: number; failed: number } | null>(null);

  const plans = store.getPlans();
  const existingMembers = store.getMembers();

  const handleDownloadTemplate = () => {
    const csvHeader = 'First Name,Last Name,Phone,Email,Gender,Plan Name,Start Date\n';
    const csvSample =
      'Amit,Kumar,9820011223,amit.kumar@example.com,male,Monthly Starter,2026-03-01\n' +
      'Priya,Verma,9820044556,priya.verma@example.com,female,Quarterly Pro,2026-03-05\n';
    const blob = new Blob([csvHeader + csvSample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fitmanage_members_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    parseCSV(selected);
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length <= 1) {
        error('Invalid CSV', 'CSV file is empty or has no data rows.');
        return;
      }

      const rows: ParsedRow[] = [];
      const existingPhones = new Set(existingMembers.map(m => m.phone.replace(/\D/g, '')));

      // Skip header (i = 1)
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
        if (cols.length < 3) continue;

        const firstName = cols[0] || '';
        const lastName = cols[1] || '';
        const phone = (cols[2] || '').replace(/\D/g, '');
        const email = cols[3] || `${firstName.toLowerCase()}@example.com`;
        const genderRaw = (cols[4] || 'male').toLowerCase();
        const gender: 'male' | 'female' | 'other' =
          genderRaw === 'female' ? 'female' : genderRaw === 'other' ? 'other' : 'male';
        const planName = cols[5] || (plans[0] ? plans[0].name : 'Monthly Starter');
        const startDate = cols[6] || new Date().toISOString().split('T')[0];

        let isValid = true;
        let rowError = '';

        if (!firstName) {
          isValid = false;
          rowError = 'Missing First Name';
        } else if (phone.length < 10) {
          isValid = false;
          rowError = 'Invalid Phone (<10 digits)';
        } else if (existingPhones.has(phone)) {
          isValid = false;
          rowError = 'Duplicate Phone Number in Gym';
        }

        rows.push({
          firstName,
          lastName,
          phone,
          email,
          gender,
          planName,
          startDate,
          isValid,
          error: rowError,
        });
      }

      setParsedRows(rows);
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      error('Cannot Import', 'No valid rows found to import.');
      return;
    }

    setIsProcessing(true);

    let importedCount = 0;
    const defaultPlan = plans[0];

    validRows.forEach(row => {
      const matchedPlan = plans.find(p => p.name.toLowerCase() === row.planName.toLowerCase()) || defaultPlan;
      const duration = matchedPlan ? matchedPlan.durationMonths : 1;
      const expDate = new Date(row.startDate);
      expDate.setMonth(expDate.getMonth() + duration);

      store.createMember({
        firstName: row.firstName,
        lastName: row.lastName,
        phone: row.phone,
        whatsappNumber: row.phone,
        email: row.email,
        gender: row.gender,
        status: 'active',
        currentPlanId: matchedPlan ? matchedPlan.id : 'default',
        currentPlanName: matchedPlan ? matchedPlan.name : row.planName,
        durationMonths: duration,
        membershipStartDate: row.startDate,
        membershipEndDate: expDate.toISOString().split('T')[0],
        membershipPrice: matchedPlan ? matchedPlan.price : 1500,
        discount: 0,
        finalAmount: matchedPlan ? matchedPlan.price : 1500,
        totalPaid: matchedPlan ? matchedPlan.price : 1500,
        balanceDue: 0,
        referralSource: 'CSV Import',
      });
      importedCount++;
    });

    setIsProcessing(false);
    setImportSummary({
      imported: importedCount,
      failed: parsedRows.length - validRows.length,
    });
    success('Bulk Import Complete', `Successfully imported ${importedCount} members.`);
    onImportCompleted();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bulk Import Members (CSV)" maxWidth="2xl">
      <div className="space-y-6">
        {/* Template & instructions banner */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800 text-xs">
          <div>
            <p className="font-bold text-slate-900 dark:text-white">Need the correct column format?</p>
            <p className="text-slate-500 mt-0.5">Download our sample CSV template with pre-formatted headers.</p>
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 transition-colors shrink-0"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Download CSV Template</span>
          </button>
        </div>

        {/* File Drag / Select Box */}
        {!file ? (
          <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group">
            <UploadCloud className="w-12 h-12 text-slate-400 group-hover:text-emerald-500 transition-colors mb-3" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Choose CSV file or drag and drop
            </span>
            <span className="text-xs text-slate-400 mt-1">Accepts standard .csv file format up to 5MB</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>
        ) : (
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs">
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{file.name}</p>
                <p className="text-slate-400">{parsedRows.length} rows parsed</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setParsedRows([]);
                setImportSummary(null);
              }}
              className="text-slate-400 hover:text-rose-500 font-semibold text-xs"
            >
              Remove
            </button>
          </div>
        )}

        {/* Validation Preview Table */}
        {parsedRows.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-slate-500">
                Row Validation Preview
              </span>
              <div className="flex items-center gap-3">
                <span className="text-emerald-600 font-semibold">
                  ✓ {parsedRows.filter(r => r.isValid).length} Valid
                </span>
                <span className="text-rose-500 font-semibold">
                  ✗ {parsedRows.filter(r => !r.isValid).length} Invalid
                </span>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 sticky top-0">
                  <tr>
                    <th className="p-2.5">Name</th>
                    <th className="p-2.5">Phone</th>
                    <th className="p-2.5">Plan</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {parsedRows.map((r, i) => (
                    <tr
                      key={i}
                      className={r.isValid ? '' : 'bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200'}
                    >
                      <td className="p-2.5 font-medium">
                        {r.firstName} {r.lastName}
                      </td>
                      <td className="p-2.5 font-mono">{r.phone}</td>
                      <td className="p-2.5">{r.planName}</td>
                      <td className="p-2.5">
                        {r.isValid ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 text-[11px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-500 text-[11px] font-bold">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {r.error}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary result */}
        {importSummary && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs">
            <h4 className="font-bold text-emerald-800 dark:text-emerald-300">Import Complete</h4>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Successfully imported {importSummary.imported} members. {importSummary.failed} rows skipped due to duplicate or invalid data.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          {parsedRows.length > 0 && !importSummary && (
            <button
              type="button"
              disabled={isProcessing || parsedRows.filter(r => r.isValid).length === 0}
              onClick={handleExecuteImport}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs disabled:opacity-50"
            >
              <span>Import {parsedRows.filter(r => r.isValid).length} Valid Members</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
