import type { MonthlySummary as Summary } from '@/domain/monthlySummary';
import { formatCLP } from '@/types/shift';
import { exportMonthlySummaryCsv, downloadCsv } from '@/domain/exportMonth';

interface Props {
  summary: Summary;
  onClose?: () => void;
}

export function MonthlySummaryPanel({ summary }: Props) {
  const handleExport = () => {
    const csv = exportMonthlySummaryCsv(summary);
    const file = `turnos-${summary.year}-${String(summary.month + 1).padStart(2, '0')}.csv`;
    downloadCsv(file, csv);
  };

  return (
    <div className="mx-3 mb-3 mt-1 rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs space-y-3 shrink-0">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white tracking-tight">
          Resumen rápido
        </h3>
        <button
          type="button"
          onClick={handleExport}
          className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition flex items-center gap-1"
        >
          <i className="fa-solid fa-file-csv text-[10px] text-emerald-400" />
          Exportar CSV
        </button>
      </div>

      <section>
        <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Días</div>
        <div className="grid grid-cols-2 gap-1.5">
          <Row label="Días liquidados" value={String(summary.liquidationDays)} />
          <Row label="Turnos normales" value={String(summary.normalShiftDays)} />
          <Row label="Turnos extras" value={String(summary.extraShiftDays)} accent="amber" />
          <Row label="Días efectivos" value={String(summary.effectiveWorkedDays)} />
        </div>
      </section>

      <section>
        <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">
          Turnos extra
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <Row label="Realizados" value={String(summary.extras.realized)} />
          <Row label="Pagados" value={String(summary.extras.paidCount)} accent="emerald" />
          <Row label="Pendientes" value={String(summary.extras.pendingCount)} accent="amber" />
          <Row label="Valor unitario" value={formatCLP(summary.extras.unitValue)} />
          <Row label="Monto pagado" value={formatCLP(summary.extras.paidAmount)} accent="emerald" />
          <Row label="Monto pendiente" value={formatCLP(summary.extras.pendingAmount)} accent="amber" />
        </div>
        {summary.extras.pendingDates.length > 0 && (
          <div className="mt-2 rounded-lg border border-amber-900/40 bg-amber-950/20 px-2.5 py-2">
            <div className="text-[10px] uppercase tracking-wider text-amber-400/80 mb-1">
              Extras pendientes
            </div>
            <div className="flex flex-wrap gap-1.5">
              {summary.extras.pendingDates.map(d => (
                <span
                  key={d}
                  className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300"
                >
                  {d.slice(8)}/{d.slice(5, 7)}/{d.slice(0, 4)}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      <section>
        <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Horas</div>
        <div className="grid grid-cols-1 gap-1.5">
          <Row label="Horas normales (WORK)" value={`${summary.hoursNormal} h`} />
          <Row
            label="Horas de turnos EXTRA"
            value={`${summary.hoursExtraShift} h`}
            accent="amber"
          />
          <Row
            label="Horas extraordinarias (sobre jornada)"
            value={`${summary.hoursOvertime} h`}
            accent="sky"
          />
        </div>
      </section>
    </div>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: 'amber' | 'emerald' | 'sky';
}) {
  const color =
    accent === 'amber'
      ? 'text-amber-300'
      : accent === 'emerald'
        ? 'text-emerald-300'
        : accent === 'sky'
          ? 'text-sky-300'
          : 'text-slate-200';
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-slate-900/70 border border-slate-800/80 px-2.5 py-1.5">
      <span className="text-slate-400">{label}</span>
      <span className={`font-mono font-semibold ${color}`}>{value}</span>
    </div>
  );
}
