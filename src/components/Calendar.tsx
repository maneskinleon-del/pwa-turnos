import { useState, useMemo } from 'react';
import type { ShiftType } from '@/types/shift';
import {
  formatDateKey,
  isToday,
  getDaysInMonth,
  getFirstDayOfMonth,
  getMonthName,
  getShiftTypeInfo,
} from '@/types/shift';
import { DayEditor } from './DayEditor';

interface CalendarProps {
  selectedDate: string | null;
  onSelectDate: (dateKey: string) => void;
  getShiftType: (dateKey: string) => ShiftType;
  onUpdateShift: (dateKey: string, type: ShiftType) => void;
}

export function Calendar({ selectedDate, onSelectDate, getShiftType, onUpdateShift }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [editorDate, setEditorDate] = useState<string | null>(null);

  const daysInMonth = useMemo(() => getDaysInMonth(currentYear, currentMonth), [currentYear, currentMonth]);
  const firstDayOfMonth = useMemo(() => getFirstDayOfMonth(currentYear, currentMonth), [currentYear, currentMonth]);
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

  const calendarDays = useMemo(() => {
    const days: (Date | null)[] = [];
    const firstDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Convert to Monday=0
    
    // Previous month days
    const prevMonthDays = firstDayIndex;
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const prevMonthTotalDays = getDaysInMonth(prevYear, prevMonth);
    
    for (let i = prevMonthDays - 1; i >= 0; i--) {
      days.push(new Date(prevYear, prevMonth, prevMonthTotalDays - i));
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(currentYear, currentMonth, day));
    }
    
    // Next month days to fill grid
    const remaining = (7 - (days.length % 7)) % 7;
    const nextMonthIdx = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    
    for (let day = 1; day <= remaining; day++) {
      days.push(new Date(nextYear, nextMonthIdx, day));
    }
    
    return days;
  }, [currentYear, currentMonth, daysInMonth, firstDayOfMonth]);

  const handleDayClick = (date: Date) => {
    const key = formatDateKey(date);
    setEditorDate(key);
    onSelectDate(key);
  };

  const renderDayCell = (date: Date | null, index: number) => {
    if (!date) return <div key={index} className="aspect-square" />;
    
    const key = formatDateKey(date);
    const type = getShiftType(key);
    const info = getShiftTypeInfo(type);
    const isCurrentMonth = date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    const isTodayFlag = isToday(date);
    const isSelected = selectedDate === key;
    
    return (
      <button
        key={key}
        onClick={() => handleDayClick(date)}
        className={`
          relative aspect-square flex flex-col items-center justify-center rounded-xl transition-all
          ${isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/50'}
          ${isTodayFlag ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
          ${isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
          hover:bg-gray-100 dark:hover:bg-gray-700/50
          active:scale-[0.98]
        `}
        style={{ minHeight: '60px' }}
      >
        <span className={`
          text-lg font-medium ${isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}
          ${isTodayFlag ? 'bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center' : ''}
        `}>
          {date.getDate()}
        </span>
        
        <div className="flex items-center justify-center gap-1 mt-1">
          <span className="text-2xl" aria-label={info.label}>{info.icon}</span>
          <span className="text-xs font-medium capitalize hidden sm:block">
            {info.label.toLowerCase()}
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-10">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Mes anterior"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="flex flex-col items-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {getMonthName(currentMonth)} {currentYear}
          </h1>
          <button
            onClick={goToToday}
            className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1"
          >
            Hoy
          </button>
        </div>
        
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Mes siguiente"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </header>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, i) => (
          <div key={i} className="py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-auto p-2 grid grid-cols-7 gap-1">
        {calendarDays.map(renderDayCell)}
      </div>

      {/* Day Editor Modal */}
      {editorDate && (
        <DayEditor
          dateKey={editorDate}
          currentType={getShiftType(editorDate)}
          onSave={(type) => onUpdateShift(editorDate, type)}
          onClose={() => setEditorDate(null)}
        />
      )}
    </div>
  );
}