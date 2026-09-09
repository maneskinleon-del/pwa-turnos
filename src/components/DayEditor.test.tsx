import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DayEditor } from '@/components/DayEditor';
import type { ComponentProps } from 'react';

function renderEditor(overrides: Partial<ComponentProps<typeof DayEditor>> = {}) {
  const props = {
    dateKey: '2026-09-01',
    currentType: 'WORK' as const,
    onSave: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  };
  render(<DayEditor {...props} />);
  return props;
}

describe('DayEditor', () => {
  it('renders all four shift types', () => {
    renderEditor();
    expect(screen.getByText('Trabajo')).toBeTruthy();
    expect(screen.getByText('Descanso')).toBeTruthy();
    expect(screen.getByText('Turno extra')).toBeTruthy();
    expect(screen.getByText('Libre / sin definir')).toBeTruthy();
  });

  it('shows the formatted date as heading', () => {
    renderEditor({ dateKey: '2026-09-01' });
    expect(screen.getByRole('heading', { name: /1 de Septiembre/i })).toBeTruthy();
  });

  it('saves the currently selected type without changes', () => {
    const { onSave, onClose } = renderEditor({ currentType: 'EXTRA' });
    fireEvent.click(screen.getByText(/Guardar/));
    expect(onSave).toHaveBeenCalledWith('EXTRA');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('saves a newly selected shift type', () => {
    const { onSave } = renderEditor();
    fireEvent.click(screen.getByText('Descanso'));
    fireEvent.click(screen.getByText(/Guardar/));
    expect(onSave).toHaveBeenCalledWith('REST');
  });

  it('closes without saving when the close button is clicked', () => {
    const { onSave, onClose } = renderEditor();
    fireEvent.click(screen.getByLabelText('Cerrar'));
    expect(onSave).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});