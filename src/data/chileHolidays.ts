import type { HolidayType } from '@/types/shift';

export interface ChileHoliday {
  date: string; // YYYY-MM-DD
  name: string;
  type: Exclude<HolidayType, 'NONE'>;
}

/**
 * Dataset local offline de feriados de Chile 2025–2030.
 * Irrenunciables: 1 ene, 1 may, 18–19 sep, 25 dic (según práctica laboral habitual).
 * Movibles (Semana Santa, etc.) incluidos para los años listados.
 */
export const CHILE_HOLIDAYS: ChileHoliday[] = [
  // 2025
  { date: '2025-01-01', name: 'Año Nuevo', type: 'IRRENUNCIABLE' },
  { date: '2025-04-18', name: 'Viernes Santo', type: 'HOLIDAY' },
  { date: '2025-05-01', name: 'Día del Trabajador', type: 'IRRENUNCIABLE' },
  { date: '2025-05-21', name: 'Día de las Glorias Navales', type: 'HOLIDAY' },
  { date: '2025-06-20', name: 'Día Nacional de los Pueblos Indígenas', type: 'HOLIDAY' },
  { date: '2025-06-29', name: 'San Pedro y San Pablo', type: 'HOLIDAY' },
  { date: '2025-07-16', name: 'Día de la Virgen del Carmen', type: 'HOLIDAY' },
  { date: '2025-08-15', name: 'Asunción de la Virgen', type: 'HOLIDAY' },
  { date: '2025-09-18', name: 'Independencia Nacional', type: 'IRRENUNCIABLE' },
  { date: '2025-09-19', name: 'Día de las Glorias del Ejército', type: 'IRRENUNCIABLE' },
  { date: '2025-10-12', name: 'Encuentro de Dos Mundos', type: 'HOLIDAY' },
  { date: '2025-10-31', name: 'Día de las Iglesias Evangélicas', type: 'HOLIDAY' },
  { date: '2025-11-01', name: 'Día de Todos los Santos', type: 'HOLIDAY' },
  { date: '2025-12-08', name: 'Inmaculada Concepción', type: 'HOLIDAY' },
  { date: '2025-12-25', name: 'Navidad', type: 'IRRENUNCIABLE' },
  // 2026
  { date: '2026-01-01', name: 'Año Nuevo', type: 'IRRENUNCIABLE' },
  { date: '2026-04-03', name: 'Viernes Santo', type: 'HOLIDAY' },
  { date: '2026-05-01', name: 'Día del Trabajador', type: 'IRRENUNCIABLE' },
  { date: '2026-05-21', name: 'Día de las Glorias Navales', type: 'HOLIDAY' },
  { date: '2026-06-21', name: 'Día Nacional de los Pueblos Indígenas', type: 'HOLIDAY' },
  { date: '2026-06-29', name: 'San Pedro y San Pablo', type: 'HOLIDAY' },
  { date: '2026-07-16', name: 'Día de la Virgen del Carmen', type: 'HOLIDAY' },
  { date: '2026-08-15', name: 'Asunción de la Virgen', type: 'HOLIDAY' },
  { date: '2026-09-18', name: 'Independencia Nacional', type: 'IRRENUNCIABLE' },
  { date: '2026-09-19', name: 'Día de las Glorias del Ejército', type: 'IRRENUNCIABLE' },
  { date: '2026-10-12', name: 'Encuentro de Dos Mundos', type: 'HOLIDAY' },
  { date: '2026-10-31', name: 'Día de las Iglesias Evangélicas', type: 'HOLIDAY' },
  { date: '2026-11-01', name: 'Día de Todos los Santos', type: 'HOLIDAY' },
  { date: '2026-12-08', name: 'Inmaculada Concepción', type: 'HOLIDAY' },
  { date: '2026-12-25', name: 'Navidad', type: 'IRRENUNCIABLE' },
  // 2027
  { date: '2027-01-01', name: 'Año Nuevo', type: 'IRRENUNCIABLE' },
  { date: '2027-03-26', name: 'Viernes Santo', type: 'HOLIDAY' },
  { date: '2027-05-01', name: 'Día del Trabajador', type: 'IRRENUNCIABLE' },
  { date: '2027-05-21', name: 'Día de las Glorias Navales', type: 'HOLIDAY' },
  { date: '2027-06-21', name: 'Día Nacional de los Pueblos Indígenas', type: 'HOLIDAY' },
  { date: '2027-06-28', name: 'San Pedro y San Pablo', type: 'HOLIDAY' },
  { date: '2027-07-16', name: 'Día de la Virgen del Carmen', type: 'HOLIDAY' },
  { date: '2027-08-15', name: 'Asunción de la Virgen', type: 'HOLIDAY' },
  { date: '2027-09-17', name: 'Feriado adicional Fiestas Patrias', type: 'HOLIDAY' },
  { date: '2027-09-18', name: 'Independencia Nacional', type: 'IRRENUNCIABLE' },
  { date: '2027-09-19', name: 'Día de las Glorias del Ejército', type: 'IRRENUNCIABLE' },
  { date: '2027-10-11', name: 'Encuentro de Dos Mundos', type: 'HOLIDAY' },
  { date: '2027-10-31', name: 'Día de las Iglesias Evangélicas', type: 'HOLIDAY' },
  { date: '2027-11-01', name: 'Día de Todos los Santos', type: 'HOLIDAY' },
  { date: '2027-12-08', name: 'Inmaculada Concepción', type: 'HOLIDAY' },
  { date: '2027-12-25', name: 'Navidad', type: 'IRRENUNCIABLE' },
  // 2028
  { date: '2028-01-01', name: 'Año Nuevo', type: 'IRRENUNCIABLE' },
  { date: '2028-04-14', name: 'Viernes Santo', type: 'HOLIDAY' },
  { date: '2028-05-01', name: 'Día del Trabajador', type: 'IRRENUNCIABLE' },
  { date: '2028-05-21', name: 'Día de las Glorias Navales', type: 'HOLIDAY' },
  { date: '2028-06-20', name: 'Día Nacional de los Pueblos Indígenas', type: 'HOLIDAY' },
  { date: '2028-06-26', name: 'San Pedro y San Pablo', type: 'HOLIDAY' },
  { date: '2028-07-16', name: 'Día de la Virgen del Carmen', type: 'HOLIDAY' },
  { date: '2028-08-15', name: 'Asunción de la Virgen', type: 'HOLIDAY' },
  { date: '2028-09-18', name: 'Independencia Nacional', type: 'IRRENUNCIABLE' },
  { date: '2028-09-19', name: 'Día de las Glorias del Ejército', type: 'IRRENUNCIABLE' },
  { date: '2028-10-09', name: 'Encuentro de Dos Mundos', type: 'HOLIDAY' },
  { date: '2028-10-27', name: 'Día de las Iglesias Evangélicas', type: 'HOLIDAY' },
  { date: '2028-11-01', name: 'Día de Todos los Santos', type: 'HOLIDAY' },
  { date: '2028-12-08', name: 'Inmaculada Concepción', type: 'HOLIDAY' },
  { date: '2028-12-25', name: 'Navidad', type: 'IRRENUNCIABLE' },
  // 2029
  { date: '2029-01-01', name: 'Año Nuevo', type: 'IRRENUNCIABLE' },
  { date: '2029-03-30', name: 'Viernes Santo', type: 'HOLIDAY' },
  { date: '2029-05-01', name: 'Día del Trabajador', type: 'IRRENUNCIABLE' },
  { date: '2029-05-21', name: 'Día de las Glorias Navales', type: 'HOLIDAY' },
  { date: '2029-06-20', name: 'Día Nacional de los Pueblos Indígenas', type: 'HOLIDAY' },
  { date: '2029-06-29', name: 'San Pedro y San Pablo', type: 'HOLIDAY' },
  { date: '2029-07-16', name: 'Día de la Virgen del Carmen', type: 'HOLIDAY' },
  { date: '2029-08-15', name: 'Asunción de la Virgen', type: 'HOLIDAY' },
  { date: '2029-09-18', name: 'Independencia Nacional', type: 'IRRENUNCIABLE' },
  { date: '2029-09-19', name: 'Día de las Glorias del Ejército', type: 'IRRENUNCIABLE' },
  { date: '2029-10-15', name: 'Encuentro de Dos Mundos', type: 'HOLIDAY' },
  { date: '2029-10-31', name: 'Día de las Iglesias Evangélicas', type: 'HOLIDAY' },
  { date: '2029-11-01', name: 'Día de Todos los Santos', type: 'HOLIDAY' },
  { date: '2029-12-08', name: 'Inmaculada Concepción', type: 'HOLIDAY' },
  { date: '2029-12-25', name: 'Navidad', type: 'IRRENUNCIABLE' },
  // 2030
  { date: '2030-01-01', name: 'Año Nuevo', type: 'IRRENUNCIABLE' },
  { date: '2030-04-19', name: 'Viernes Santo', type: 'HOLIDAY' },
  { date: '2030-05-01', name: 'Día del Trabajador', type: 'IRRENUNCIABLE' },
  { date: '2030-05-21', name: 'Día de las Glorias Navales', type: 'HOLIDAY' },
  { date: '2030-06-21', name: 'Día Nacional de los Pueblos Indígenas', type: 'HOLIDAY' },
  { date: '2030-06-29', name: 'San Pedro y San Pablo', type: 'HOLIDAY' },
  { date: '2030-07-16', name: 'Día de la Virgen del Carmen', type: 'HOLIDAY' },
  { date: '2030-08-15', name: 'Asunción de la Virgen', type: 'HOLIDAY' },
  { date: '2030-09-18', name: 'Independencia Nacional', type: 'IRRENUNCIABLE' },
  { date: '2030-09-19', name: 'Día de las Glorias del Ejército', type: 'IRRENUNCIABLE' },
  { date: '2030-10-14', name: 'Encuentro de Dos Mundos', type: 'HOLIDAY' },
  { date: '2030-10-31', name: 'Día de las Iglesias Evangélicas', type: 'HOLIDAY' },
  { date: '2030-11-01', name: 'Día de Todos los Santos', type: 'HOLIDAY' },
  { date: '2030-12-08', name: 'Inmaculada Concepción', type: 'HOLIDAY' },
  { date: '2030-12-25', name: 'Navidad', type: 'IRRENUNCIABLE' },
];

const byDate = new Map(CHILE_HOLIDAYS.map(h => [h.date, h]));

export function getHoliday(dateKey: string): ChileHoliday | undefined {
  return byDate.get(dateKey);
}

export function getHolidayType(dateKey: string): HolidayType {
  return byDate.get(dateKey)?.type ?? 'NONE';
}

export function isHoliday(dateKey: string): boolean {
  return byDate.has(dateKey);
}

export function isIrrenunciable(dateKey: string): boolean {
  return byDate.get(dateKey)?.type === 'IRRENUNCIABLE';
}
