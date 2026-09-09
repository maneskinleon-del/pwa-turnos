import { describe, it, expect } from 'vitest';
import { getHolidayType, getHoliday, isIrrenunciable } from './chileHolidays';

describe('chile holidays', () => {
  it('marks Christmas as irrenunciable', () => {
    expect(getHolidayType('2026-12-25')).toBe('IRRENUNCIABLE');
    expect(isIrrenunciable('2026-12-25')).toBe(true);
    expect(getHoliday('2026-12-25')?.name).toMatch(/Navidad/i);
  });

  it('marks a normal holiday', () => {
    expect(getHolidayType('2026-05-21')).toBe('HOLIDAY');
  });

  it('returns NONE for ordinary day', () => {
    expect(getHolidayType('2026-09-10')).toBe('NONE');
  });

  it('does not change shift type — holiday is independent dimension', () => {
    // purely documentary: API only returns HolidayType, never ShiftType
    const h = getHolidayType('2026-12-25');
    expect(['NONE', 'HOLIDAY', 'IRRENUNCIABLE']).toContain(h);
  });
});
