import type { ShiftDay, ShiftType } from '@/types/shift';

const STORAGE_KEY = 'pwa-turnos-shifts';

export function loadShifts(): ShiftDay[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidShiftDay).map(normalizeShiftDay);
  } catch {
    return [];
  }
}

export function saveShifts(shifts: ShiftDay[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shifts));
  } catch (error) {
    console.error('Failed to save shifts:', error);
  }
}

export function getShift(dateKey: string): ShiftDay | undefined {
  return loadShifts().find(s => s.date === dateKey);
}

export function setShift(
  dateKey: string,
  type: ShiftType,
  hoursWorked?: number,
  paid?: boolean
): void {
  const shifts = loadShifts();
  const existingIndex = shifts.findIndex(s => s.date === dateKey);

  if (type === 'OFF' && (hoursWorked === undefined || hoursWorked <= 0)) {
    if (existingIndex >= 0) {
      shifts.splice(existingIndex, 1);
      saveShifts(shifts);
    }
    return;
  }

  const newShift: ShiftDay = { date: dateKey, type };
  if (typeof hoursWorked === 'number' && hoursWorked > 0) {
    newShift.hoursWorked = hoursWorked;
  }
  if (type === 'EXTRA') {
    newShift.paid = paid === true;
  }

  if (existingIndex >= 0) {
    shifts[existingIndex] = newShift;
  } else {
    shifts.push(newShift);
  }
  saveShifts(shifts);
}

export function clearAllShifts(): void {
  localStorage.removeItem(STORAGE_KEY);
}

function isValidShiftDay(obj: unknown): obj is ShiftDay {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.date === 'string' &&
    typeof o.type === 'string' &&
    ['WORK', 'REST', 'EXTRA', 'OFF'].includes(o.type)
  );
}

/** Migra datos antiguos: EXTRA sin paid → pendiente (paid omitido/false). */
function normalizeShiftDay(day: ShiftDay): ShiftDay {
  const out: ShiftDay = { date: day.date, type: day.type };
  if (typeof day.hoursWorked === 'number' && day.hoursWorked > 0) {
    out.hoursWorked = day.hoursWorked;
  }
  if (day.type === 'EXTRA' && day.paid === true) {
    out.paid = true;
  }
  return out;
}

export function seedDemoData(): void {
  if (loadShifts().length > 0) return;
  seedDemoDataForced();
}

export function seedDemoDataForced(): void {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const m = String(month + 1).padStart(2, '0');

  const demo: ShiftDay[] = [
    { date: `${year}-${m}-01`, type: 'WORK', hoursWorked: 12 },
    { date: `${year}-${m}-02`, type: 'REST' },
    { date: `${year}-${m}-03`, type: 'WORK', hoursWorked: 16 },
    { date: `${year}-${m}-04`, type: 'EXTRA', hoursWorked: 12, paid: true },
    { date: `${year}-${m}-05`, type: 'REST' },
    { date: `${year}-${m}-06`, type: 'EXTRA', hoursWorked: 12, paid: false },
  ];
  saveShifts(demo);
}
