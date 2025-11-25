import type { Barber } from '../../../types/barber';
import { formatPhoneNumber, getBarberInitials } from '../../../shared/utils/formatters';

interface BarberListProps {
  loading: boolean;
  barbers: Barber[];
  selectedBarber: Barber | null;
  showBookingForm: boolean;
  onBarberSelect: (barber: Barber) => void;
}

export default function BarberList({
  loading,
  barbers,
  selectedBarber,
  showBookingForm,
  onBarberSelect,
}: BarberListProps) {
  return (
    <div className={`transition-all duration-500 ${showBookingForm && selectedBarber ? 'lg:col-span-4' : 'w-full'}`}>
      <div className="bg-navy rounded-xl p-4 sm:p-6 shadow-xl">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Berberler</h2>
        {loading ? (
          <p className="text-gray-400">Yükleniyor...</p>
        ) : barbers.length === 0 ? (
          <p className="text-gray-400">Aktif berber bulunamadı</p>
        ) : (
          <div className={`grid gap-4 ${showBookingForm && selectedBarber ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
            {(!showBookingForm || !selectedBarber ? barbers : barbers.filter(b => b.id === selectedBarber?.id)).map((barber) => (
              <div
                key={barber.id}
                onClick={() => onBarberSelect(barber)}
                className={`rounded-xl p-4 sm:p-6 shadow-xl cursor-pointer hover:shadow-lg transition-all flex flex-row md:flex-col items-center justify-between md:justify-center text-left md:text-center gap-4 ${
                  selectedBarber?.id === barber.id
                    ? 'bg-secondary text-white'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
              >
                {/* Info (Left on mobile, Bottom on desktop) */}
                <div className="flex flex-col order-1 md:order-2">
                  <h3 className="font-semibold text-base sm:text-lg mb-1 md:mb-2">{barber.users.full_name}</h3>
                  <p className="text-xs sm:text-sm opacity-80">{formatPhoneNumber(barber.users.phone)}</p>
                </div>

                {/* Avatar (Right on mobile, Top on desktop) */}
                <div 
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-2xl overflow-hidden order-2 md:order-1 ${
                    selectedBarber?.id === barber.id ? 'bg-white/20' : 'bg-secondary'
                  }`}
                >
                  {barber.avatar_url ? (
                    <img 
                      src={barber.avatar_url} 
                      alt={barber.users.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getBarberInitials(barber.users.full_name)
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
