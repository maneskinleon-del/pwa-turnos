export type ShiftType = 'WORK' | 'REST' | 'EXTRA' | 'OFF';

export interface ShiftDay {
  date: string; // YYYY-MM-DD
  type: ShiftType;
  /** Horas realmente trabajadas ese día (opcional). */
  hoursWorked?: number;
}

/** Configuración de jornada (Fase 3). Independiente de HolidayType. */
export interface WorkdayConfig {
  /** Horas de jornada normal (default 8). */
  normalHours: number;
}

export const DEFAULT_WORKDAY_CONFIG: WorkdayConfig = {
  normalHours: 8,
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
 * worked → normal / overtime respecto a la jornada configurada.
 */
export function computeHours(
  hoursWorked: number | undefined,
  normalHours: number = DEFAULT_WORKDAY_CONFIG.normalHours
): { worked: number; normal: number; overtime: number } {
  const worked = typeof hoursWorked === 'number' && hoursWorked > 0 ? hoursWorked : 0;
  const normal = Math.min(worked, normalHours);
  const overtime = Math.max(0, worked - normalHours);
  return { worked, normal, overtime };
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
