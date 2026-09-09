import type { MonthlySummary } from '@/domain/monthlySummary';
import { formatCLP, getMonthName } from '@/types/shift';
import { exportMonthlySummaryCsv, downloadCsv } from '@/domain/exportMonth';

interface ResumenViewProps {
  summary: MonthlySummary;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onGoToday: () => void;
}

export function ResumenView({
  summary,
  onPrevMonth,
  onNextMonth,
  onGoToday,
}: ResumenViewProps) {
  const handleExport = () => {
    const csv = exportMonthlySummaryCsv(summary);
    const file = `turnos-${summary.year}-${String(summary.month + 1).padStart(2, '0')}.csv`;
    downloadCsv(file, csv);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
      {/* Month nav */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Resumen · {getMonthName(summary.month)} {summary.year}
          </h2>
          <p className="text-[11px] text-slate-400">
            Control de liquidación mensual
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrevMonth}
            aria-label="Mes anterior"
            className="w-9 h-9 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center border border-slate-700/60"
          >
            <i className="fa-solid fa-chevron-left text-xs" />
          </button>
          <button
            type="button"
            onClick={onGoToday}
            className="text-[10px] px-2 py-1.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            aria-label="Mes siguiente"
            className="w-9 h-9 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center border border-slate-700/60"
          >
            <i className="fa-solid fa-chevron-right text-xs" />
          </button>
        </div>
      </div>

      <div className="px-3 pb-4 space-y-3">
        {/* DÍAS */}
        <Card title="Días">
          <Row label="Días liquidados" value={String(summary.liquidationDays)} />
          <Row label="Turnos normales" value={String(summary.normalShiftDays)} />
          <Row label="Turnos extras" value={String(summary.extraShiftDays)} accent="amber" />
          <Row
            label="Días efectivos trabajados"
            value={String(summary.effectiveWorkedDays)}
          />
        </Card>

        {/* TURNOS EXTRA */}
        <Card title="Turnos extra">
          <Row label="Realizados" value={String(summary.extras.realized)} />
          <Row label="Pagados" value={String(summary.extras.paidCount)} accent="emerald" />
          <Row label="Pendientes" value={String(summary.extras.pendingCount)} accent="amber" />
          <div className="h-px bg-slate-800 my-1" />
          <Row label="Valor unitario" value={formatCLP(summary.extras.unitValue)} />
          <Row label="Pagado" value={formatCLP(summary.extras.paidAmount)} accent="emerald" />
          <Row
            label="Pendiente"
            value={formatCLP(summary.extras.pendingAmount)}
            accent="amber"
          />
        </Card>

        {/* HORAS */}
        <Card title="Horas">
          <Row label="Horas normales" value={`${summary.hoursNormal} h`} />
          <Row
            label="Horas de turnos extra"
            value={`${summary.hoursExtraShift} h`}
            accent="amber"
          />
          <Row
            label="Horas extraordinarias"
            value={`${summary.hoursOvertime} h`}
            accent="sky"
          />
        </Card>

        {/* EXTRAS PENDIENTES */}
        <Card title="Extras pendientes">
          {summary.extras.pendingDates.length === 0 ? (
            <p className="text-[11px] text-slate-500 py-1">No hay extras pendientes</p>
          ) : (
            <ul className="space-y-1.5">
              {summary.extras.all
                .filter(e => e.paid !== true)
                .map(e => {
                  const [, m, d] = e.date.split('-');
                  const hrs =
                    typeof e.hoursWorked === 'number' && e.hoursWorked > 0
                      ? e.hoursWorked
                      : '—';
                  return (
                    <li
                      key={e.date}
                      className="flex items-center justify-between rounded-lg bg-slate-900/80 border border-slate-800 px-2.5 py-2"
                    >
                      <span className="text-slate-300 font-mono text-[11px]">
                        <span className="text-amber-400/90 mr-1.5">□</span>
                        {d}/{m}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">{hrs} h</span>
                    </li>
                  );
                })}
            </ul>
          )}
        </Card>

        {/* EXTRAS PAGADOS (compact) */}
        {summary.extras.paidCount > 0 && (
          <Card title="Extras pagados">
            <ul className="space-y-1.5">
              {summary.extras.all
                .filter(e => e.paid === true)
                .map(e => {
                  const [, m, d] = e.date.split('-');
                  const hrs =
                    typeof e.hoursWorked === 'number' && e.hoursWorked > 0
                      ? e.hoursWorked
                      : '—';
                  return (
                    <li
                      key={e.date}
                      className="flex items-center justify-between rounded-lg bg-slate-900/80 border border-slate-800 px-2.5 py-2"
                    >
                      <span className="text-slate-300 font-mono text-[11px]">
                        <span className="text-emerald-400 mr-1.5">✓</span>
                        {d}/{m}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">{hrs} h</span>
                    </li>
                  );
                })}
            </ul>
          </Card>
        )}

        <button
          type="button"
          onClick={handleExport}
          className="w-full py-3 rounded-xl bg-emerald-700/90 hover:bg-emerald-600 text-white font-semibold text-sm border border-emerald-600/50 shadow-lg shadow-emerald-950/30 flex items-center justify-center gap-2 active:scale-[0.98] transition"
        >
          <i className="fa-solid fa-file-csv" />
          Exportar CSV
        </button>

        <p className="text-[10px] text-center text-slate-600 pb-2">
          Mismos cálculos que el resumen del calendario · datos solo en este dispositivo
        </p>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 space-y-1.5">
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
        {title}
      </h3>
      {children}
    </section>
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
          : 'text-slate-100';
  return (
    <div className="flex items-center justify-between gap-2 px-1 py-1">
      <span className="text-[12px] text-slate-400">{label}</span>
      <span className={`text-[13px] font-mono font-semibold tabular-nums ${color}`}>
        {value}
      </span>
    </div>
  );
}
