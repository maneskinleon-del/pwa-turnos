import type { ShiftDay, WorkdayConfig } from '@/types/shift';
import { DEFAULT_WORKDAY_CONFIG } from '@/types/shift';

/** EXTRA antiguo sin `paid` → pendiente (false). */
export function isExtraPaid(day: ShiftDay): boolean {
  return day.type === 'EXTRA' && day.paid === true;
}

export function isExtraPending(day: ShiftDay): boolean {
  return day.type === 'EXTRA' && day.paid !== true;
}

export function listExtras(shifts: ShiftDay[], year: number, month: number): ShiftDay[] {
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
  return shifts
    .filter(s => s.type === 'EXTRA' && s.date.startsWith(prefix))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function summarizeExtras(
  shifts: ShiftDay[],
  year: number,
  month: number,
  config: WorkdayConfig = DEFAULT_WORKDAY_CONFIG
) {
  const extras = listExtras(shifts, year, month);
  const paid = extras.filter(isExtraPaid);
  const pending = extras.filter(isExtraPending);
  const unit = config.extraShiftValue;
  return {
    realized: extras.length,
    paidCount: paid.length,
    pendingCount: pending.length,
    unitValue: unit,
    paidAmount: paid.length * unit,
    pendingAmount: pending.length * unit,
    paidDates: paid.map(e => e.date),
    pendingDates: pending.map(e => e.date),
    all: extras,
  };
}
