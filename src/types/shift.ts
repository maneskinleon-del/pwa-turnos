export type ShiftType = 'WORK' | 'REST' | 'EXTRA' | 'OFF';

export type HolidayType = 'NONE' | 'HOLIDAY' | 'IRRENUNCIABLE';

export interface ShiftDay {
  date: string; // YYYY-MM-DD
  type: ShiftType;
  /** Horas realmente trabajadas ese día (opcional). */
  hoursWorked?: number;
  /**
   * Solo aplica a EXTRA.
   * true = pagado, false/undefined = pendiente (compatibilidad con datos antiguos).
   */
  paid?: boolean;
}

/** Configuración de jornada y liquidación. */
export interface WorkdayConfig {
  /** Horas de un turno normal (ej. 12 en régimen 4x4). */
  normalHours: number;
  /** Valor fijo de un turno EXTRA completo (CLP). */
  extraShiftValue: number;
  /** Días liquidados del mes (independiente de días físicos trabajados). */
  liquidationDays: number;
}

export const DEFAULT_WORKDAY_CONFIG: WorkdayConfig = {
  normalHours: 12,
  extraShiftValue: 40_000,
  liquidationDays: 30,
};

export const SHIFT_TYPES: { value: ShiftType; label: string; icon: string }[] = [
  { value: 'WORK', label: 'Trabajo', icon: '💼' },
  { value: 'REST', label: 'Descanso', icon: '🛌' },
  { value: 'EXTRA', label: 'Turno extra', icon: '⚡' },
  { value: 'OFF', label: 'Libre / sin definir', icon: '➖' },
];

export function getShiftTypeInfo(type: ShiftType) {
  return SHIFT_TYPES.find(t => t.value === type) || SHIFT_TYPES[3];
}

/**
 * Cálculo derivado de horas (no se persiste).
 *
 * - WORK: parte hoursWorked en normalHours + overtimeHours (sobre jornada).
 * - EXTRA: hoursWorked → extraShiftHours (NO son overtimeHours).
 * - REST/OFF: cero.
 *
 * overtimeHours y turnos EXTRA son conceptos distintos.
 */
export function computeHours(
  hoursWorked: number | undefined,
  normalHours: number = DEFAULT_WORKDAY_CONFIG.normalHours,
  shiftType: ShiftType = 'WORK'
): {
  worked: number;
  /** Horas de jornada normal (solo WORK). */
  normal: number;
  /**
   * Horas sobre la jornada en un turno WORK.
   * Nunca se usa para días EXTRA.
   */
  overtimeHours: number;
  /**
   * Horas trabajadas en un turno EXTRA (día completo extra).
   * Independiente de overtimeHours.
   */
  extraShiftHours: number;
  isExtraDay: boolean;
  /** @deprecated usar overtimeHours — alias de compatibilidad */
  overtime: number;
} {
  const worked =
    typeof hoursWorked === 'number' && hoursWorked > 0 ? hoursWorked : 0;

  if (shiftType === 'EXTRA') {
    return {
      worked,
      normal: 0,
      overtimeHours: 0,
      extraShiftHours: worked,
      isExtraDay: true,
      overtime: 0,
    };
  }

  if (shiftType === 'REST' || shiftType === 'OFF') {
    return {
      worked: 0,
      normal: 0,
      overtimeHours: 0,
      extraShiftHours: 0,
      isExtraDay: false,
      overtime: 0,
    };
  }

  const normal = Math.min(worked, normalHours);
  const overtimeHours = Math.max(0, worked - normalHours);
  return {
    worked,
    normal,
    overtimeHours,
    extraShiftHours: 0,
    isExtraDay: false,
    overtime: overtimeHours,
  };
}

export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function getMonthName(month: number): string {
  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];
  return months[month];
}

export function formatCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount);
}
