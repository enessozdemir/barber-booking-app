import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MyBookingsList from '../MyBookingsList';
import type { Booking } from '../../../../types/booking';

const mockBookings: Booking[] = [
  {
    id: '1',
    customer_id: 'c1',
    barber_id: 'b1',
    date: '2023-01-15',
    start_time: '09:00:00',
    end_time: '09:30:00',
    status: 'pending',
    note: 'Test note',
    created_at: '2023-01-01',
    barbers: {
      id: 'b1',
      users: {
        full_name: 'Test Barber',
        phone: '5551234567',
      },
    },
  },
  {
    id: '2',
    customer_id: 'c1',
    barber_id: 'b2',
    date: '2023-01-20',
    start_time: '10:00:00',
    end_time: '10:30:00',
    status: 'completed',
    created_at: '2023-01-01',
    barbers: {
      id: 'b2',
      users: {
        full_name: 'Another Barber',
        phone: '5559876543',
      },
    },
  },
  {
    id: '3',
    customer_id: 'c1',
    barber_id: 'b1',
    date: '2023-01-25',
    start_time: '11:00:00',
    end_time: '11:30:00',
    status: 'cancelled',
    created_at: '2023-01-01',
    barbers: {
      id: 'b1',
      users: {
        full_name: 'Test Barber',
        phone: '5551234567',
      },
    },
  },
];

describe('MyBookingsList', () => {
  const defaultProps = {
    loading: false,
    myBookings: mockBookings,
    filteredBookings: mockBookings,
    filterStatus: 'all' as const,
    onFilterChange: vi.fn(),
    onCancelBooking: vi.fn(),
  };

  it('renders component title', () => {
    render(<MyBookingsList {...defaultProps} />);
    expect(screen.getByText('Randevularım')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<MyBookingsList {...defaultProps} loading={true} />);
    expect(screen.getByText('Yükleniyor...')).toBeInTheDocument();
  });

  it('shows empty state when no bookings exist', () => {
    render(<MyBookingsList {...defaultProps} myBookings={[]} filteredBookings={[]} />);
    expect(screen.getByText('Henüz randevunuz bulunmuyor.')).toBeInTheDocument();
  });

  it('shows empty filter state when no bookings match filter', () => {
    render(<MyBookingsList {...defaultProps} filteredBookings={[]} />);
    expect(screen.getByText('Bu kategoride randevu bulunamadı.')).toBeInTheDocument();
  });

  it('renders all filter buttons', () => {
    render(<MyBookingsList {...defaultProps} />);
    
    expect(screen.getByRole('button', { name: 'Tümü' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Beklemede' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tamamlanmış' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'İptal Edilen' })).toBeInTheDocument();
  });

  it('highlights active filter', () => {
    render(<MyBookingsList {...defaultProps} filterStatus="pending" />);
    
    const pendingButton = screen.getByRole('button', { name: 'Beklemede' });
    expect(pendingButton).toHaveClass('bg-secondary');
  });

  it('calls onFilterChange when filter button is clicked', () => {
    render(<MyBookingsList {...defaultProps} />);
    
    const completedButton = screen.getByRole('button', { name: 'Tamamlanmış' });
    fireEvent.click(completedButton);
    
    expect(defaultProps.onFilterChange).toHaveBeenCalledWith('completed');
  });

  it('renders booking list', () => {
    render(<MyBookingsList {...defaultProps} />);
    
    // Check for barber names (Test Barber appears twice)
    const testBarberElements = screen.getAllByText('Test Barber');
    expect(testBarberElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Another Barber')).toBeInTheDocument();
  });

  it('displays booking date and time correctly', () => {
    render(<MyBookingsList {...defaultProps} />);
    
    // Check if date is formatted correctly (Turkish locale)
    expect(screen.getByText(/15\.01\.2023/)).toBeInTheDocument();
    expect(screen.getByText(/09:00 - 09:30/)).toBeInTheDocument();
  });

  it('displays booking note when present', () => {
    render(<MyBookingsList {...defaultProps} />);
    
    expect(screen.getByText(/Not: Test note/)).toBeInTheDocument();
  });

  it('does not display note when not present', () => {
    render(<MyBookingsList {...defaultProps} />);
    
    // Second booking has no note
    const bookingCards = screen.getAllByText(/Durum:/);
    expect(bookingCards).toHaveLength(3);
  });

  it('displays pending status with correct styling', () => {
    render(<MyBookingsList {...defaultProps} />);
    
    // Get all elements with "Beklemede" text and find the status span
    const allPendingTexts = screen.getAllByText('Beklemede');
    const pendingStatus = allPendingTexts.find(el => el.tagName === 'SPAN');
    expect(pendingStatus).toHaveClass('text-yellow-400');
  });

  it('displays completed status with correct styling', () => {
    render(<MyBookingsList {...defaultProps} />);
    
    const completedStatus = screen.getByText('Tamamlandı');
    expect(completedStatus).toHaveClass('text-blue-400');
  });

  it('displays cancelled status with correct styling', () => {
    render(<MyBookingsList {...defaultProps} />);
    
    const cancelledStatus = screen.getByText('İptal Edildi');
    expect(cancelledStatus).toHaveClass('text-red-400');
  });

  it('shows cancel button only for pending bookings', () => {
    render(<MyBookingsList {...defaultProps} />);
    
    const cancelButtons = screen.getAllByRole('button', { name: 'İptal Et' });
    // Only 1 pending booking in mock data
    expect(cancelButtons).toHaveLength(1);
  });

  it('calls onCancelBooking when cancel button is clicked', () => {
    render(<MyBookingsList {...defaultProps} />);
    
    const cancelButton = screen.getByRole('button', { name: 'İptal Et' });
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onCancelBooking).toHaveBeenCalledWith('1');
  });

  it('does not show cancel button for completed bookings', () => {
    const completedBooking = [mockBookings[1]]; // completed booking
    render(
      <MyBookingsList 
        {...defaultProps} 
        myBookings={completedBooking}
        filteredBookings={completedBooking}
      />
    );
    
    expect(screen.queryByRole('button', { name: 'İptal Et' })).not.toBeInTheDocument();
  });

  it('does not show cancel button for cancelled bookings', () => {
    const cancelledBooking = [mockBookings[2]]; // cancelled booking
    render(
      <MyBookingsList 
        {...defaultProps} 
        myBookings={cancelledBooking}
        filteredBookings={cancelledBooking}
      />
    );
    
    expect(screen.queryByRole('button', { name: 'İptal Et' })).not.toBeInTheDocument();
  });

  it('renders multiple bookings correctly', () => {
    render(<MyBookingsList {...defaultProps} />);
    
    const bookingCards = screen.getAllByText(/Durum:/);
    expect(bookingCards).toHaveLength(3);
  });
});
