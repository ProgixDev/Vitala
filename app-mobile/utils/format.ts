/** Small pure formatting helpers used across screens. */

export function formatPrice(amount?: number | null, currency = 'USD'): string {
  const value = typeof amount === 'number' ? amount : 0;
  const symbol = currency === 'USD' ? '$' : `${currency} `;
  return `${symbol}${value.toFixed(value % 1 === 0 ? 0 : 2)}`;
}

export function formatDuration(minutes?: number | null): string {
  const m = minutes ?? 0;
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h} h ${rem}` : `${h} h`;
}

/** "2026-07-14" -> "Tue, Jul 14". */
export function formatDate(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/** "14:30" or "14:30:00" -> "2:30 PM". */
export function formatTime(hhmm?: string | null): string {
  if (!hhmm) return '';
  const [hStr, mStr] = hhmm.split(':');
  const h = Number(hStr);
  const m = Number(mStr ?? 0);
  if (Number.isNaN(h)) return hhmm;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

/** Relative "time ago" for feeds. */
export function timeAgo(iso?: string | null): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const secs = Math.max(1, Math.floor((Date.now() - then) / 1000));
  const table: [number, string][] = [
    [60, 's'],
    [3600, 'm'],
    [86400, 'h'],
    [604800, 'd'],
  ];
  if (secs < 60) return 'just now';
  for (let i = 1; i < table.length; i++) {
    const [limit, unit] = table[i];
    if (secs < limit) {
      const prev = table[i - 1][0];
      return `${Math.floor(secs / prev)}${unit} ago`;
    }
  }
  return `${Math.floor(secs / 604800)}w ago`;
}

export function initialsOf(name?: string | null): string {
  if (!name) return '·';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '·';
}

export function maskCard(last4?: string | null): string {
  return `•••• •••• •••• ${last4 ?? '····'}`;
}
