import { useState, useMemo, useImperativeHandle, forwardRef } from 'react';
import type { ShiftType } from '@/types/shift';
import {
  formatDateKey,
  isToday,
  getDaysInMonth,
  getFirstDayOfMonth,
  getMonthName,
} from '@/types/shift';
import { DayEditor } from './DayEditor';
import { getHoliday } from '@/data/chileHolidays';
import { MonthlySummaryPanel } from './MonthlySummary';
import { buildMonthlySummary } from '@/domain/monthlySummary';
import type { WorkdayConfig } from '@/types/shift';
import { DEFAULT_WORKDAY_CONFIG } from '@/types/shift';

interface CalendarProps {
  selectedDate: string | null;
  onSelectDate: (dateKey: string) => void;
  getShiftType: (dateKey: string) => ShiftType;
  getHoursWorked?: (dateKey: string) => number | undefined;
  getPaid?: (dateKey: string) => boolean;
  normalHours?: number;
  config?: WorkdayConfig;
  shifts?: import('@/types/shift').ShiftDay[];
  /** Mes controlado desde App (0-index). Si se pasa, Calendar es controlado. */
  viewMonth?: number;
  viewYear?: number;
  onViewMonthChange?: (year: number, month: number) => void;
  onUpdateShift: (
    dateKey: string,
    type: ShiftType,
    hoursWorked?: number,
    paid?: boolean
  ) => void;
}

export interface CalendarHandle {
  goToToday: () => void;
}

const SHIFT_BADGE: Record<
  ShiftType,
  { border: string; bg: string; badge: string; icon: string; short: string } | null
> = {
  WORK: {
    border: 'border-sky-500/40',
    bg: 'bg-sky-950/20',
    badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    icon: 'fa-briefcase',
    short: 'W',
  },
  REST: {
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-950/20',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    icon: 'fa-bed',
    short: 'R',
  },
  EXTRA: {
    border: 'border-amber-500/40',
    bg: 'bg-amber-950/20',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    icon: 'fa-bolt',
    short: 'EXT',
  },
  OFF: null,
};

