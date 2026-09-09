import type { MonthlySummary } from './monthlySummary';

function esc(v: string | number): string {
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Exporta resumen mensual a CSV (UTF-8). */
export function exportMonthlySummaryCsv(summary: MonthlySummary): string {
  const lines: string[] = [];
  lines.push('campo,valor');
  lines.push(`mes,${esc(summary.monthLabel)}`);
  lines.push(`anio,${summary.year}`);
  lines.push(`mes_numero,${summary.month + 1}`);
  lines.push(`dias_calendario,${summary.calendarDays}`);
  lines.push(`dias_liquidados,${summary.liquidationDays}`);
  lines.push(`turnos_normales,${summary.normalShiftDays}`);
  lines.push(`turnos_extras,${summary.extraShiftDays}`);
  lines.push(`dias_efectivos_trabajados,${summary.effectiveWorkedDays}`);
  lines.push(`turnos_extra_realizados,${summary.extras.realized}`);
  lines.push(`turnos_extra_pagados,${summary.extras.paidCount}`);
  lines.push(`turnos_extra_pendientes,${summary.extras.pendingCount}`);
  lines.push(`valor_unitario_turno_extra,${summary.extras.unitValue}`);
  lines.push(`monto_pagado,${summary.extras.paidAmount}`);
  lines.push(`monto_pendiente,${summary.extras.pendingAmount}`);
  lines.push(`horas_normales,${summary.hoursNormal}`);
  lines.push(`horas_turnos_extra,${summary.hoursExtraShift}`);
  lines.push(`horas_extraordinarias,${summary.hoursOvertime}`);
  lines.push('');
  lines.push('detalle_extras');
  lines.push('fecha,estado,horas');
  for (const e of summary.extras.all) {
    const estado = e.paid === true ? 'pagado' : 'pendiente';
    lines.push(`${e.date},${estado},${e.hoursWorked ?? ''}`);
  }
  return lines.join('\n');
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
