import { describe, it, expect } from 'vitest';
import {
  formatDateKey,
  parseDateKey,
  isToday,
  getDaysInMonth,
  getFirstDayOfMonth,
  getMonthName,
  getShiftTypeInfo,
  SHIFT_TYPES,
} from '@/types/shift';

describe('Date utilities', () => {
  describe('formatDateKey', () => {
    it('formats date as YYYY-MM-DD', () => {
      const date = new Date(2026, 8, 15); // Sept 15, 2026
      expect(formatDateKey(date)).toBe('2026-09-15');
    });

    it('pads single digit months and days', () => {
      const date = new Date(2026, 0, 5); // Jan 5, 2026
      expect(formatDateKey(date)).toBe('2026-01-05');
    });

    it('handles December correctly', () => {
      const date = new Date(2026, 11, 31);
      expect(formatDateKey(date)).toBe('2026-12-31');
    });
  });

  describe('parseDateKey', () => {
    it('parses YYYY-MM-DD to Date at local midnight', () => {
      const date = parseDateKey('2026-09-15');
      expect(date.getFullYear()).toBe(2026);
      expect(date.getMonth()).toBe(8); // 0-indexed
      expect(date.getDate()).toBe(15);
      expect(date.getHours()).toBe(0);
      expect(date.getMinutes()).toBe(0);
    });

    it('roundtrips with formatDateKey', () => {
      const original = new Date(2026, 8, 15);
      const key = formatDateKey(original);
      const parsed = parseDateKey(key);
      expect(parsed.getFullYear()).toBe(original.getFullYear());
      expect(parsed.getMonth()).toBe(original.getMonth());
      expect(parsed.getDate()).toBe(original.getDate());
    });
  });

  describe('isToday', () => {
    it('returns true for today', () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
    });

    it('returns false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });

    it('returns false for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isToday(tomorrow)).toBe(false);
    });
  });

  describe('getDaysInMonth', () => {
    it('returns 31 for January', () => {
      expect(getDaysInMonth(2026, 0)).toBe(31);
    });

    it('returns 28 for February 2026 (non-leap)', () => {
      expect(getDaysInMonth(2026, 1)).toBe(28);
    });

    it('returns 29 for February 2024 (leap)', () => {
      expect(getDaysInMonth(2024, 1)).toBe(29);
    });

    it('returns 30 for April', () => {
      expect(getDaysInMonth(2026, 3)).toBe(30);
    });
  });

  describe('getFirstDayOfMonth', () => {
    it('returns 0 for Sunday', () => {
      // Jan 1, 2023 is a Sunday
      expect(getFirstDayOfMonth(2023, 0)).toBe(0);
    });

    it('returns 1 for Monday', () => {
      // Jan 1, 2024 is a Monday
      expect(getFirstDayOfMonth(2024, 0)).toBe(1);
    });
  });

  describe('getMonthName', () => {
    it('returns Spanish month names', () => {
      expect(getMonthName(0)).toBe('Enero');
      expect(getMonthName(5)).toBe('Junio');
      expect(getMonthName(11)).toBe('Diciembre');
    });
  });
});

describe('Shift types', () => {
  describe('SHIFT_TYPES', () => {
    it('contains all four required types', () => {
      const values = SHIFT_TYPES.map(t => t.value);
      expect(values).toContain('WORK');
      expect(values).toContain('REST');
      expect(values).toContain('EXTRA');
      expect(values).toContain('OFF');
    });

    it('each type has label and icon', () => {
      SHIFT_TYPES.forEach(t => {
        expect(t.label).toBeTruthy();
        expect(t.icon).toBeTruthy();
      });
    });
  });

  describe('getShiftTypeInfo', () => {
    it('returns correct info for WORK', () => {
      const info = getShiftTypeInfo('WORK');
      expect(info.value).toBe('WORK');
      expect(info.label).toBe('Trabajo');
      expect(info.icon).toBe('💼');
    });

    it('returns correct info for REST', () => {
      const info = getShiftTypeInfo('REST');
      expect(info.value).toBe('REST');
      expect(info.label).toBe('Descanso');
      expect(info.icon).toBe('🛌');
    });

    it('returns correct info for EXTRA', () => {
      const info = getShiftTypeInfo('EXTRA');
      expect(info.value).toBe('EXTRA');
      expect(info.label).toBe('Turno extra');
      expect(info.icon).toBe('⚡');
    });

    it('returns correct info for OFF', () => {
      const info = getShiftTypeInfo('OFF');
      expect(info.value).toBe('OFF');
      expect(info.label).toBe('Libre / sin definir');
      expect(info.icon).toBe('➖');
    });

    it('returns OFF for unknown type', () => {
      const info = getShiftTypeInfo('UNKNOWN' as any);
      expect(info.value).toBe('OFF');
    });
  });
});

describe('Timezone safety', () => {
  it('formatDateKey and parseDateKey do not shift dates across timezone boundaries', () => {
    // Test with a date that could be affected by DST
    const date = new Date(2026, 2, 9); // Mar 9, 2026 (DST transition in some zones)
    const key = formatDateKey(date);
    const parsed = parseDateKey(key);
    
    expect(parsed.getFullYear()).toBe(date.getFullYear());
    expect(parsed.getMonth()).toBe(date.getMonth());
    expect(parsed.getDate()).toBe(date.getDate());
  });

  it('parsing does not use UTC', () => {
    const key = '2026-09-15';
    const parsed = parseDateKey(key);
    
    // Should be local midnight, not UTC
    expect(parsed.getHours()).toBe(0);
    expect(parsed.getMinutes()).toBe(0);
  });
});