export const Calendar = forwardRef<CalendarHandle, CalendarProps>(function Calendar(
  {
    selectedDate: _selectedDate,
    onSelectDate,
    getShiftType,
    getHoursWorked,
    getPaid,
    normalHours = 12,
    config = DEFAULT_WORKDAY_CONFIG,
    shifts = [],
    viewMonth,
    viewYear,
    onViewMonthChange,
    onUpdateShift,
  },
  ref
) {
  const [internalMonth, setInternalMonth] = useState(() => new Date().getMonth());
  const [internalYear, setInternalYear] = useState(() => new Date().getFullYear());
  const currentMonth = viewMonth ?? internalMonth;
  const currentYear = viewYear ?? internalYear;
  const setCurrentMonth = (m: number | ((prev: number) => number)) => {
    const next = typeof m === 'function' ? m(currentMonth) : m;
    if (onViewMonthChange) onViewMonthChange(currentYear, next);
    else setInternalMonth(next);
  };
  const setCurrentYear = (y: number | ((prev: number) => number)) => {
    const next = typeof y === 'function' ? y(currentYear) : y;
    if (onViewMonthChange) onViewMonthChange(next, currentMonth);
    else setInternalYear(next);
  };
  const [editorDate, setEditorDate] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(true);

  const daysInMonth = useMemo(
    () => getDaysInMonth(currentYear, currentMonth),
    [currentYear, currentMonth]
  );
  const firstDayOfMonth = useMemo(
    () => getFirstDayOfMonth(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  const prevMonth = () => {
    if (currentMonth === 0) {
      if (onViewMonthChange) onViewMonthChange(currentYear - 1, 11);
      else {
        setInternalYear(y => y - 1);
        setInternalMonth(11);
      }
    } else {
      if (onViewMonthChange) onViewMonthChange(currentYear, currentMonth - 1);
      else setInternalMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      if (onViewMonthChange) onViewMonthChange(currentYear + 1, 0);
      else {
        setInternalYear(y => y + 1);
        setInternalMonth(0);
      }
    } else {
      if (onViewMonthChange) onViewMonthChange(currentYear, currentMonth + 1);
      else setInternalMonth(m => m + 1);
    }
  };

  const goToToday = () => {
    const now = new Date();
    if (onViewMonthChange) onViewMonthChange(now.getFullYear(), now.getMonth());
    else {
      setInternalMonth(now.getMonth());
      setInternalYear(now.getFullYear());
    }
  };

  useImperativeHandle(ref, () => ({ goToToday }), []);

  const calendarDays = useMemo(() => {
    const days: Date[] = [];
    const firstDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const prevMonthIdx = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const prevMonthTotalDays = getDaysInMonth(prevYear, prevMonthIdx);

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push(new Date(prevYear, prevMonthIdx, prevMonthTotalDays - i));
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(currentYear, currentMonth, day));
    }

    const remaining = (7 - (days.length % 7)) % 7;
    const nextMonthIdx = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

    for (let day = 1; day <= remaining; day++) {
      days.push(new Date(nextYear, nextMonthIdx, day));
    }

    return days;
  }, [currentYear, currentMonth, daysInMonth, firstDayOfMonth]);

  const stats = useMemo(() => {
    const counts = { WORK: 0, REST: 0, EXTRA: 0, OFF: 0 };
    for (let d = 1; d <= daysInMonth; d++) {
      const key = formatDateKey(new Date(currentYear, currentMonth, d));
      const type = getShiftType(key);
      counts[type] = (counts[type] || 0) + 1;
    }
    return counts;
  }, [currentYear, currentMonth, daysInMonth, getShiftType]);

  const hoursSummary = useMemo(() => {
    let worked = 0;
    let normalAcc = 0;
    let overtimeHrs = 0;
    let extraShiftHrs = 0;
    let daysWithHours = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const key = formatDateKey(new Date(currentYear, currentMonth, d));
      const type = getShiftType(key);
      const h = getHoursWorked?.(key);
      if (type === 'EXTRA') {
        const hrs = typeof h === 'number' && h > 0 ? h : normalHours;
        worked += hrs;
        extraShiftHrs += hrs;
        daysWithHours += 1;
        continue;
      }
      if (typeof h === 'number' && h > 0) {
        worked += h;
        normalAcc += Math.min(h, normalHours);
        overtimeHrs += Math.max(0, h - normalHours);
        daysWithHours += 1;
      }
    }
    return {
      worked,
      normal: normalAcc,
      overtime: overtimeHrs,
      extraShift: extraShiftHrs,
      daysWithHours,
    };
  }, [currentYear, currentMonth, daysInMonth, getHoursWorked, getShiftType, normalHours]);

  const handleDayClick = (date: Date) => {
    const key = formatDateKey(date);
    setEditorDate(key);
    onSelectDate(key);
  };

  const renderDayCell = (date: Date) => {
    const key = formatDateKey(date);
    const type = getShiftType(key);
    const hours = getHoursWorked?.(key);
    const isCurrentMonth =
      date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    const isTodayFlag = isToday(date);
    const badge = SHIFT_BADGE[type];
    const holiday = getHoliday(key);
    const paid = type === 'EXTRA' ? getPaid?.(key) === true : false;

    let base =
      'calendar-cell flex flex-col justify-between p-1.5 rounded-xl border cursor-pointer ';

    if (!isCurrentMonth) {
      base += 'calendar-cell-muted bg-slate-900/40 border-slate-800/40 text-slate-600 ';
    } else {
      base += 'bg-slate-950/80 border-slate-700/80 text-slate-300 hover:border-slate-600 ';
    }

    if (isTodayFlag) {
      base += 'calendar-cell-today border-sky-400/60 ';
    }

    if (badge && isCurrentMonth) {
      base += `${badge.border} ${badge.bg} `;
    }

    return (
      <button
        key={key}
        type="button"
        onClick={() => handleDayClick(date)}
        className={base}
        data-date={key}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-xs font-semibold ${
              isTodayFlag ? 'text-sky-400 font-extrabold' : ''
            }`}
          >
            {date.getDate()}
          </span>
          <div className="flex items-center gap-0.5">
            {holiday && (
              <span
                className={`text-[9px] ${
                  holiday.type === 'IRRENUNCIABLE' ? 'text-rose-400' : 'text-violet-400'
                }`}
                title={holiday.name}
              >
                {holiday.type === 'IRRENUNCIABLE' ? '⚠' : '★'}
              </span>
            )}
            {isTodayFlag && <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />}
          </div>
        </div>
        {badge ? (
          <div className="mt-auto space-y-0.5">
            <div
              className={`flex items-center justify-center gap-0.5 py-0.5 px-1 rounded border text-[9px] font-bold ${badge.badge}`}
            >
              <i className={`fa-solid ${badge.icon} text-[8px]`} />
              <span className="tracking-tight">{badge.short}</span>
            </div>
            {typeof hours === 'number' && hours > 0 && isCurrentMonth && (() => {
              // WORK: mostrar jornada + sobre-jornada (ej. 12h + 4)
              // EXTRA: todo el bloque es día extra
              if (type === 'WORK') {
                const normal = Math.min(hours, normalHours);
                const over = Math.max(0, hours - normalHours);
                return (
                  <div className="text-center leading-tight">
                    <div className="text-[8px] font-mono text-sky-300/90">
                      {normal}h
                    </div>
                    {over > 0 && (
                      <div className="text-[8px] font-mono font-semibold text-amber-400">
                        +{over}h
                      </div>
                    )}
                  </div>
                );
              }
              if (type === 'EXTRA') {
                return (
                  <div className="text-center leading-tight">
                    <div className="text-[8px] font-mono font-semibold text-amber-400">
                      {hours}h
                    </div>
                    <div
                      className={`text-[8px] font-bold ${
                        paid ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      {paid ? '✓' : '□'}
                    </div>
                  </div>
                );
              }
              return (
                <div className="text-center text-[8px] font-mono text-slate-400 leading-none">
                  {hours}h
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="mt-auto h-4 flex items-center justify-center text-[10px] text-slate-700">
            ·
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Month Navigation & Stats Header */}
      <div className="bg-slate-900 px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2
              id="current-month-display"
              className="text-lg font-bold text-white capitalize tracking-tight"
            >
              {getMonthName(currentMonth)} {currentYear}
            </h2>
            <span id="current-month-year" className="text-xs text-slate-400">
              Mes seleccionado
            </span>
            <button
              type="button"
              onClick={() => setShowSummary(s => !s)}
              className="mt-1 text-[10px] text-sky-400 hover:text-sky-300"
            >
              {showSummary ? 'Ocultar resumen' : 'Ver resumen'}
            </button>
          </div>
          <div className="flex items-center space-x-1">
            <button
              type="button"
              id="btn-prev-month"
              onClick={prevMonth}
              aria-label="Mes anterior"
              className="w-9 h-9 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white active:scale-90 flex items-center justify-center border border-slate-700/60 transition"
            >
              <i className="fa-solid fa-chevron-left text-xs" />
            </button>
            <button
              type="button"
              id="btn-next-month"
              onClick={nextMonth}
              aria-label="Mes siguiente"
              className="w-9 h-9 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white active:scale-90 flex items-center justify-center border border-slate-700/60 transition"
            >
              <i className="fa-solid fa-chevron-right text-xs" />
            </button>
          </div>
        </div>

        {/* Quick Legend & Counts */}
        <div className="grid grid-cols-4 gap-1.5 py-2 px-2 bg-slate-950/60 rounded-xl border border-slate-800/80 text-center">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-sky-400">
              <span className="w-2 h-2 rounded-full bg-sky-400" /> WORK
            </div>
            <span id="stat-work" className="text-xs font-mono font-bold text-slate-200 mt-0.5">
              {stats.WORK} d
            </span>
          </div>
          <div className="flex flex-col items-center border-l border-slate-800">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> REST
            </div>
            <span id="stat-rest" className="text-xs font-mono font-bold text-slate-200 mt-0.5">
              {stats.REST} d
            </span>
          </div>
          <div className="flex flex-col items-center border-l border-slate-800">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> EXTRA
            </div>
            <span id="stat-extra" className="text-xs font-mono font-bold text-slate-200 mt-0.5">
              {stats.EXTRA} d
            </span>
          </div>
          <div className="flex flex-col items-center border-l border-slate-800">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
              <span className="w-2 h-2 rounded-full bg-slate-500" /> OFF
            </div>
            <span id="stat-off" className="text-xs font-mono font-bold text-slate-300 mt-0.5">
              {stats.OFF} d
            </span>
          </div>
        </div>

        {/* Resumen de horas del mes (Fase 3) */}
        {hoursSummary.daysWithHours > 0 && (
          <div className="mt-2 flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl bg-slate-950/50 border border-slate-800/70 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-400">
              <i className="fa-solid fa-clock text-sky-400/80 text-[10px]" />
              <span>Horas mes</span>
            </div>
            <div className="flex items-center gap-3 font-mono">
              <span className="text-slate-300">
                <span className="text-slate-500">Σ</span> {hoursSummary.worked}h
              </span>
              <span className="text-sky-300">{hoursSummary.normal}h n</span>
              <span className="text-amber-300">{hoursSummary.overtime}h oe</span>
              <span className="text-amber-200/80">{hoursSummary.extraShift}h ex</span>
            </div>
          </div>
        )}
      </div>

      {/* Calendar Grid */}
      <main className="flex-1 px-3 py-2 flex flex-col min-h-0">
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie'].map(d => (
            <span
              key={d}
              className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
            >
              {d}
            </span>
          ))}
          <span className="text-[11px] font-semibold text-rose-400/90 uppercase tracking-wider">
            Sáb
          </span>
          <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
            Dom
          </span>
        </div>
        <div
          id="calendar-days"
          className="grid grid-cols-7 gap-1 flex-1 content-start select-none"
        >
          {calendarDays.map(renderDayCell)}
        </div>
      </main>

      {/* Day Editor Modal */}
      {showSummary && (
        <MonthlySummaryPanel
          summary={buildMonthlySummary(shifts, currentYear, currentMonth, config)}
        />
      )}

      {editorDate && (
        <DayEditor
          dateKey={editorDate}
          currentType={getShiftType(editorDate)}
          currentHours={getHoursWorked?.(editorDate)}
          currentPaid={getPaid?.(editorDate) === true}
          normalHours={normalHours}
          onSave={(type, hours, paid) => onUpdateShift(editorDate, type, hours, paid)}
          onClose={() => setEditorDate(null)}
        />
      )}
    </div>
  );
});
