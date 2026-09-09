import type { ShiftDay, WorkdayConfig } from '@/types/shift';
import {
  DEFAULT_WORKDAY_CONFIG,
  computeHours,
  getDaysInMonth,
  getMonthName,
} from '@/types/shift';
import { summarizeExtras } from './extras';

export interface MonthlySummary {
  year: number;
  month: number; // 0-indexed
  monthLabel: string;
  calendarDays: number;
  /** Días liquidados (configurable, default 30). Independiente de turnos físicos. */
  liquidationDays: number;
  normalShiftDays: number;
  extraShiftDays: number;
  /** WORK + EXTRA con trabajo efectivo. */
  effectiveWorkedDays: number;
  restDays: number;
  hoursNormal: number;
  hoursOvertime: number;
  hoursExtraShift: number;
  extras: ReturnType<typeof summarizeExtras>;
}

export function buildMonthlySummary(
  shifts: ShiftDay[],
  year: number,
  month: number,
  config: WorkdayConfig = DEFAULT_WORKDAY_CONFIG
): MonthlySummary {
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
  const calendarDays = getDaysInMonth(year, month);

  let normalShiftDays = 0;
  let extraShiftDays = 0;
  let restDays = 0;
  let hoursNormal = 0;
  let hoursOvertime = 0;
  let hoursExtraShift = 0;

  for (const s of shifts) {
    if (!s.date.startsWith(prefix)) continue;

    if (s.type === 'WORK') {
      normalShiftDays += 1;
      const worked =
        typeof s.hoursWorked === 'number' && s.hoursWorked > 0
          ? s.hoursWorked
          : config.normalHours;
      const h = computeHours(worked, config.normalHours, 'WORK');
      hoursNormal += h.normal;
      hoursOvertime += h.overtimeHours;
    } else if (s.type === 'EXTRA') {
      extraShiftDays += 1;
      const worked =
        typeof s.hoursWorked === 'number' && s.hoursWorked > 0
          ? s.hoursWorked
          : config.normalHours;
      const h = computeHours(worked, config.normalHours, 'EXTRA');
      hoursExtraShift += h.extraShiftHours;
    } else if (s.type === 'REST') {
      restDays += 1;
    }
  }

  return {
    year,
    month,
    monthLabel: `${getMonthName(month)} ${year}`,
    calendarDays,
    liquidationDays: config.liquidationDays,
    normalShiftDays,
    extraShiftDays,
    effectiveWorkedDays: normalShiftDays + extraShiftDays,
    restDays,
    hoursNormal,
    hoursOvertime,
    hoursExtraShift,
    extras: summarizeExtras(shifts, year, month, config),
  };
}
