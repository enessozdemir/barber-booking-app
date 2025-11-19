import { useEffect, useState } from 'react';
import { useBooking } from '../hooks/useBooking';
import { useAuth } from '../../auth/hooks/useAuth';
import { toast } from 'react-toastify';
import { useErrorHandler } from '../../../shared/hooks/useErrorHandler';
import Header from '../../../shared/components/Header';

interface Barber {
  id: string;
  active: boolean;
  rating: number;
  created_at: string;
  users: {
    id: string;
    full_name: string;
    phone: string;
    email: string;
  };
}

export default function CustomerDashboard() {
  const { booking, fetchBarbers, selectBarber, fetchAvailableSlots, createBooking, fetchMyBookings, cancelBooking } = useBooking();
  const { state: authState } = useAuth();
  const { handleError } = useErrorHandler();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'book' | 'my-bookings'>('book');

  useEffect(() => {
    fetchBarbers();
    fetchMyBookings();
  }, []);

  const handleBarberSelect = (barber: Barber) => {
    selectBarber(barber);
    setShowBookingForm(true);
    setSelectedDate('');
    setSelectedTime('');
    setNotes('');
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    if (booking.selectedBarber && date) {
      fetchAvailableSlots(booking.selectedBarber.id, date);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking.selectedBarber || !selectedDate || !selectedTime) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    try {
      await createBooking(booking.selectedBarber.id, selectedDate, selectedTime, notes);
      toast.success('Randevu başarıyla oluşturuldu!');
      setShowBookingForm(false);
      selectBarber(null);
      fetchMyBookings();
    } catch (err) {
      toast.error(handleError(err));
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Randevuyu iptal etmek istediğinizden emin misiniz?')) return;
    
    try {
      await cancelBooking(bookingId);
      toast.success('Randevu iptal edildi');
      fetchMyBookings();
      // Refresh available slots if a barber and date are selected
      if (booking.selectedBarber && selectedDate) {
        fetchAvailableSlots(booking.selectedBarber.id, selectedDate);
      }
    } catch (err) {
      toast.error(handleError(err));
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Hoş geldiniz, {authState.user?.full_name}!
          </h1>
          <p className="text-gray-400">Randevu oluşturun veya mevcut randevularınızı görüntüleyin</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('book')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'book'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Randevu Al
          </button>
          <button
            onClick={() => setActiveTab('my-bookings')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'my-bookings'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Randevularım
          </button>
        </div>

        {/* Book Tab */}
        {activeTab === 'book' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Barber List */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-4">Berberler</h2>
              {booking.loading ? (
                <p className="text-gray-400">Yükleniyor...</p>
              ) : booking.barbers.length === 0 ? (
                <p className="text-gray-400">Aktif berber bulunamadı</p>
              ) : (
                <div className="space-y-3">
                  {booking.barbers.map((barber) => (
                    <div
                      key={barber.id}
                      onClick={() => handleBarberSelect(barber)}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${
                        booking.selectedBarber?.id === barber.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                      }`}
                    >
                      <h3 className="font-semibold text-lg">{barber.users.full_name}</h3>
                      <p className="text-sm opacity-80">{barber.users.phone}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Booking Form */}
            {showBookingForm && booking.selectedBarber && (
              <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Randevu Oluştur - {booking.selectedBarber.users.full_name}
                </h2>
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2">Tarih</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      min={getMinDate()}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>

                  {selectedDate && (
                    <div>
                      <label className="block text-gray-300 mb-2">Saat</label>
                      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                        {booking.availableSlots.map((slot) => {
                          // Calculate end time for display
                          const [hours, minutes] = slot.time.split(':').map(Number);
                          const totalMinutes = hours * 60 + minutes + 30;
                          const endHours = Math.floor(totalMinutes / 60);
                          const endMinutes = totalMinutes % 60;
                          const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
                          
                          return (
                            <button
                              key={slot.time}
                              type="button"
                              onClick={() => slot.available && setSelectedTime(slot.time)}
                              disabled={!slot.available}
                              className={`px-3 py-2 rounded-lg font-semibold transition-all text-sm ${
                                selectedTime === slot.time
                                  ? 'bg-blue-600 text-white'
                                  : slot.available
                                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                                  : 'bg-red-900 text-red-300 cursor-not-allowed border border-red-700'
                              }`}
                            >
                              {slot.time} - {endTime}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-gray-300 mb-2">Not (Opsiyonel)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      rows={3}
                      placeholder="Özel bir isteğiniz varsa buraya yazabilirsiniz..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={!selectedDate || !selectedTime}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-all"
                    >
                      Randevu Oluştur
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowBookingForm(false);
                        selectBarber(null);
                      }}
                      className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all"
                    >
                      İptal
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* My Bookings Tab */}
        {activeTab === 'my-bookings' && (
          <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-4">Randevularım</h2>
            {booking.loading ? (
              <p className="text-gray-400">Yükleniyor...</p>
            ) : booking.myBookings.length === 0 ? (
              <p className="text-gray-400">Henüz randevunuz yok</p>
            ) : (
              <div className="space-y-4">
                {booking.myBookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-gray-700 rounded-lg p-4 flex justify-between items-start"
                  >
                    <div>
                      <h3 className="font-semibold text-white text-lg">
                        {b.barbers?.users.full_name}
                      </h3>
                      <p className="text-gray-300">
                        {new Date(b.date).toLocaleDateString('tr-TR')} - {b.start_time} - {b.end_time}
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
                        onClick={() => handleCancelBooking(b.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                      >
                        İptal Et
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
