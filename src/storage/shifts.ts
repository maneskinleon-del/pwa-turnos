import type { ShiftDay, ShiftType } from '@/types/shift';

const STORAGE_KEY = 'pwa-turnos-shifts';

export function loadShifts(): ShiftDay[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidShiftDay);
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
  const shifts = loadShifts();
  return shifts.find(s => s.date === dateKey);
}

export function setShift(dateKey: string, type: ShiftType): void {
  const shifts = loadShifts();
  const existingIndex = shifts.findIndex(s => s.date === dateKey);
  const newShift: ShiftDay = { date: dateKey, type };
  
  if (existingIndex >= 0) {
    if (type === 'OFF') {
      shifts.splice(existingIndex, 1);
    } else {
      shifts[existingIndex] = newShift;
    }
  } else if (type !== 'OFF') {
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
  return typeof o.date === 'string' && 
         typeof o.type === 'string' &&
         ['WORK', 'REST', 'EXTRA', 'OFF'].includes(o.type);
}

export function seedDemoData(): void {
  const existing = loadShifts();
  if (existing.length > 0) return;
  
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  const demo: ShiftDay[] = [
    { date: `${year}-${String(month + 1).padStart(2, '0')}-01`, type: 'WORK' },
    { date: `${year}-${String(month + 1).padStart(2, '0')}-02`, type: 'REST' },
    { date: `${year}-${String(month + 1).padStart(2, '0')}-03`, type: 'WORK' },
    { date: `${year}-${String(month + 1).padStart(2, '0')}-04`, type: 'EXTRA' },
    { date: `${year}-${String(month + 1).padStart(2, '0')}-05`, type: 'REST' },
  ];
  
  saveShifts(demo);
}