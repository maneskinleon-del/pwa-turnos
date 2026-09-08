import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadShifts,
  saveShifts,
  getShift,
  setShift,
  clearAllShifts,
  seedDemoData,
} from '@/storage/shifts';
import type { ShiftDay } from '@/types/shift';

// Mock localStorage
const createStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get store() { return store; },
  };
};

describe('Storage layer', () => {
  let storageMock: ReturnType<typeof createStorageMock>;

  beforeEach(() => {
    storageMock = createStorageMock();
    vi.stubGlobal('localStorage', storageMock);
    vi.clearAllMocks();
  });

  describe('loadShifts', () => {
    it('returns empty array when no data', () => {
      expect(loadShifts()).toEqual([]);
    });

    it('returns parsed shifts from localStorage', () => {
      const shifts: ShiftDay[] = [
        { date: '2026-09-01', type: 'WORK' },
        { date: '2026-09-02', type: 'REST' },
      ];
      storageMock.getItem.mockReturnValue(JSON.stringify(shifts));
      
      expect(loadShifts()).toEqual(shifts);
    });

    it('returns empty array on invalid JSON', () => {
      storageMock.getItem.mockReturnValue('invalid json');
      expect(loadShifts()).toEqual([]);
    });

    it('returns empty array on non-array data', () => {
      storageMock.getItem.mockReturnValue(JSON.stringify({ not: 'array' }));
      expect(loadShifts()).toEqual([]);
    });

    it('filters out invalid shift objects', () => {
      storageMock.getItem.mockReturnValue(JSON.stringify([
        { date: '2026-09-01', type: 'WORK' },
        { invalid: true },
        { date: '2026-09-02' }, // missing type
        { type: 'WORK' }, // missing date
      ]));
      
      const result = loadShifts();
      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2026-09-01');
    });
  });

  describe('saveShifts', () => {
    it('saves shifts to localStorage', () => {
      const shifts: ShiftDay[] = [
        { date: '2026-09-01', type: 'WORK' },
      ];
      saveShifts(shifts);
      expect(storageMock.setItem).toHaveBeenCalledWith(
        'pwa-turnos-shifts',
        JSON.stringify(shifts)
      );
    });
  });

  describe('getShift', () => {
    it('returns shift for date key', () => {
      const shifts: ShiftDay[] = [
        { date: '2026-09-01', type: 'WORK' },
        { date: '2026-09-02', type: 'REST' },
      ];
      storageMock.getItem.mockReturnValue(JSON.stringify(shifts));
      
      expect(getShift('2026-09-01')).toEqual({ date: '2026-09-01', type: 'WORK' });
      expect(getShift('2026-09-02')).toEqual({ date: '2026-09-02', type: 'REST' });
      expect(getShift('2026-09-03')).toBeUndefined();
    });
  });

  describe('setShift', () => {
    it('adds new shift when date does not exist', () => {
      storageMock.getItem.mockReturnValue(JSON.stringify([]));
      
      setShift('2026-09-01', 'WORK');
      
      expect(storageMock.setItem).toHaveBeenCalledWith(
        'pwa-turnos-shifts',
        JSON.stringify([{ date: '2026-09-01', type: 'WORK' }])
      );
    });

    it('updates existing shift', () => {
      storageMock.getItem.mockReturnValue(JSON.stringify([
        { date: '2026-09-01', type: 'WORK' },
      ]));
      
      setShift('2026-09-01', 'REST');
      
      expect(storageMock.setItem).toHaveBeenCalledWith(
        'pwa-turnos-shifts',
        JSON.stringify([{ date: '2026-09-01', type: 'REST' }])
      );
    });

    it('removes shift when set to OFF', () => {
      storageMock.getItem.mockReturnValue(JSON.stringify([
        { date: '2026-09-01', type: 'WORK' },
      ]));
      
      setShift('2026-09-01', 'OFF');
      
      expect(storageMock.setItem).toHaveBeenCalledWith(
        'pwa-turnos-shifts',
        JSON.stringify([])
      );
    });

    it('does not add shift when setting OFF for non-existing date', () => {
      storageMock.getItem.mockReturnValue(JSON.stringify([]));
      
      setShift('2026-09-01', 'OFF');
      
      expect(storageMock.setItem).toHaveBeenCalledWith(
        'pwa-turnos-shifts',
        JSON.stringify([])
      );
    });

    it('handles WORK -> REST transition', () => {
      storageMock.getItem.mockReturnValue(JSON.stringify([
        { date: '2026-09-01', type: 'WORK' },
      ]));
      
      setShift('2026-09-01', 'REST');
      
      const saved = JSON.parse(storageMock.setItem.mock.calls[0][1]);
      expect(saved[0].type).toBe('REST');
    });

    it('handles EXTRA -> OFF transition', () => {
      storageMock.getItem.mockReturnValue(JSON.stringify([
        { date: '2026-09-01', type: 'EXTRA' },
      ]));
      
      setShift('2026-09-01', 'OFF');
      
      const saved = JSON.parse(storageMock.setItem.mock.calls[0][1]);
      expect(saved).toHaveLength(0);
    });
  });

  describe('clearAllShifts', () => {
    it('removes storage key', () => {
      clearAllShifts();
      expect(storageMock.removeItem).toHaveBeenCalledWith('pwa-turnos-shifts');
    });
  });

  describe('seedDemoData', () => {
    it('does not seed when data already exists', () => {
      storageMock.getItem.mockReturnValue(JSON.stringify([
        { date: '2026-09-01', type: 'WORK' },
      ]));
      
      seedDemoData();
      
      // Should not call setItem since data exists
      expect(storageMock.setItem).not.toHaveBeenCalled();
    });

    it('seeds demo data when empty', () => {
      storageMock.getItem.mockReturnValue(JSON.stringify([]));
      
      seedDemoData();
      
      expect(storageMock.setItem).toHaveBeenCalled();
      const saved = JSON.parse(storageMock.setItem.mock.calls[0][1]);
      expect(saved.length).toBeGreaterThan(0);
    });
  });
});