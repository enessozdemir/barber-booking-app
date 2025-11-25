import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BarberList from '../BarberList';
import type { Barber } from '../../../../types/barber';

const mockBarbers: Barber[] = [
  {
    id: '1',
    active: true,
    created_at: '2023-01-01',
    users: {
      id: 'u1',
      full_name: 'Ahmet Yilmaz',
      phone: '5551234567',
      email: 'ahmet@test.com',
    },
    avatar_url: null,
  },
  {
    id: '2',
    active: true,
    created_at: '2023-01-01',
    users: {
      id: 'u2',
      full_name: 'Mehmet Demir',
      phone: '5559876543',
      email: 'mehmet@test.com',
    },
    avatar_url: 'http://example.com/avatar.jpg',
  },
];

describe('BarberList', () => {
  it('renders loading state', () => {
    render(
      <BarberList
        loading={true}
        barbers={[]}
        selectedBarber={null}
        showBookingForm={false}
        onBarberSelect={() => {}}
      />
    );
    expect(screen.getByText('Yükleniyor...')).toBeInTheDocument();
  });

  it('renders no barbers message', () => {
    render(
      <BarberList
        loading={false}
        barbers={[]}
        selectedBarber={null}
        showBookingForm={false}
        onBarberSelect={() => {}}
      />
    );
    expect(screen.getByText('Aktif berber bulunamadı')).toBeInTheDocument();
  });

  it('renders list of barbers', () => {
    render(
      <BarberList
        loading={false}
        barbers={mockBarbers}
        selectedBarber={null}
        showBookingForm={false}
        onBarberSelect={() => {}}
      />
    );
    expect(screen.getByText('Ahmet Yilmaz')).toBeInTheDocument();
    expect(screen.getByText('Mehmet Demir')).toBeInTheDocument();
  });

  it('calls onBarberSelect when a barber is clicked', () => {
    const handleSelect = vi.fn();
    render(
      <BarberList
        loading={false}
        barbers={mockBarbers}
        selectedBarber={null}
        showBookingForm={false}
        onBarberSelect={handleSelect}
      />
    );
    
    fireEvent.click(screen.getByText('Ahmet Yilmaz'));
    expect(handleSelect).toHaveBeenCalledWith(mockBarbers[0]);
  });
});
