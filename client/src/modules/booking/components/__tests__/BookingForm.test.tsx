import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BookingForm from '../BookingForm';
import type { Barber } from '../../../../types/barber';
import type { BookingSlot } from '../../../../types/booking';

const mockBarber: Barber = {
  id: 'b1',
  active: true,
  created_at: '2023-01-01',
  users: {
    id: 'u1',
    full_name: 'Test Barber',
    phone: '5551234567',
    email: 'barber@test.com',
  },
  avatar_url: null,
};

const mockAvailableSlots: BookingSlot[] = [
  { time: '09:00', available: true, status: null, span: 1, isStart: true },
  { time: '09:30', available: true, status: null, span: 1, isStart: true },
  { time: '10:00', available: true, status: null, span: 1, isStart: true },
  { time: '10:30', available: false, status: 'pending', span: 2, isStart: true },
  { time: '11:00', available: false, status: 'pending', span: 0, isStart: false },
  { time: '11:30', available: true, status: null, span: 1, isStart: true },
];

describe('BookingForm', () => {
  const defaultProps = {
    selectedBarber: mockBarber,
    selectedDate: '',
    selectedTime: '',
    notes: '',
    personCount: 1,
    minDate: '2023-01-01',
    availableSlots: mockAvailableSlots,
    onDateChange: vi.fn(),
    onTimeSelect: vi.fn(),
    onPersonCountChange: vi.fn(),
    onNotesChange: vi.fn(),
    onSubmit: vi.fn(),
    onClose: vi.fn(),
  };

  it('renders barber name in header', () => {
    render(<BookingForm {...defaultProps} />);
    expect(screen.getByText(/Randevu Oluştur - Test Barber/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<BookingForm {...defaultProps} />);
    const closeButton = screen.getAllByRole('button').find(btn => 
      btn.querySelector('svg')
    );
    fireEvent.click(closeButton!);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('renders date input with correct min date', () => {
    const { container } = render(<BookingForm {...defaultProps} />);
    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
    expect(dateInput).toBeInTheDocument();
    expect(dateInput.min).toBe('2023-01-01');
  });

  it('calls onDateChange when date is selected', () => {
    const { container } = render(<BookingForm {...defaultProps} />);
    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: '2023-01-15' } });
    expect(defaultProps.onDateChange).toHaveBeenCalledWith('2023-01-15');
  });

  it('shows time slots only when date is selected', () => {
    const { rerender } = render(<BookingForm {...defaultProps} />);
    expect(screen.queryByText(/Saat/i)).not.toBeInTheDocument();

    rerender(<BookingForm {...defaultProps} selectedDate="2023-01-15" />);
    expect(screen.getByText(/Saat/i)).toBeInTheDocument();
  });

  it('renders person count selector', () => {
    render(<BookingForm {...defaultProps} selectedDate="2023-01-15" />);
    
    // Find the label element specifically (not the description text)
    const labels = screen.getAllByText(/Kişi Sayısı/i);
    const personCountLabel = labels.find(el => el.tagName === 'LABEL');
    expect(personCountLabel).toBeInTheDocument();
    
    // Check all 4 person count buttons
    [1, 2, 3, 4].forEach(count => {
      expect(screen.getByRole('button', { name: count.toString() })).toBeInTheDocument();
    });
  });

  it('calls onPersonCountChange and clears time when person count changes', () => {
    render(<BookingForm {...defaultProps} selectedDate="2023-01-15" />);
    const button2 = screen.getByRole('button', { name: '2' });
    
    fireEvent.click(button2);
    
    expect(defaultProps.onPersonCountChange).toHaveBeenCalledWith(2);
    expect(defaultProps.onTimeSelect).toHaveBeenCalledWith('');
  });

  it('highlights selected person count', () => {
    render(<BookingForm {...defaultProps} selectedDate="2023-01-15" personCount={3} />);
    const button3 = screen.getByRole('button', { name: '3' });
    
    expect(button3).toHaveClass('bg-secondary');
  });

  it('renders available time slots', () => {
    render(<BookingForm {...defaultProps} selectedDate="2023-01-15" />);
    
    expect(screen.getByText(/09:00 - 09:30/i)).toBeInTheDocument();
    expect(screen.getByText(/09:30 - 10:00/i)).toBeInTheDocument();
  });

  it('renders booked slots as disabled', () => {
    render(<BookingForm {...defaultProps} selectedDate="2023-01-15" />);
    
    const bookedSlot = screen.getByText(/10:30 - 11:30/i).closest('button');
    expect(bookedSlot).toBeDisabled();
    expect(bookedSlot).toHaveClass('bg-red-800/40');
  });

  it('calls onTimeSelect when available slot is clicked', () => {
    render(<BookingForm {...defaultProps} selectedDate="2023-01-15" />);
    
    const slot = screen.getByText(/09:00 - 09:30/i).closest('button');
    fireEvent.click(slot!);
    
    expect(defaultProps.onTimeSelect).toHaveBeenCalledWith('09:00');
  });

  it('highlights selected time slot', () => {
    render(
      <BookingForm 
        {...defaultProps} 
        selectedDate="2023-01-15" 
        selectedTime="09:00"
      />
    );
    
    const selectedSlot = screen.getByText(/09:00 - 09:30/i).closest('button');
    expect(selectedSlot).toHaveClass('bg-secondary');
  });

  it('disables slots without consecutive availability when person count > 1', () => {
    render(
      <BookingForm 
        {...defaultProps} 
        selectedDate="2023-01-15" 
        personCount={2}
      />
    );
    
    // 09:00 and 09:30 are consecutive and available
    const consecutiveSlot = screen.getByText(/09:00 - 09:30/i).closest('button');
    expect(consecutiveSlot).not.toBeDisabled();
    
    // 11:30 doesn't have a consecutive slot after it
    const nonConsecutiveSlot = screen.getByText(/11:30 - 12:00/i).closest('button');
    expect(nonConsecutiveSlot).toBeDisabled();
  });

  it('renders notes textarea', () => {
    render(<BookingForm {...defaultProps} />);
    const textarea = screen.getByPlaceholderText(/Özel bir isteğiniz/i);
    expect(textarea).toBeInTheDocument();
  });

  it('calls onNotesChange when notes are typed', () => {
    render(<BookingForm {...defaultProps} />);
    const textarea = screen.getByPlaceholderText(/Özel bir isteğiniz/i);
    
    fireEvent.change(textarea, { target: { value: 'Test note' } });
    
    expect(defaultProps.onNotesChange).toHaveBeenCalledWith('Test note');
  });

  it('submit button is disabled when date or time is not selected', () => {
    render(<BookingForm {...defaultProps} />);
    const submitButton = screen.getByRole('button', { name: /Randevu Oluştur/i });
    
    expect(submitButton).toBeDisabled();
  });

  it('submit button is enabled when both date and time are selected', () => {
    render(
      <BookingForm 
        {...defaultProps} 
        selectedDate="2023-01-15" 
        selectedTime="09:00"
      />
    );
    const submitButton = screen.getByRole('button', { name: /Randevu Oluştur/i });
    
    expect(submitButton).not.toBeDisabled();
  });

  it('calls onSubmit when form is submitted', () => {
    render(
      <BookingForm 
        {...defaultProps} 
        selectedDate="2023-01-15" 
        selectedTime="09:00"
      />
    );
    
    const form = screen.getByRole('button', { name: /Randevu Oluştur/i }).closest('form');
    fireEvent.submit(form!);
    
    expect(defaultProps.onSubmit).toHaveBeenCalled();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<BookingForm {...defaultProps} />);
    const cancelButton = screen.getByRole('button', { name: /İptal/i });
    
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('shows message when no slots are available', () => {
    render(
      <BookingForm 
        {...defaultProps} 
        selectedDate="2023-01-15" 
        availableSlots={[]}
      />
    );
    
    expect(screen.getByText(/Bu tarihte uygun saat bulunamadı/i)).toBeInTheDocument();
  });
});
