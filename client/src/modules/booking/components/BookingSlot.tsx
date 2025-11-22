import React from 'react';

interface BookingSlotProps {
  slot: string;
  isSelected: boolean;
  isAvailable: boolean;
  onClick: (slot: string) => void;
}

const BookingSlot: React.FC<BookingSlotProps> = React.memo(({ slot, isSelected, isAvailable, onClick }) => {
  return (
    <button
      type="button"
      onClick={() => onClick(slot)}
      disabled={!isAvailable}
      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
        isSelected
          ? 'bg-secondary text-white'
          : isAvailable
          ? 'bg-gray-800 text-white hover:bg-gray-700'
          : 'bg-gray-900 text-gray-600 cursor-not-allowed'
      }`}
    >
      {slot}
    </button>
  );
});

BookingSlot.displayName = 'BookingSlot';

export default BookingSlot;
