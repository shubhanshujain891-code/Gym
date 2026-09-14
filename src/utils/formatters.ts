import { Member, MembershipStatus, RiskScoreInfo } from '../types';

/**
 * Format numbers using Indian numbering system (Lakhs & Crores)
 * e.g. 150000 -> ₹1,50,000
 */
export function formatCurrency(amount: number | undefined | null, symbol: string = '₹'): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${symbol}0`;
  }
  const isNegative = amount < 0;
  const absVal = Math.abs(Math.round(amount));
  
  const str = absVal.toString();
  let result = '';
  
  if (str.length > 3) {
    const lastThree = str.substring(str.length - 3);
    const otherNumbers = str.substring(0, str.length - 3);
    const formattedOther = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    result = `${formattedOther},${lastThree}`;
  } else {
    result = str;
  }
  
  return `${isNegative ? '-' : ''}${symbol}${result}`;
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

export function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return 'just now';
  try {
    const now = Date.now();
    const past = new Date(dateStr).getTime();
    if (isNaN(past)) return dateStr;
    const diffSec = Math.floor((now - past) / 1000);

    if (diffSec < 60) return 'just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;
    return formatDate(dateStr);
  } catch {
    return dateStr;
  }
}

export function getDaysRemaining(expiryDateStr: string): number {
  if (!expiryDateStr) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDateStr);
  expiry.setHours(0, 0, 0, 0);
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function calculateMembershipStatus(
  expiryDateStr: string,
  expiringThresholdDays: number = 7,
  currentStatus?: MembershipStatus
): MembershipStatus {
  if (currentStatus === 'paused' || currentStatus === 'cancelled') {
    return currentStatus;
  }
  const days = getDaysRemaining(expiryDateStr);
  if (days < 0) {
    return 'expired';
  } else if (days <= expiringThresholdDays) {
    return 'expiring_soon';
  }
  return 'active';
}

export function calculateMemberRiskScore(member: Member): RiskScoreInfo {
  const reasons: string[] = [];
  let penalty = 0;

  // 1. Visit Inactivity Check
  if (!member.lastVisitDate) {
    penalty += 30;
    reasons.push('No attendance recorded yet');
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastVisit = new Date(member.lastVisitDate);
    lastVisit.setHours(0, 0, 0, 0);
    const daysSinceVisit = Math.floor((today.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceVisit >= 30) {
      penalty += 45;
      reasons.push(`Has not visited for ${daysSinceVisit} days`);
    } else if (daysSinceVisit >= 14) {
      penalty += 35;
      reasons.push(`Inactive for ${daysSinceVisit} days`);
    } else if (daysSinceVisit >= 7) {
      penalty += 20;
      reasons.push(`No visit in the past week`);
    }
  }

  // 2. Expiry status
  const daysRemaining = getDaysRemaining(member.membershipEndDate);
  if (daysRemaining < 0) {
    penalty += 35;
    reasons.push(`Membership expired ${Math.abs(daysRemaining)} days ago`);
  } else if (daysRemaining <= 3) {
    penalty += 20;
    reasons.push(`Membership expires in ${daysRemaining} days`);
  } else if (daysRemaining <= 7) {
    penalty += 10;
    reasons.push(`Membership expiring soon (${daysRemaining} days)`);
  }

  // 3. Balance due
  if (member.balanceDue > 0) {
    penalty += 20;
    reasons.push(`Pending fee of ${formatCurrency(member.balanceDue)}`);
  }

  const score = Math.max(0, 100 - penalty);

  let level: 'healthy' | 'attention' | 'at_risk' = 'healthy';
  if (score < 50 || penalty >= 40) {
    level = 'at_risk';
  } else if (score < 80 || penalty >= 20) {
    level = 'attention';
  }

  if (reasons.length === 0) {
    reasons.push('Regular attendance and membership up to date');
  }

  return { level, score, reasons };
}

export function cleanIndianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  } else if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }
  return digits;
}

export function createWhatsAppLink(phone: string, message: string): string {
  const cleaned = cleanIndianPhone(phone);
  const encodedMsg = encodeURIComponent(message.trim());
  return `https://wa.me/${cleaned}?text=${encodedMsg}`;
}

export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string | number | undefined>
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(regex, String(value ?? ''));
  }
  return result;
}
