import { describe, it, expect } from 'vitest';
import { summarizeExtras, isExtraPaid, isExtraPending } from './extras';
import type { ShiftDay } from '@/types/shift';
import { DEFAULT_WORKDAY_CONFIG } from '@/types/shift';

const base: ShiftDay[] = [
  { date: '2026-09-01', type: 'WORK', hoursWorked: 12 },
  { date: '2026-09-04', type: 'EXTRA', hoursWorked: 12, paid: true },
  { date: '2026-09-05', type: 'EXTRA', hoursWorked: 12, paid: true },
  { date: '2026-09-06', type: 'EXTRA', hoursWorked: 12, paid: true },
  { date: '2026-09-20', type: 'EXTRA', hoursWorked: 12 }, // pending
  { date: '2026-09-21', type: 'EXTRA', hoursWorked: 12, paid: false },
];

describe('extras domain', () => {
  it('identifies paid vs pending', () => {
    expect(isExtraPaid(base[1])).toBe(true);
    expect(isExtraPending(base[4])).toBe(true);
    expect(isExtraPending(base[5])).toBe(true);
  });

  it('summarizes 5 extras / 3 paid / 2 pending with money', () => {
    const s = summarizeExtras(base, 2026, 8, DEFAULT_WORKDAY_CONFIG);
    expect(s.realized).toBe(5);
    expect(s.paidCount).toBe(3);
    expect(s.pendingCount).toBe(2);
    expect(s.unitValue).toBe(40_000);
    expect(s.paidAmount).toBe(120_000);
    expect(s.pendingAmount).toBe(80_000);
    expect(s.pendingDates).toEqual(['2026-09-20', '2026-09-21']);
  });

  it('EXTRA value is fixed not hour-multiplied', () => {
    const s = summarizeExtras(
      [{ date: '2026-09-10', type: 'EXTRA', hoursWorked: 12, paid: true }],
      2026,
      8
    );
    expect(s.paidAmount).toBe(40_000);
    expect(s.paidAmount).not.toBe(12 * 40_000);
  });
});
