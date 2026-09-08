import { useState } from 'react';
import { Calendar } from '@/components/Calendar';
import { useShifts } from '@/hooks/useShifts';

function App() {
  const { loaded, updateShift, getShiftType } = useShifts();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Calendar
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        getShiftType={getShiftType}
        onUpdateShift={updateShift}
      />
    </div>
  );
}

export default App;