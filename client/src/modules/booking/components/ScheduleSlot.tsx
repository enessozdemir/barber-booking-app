import React from 'react';

interface Booking {
  id: string;
  customer_id: string;
  barber_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  note?: string;
  price?: number;
  created_at: string;
  customer?: {
    full_name: string;
    phone: string;
  };
}

interface ScheduleSlotProps {
  booking?: Booking;
  slot: string;
  span: number;
  onClick: (booking: Booking | undefined) => void;
}

const ScheduleSlot: React.FC<ScheduleSlotProps> = React.memo(({ booking, slot, span, onClick }) => {
  if (booking) {
    // Determine color based on status - matching CustomerDashboard colors
    let colorClass = 'bg-gray-700 border-2 border-gray-600 cursor-not-allowed opacity-50';
    if (booking.status === 'cancelled' || booking.status === 'rejected') {
      colorClass = 'bg-red-800/40 border-2 border-red-600 text-red-300 cursor-pointer';
    } else if (booking.status === 'pending') {
      colorClass = 'bg-yellow-800/40 border-2 border-yellow-600 text-yellow-300 cursor-pointer';
    } else if (booking.status === 'completed') {
      colorClass = 'bg-green-800/40 border-2 border-green-600 text-green-300 cursor-pointer';
    }

    return (
      <button
        onClick={() => onClick(booking)}
        className={`booking-slot p-3 rounded-lg transition-all h-20 flex flex-col justify-center items-center text-center ${colorClass}`}
        style={{ '--span': span } as React.CSSProperties}
      >
        <div className="text-white font-semibold text-sm">
          {booking.start_time.substring(0, 5)} - {booking.end_time.substring(0, 5)}
        </div>
        <div className="text-xs text-gray-200 truncate w-full">
          {booking.customer?.full_name || 'Müşteri'}
        </div>
      </button>
    );
  }

  // Empty slot
  const endTime = new Date(`2000-01-01T${slot}`);
  endTime.setMinutes(endTime.getMinutes() + 30);
  const endTimeStr = endTime.toTimeString().slice(0, 5);

  return (
    <button
      disabled
      className="booking-slot p-3 rounded-lg transition-all h-20 flex flex-col justify-center items-center text-center bg-gray-700 border-2 border-gray-600 cursor-not-allowed opacity-50"
      style={{ '--span': 1 } as React.CSSProperties}
    >
      <div className="text-white font-semibold text-sm">
        {slot} - {endTimeStr}
      </div>
    </button>
  );
});

ScheduleSlot.displayName = 'ScheduleSlot';

export default ScheduleSlot;
