import { describe, it, expect } from 'vitest';
import { buildMonthlySummary } from './monthlySummary';
import type { ShiftDay } from '@/types/shift';
import { DEFAULT_WORKDAY_CONFIG } from '@/types/shift';

describe('buildMonthlySummary', () => {
  const shifts: ShiftDay[] = [
    { date: '2026-09-01', type: 'WORK', hoursWorked: 12 },
    { date: '2026-09-02', type: 'WORK', hoursWorked: 16 }, // 12 + 4 overtime
    { date: '2026-09-03', type: 'EXTRA', hoursWorked: 12, paid: true },
    { date: '2026-09-04', type: 'EXTRA', hoursWorked: 12, paid: false },
    { date: '2026-09-05', type: 'REST' },
  ];

  it('separates normal hours, extra-shift hours and overtime hours', () => {
    const s = buildMonthlySummary(shifts, 2026, 8, DEFAULT_WORKDAY_CONFIG);
    expect(s.normalShiftDays).toBe(2);
    expect(s.extraShiftDays).toBe(2);
    expect(s.effectiveWorkedDays).toBe(4);
    expect(s.liquidationDays).toBe(30);
    expect(s.hoursNormal).toBe(24); // 12+12
    expect(s.hoursOvertime).toBe(4); // only from WORK 16h
    expect(s.hoursExtraShift).toBe(24); // 12+12 EXTRA
    expect(s.extras.paidCount).toBe(1);
    expect(s.extras.pendingCount).toBe(1);
  });

  it('liquidationDays independent of physical work days', () => {
    const s = buildMonthlySummary([], 2026, 8, {
      ...DEFAULT_WORKDAY_CONFIG,
      liquidationDays: 30,
    });
    expect(s.effectiveWorkedDays).toBe(0);
    expect(s.liquidationDays).toBe(30);
  });
});
