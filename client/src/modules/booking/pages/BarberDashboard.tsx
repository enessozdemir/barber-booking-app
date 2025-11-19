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

export default function BarberDashboard() {
  const dispatch = useDispatch();
  const { handleError } = useErrorHandler();
  const user = useSelector((state: RootState) => state.auth.user);
  const bookings = useSelector((state: RootState) => state.booking.barberBookings);
  const loading = useSelector((state: RootState) => state.booking.loading);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);

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

  const updateStatus = async (bookingId: string, status: string) => {
    try {
      await axios.patch(`/bookings/${bookingId}/status`, { status });
      toast.success('Durum güncellendi');
      fetchSchedule(selectedDate);
      setShowModal(false);
    } catch (err) {
      toast.error(handleError(err));
    }
  };

  const updatePrice = async (bookingId: string, price: number) => {
    try {
      await axios.patch(`/bookings/${bookingId}/price`, { price });
      toast.success('Fiyat güncellendi');
      fetchSchedule(selectedDate);
    } catch (err) {
      toast.error(handleError(err));
    }
  };

  const deleteBooking = async (bookingId: string) => {
    if (!confirm('Randevuyu silmek istediğinizden emin misiniz?')) return;
    
    try {
      await axios.delete(`/bookings/${bookingId}`);
      toast.success('Randevu silindi');
      fetchSchedule(selectedDate);
      setShowModal(false);
    } catch (err) {
      toast.error(handleError(err));
    }
  };

  const openBookingModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Berber Paneli - {user?.full_name}
          </h1>
          <p className="text-gray-400">Günlük randevularınızı yönetin</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 shadow-xl mb-6">
          <label className="block text-gray-300 mb-2 font-semibold">Tarih Seçin</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-4">
            Günlük Çizelge - {new Date(selectedDate).toLocaleDateString('tr-TR')}
          </h2>
          
          {loading ? (
            <p className="text-gray-400">Yükleniyor...</p>
          ) : bookings.length === 0 ? (
            <p className="text-gray-400">Bu tarihte randevu yok</p>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  onClick={() => openBookingModal(booking)}
                  className="bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-white text-lg">
                        {booking.customer?.full_name}
                      </h3>
                      <p className="text-gray-300">{booking.start_time} - {booking.end_time}</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Durum: <span className={`font-semibold ${
                          booking.status === 'confirmed' ? 'text-green-400' :
                          booking.status === 'pending' ? 'text-yellow-400' :
                          booking.status === 'completed' ? 'text-blue-400' :
                          'text-red-400'
                        }`}>
                          {booking.status === 'pending' ? 'Beklemede' :
                           booking.status === 'confirmed' ? 'Onaylandı' :
                           booking.status === 'completed' ? 'Tamamlandı' :
                           'İptal Edildi'}
                        </span>
                      </p>
                      {booking.price && (
                        <p className="text-sm text-green-400 mt-1">Fiyat: ₺{booking.price}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-4">Randevu Detayları</h2>
              
              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-gray-400 text-sm">Müşteri</p>
                  <p className="text-white font-semibold">{selectedBooking.customer?.full_name}</p>
                  <p className="text-gray-300 text-sm">{selectedBooking.customer?.phone}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm">Tarih & Saat</p>
                  <p className="text-white font-semibold">
                    {new Date(selectedBooking.date).toLocaleDateString('tr-TR')} - {selectedBooking.start_time} - {selectedBooking.end_time}
                  </p>
                </div>
                
                {selectedBooking.note && (
                  <div>
                    <p className="text-gray-400 text-sm">Not</p>
                    <p className="text-white">{selectedBooking.note}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-gray-400 text-sm mb-2">Durum</p>
                  <select
                    value={selectedBooking.status}
                    onChange={(e) => updateStatus(selectedBooking.id, e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="pending">Beklemede</option>
                    <option value="confirmed">Onaylandı</option>
                    <option value="completed">Tamamlandı</option>
                    <option value="cancelled">İptal Edildi</option>
                  </select>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm mb-2">Fiyat (₺)</p>
                  <input
                    type="number"
                    defaultValue={selectedBooking.price || ''}
                    onBlur={(e) => {
                      const price = parseFloat(e.target.value);
                      if (price && price !== selectedBooking.price) {
                        updatePrice(selectedBooking.id, price);
                      }
                    }}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Fiyat girin"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => deleteBooking(selectedBooking.id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                >
                  Sil
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
