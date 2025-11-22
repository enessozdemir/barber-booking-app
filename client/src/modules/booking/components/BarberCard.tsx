import React from 'react';
import { getBarberInitials } from '../../../shared/utils/formatters';

interface Barber {
  id: string;
  active: boolean;
  created_at: string;
  users: {
    id: string;
    full_name: string;
    phone: string;
    email: string;
  };
  avatar_url?: string;
}

interface BarberCardProps {
  barber: Barber;
  isSelected: boolean;
  onSelect: (barber: Barber) => void;
}

const BarberCard: React.FC<BarberCardProps> = React.memo(({ barber, isSelected, onSelect }) => {
  return (
    <button
      onClick={() => onSelect(barber)}
      className={`p-4 rounded-xl border-2 transition-all text-left ${
        isSelected
          ? 'border-secondary bg-secondary/10'
          : 'border-gray-700 bg-gray-800 hover:border-gray-600'
      }`}
    >
      <div className="flex items-center gap-3">
        {barber.avatar_url ? (
          <img
            src={barber.avatar_url}
            alt={barber.users.full_name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-white font-bold">
            {getBarberInitials(barber.users.full_name)}
          </div>
        )}
        <div>
          <p className="font-semibold text-white">{barber.users.full_name}</p>
          <p className="text-sm text-gray-400">{barber.users.phone}</p>
        </div>
      </div>
    </button>
  );
});

BarberCard.displayName = 'BarberCard';

export default BarberCard;
