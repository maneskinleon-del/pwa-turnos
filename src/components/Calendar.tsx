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

interface CalendarProps {
  selectedDate: string | null;
  onSelectDate: (dateKey: string) => void;
  getShiftType: (dateKey: string) => ShiftType;
  onUpdateShift: (dateKey: string, type: ShiftType) => void;
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
  { selectedDate: _selectedDate, onSelectDate, getShiftType, onUpdateShift },
  ref
) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [editorDate, setEditorDate] = useState<string | null>(null);

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
      setCurrentYear(y => y - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(y => y + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
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

  const handleDayClick = (date: Date) => {
    const key = formatDateKey(date);
    setEditorDate(key);
    onSelectDate(key);
  };

  const renderDayCell = (date: Date) => {
    const key = formatDateKey(date);
    const type = getShiftType(key);
    const isCurrentMonth =
      date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    const isTodayFlag = isToday(date);
    const badge = SHIFT_BADGE[type];

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
          {isTodayFlag && <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />}
        </div>
        {badge ? (
          <div
            className={`mt-auto flex items-center justify-center gap-0.5 py-0.5 px-1 rounded border text-[9px] font-bold ${badge.badge}`}
          >
            <i className={`fa-solid ${badge.icon} text-[8px]`} />
            <span className="tracking-tight">{badge.short}</span>
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
      {editorDate && (
        <DayEditor
          dateKey={editorDate}
          currentType={getShiftType(editorDate)}
          onSave={type => onUpdateShift(editorDate, type)}
          onClose={() => setEditorDate(null)}
        />
      )}
    </div>
  );
});
