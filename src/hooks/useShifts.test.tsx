import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useShifts } from '@/hooks/useShifts';

const createStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
};

describe('useShifts', () => {
  let storageMock: ReturnType<typeof createStorageMock>;

  beforeEach(() => {
    storageMock = createStorageMock();
    vi.stubGlobal('localStorage', storageMock);
    vi.clearAllMocks();
  });

  it('starts loaded and returns OFF for unknown dates', () => {
    const { result } = renderHook(() => useShifts());
    expect(result.current.loaded).toBe(true);
    expect(result.current.getShiftType('2026-10-15')).toBe('OFF');
  });

  it('loads persisted shifts from localStorage', () => {
    storageMock.getItem.mockReturnValue(JSON.stringify([
      { date: '2026-09-01', type: 'WORK' },
      { date: '2026-09-02', type: 'REST' },
    ]));
    const { result } = renderHook(() => useShifts());
    expect(result.current.getShiftType('2026-09-01')).toBe('WORK');
    expect(result.current.getShiftType('2026-09-02')).toBe('REST');
    expect(result.current.getShiftType('2026-09-03')).toBe('OFF');
  });

  it('persists a new shift with updateShift', () => {
    const { result } = renderHook(() => useShifts());
    act(() => { result.current.updateShift('2026-10-15', 'EXTRA'); });
    expect(result.current.getShiftType('2026-10-15')).toBe('EXTRA');
    const lastCall = storageMock.setItem.mock.calls[storageMock.setItem.mock.calls.length - 1];
    expect(lastCall).toBeDefined();
    const saved = JSON.parse(lastCall![1]);
    expect(saved).toContainEqual({ date: '2026-10-15', type: 'EXTRA' });
  });

  it('updates an existing shift type', () => {
    storageMock.getItem.mockReturnValue(JSON.stringify([
      { date: '2026-09-01', type: 'WORK' },
    ]));
    const { result } = renderHook(() => useShifts());
    act(() => { result.current.updateShift('2026-09-01', 'REST'); });
    expect(result.current.getShiftType('2026-09-01')).toBe('REST');
  });

  it('removes a shift when set to OFF', () => {
    storageMock.getItem.mockReturnValue(JSON.stringify([
      { date: '2026-09-01', type: 'WORK' },
    ]));
    const { result } = renderHook(() => useShifts());
    act(() => { result.current.updateShift('2026-09-01', 'OFF'); });
    expect(result.current.getShiftType('2026-09-01')).toBe('OFF');
    const lastCall = storageMock.setItem.mock.calls[storageMock.setItem.mock.calls.length - 1];
    expect(lastCall).toBeDefined();
    const saved = JSON.parse(lastCall![1]);
    expect(saved).toHaveLength(0);
  });

  it('keeps persisted data across simulated reloads', () => {
    // Seed the store directly (not via mockReturnValue) so the second hook
    // instance reads back the updated store, exactly like a real page reload.
    storageMock.setItem('pwa-turnos-shifts', JSON.stringify([
      { date: '2026-09-01', type: 'WORK' },
    ]));
    const first = renderHook(() => useShifts());
    act(() => { first.result.current.updateShift('2026-09-05', 'EXTRA'); });

    // Simulate a reload: a new hook instance reads from the same store.
    const second = renderHook(() => useShifts());
    expect(second.result.current.getShiftType('2026-09-05')).toBe('EXTRA');
    expect(second.result.current.getShiftType('2026-09-01')).toBe('WORK');
  });
});