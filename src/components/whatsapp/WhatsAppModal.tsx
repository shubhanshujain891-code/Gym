import React, { useState } from 'react';
import { Member, Gym, WhatsAppTemplate } from '../../types';
import { Modal } from '../common/Modal';
import { store } from '../../services/store';
import { replaceTemplateVariables, createWhatsAppLink, formatCurrency, formatDate } from '../../utils/formatters';
import { MessageSquare, Send, Copy, ExternalLink, Check } from 'lucide-react';
import { useToast } from '../common/Toast';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  defaultCategory?: WhatsAppTemplate['category'];
}

export function WhatsAppModal({
  isOpen,
  onClose,
  member,
  defaultCategory = 'membership_expiry',
}: WhatsAppModalProps) {
  const { success } = useToast();
  const gym = store.getCurrentGym();
  const templates = store.getWhatsAppTemplates();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates.find(t => t.category === defaultCategory)?.id || templates[0]?.id || ''
  );
  const [customMessage, setCustomMessage] = useState<string>('');
  const [copied, setCopied] = useState(false);

  if (!member) return null;

  const currentTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];

  const variables: Record<string, string | number | undefined> = {
    memberName: `${member.firstName} ${member.lastName}`,
    gymName: gym.name,
    expiryDate: formatDate(member.membershipEndDate),
    amount: formatCurrency(member.balanceDue || member.finalAmount, gym.settings.currencySymbol),
    memberId: member.memberCode,
    trainerName: member.primaryTrainerName || 'Trainer Team',
  };

  const finalMessage = customMessage || (currentTemplate ? replaceTemplateVariables(currentTemplate.body, variables) : '');

  const handleOpenWhatsApp = () => {
    const link = createWhatsAppLink(member.whatsappNumber || member.phone, finalMessage);
    window.open(link, '_blank');
    store.logAudit('SEND_WHATSAPP', 'member', member.id, `Triggered WhatsApp communication to ${member.firstName} (${member.phone})`);
    success('WhatsApp opened in new tab!');
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(finalMessage);
    setCopied(true);
    success('Message copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send WhatsApp Message" maxWidth="lg">
      <div className="space-y-5">
        {/* Recipient info */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center">
              {member.firstName[0]}
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">
                {member.firstName} {member.lastName}
              </p>
              <p className="text-slate-500 font-mono">{member.phone}</p>
            </div>
          </div>
          <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
            ID: {member.memberCode}
          </span>
        </div>

        {/* Template Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
            Choose Message Template
          </label>
          <select
            value={selectedTemplateId}
            onChange={e => {
              setSelectedTemplateId(e.target.value);
              setCustomMessage('');
            }}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-emerald-500"
          >
            {templates.map(t => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.category.replace('_', ' ')})
              </option>
            ))}
          </select>
        </div>

        {/* Editable Message Box */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Message Preview (Editable)
            </label>
            <span className="text-[11px] text-slate-400">
              Personalized for {member.firstName}
            </span>
          </div>
          <textarea
            rows={5}
            value={finalMessage}
            onChange={e => setCustomMessage(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-sans focus:outline-emerald-500 leading-relaxed"
          />
        </div>

        {/* Available Placeholders Reference */}
        <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-[11px] text-slate-500 dark:text-slate-400">
          <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Supported Dynamic Variables:</p>
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(variables).map(key => (
              <span key={key} className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                {`{{${key}}}`}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>
          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <Send className="w-4 h-4" />
            <span>Open in WhatsApp Web / App</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </button>
        </div>
      </div>
    </Modal>
  );
}
