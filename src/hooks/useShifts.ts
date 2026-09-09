import { useState, useEffect, useCallback } from 'react';
import type { ShiftDay, ShiftType, WorkdayConfig } from '@/types/shift';
import { DEFAULT_WORKDAY_CONFIG } from '@/types/shift';
import { loadShifts, saveShifts, seedDemoData } from '@/storage/shifts';
import { loadConfig, saveConfig } from '@/storage/config';
import { buildMonthlySummary } from '@/domain/monthlySummary';

export function useShifts() {
  const [shifts, setShiftsState] = useState<ShiftDay[]>([]);
  const [config, setConfig] = useState<WorkdayConfig>(DEFAULT_WORKDAY_CONFIG);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(() => {
    setShiftsState(loadShifts());
    setConfig(loadConfig());
  }, []);

  useEffect(() => {
    seedDemoData();
    setShiftsState(loadShifts());
    setConfig(loadConfig());
    setLoaded(true);
  }, []);

  const updateShift = useCallback(
    (dateKey: string, type: ShiftType, hoursWorked?: number, paid?: boolean) => {
      setShiftsState(prev => {
        const existingIndex = prev.findIndex(s => s.date === dateKey);
        let next: ShiftDay[];

        if (type === 'OFF' && (hoursWorked === undefined || hoursWorked <= 0)) {
          next = existingIndex >= 0 ? prev.filter(s => s.date !== dateKey) : prev;
        } else {
          const newShift: ShiftDay = { date: dateKey, type };
          if (typeof hoursWorked === 'number' && hoursWorked > 0) {
            newShift.hoursWorked = hoursWorked;
          }
          if (type === 'EXTRA') {
            newShift.paid = paid === true;
          }
          if (existingIndex >= 0) {
            next = [...prev];
            next[existingIndex] = newShift;
          } else {
            next = [...prev, newShift];
          }
        }
        saveShifts(next);
        return next;
      });
    },
    []
  );

  const getShiftType = useCallback(
    (dateKey: string): ShiftType => {
      return shifts.find(s => s.date === dateKey)?.type ?? 'OFF';
    },
    [shifts]
  );

  const getShift = useCallback(
    (dateKey: string): ShiftDay | undefined => shifts.find(s => s.date === dateKey),
    [shifts]
  );

  const updateConfig = useCallback((partial: Partial<WorkdayConfig>) => {
    setConfig(prev => {
      const next = { ...prev, ...partial };
      saveConfig(next);
      return next;
    });
  }, []);

  const getMonthSummary = useCallback(
    (year: number, month: number) => buildMonthlySummary(shifts, year, month, config),
    [shifts, config]
  );

  return {
    shifts,
    loaded,
    config,
    updateShift,
    getShiftType,
    getShift,
    updateConfig,
    getMonthSummary,
    reload,
  };
}
