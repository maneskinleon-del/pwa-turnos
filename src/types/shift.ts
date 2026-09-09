export type ShiftType = 'WORK' | 'REST' | 'EXTRA' | 'OFF';

export interface ShiftDay {
  date: string; // YYYY-MM-DD
  type: ShiftType;
  /** Horas realmente trabajadas ese día (opcional). */
  hoursWorked?: number;
}

/** Configuración de jornada (Fase 3). Independiente de HolidayType. */
export interface WorkdayConfig {
  /** Horas de un turno normal (ej. 12 en régimen 4x4). */
  normalHours: number;
}

/** Default alineado a turnos 4x4 de 12 h. */
export const DEFAULT_WORKDAY_CONFIG: WorkdayConfig = {
  normalHours: 12,
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
 * Cálculo derivado de horas (no se persiste el resultado).
 *
 * WORK:  hoursWorked se parte en normal / overtime según la jornada.
 * EXTRA: el día completo es extra (pago por día). No se resta jornada normal.
 * REST/OFF: sin horas.
 */
export function computeHours(
  hoursWorked: number | undefined,
  normalHours: number = DEFAULT_WORKDAY_CONFIG.normalHours,
  shiftType: ShiftType = 'WORK'
): { worked: number; normal: number; overtime: number; isExtraDay: boolean } {
  const worked =
    typeof hoursWorked === 'number' && hoursWorked > 0 ? hoursWorked : 0;

  if (shiftType === 'EXTRA') {
    // Día extra laboral completo: todo cuenta como extra, 0 normales.
    return {
      worked,
      normal: 0,
      overtime: worked,
      isExtraDay: true,
    };
  }

  if (shiftType === 'REST' || shiftType === 'OFF') {
    return { worked: 0, normal: 0, overtime: 0, isExtraDay: false };
  }

  // WORK
  const normal = Math.min(worked, normalHours);
  const overtime = Math.max(0, worked - normalHours);
  return { worked, normal, overtime, isExtraDay: false };
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
  return new Date(year, month, 1).getDay(); // 0 = Sunday
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
