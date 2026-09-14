import { MembershipStatus } from '../types';

export function formatCurrency(amount: number, symbol: string = '₹'): string {
  return `${symbol}${amount.toLocaleString('en-IN')}`;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateString;
  }
}

export function calculateMembershipStatus(
  expiryDateStr: string,
  expiringThresholdDays: number = 7,
  currentStatus: MembershipStatus = 'active'
): MembershipStatus {
  if (currentStatus === 'paused' || currentStatus === 'cancelled') {
    return currentStatus;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDateStr);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'expired';
  } else if (diffDays <= expiringThresholdDays) {
    return 'expiring_soon';
  }
  return 'active';
}

export function getDaysRemaining(expiryDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDateStr);
  expiry.setHours(0, 0, 0, 0);
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
