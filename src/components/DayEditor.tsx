import { useState, useEffect } from 'react';
import type { ShiftType } from '@/types/shift';
import { getMonthName, computeHours, DEFAULT_WORKDAY_CONFIG } from '@/types/shift';

interface DayEditorProps {
  dateKey: string;
  currentType: ShiftType;
  currentHours?: number;
  normalHours?: number;
  onSave: (type: ShiftType, hoursWorked?: number) => void;
  onClose: () => void;
}

const WEEKDAY_NAMES = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

const OPTIONS: {
  type: ShiftType;
  label: string;
  sub: string;
  icon: string;
  iconBg: string;
  badge: string;
}[] = [
  {
    type: 'WORK',
    label: 'Trabajo',
    sub: 'Jornada habitual programada',
    icon: 'fa-briefcase',
    iconBg: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    badge: 'bg-sky-950 text-sky-300 border-sky-800',
  },
  {
    type: 'REST',
    label: 'Descanso',
    sub: 'Día de descanso entre turnos',
    icon: 'fa-bed',
    iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    badge: 'bg-emerald-950 text-emerald-300 border-emerald-800',
  },
  {
    type: 'EXTRA',
    label: 'Turno extra',
    sub: 'Jornada adicional / refuerzo',
    icon: 'fa-bolt',
    iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    badge: 'bg-amber-950 text-amber-300 border-amber-800',
  },
  {
    type: 'OFF',
    label: 'Libre / sin definir',
    sub: 'Sin turno asignado / Restablecer',
    icon: 'fa-ban',
    iconBg: 'bg-slate-800 text-slate-400 border-slate-700',
    badge: 'bg-slate-800 text-slate-400 border-slate-700',
  },
];

export function DayEditor({
  dateKey,
  currentType,
  currentHours,
  normalHours = DEFAULT_WORKDAY_CONFIG.normalHours,
  onSave,
  onClose,
}: DayEditorProps) {
  const [selectedType, setSelectedType] = useState<ShiftType>(currentType);
  const [hoursInput, setHoursInput] = useState<string>(
    currentHours && currentHours > 0 ? String(currentHours) : ''
  );
  const [visible, setVisible] = useState(false);

  const [year, month, day] = dateKey.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const weekday = WEEKDAY_NAMES[dateObj.getDay()];
  const dateTitle = `${day} de ${getMonthName(month - 1)}, ${year}`;

  const parsedHours = hoursInput === '' ? undefined : Number(hoursInput);
  const hoursValid =
    parsedHours === undefined ||
    (Number.isFinite(parsedHours) && parsedHours >= 0 && parsedHours <= 24);
  const breakdown =
    hoursValid && parsedHours !== undefined && parsedHours > 0
      ? computeHours(parsedHours, normalHours)
      : null;

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSave = () => {
    if (!hoursValid) return;
    const hours =
      parsedHours !== undefined && parsedHours > 0 ? parsedHours : undefined;
    onSave(selectedType, hours);
    onClose();
  };

  const showHoursField = selectedType === 'WORK' || selectedType === 'EXTRA';

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-40 backdrop-transition ${
          visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden
      />

      <div
        className={`fixed bottom-0 inset-x-0 max-w-md mx-auto z-50 bg-slate-900 border-t border-slate-700/80 rounded-t-2xl shadow-2xl p-5 sheet-transition max-h-[90vh] overflow-y-auto ${
          visible ? 'translate-y-0' : 'translate-y-full pointer-events-none'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-date-title"
      >
        <div
          className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4 cursor-pointer"
          onClick={onClose}
        />

        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-[10px] font-semibold text-sky-400 tracking-wider uppercase">
              {weekday}
            </span>
            <h3
              id="sheet-date-title"
              className="text-lg font-bold text-white tracking-tight"
            >
              {dateTitle}
            </h3>
            <p className="text-xs text-slate-400">
              Selecciona el tipo de turno y las horas
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
            aria-label="Cerrar"
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>

        <div className="space-y-2.5 mb-4">
          {OPTIONS.map(opt => {
            const selected = selectedType === opt.type;
            return (
              <button
                key={opt.type}
                type="button"
                onClick={() => setSelectedType(opt.type)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border cursor-pointer transition active:scale-[0.99] text-left ${
                  selected
                    ? 'border-sky-500 bg-sky-950/30'
                    : 'border-slate-800 bg-slate-950/50 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-base border ${opt.iconBg}`}
                  >
                    <i className={`fa-solid ${opt.icon}`} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                      {opt.label}
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${opt.badge}`}
                      >
                        {opt.type}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">{opt.sub}</div>
                  </div>
                </div>
                <span
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selected
                      ? 'border-sky-500 bg-sky-500'
                      : 'border-slate-600 bg-slate-800'
                  }`}
                >
                  {selected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Horas trabajadas (Fase 3) */}
        {showHoursField && (
          <div className="mb-5 p-3 rounded-xl border border-slate-800 bg-slate-950/60">
            <label
              htmlFor="hours-worked"
              className="block text-xs font-semibold text-slate-300 mb-2"
            >
              Horas trabajadas
              <span className="ml-1.5 font-normal text-slate-500">
                (jornada normal: {normalHours} h)
              </span>
            </label>
            <div className="flex items-center gap-2">
              <input
                id="hours-worked"
                type="number"
                inputMode="decimal"
                min={0}
                max={24}
                step={0.5}
                placeholder="0"
                value={hoursInput}
                onChange={e => setHoursInput(e.target.value)}
                className="w-24 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm font-mono focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40"
              />
              <span className="text-xs text-slate-400">horas</span>
            </div>
            {!hoursValid && (
              <p className="mt-1.5 text-[11px] text-rose-400">
                Ingresa un valor entre 0 y 24
              </p>
            )}
            {breakdown && (
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-slate-900/80 border border-slate-800 py-1.5 px-1">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">
                    Total
                  </div>
                  <div className="text-sm font-mono font-bold text-slate-200">
                    {breakdown.worked} h
                  </div>
                </div>
                <div className="rounded-lg bg-slate-900/80 border border-slate-800 py-1.5 px-1">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">
                    Normal
                  </div>
                  <div className="text-sm font-mono font-bold text-sky-300">
                    {breakdown.normal} h
                  </div>
                </div>
                <div className="rounded-lg bg-slate-900/80 border border-slate-800 py-1.5 px-1">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">
                    Extra
                  </div>
                  <div className="text-sm font-mono font-bold text-amber-300">
                    {breakdown.overtime} h
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm border border-slate-700 active:scale-[0.98] transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!hoursValid}
            className="py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:pointer-events-none text-white font-semibold text-sm shadow-lg shadow-sky-900/30 active:scale-[0.98] transition flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-check" /> Guardar Turno
          </button>
        </div>
      </div>
    </>
  );
}
