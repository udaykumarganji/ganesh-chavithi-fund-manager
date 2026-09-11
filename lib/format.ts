export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function formatCurrencyPlain(amount: number): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(amount || 0);
  return `₹${formatted}`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  });
}

export function formatTime(time: string): string {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH.toString().padStart(2, '0')}:${minutes} ${ampm}`;
}

export function getCurrentTime(): string {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function getMemberStatus(
  totalPaid: number,
  totalContribution: number
): 'NOT_PAID' | 'PARTIALLY_PAID' | 'COMPLETED' {
  if (totalPaid <= 0) return 'NOT_PAID';
  if (totalPaid >= totalContribution) return 'COMPLETED';
  return 'PARTIALLY_PAID';
}
