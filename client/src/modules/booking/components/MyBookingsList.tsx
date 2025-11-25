import type { Booking } from '../../../types/booking';

interface MyBookingsListProps {
  loading: boolean;
  myBookings: Booking[];
  filteredBookings: Booking[];
  filterStatus: 'all' | 'completed' | 'pending' | 'cancelled';
  onFilterChange: (status: 'all' | 'completed' | 'pending' | 'cancelled') => void;
  onCancelBooking: (id: string) => void;
}

export default function MyBookingsList({
  loading,
  myBookings,
  filteredBookings,
  filterStatus,
  onFilterChange,
  onCancelBooking,
}: MyBookingsListProps) {
  return (
    <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Randevularım</h2>
        
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'Tümü' },
            { id: 'pending', label: 'Beklemede' },
            { id: 'completed', label: 'Tamamlanmış' },
            { id: 'cancelled', label: 'İptal Edilen' },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id as 'all' | 'completed' | 'pending' | 'cancelled')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                filterStatus === filter.id
                  ? 'bg-secondary'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400">Yükleniyor...</p>
      ) : myBookings.length === 0 ? (
        <p className="text-gray-400">Henüz randevunuz bulunmuyor.</p>
      ) : (
        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <p className="text-gray-400 text-center py-4">Bu kategoride randevu bulunamadı.</p>
          ) : (
            filteredBookings.map((b) => (
              <div
                key={b.id}
                className="bg-gray-700/50 rounded-lg p-4 flex justify-between items-center border border-gray-700 hover:border-gray-600 transition-all"
              >
                <div>
                  <h3 className="font-semibold text-white text-lg">
                    {b.barbers?.users.full_name}
                  </h3>
                  <p className="text-gray-300">
                    {new Date(b.date).toLocaleDateString('tr-TR')} - {b.start_time.substring(0, 5)} - {b.end_time.substring(0, 5)}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Durum: <span className={`font-semibold ${
                      b.status === 'confirmed' ? 'text-green-400' :
                      b.status === 'pending' ? 'text-yellow-400' :
                      b.status === 'completed' ? 'text-blue-400' :
                      'text-red-400'
                    }`}>
                      {b.status === 'pending' ? 'Beklemede' :
                       b.status === 'confirmed' ? 'Onaylandı' :
                       b.status === 'completed' ? 'Tamamlandı' :
                       'İptal Edildi'}
                    </span>
                  </p>
                  {b.note && (
                    <p className="text-sm text-gray-400 mt-1">Not: {b.note}</p>
                  )}
                </div>
                {b.status === 'pending' && (
                  <button
                    onClick={() => onCancelBooking(b.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all cursor-pointer"
                  >
                    İptal Et
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
