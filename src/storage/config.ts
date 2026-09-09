import type { WorkdayConfig } from '@/types/shift';
import { DEFAULT_WORKDAY_CONFIG } from '@/types/shift';

const CONFIG_KEY = 'pwa-turnos-config-v3';

export function loadConfig(): WorkdayConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return { ...DEFAULT_WORKDAY_CONFIG };
    const parsed = JSON.parse(raw) as Partial<WorkdayConfig>;
    return {
      normalHours:
        typeof parsed.normalHours === 'number' && parsed.normalHours > 0
          ? parsed.normalHours
          : DEFAULT_WORKDAY_CONFIG.normalHours,
      extraShiftValue:
        typeof parsed.extraShiftValue === 'number' && parsed.extraShiftValue >= 0
          ? parsed.extraShiftValue
          : DEFAULT_WORKDAY_CONFIG.extraShiftValue,
      liquidationDays:
        typeof parsed.liquidationDays === 'number' && parsed.liquidationDays > 0
          ? parsed.liquidationDays
          : DEFAULT_WORKDAY_CONFIG.liquidationDays,
    };
  } catch {
    return { ...DEFAULT_WORKDAY_CONFIG };
  }
}

export function saveConfig(config: WorkdayConfig): void {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save config:', error);
  }
}
