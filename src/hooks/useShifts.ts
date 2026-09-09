import { useState, useEffect, useCallback } from 'react';
import type { ShiftDay, ShiftType, WorkdayConfig } from '@/types/shift';
import { DEFAULT_WORKDAY_CONFIG, computeHours } from '@/types/shift';
import { loadShifts, saveShifts, seedDemoData } from '@/storage/shifts';
import { loadConfig, saveConfig } from '@/storage/config';

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
    (dateKey: string, type: ShiftType, hoursWorked?: number) => {
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
      const shift = shifts.find(s => s.date === dateKey);
      return shift?.type ?? 'OFF';
    },
    [shifts]
  );

  const getShift = useCallback(
    (dateKey: string): ShiftDay | undefined => {
      return shifts.find(s => s.date === dateKey);
    },
    [shifts]
  );

  const updateConfig = useCallback((partial: Partial<WorkdayConfig>) => {
    setConfig(prev => {
      const next = { ...prev, ...partial };
      saveConfig(next);
      return next;
    });
  }, []);

  /** Resumen de horas del mes (solo días del mes indicado). */
  const getMonthHoursSummary = useCallback(
    (year: number, month: number) => {
      const prefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
      let worked = 0;
      let normal = 0;
      let overtime = 0;
      let daysWithHours = 0;

      for (const s of shifts) {
        if (!s.date.startsWith(prefix)) continue;
        if (typeof s.hoursWorked !== 'number' || s.hoursWorked <= 0) continue;
        const h = computeHours(s.hoursWorked, config.normalHours);
        worked += h.worked;
        normal += h.normal;
        overtime += h.overtime;
        daysWithHours += 1;
      }

      return { worked, normal, overtime, daysWithHours };
    },
    [shifts, config.normalHours]
  );

  return {
    shifts,
    loaded,
    config,
    updateShift,
    getShiftType,
    getShift,
    updateConfig,
    getMonthHoursSummary,
    reload,
  };
}
