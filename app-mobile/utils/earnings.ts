import type { Appointment } from '@/types';

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export type EarningsPeriod = 'week' | 'month' | 'all';

/**
 * The inclusive lower-bound date (YYYY-MM-DD) for a period, or '' for all-time.
 * Compare with `scheduled_date >= boundary` — both are YMD so it's chronological.
 */
export function periodBoundary(period: EarningsPeriod, now: Date = new Date()): string {
  if (period === 'all') return '';
  if (period === 'month') {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  }
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // back to Monday
  return ymd(monday);
}

export interface NurseEarnings {
  /** Completed visits (newest first). */
  completed: Appointment[];
  todayTotal: number;
  weekTotal: number;
  monthTotal: number;
  allTotal: number;
  count: number;
}

/**
 * Bucket a nurse's completed visits into today / this week / this month / all,
 * summing `price`. Dates are YYYY-MM-DD so lexical comparison is chronological.
 */
export function nurseEarnings(
  appts: Appointment[] | null,
  meId?: string | null,
  now: Date = new Date(),
): NurseEarnings {
  const completed = (appts ?? [])
    .filter((a) => a.status === 'completed' && (!meId || a.nurse_id === meId))
    .sort((a, b) =>
      `${b.scheduled_date}${b.scheduled_start}`.localeCompare(`${a.scheduled_date}${a.scheduled_start}`),
    );

  const today = ymd(now);
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // back to Monday
  const weekStart = ymd(monday);
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  const sum = (pred: (a: Appointment) => boolean) =>
    completed.filter(pred).reduce((s, a) => s + (a.price || 0), 0);

  return {
    completed,
    todayTotal: sum((a) => a.scheduled_date === today),
    weekTotal: sum((a) => a.scheduled_date >= weekStart),
    monthTotal: sum((a) => a.scheduled_date >= monthStart),
    allTotal: completed.reduce((s, a) => s + (a.price || 0), 0),
    count: completed.length,
  };
}
