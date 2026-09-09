import { useState, useRef, useMemo } from 'react';
import { Calendar, type CalendarHandle } from '@/components/Calendar';
import { useShifts } from '@/hooks/useShifts';
import { clearAllShifts, seedDemoDataForced } from '@/storage/shifts';
import { getMonthName } from '@/types/shift';

function formatTodayLabel(): string {
  const now = new Date();
  return `${now.getDate()} de ${getMonthName(now.getMonth()).toLowerCase()}`;
}

function App() {
  const {
    loaded,
    updateShift,
    getShiftType,
    getShift,
    config,
    shifts,
    reload,
  } = useShifts();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const calendarRef = useRef<CalendarHandle>(null);
  const todayLabel = useMemo(() => formatTodayLabel(), []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  };

  const handleClearAll = () => {
    if (confirm('¿Restablecer y borrar todos los turnos guardados?')) {
      clearAllShifts();
      reload();
      showToast('Datos borrados');
    }
  };

  const handleSeedDemo = () => {
    seedDemoDataForced();
    reload();
    showToast('Datos de prueba cargados');
  };

  const handleGoToday = () => {
    calendarRef.current?.goToToday();
    showToast('Mes actual restaurado');
  };

  if (!loaded) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center bg-slate-950 font-sans antialiased selection:bg-sky-500 selection:text-white">
      <div className="w-full max-w-md h-full min-h-screen bg-slate-900 border-x border-slate-800/80 flex flex-col relative shadow-2xl overflow-x-hidden">
        <header className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-lg border border-sky-500/30">
              <i className="fa-solid fa-calendar-days text-sm" />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-white flex items-center gap-1.5">
                PWA Turnos
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800/60 uppercase">
                  Control
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">Turnos · Horas · Extras · Feriados</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              id="btn-today"
              onClick={handleGoToday}
              title="Ir al mes actual"
              className="text-xs px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 font-medium transition flex items-center gap-1.5 shadow-sm shadow-black/40"
            >
              <i className="fa-regular fa-clock text-[10px] text-sky-400" />
              <span className="tabular-nums">{todayLabel}</span>
            </button>
            <button
              type="button"
              id="btn-demo"
              title="Cargar datos de prueba"
              onClick={handleSeedDemo}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition text-xs"
            >
              <i className="fa-solid fa-wand-magic-sparkles" />
            </button>
          </div>
        </header>

        <Calendar
          ref={calendarRef}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          getShiftType={getShiftType}
          getHoursWorked={dateKey => getShift(dateKey)?.hoursWorked}
          getPaid={dateKey => getShift(dateKey)?.paid === true}
          normalHours={config.normalHours}
          config={config}
          shifts={shifts}
          onUpdateShift={(dateKey, type, hours, paid) => {
            updateShift(dateKey, type, hours, paid);
            const bits = [type];
            if (typeof hours === 'number' && hours > 0) bits.push(`${hours}h`);
            if (type === 'EXTRA') bits.push(paid ? 'pagado' : 'pendiente');
            showToast(`Día: ${bits.join(' · ')}`);
          }}
        />

        <footer className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px]">
              Local · jornada {config.normalHours}h · extra $
              {config.extraShiftValue.toLocaleString('es-CL')}
            </span>
          </div>
          <button
            type="button"
            onClick={handleClearAll}
            className="text-[11px] text-slate-500 hover:text-rose-400 transition"
          >
            Resetear datos
          </button>
        </footer>

        <div
          className={`fixed top-16 inset-x-0 mx-auto w-max max-w-[90%] bg-slate-800/95 border border-slate-700 text-slate-200 text-xs px-3.5 py-2 rounded-full shadow-lg pointer-events-none transition-opacity duration-300 flex items-center gap-2 z-50 ${
            toast ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <i className="fa-solid fa-circle-check text-emerald-400" />
          <span>{toast ?? 'Turno actualizado'}</span>
        </div>
      </div>
    </div>
  );
}

export default App;
