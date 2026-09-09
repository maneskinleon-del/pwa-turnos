import { describe, it, expect } from 'vitest';
import { exportMonthlySummaryCsv } from './exportMonth';
import { buildMonthlySummary } from './monthlySummary';
import type { ShiftDay } from '@/types/shift';

describe('exportMonthlySummaryCsv', () => {
  it('includes summary fields and extra detail', () => {
    const shifts: ShiftDay[] = [
      { date: '2026-09-04', type: 'EXTRA', hoursWorked: 12, paid: true },
      { date: '2026-09-21', type: 'EXTRA', hoursWorked: 12, paid: false },
      { date: '2026-09-01', type: 'WORK', hoursWorked: 14 },
    ];
    const summary = buildMonthlySummary(shifts, 2026, 8);
    const csv = exportMonthlySummaryCsv(summary);
    expect(csv).toContain('dias_liquidados,30');
    expect(csv).toContain('dias_trabajados_normales,1');
    expect(csv).toContain('dias_trabajados_extra,2');
    expect(csv).toContain('dias_efectivos_trabajados,3');
    expect(csv).toContain('turnos_extra_pagados,1');
    expect(csv).toContain('turnos_extra_pendientes,1');
    expect(csv).toContain('monto_pagado,40000');
    expect(csv).toContain('horas_extraordinarias,2');
    expect(csv).toContain('2026-09-21,pendiente');
    expect(csv).toContain('2026-09-04,pagado');
  });
});
