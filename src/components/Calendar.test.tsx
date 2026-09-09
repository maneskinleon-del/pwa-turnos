import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createRef } from 'react';
import { Calendar, type CalendarHandle } from '@/components/Calendar';
import { getMonthName } from '@/types/shift';
import type { ShiftType } from '@/types/shift';

// Ensure a failing fake-timer test cannot leak mocked timers into later tests.
afterEach(() => {
  vi.useRealTimers();
});

interface CalendarOverrides {
  selectedDate?: string | null;
  onSelectDate?: (dateKey: string) => void;
  getShiftType?: (dateKey: string) => ShiftType;
  onUpdateShift?: (dateKey: string, type: ShiftType) => void;
}

function renderCalendar(overrides: CalendarOverrides = {}) {
  const props = {
    selectedDate: null,
    onSelectDate: vi.fn(),
    getShiftType: () => 'OFF' as ShiftType,
    onUpdateShift: vi.fn(),
    ...overrides,
  };
  render(<Calendar {...props} />);
  return props;
}

function monthLabel(offset: number): string {
  const date = new Date(new Date().getFullYear(), new Date().getMonth() + offset, 1);
  return `${getMonthName(date.getMonth())} ${date.getFullYear()}`;
}

function getDayButtons(): HTMLElement[] {
  // Day cells have data-date attribute
  return screen.getAllByRole('button').filter(b => b.hasAttribute('data-date'));
}

describe('Calendar', () => {
  it('renders the current month name and weekday headers', () => {
    renderCalendar();
    expect(screen.getByRole('heading', { name: monthLabel(0) })).toBeTruthy();
    ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].forEach(day => {
      expect(screen.getByText(day)).toBeTruthy();
    });
  });

  it('navigates to the previous month', () => {
    renderCalendar();
    fireEvent.click(screen.getByLabelText('Mes anterior'));
    expect(screen.getByRole('heading', { name: monthLabel(-1) })).toBeTruthy();
  });

  it('navigates to the next month', () => {
    renderCalendar();
    fireEvent.click(screen.getByLabelText('Mes siguiente'));
    expect(screen.getByRole('heading', { name: monthLabel(1) })).toBeTruthy();
  });

  it('wraps to December of the previous year when navigating back from January', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 15)); // 15 Jan 2026
    renderCalendar();
    fireEvent.click(screen.getByLabelText('Mes anterior'));
    expect(screen.getByRole('heading', { name: 'Diciembre 2025' })).toBeTruthy();
    vi.useRealTimers();
  });

  it('wraps to January of the next year when navigating forward from December', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 11, 15)); // 15 Dec 2026
    renderCalendar();
    fireEvent.click(screen.getByLabelText('Mes siguiente'));
    expect(screen.getByRole('heading', { name: 'Enero 2027' })).toBeTruthy();
    vi.useRealTimers();
  });

  it('returns to the current month via imperative goToToday handle', () => {
    const ref = createRef<CalendarHandle>();
    const props = {
      selectedDate: null as string | null,
      onSelectDate: vi.fn(),
      getShiftType: () => 'OFF' as ShiftType,
      onUpdateShift: vi.fn(),
    };
    render(<Calendar ref={ref} {...props} />);
    fireEvent.click(screen.getByLabelText('Mes siguiente'));
    fireEvent.click(screen.getByLabelText('Mes siguiente'));
    expect(screen.getByRole('heading', { name: monthLabel(2) })).toBeTruthy();
    ref.current?.goToToday();
    expect(screen.getByRole('heading', { name: monthLabel(0) })).toBeTruthy();
  });

  it('opens the day editor when a day is clicked', () => {
    const onSelectDate = vi.fn();
    renderCalendar({ onSelectDate });
    const dayButtons = getDayButtons();
    expect(dayButtons.length).toBeGreaterThan(0);
    fireEvent.click(dayButtons[0]);
    expect(screen.getByText(/Guardar/)).toBeTruthy();
    expect(screen.getByText('Trabajo')).toBeTruthy();
    expect(onSelectDate).toHaveBeenCalledTimes(1);
  });

  it('forwards the edited date and type from editor to onUpdateShift', () => {
    const onUpdateShift = vi.fn();
    renderCalendar({ onUpdateShift });
    fireEvent.click(getDayButtons()[0]);
    fireEvent.click(screen.getByText('Descanso'));
    fireEvent.click(screen.getByText(/Guardar/));
    expect(onUpdateShift).toHaveBeenCalledTimes(1);
    expect(onUpdateShift.mock.calls[0][0]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(onUpdateShift.mock.calls[0][1]).toBe('REST');
  });

  it('renders the shift badge for a day with a stored shift', () => {
    renderCalendar({ getShiftType: key => (key.endsWith('-15') ? 'WORK' : 'OFF') });
    // Badge shows short label "W" for WORK
    const workBadges = screen.getAllByText('W');
    expect(workBadges.length).toBeGreaterThan(0);
  });

  it('closes the editor without saving', () => {
    const onUpdateShift = vi.fn();
    renderCalendar({ onUpdateShift });
    fireEvent.click(getDayButtons()[0]);
    fireEvent.click(screen.getByLabelText('Cerrar'));
    expect(screen.queryByText(/Guardar/)).toBeNull();
    expect(onUpdateShift).not.toHaveBeenCalled();
  });
});
