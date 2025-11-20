import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { setBarberBookings, setLoading } from '../store/bookingSlice';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useErrorHandler } from '../../../shared/hooks/useErrorHandler';
import Header from '../../../shared/components/Header';

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

// Generate time slots (8:00 - 20:00, 30min intervals)
const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let hour = 8; hour < 20; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return slots;
};

export default function BarberDashboard() {
  const dispatch = useDispatch();
  const { handleError } = useErrorHandler();
  const user = useSelector((state: RootState) => state.auth.user);
  const bookings = useSelector((state: RootState) => state.booking.barberBookings);
  const loading = useSelector((state: RootState) => state.booking.loading);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('pending');

  useEffect(() => {
    fetchSchedule(selectedDate);
  }, [selectedDate]);

  const fetchSchedule = async (date: string) => {
    try {
      dispatch(setLoading(true));
      const res = await axios.get('/bookings/barber/schedule', { params: { date } });
      dispatch(setBarberBookings(res.data.bookings));
    } catch (err) {
      toast.error(handleError(err));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const findBookingForSlot = (time: string): Booking | undefined => {
    return bookings.find(b => {
      const slotTime = new Date(`2000-01-01T${time}`);
      const startTime = new Date(`2000-01-01T${b.start_time}`);
      const endTime = new Date(`2000-01-01T${b.end_time}`);
      return slotTime >= startTime && slotTime < endTime;
    });
  };

  const handleSlotClick = (booking: Booking | undefined) => {
    if (!booking) return;
    setSelectedBooking(booking);
    setPrice(booking.price?.toString() || '');
    setStatus(booking.status);
    setShowModal(true);
  };

  const handleUpdateBooking = async () => {
    if (!selectedBooking) return;

    try {
      // Update status
      await axios.patch(`/bookings/${selectedBooking.id}/status`, { status });
      
      // Update price if provided
      if (price && parseFloat(price) > 0) {
        await axios.patch(`/bookings/${selectedBooking.id}/price`, { price: parseFloat(price) });
      }

      toast.success('Randevu güncellendi');
      fetchSchedule(selectedDate);
      setShowModal(false);
    } catch (err) {
      toast.error(handleError(err));
    }
  };

  const allSlots = generateTimeSlots();

  return (
    <>
      <Header />
      <div className="min-h-screen p-6 pt-24 bg-dark">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
              {user?.full_name}
            </h1>
            <p className="text-sm sm:text-base text-gray-400">Günlük randevularınızı yönetin</p>
          </div>

          {/* Date Picker */}
          <div className="mb-6">
            <label className="block text-gray-300 mb-2">Tarih Seç</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              onKeyDown={(e) => e.preventDefault()}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
            />
          </div>

          {/* Time Slot Grid */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6">
              Günlük Çizelge - {new Date(selectedDate).toLocaleDateString('tr-TR')}
            </h2>

            {loading ? (
              <p className="text-gray-400">Yükleniyor...</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {(() => {
                  const renderedSlots = [];
                  for (let i = 0; i < allSlots.length; i++) {
                    const slot = allSlots[i];
                    // Find if a booking STARTS at this slot
                    const booking = bookings.find(b => b.start_time.substring(0, 5) === slot);
                    
                    if (booking) {
                      // Calculate span
                      const start = new Date(`2000-01-01T${booking.start_time}`);
                      const end = new Date(`2000-01-01T${booking.end_time}`);
                      const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
                      const span = Math.ceil(durationMinutes / 30);
                      
                      // Determine color based on status
                      let colorClass = 'bg-gray-700 cursor-not-allowed opacity-50';
                      if (booking.status === 'cancelled') {
                        colorClass = 'bg-red-900/50 border border-red-700/50 cursor-pointer';
                      } else if (booking.status === 'pending') {
                        colorClass = 'bg-yellow-900/50 border border-yellow-700/50 cursor-pointer';
                      } else if (booking.status === 'completed') {
                        colorClass = 'bg-green-900/50 border border-green-700/50 cursor-pointer';
                      }

                      renderedSlots.push(
                        <button
                          key={slot}
                          onClick={() => handleSlotClick(booking)}
                          className={`p-3 rounded-lg transition-all h-20 flex flex-col justify-center items-center text-center ${colorClass}`}
                          style={{ gridColumn: `span ${span}` }}
                        >
                          <div className="text-white font-semibold text-sm">
                            {booking.start_time.substring(0, 5)} - {booking.end_time.substring(0, 5)}
                          </div>
                          <div className="text-xs text-gray-200 truncate w-full">
                            {booking.customer?.full_name || 'Müşteri'}
                          </div>
                        </button>
                      );
                      
                      // Skip the next slots that are covered by this booking
                      i += span - 1;
                    } else {
                      // Check if this slot is "inside" another booking (shouldn't happen with skipping, but safety check)
                      // Actually, we just render an empty slot if no booking starts here
                      // But we must ensure we don't render slots that are covered by a booking starting earlier.
                      // The skipping logic (i += span - 1) handles this.
                      // However, we need to check if this slot is covered by a booking that started BEFORE the grid start (e.g. 07:30)
                      // Our grid starts at 08:00. If a booking is 07:30-09:00, we need to handle it.
                      // But our generateTimeSlots starts at 08:00 fixed.
                      // Assuming no bookings start before 08:00 for now.
                      
                      // Also check if it's inside a booking to be safe (in case of overlap errors)
                      const isInsideBooking = bookings.some(b => {
                         const s = new Date(`2000-01-01T${b.start_time}`);
                         const e = new Date(`2000-01-01T${b.end_time}`);
                         const c = new Date(`2000-01-01T${slot}`);
                         return c > s && c < e;
                      });

                      if (!isInsideBooking) {
                          const endTime = new Date(`2000-01-01T${slot}`);
                          endTime.setMinutes(endTime.getMinutes() + 30);
                          const endTimeStr = endTime.toTimeString().slice(0, 5);

                          renderedSlots.push(
                            <button
                              key={slot}
                              disabled
                              className="p-3 rounded-lg transition-all h-20 flex flex-col justify-center items-center text-center bg-gray-700 cursor-not-allowed opacity-50"
                            >
                              <div className="text-white font-semibold text-sm">
                                {slot} - {endTimeStr}
                              </div>
                            </button>
                          );
                      }
                    }
                  }
                  return renderedSlots;
                })()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Randevu Detayları</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm">Müşteri</p>
                <p className="text-white font-semibold">{selectedBooking.customer?.full_name}</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Telefon</p>
                <p className="text-white">{selectedBooking.customer?.phone}</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Saat</p>
                <p className="text-white">
                  {selectedBooking.start_time.substring(0, 5)} - {selectedBooking.end_time.substring(0, 5)}
                </p>
              </div>

              {selectedBooking.note && (
                <div>
                  <p className="text-gray-400 text-sm">Not</p>
                  <p className="text-white">{selectedBooking.note}</p>
                </div>
              )}

              <div>
                <label className="block text-gray-300 mb-2">Durum</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="pending">Beklemede</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="cancelled">İptal Edildi</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Fiyat (₺)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Fiyat girin"
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleUpdateBooking}
                className="flex-1 px-4 py-2.5 bg-secondary text-white rounded-lg font-semibold hover:opacity-90 transition-colors"
              >
                Güncelle
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
