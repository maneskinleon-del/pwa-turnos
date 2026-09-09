import { useState, useEffect, useCallback } from 'react';
import type { ShiftDay, ShiftType } from '@/types/shift';
import { loadShifts, saveShifts, seedDemoData } from '@/storage/shifts';

export function useShifts() {
  const [shifts, setShiftsState] = useState<ShiftDay[]>([]);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(() => {
    const data = loadShifts();
    setShiftsState(data);
  }, []);

  useEffect(() => {
    seedDemoData();
    const data = loadShifts();
    setShiftsState(data);
    setLoaded(true);
  }, []);

  const updateShift = useCallback((dateKey: string, type: ShiftType) => {
    setShiftsState(prev => {
      const existingIndex = prev.findIndex(s => s.date === dateKey);
      const newShift: ShiftDay = { date: dateKey, type };
      let next: ShiftDay[];

      if (existingIndex >= 0) {
        if (type === 'OFF') {
          next = prev.filter(s => s.date !== dateKey);
        } else {
          next = [...prev];
          next[existingIndex] = newShift;
        }
      } else if (type !== 'OFF') {
        next = [...prev, newShift];
      } else {
        next = prev;
      }

      saveShifts(next);
      return next;
    });
  }, []);

  const getShiftType = useCallback(
    (dateKey: string): ShiftType => {
      const shift = shifts.find(s => s.date === dateKey);
      return shift?.type ?? 'OFF';
    },
    [shifts]
  );

  return { shifts, loaded, updateShift, getShiftType, reload };
}
