import { useEffect, useState } from 'react';
import { useBooking } from '../hooks/useBooking';
import { useAuth } from '../../auth/hooks/useAuth';
import { toast } from 'react-toastify';
import { useErrorHandler } from '../../../shared/hooks/useErrorHandler';
import Header from '../../../shared/components/Header';
import ConfirmModal from '../../../shared/components/ConfirmModal';

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
}

export default function CustomerDashboard() {
  const { booking, fetchBarbers, selectBarber, fetchAvailableSlots, createBooking, fetchMyBookings, cancelBooking } = useBooking();
  const { state: authState } = useAuth();
  const { handleError } = useErrorHandler();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [personCount, setPersonCount] = useState(1);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'book' | 'my-bookings'>('book');
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    bookingId: string | null;
  }>({ isOpen: false, bookingId: null });

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
    setSelectedTime(''); // Reset time when date changes
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

    const duration = personCount * 30; // Each person = 30 minutes

    try {
      await createBooking(booking.selectedBarber.id, selectedDate, selectedTime, notes, duration);
      toast.success('Randevu başarıyla oluşturuldu!');
      setShowBookingForm(false);
      selectBarber(null);
      setPersonCount(1);
      fetchMyBookings();
    } catch (err) {
      toast.error(handleError(err));
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    setConfirmModal({ isOpen: true, bookingId });
  };

  const confirmCancelBooking = async () => {
    if (!confirmModal.bookingId) return;
    
    try {
      await cancelBooking(confirmModal.bookingId);
      toast.success('Randevu iptal edildi');
      await fetchMyBookings();
      
      // Refresh available slots if a barber and date are selected
      if (booking.selectedBarber && selectedDate) {
        await fetchAvailableSlots(booking.selectedBarber.id, selectedDate);
      }
    } catch (err) {
      toast.error(handleError(err));
    } finally {
      setConfirmModal({ isOpen: false, bookingId: null });
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format as +90 XXX XXX XX XX
    if (cleaned.length === 11 && cleaned.startsWith('0')) {
      // Remove leading 0 and add +90
      const withoutZero = cleaned.substring(1);
      return `+90 ${withoutZero.substring(0, 3)} ${withoutZero.substring(3, 6)} ${withoutZero.substring(6, 8)} ${withoutZero.substring(8, 10)}`;
    } else if (cleaned.length === 10) {
      // Already without leading 0
      return `+90 ${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6, 8)} ${cleaned.substring(8, 10)}`;
    }
    // Return as is if format is unexpected
    return phone;
  };

  const getBarberInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <Header />
      <div className="min-h-screen p-6 pt-24 bg-dark">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
            Hoş geldiniz, {authState.user?.full_name}!
          </h1>
          <p className="text-sm sm:text-base text-gray-400">Randevu oluşturun veya mevcut randevularınızı görüntüleyin</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('book')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all text-white cursor-pointer ${
              activeTab === 'book'
                ? 'bg-secondary shadow-lg'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Randevu Al
          </button>
          <button
            onClick={() => setActiveTab('my-bookings')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all text-white cursor-pointer ${
              activeTab === 'my-bookings'
                ? 'bg-secondary shadow-lg'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Randevularım
          </button>
        </div>

        {/* Book Tab */}
        {activeTab === 'book' && (
          <div className={`transition-all duration-500 ${showBookingForm && booking.selectedBarber ? 'grid grid-cols-1 lg:grid-cols-12 gap-6' : ''}`}>
            {/* Barber List */}
            <div className={`transition-all duration-500 ${showBookingForm && booking.selectedBarber ? 'lg:col-span-4' : 'w-full'}`}>
              <div className="bg-navy rounded-xl p-6 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-6">Berberler</h2>
                {booking.loading ? (
                  <p className="text-gray-400">Yükleniyor...</p>
                ) : booking.barbers.length === 0 ? (
                  <p className="text-gray-400">Aktif berber bulunamadı</p>
                ) : (
                  <div className={`grid gap-4 ${showBookingForm && booking.selectedBarber ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                    {(!showBookingForm || !booking.selectedBarber ? booking.barbers : booking.barbers.filter(b => b.id === booking.selectedBarber?.id)).map((barber) => (
                      <div
                        key={barber.id}
                        onClick={() => handleBarberSelect(barber)}
                        className={`rounded-xl p-6 shadow-xl cursor-pointer hover:shadow-lg transition-all flex flex-col items-center text-center ${
                          booking.selectedBarber?.id === barber.id
                            ? 'bg-secondary text-white'
                            : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                        }`}
                      >
                        {/* Avatar */}
                        <div 
                          className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4 overflow-hidden ${
                            booking.selectedBarber?.id === barber.id ? 'bg-white/20' : 'bg-secondary'
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
                        
                        {/* Name */}
                        <h3 className="font-semibold text-lg mb-2">{barber.users.full_name}</h3>
                        
                        {/* Phone */}
                        <p className="text-sm opacity-80">{formatPhoneNumber(barber.users.phone)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Booking Form */}
            {showBookingForm && booking.selectedBarber && (
              <div className="lg:col-span-8">
                <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">
                      Randevu Oluştur - {booking.selectedBarber.users.full_name}
                    </h2>
                    <button
                      onClick={() => {
                        setShowBookingForm(false);
                        selectBarber(null);
                      }}
                      className="text-gray-400 hover:text-white transition-all"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    <div>
                      <label className="block text-gray-300 mb-2">Tarih</label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => handleDateChange(e.target.value)}
                        min={getMinDate()}
                        onKeyDown={(e) => e.preventDefault()}
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                        required
                      />
                    </div>

                    {selectedDate && (
                      <div>
                        <label className="block text-gray-300 mb-2">Saat</label>
                        {booking.availableSlots.length > 0 ? (
                <div className="space-y-4">
                  {/* Person Count Selector */}
                  <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                    <label className="block text-gray-300 mb-2 font-medium">Kişi Sayısı / Süre</label>
                    <select
                      value={personCount}
                      onChange={(e) => {
                        setPersonCount(parseInt(e.target.value));
                        setSelectedTime(''); // Reset time when person count changes
                      }}
                      className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-secondary outline-none border border-gray-600"
                    >
                      <option value="1">1 Kişi (30 dk)</option>
                      <option value="2">2 Kişi (1 saat)</option>
                      <option value="3">3 Kişi (1.5 saat)</option>
                      <option value="4">4 Kişi (2 saat)</option>
                      <option value="5">5 Kişi (2.5 saat)</option>
                    </select>
                    <p className="text-xs text-gray-400 mt-2">
                      * Seçtiğiniz kişi sayısına göre ardışık {personCount} slot otomatik rezerve edilecektir.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                    {booking.availableSlots.map((slot, index) => {
                      // If slot is booked and not the start, don't render it (it's covered by the previous merged slot)
                      if (!slot.available && slot.isStart === false) {
                        return null;
                      }

                      const endTime = new Date(`2000-01-01T${slot.time}`);
                      // If booked, use span to calculate end time. If available, use personCount * 30
                      const durationMinutes = !slot.available && slot.span ? slot.span * 30 : 30;
                      endTime.setMinutes(endTime.getMinutes() + durationMinutes);
                      const endTimeStr = endTime.toTimeString().slice(0, 5);
                      
                      // Check if consecutive slots are available (only for available slots)
                      let isConsecutiveAvailable = true;
                      if (slot.available && personCount > 1) {
                        for (let i = 0; i < personCount; i++) {
                          const nextSlot = booking.availableSlots[index + i];
                          if (!nextSlot || !nextSlot.available) {
                            isConsecutiveAvailable = false;
                            break;
                          }
                        }
                      }

                      // Determine color based on status
                      let colorClass = '';
                      
                      // Selection Logic: Check if this slot is within the selected range
                      let isSelected = false;
                      if (selectedTime && slot.available) {
                         const selectedStart = new Date(`2000-01-01T${selectedTime}`);
                         const selectedEnd = new Date(selectedStart);
                         selectedEnd.setMinutes(selectedEnd.getMinutes() + (personCount * 30));
                         
                         const currentSlotTime = new Date(`2000-01-01T${slot.time}`);
                         
                         // Highlight if it's the selected start time OR if it falls within the selected range
                         if (currentSlotTime >= selectedStart && currentSlotTime < selectedEnd) {
                             isSelected = true;
                         }
                      }

                      if (isSelected) {
                        colorClass = 'bg-secondary';
                      } else if (slot.available && isConsecutiveAvailable) {
                        colorClass = 'bg-gray-700 hover:bg-gray-600';
                      } else if (slot.available && !isConsecutiveAvailable) {
                        colorClass = 'bg-gray-700/50 cursor-not-allowed opacity-50'; // Available but not enough consecutive slots
                      } else {
                        // Slot is booked - check status
                        if (slot.status === 'completed') {
                          colorClass = 'bg-green-900/50 border border-green-700/50 cursor-not-allowed';
                        } else {
                          colorClass = 'bg-red-900/50 border border-red-700/50 cursor-not-allowed';
                        }
                      }

                      return (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => {
                            if (slot.available && isConsecutiveAvailable) {
                              setSelectedTime(slot.time);
                            }
                          }}
                          disabled={!slot.available || (slot.available && !isConsecutiveAvailable)}
                          className={`px-2 sm:px-4 py-2 text-white rounded-lg transition-all flex flex-col justify-center items-center text-center h-12 ${colorClass}`}
                          style={!slot.available && slot.span ? { gridColumn: `span ${slot.span}` } : {}}
                        >
                          <span className="font-semibold text-xs sm:text-sm truncate w-full">{slot.time} - {endTimeStr}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">Bu tarihte uygun saat bulunamadı.</p>
              )}
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
                        className={`w-full py-3 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                          selectedDate && selectedTime ? 'bg-secondary' : 'bg-gray-700'
                        }`}
                      >
                        Randevu Oluştur
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowBookingForm(false);
                          selectBarber(null);
                        }}
                        className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all cursor-pointer"
                      >
                        İptal
                      </button>
                    </div>
                  </form>
                </div>
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
            ) : booking.myBookings.filter(b => b.status !== 'cancelled').length === 0 ? (
              <p className="text-gray-400">Henüz randevunuz yok</p>
            ) : (
              <div className="space-y-4">
                {booking.myBookings.filter(b => b.status !== 'cancelled').map((b) => (
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
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all cursor-pointer"
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

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Randevu İptali"
        message="Randevuyu iptal etmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmText="İptal Et"
        cancelText="Vazgeç"
        type="danger"
        onConfirm={confirmCancelBooking}
        onCancel={() => setConfirmModal({ isOpen: false, bookingId: null })}
      />
    </>
  );
}
