import { useState } from 'react';
import type { ShiftType } from '@/types/shift';
import { SHIFT_TYPES } from '@/types/shift';

interface DayEditorProps {
  dateKey: string;
  currentType: ShiftType;
  onSave: (type: ShiftType) => void;
  onClose: () => void;
}

export function DayEditor({ dateKey, currentType, onSave, onClose }: DayEditorProps) {
  const [selectedType, setSelectedType] = useState<ShiftType>(currentType);
  const [dateLabel] = useState(() => {
    const [year, month, day] = dateKey.split('-');
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  });

  const handleSave = () => {
    onSave(selectedType);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-xl shadow-xl animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{dateLabel}</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Cerrar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 space-y-3">
          {SHIFT_TYPES.map(({ value, label, icon }) => (
            <button
              key={value}
              onClick={() => setSelectedType(value)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all ${
                selectedType === value
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500 dark:border-blue-400'
                  : 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600/50'
              }`}
            >
              <span className="text-3xl">{icon}</span>
              <span className="text-lg font-medium text-gray-900 dark:text-white">{label}</span>
              {selectedType === value && (
                <svg className="ml-auto w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>

        <div className="p-4 border-t dark:border-gray-700">
          <button
            onClick={handleSave}
            className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}