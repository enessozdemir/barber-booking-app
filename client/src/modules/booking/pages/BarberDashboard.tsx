import BarberLayout from '../../../components/layout/BarberLayout';
import ConfirmModal from '../../../shared/components/ConfirmModal';
import ScheduleSlot from '../components/ScheduleSlot';
import { useBarberDashboard } from '../hooks/useBarberDashboard';
import WalkInModal from '../../financial/components/WalkInModal';
import ExpenseModal from '../../financial/components/ExpenseModal';
import DatePicker from '../../../shared/components/DatePicker';
import { useState } from 'react';


export default function BarberDashboard() {
  const {
    user,
    bookings,
    loading,
    selectedDate,
    selectedBooking,
    showModal,
    price,
    status,
    confirmModal,
    allSlots,
    setSelectedDate,
    setPrice,
    setStatus,
    handleSlotClick,
    handleDeleteBooking,
    handleUpdateBooking,
    closeModal,
    openDeleteConfirm,
    closeDeleteConfirm,
    fetchSchedule,
  } = useBarberDashboard();

  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  return (
    <BarberLayout>
      <div className="min-h-screen p-6 bg-dark">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
              {user?.full_name}
            </h1>
            <p className="text-sm sm:text-base text-gray-400">Günlük randevularınızı yönetin</p>
          </div>

          {/* Date Picker & Walk-In Button */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1">
              <label className="block text-gray-300 mb-2">Tarih Seç</label>
              <DatePicker value={selectedDate} onChange={setSelectedDate} className="w-full" />
            </div>
            <button
              onClick={() => setShowWalkInModal(true)}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
            >
              + Müşteri Ekle
            </button>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
            >
              + Gider Ekle
            </button>
          </div>

          {/* Time Slot Grid */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6">
              Günlük Çizelge - {new Date(selectedDate).toLocaleDateString('tr-TR')}
            </h2>

            {loading ? (
              <p className="text-gray-400">Yükleniyor...</p>
            ) : (
              <div className="booking-grid">
                <style>{`
                  .booking-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.75rem; /* gap-3 */
                    --cols: 2;
                  }
                  @media (min-width: 640px) { .booking-grid { --cols: 3; } }
                  @media (min-width: 768px) { .booking-grid { --cols: 4; } }
                  @media (min-width: 1024px) { .booking-grid { --cols: 6; } }
                  
                  .booking-slot {
                    flex-grow: 1;
                    /* Formula: ((100% + gap) * span) / cols - gap */
                    width: calc( ((100% + 0.75rem) * var(--span)) / var(--cols) - 0.75rem );
                    max-width: 100%;
                  }
                `}</style>
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
                      
                      renderedSlots.push(
                        <ScheduleSlot
                          key={slot}
                          booking={booking}
                          slot={slot}
                          span={span}
                          onClick={handleSlotClick}
                        />
                      );
                      
                      // Skip the next slots that are covered by this booking
                      i += span - 1;
                    } else {
                      // Check if this slot is "inside" another booking
                      const isInsideBooking = bookings.some(b => {
                         const s = new Date(`2000-01-01T${b.start_time}`);
                         const e = new Date(`2000-01-01T${b.end_time}`);
                         const c = new Date(`2000-01-01T${slot}`);
                         return c > s && c < e;
                      });

                      if (!isInsideBooking) {
                        renderedSlots.push(
                          <ScheduleSlot
                            key={slot}
                            slot={slot}
                            span={1}
                            onClick={handleSlotClick}
                          />
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
                <label className="block text-gray-300 mb-2">
                  Fiyat (₺) {status === 'completed' && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="number"
                  step={1}
                  min={1}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={status === 'completed' ? "Fiyat girin" : "Sadece tamamlanan randevular için"}
                  disabled={status !== 'completed'}
                  className={`w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-opacity ${
                    status !== 'completed' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
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
            
            <div className="mt-4 pt-4 border-t border-gray-700">
              {selectedBooking.status !== 'completed' && (
                <button
                  onClick={() => openDeleteConfirm(selectedBooking.id)}
                  className="w-full px-4 py-2.5 bg-red-900/50 text-red-200 border border-red-900/50 rounded-lg font-semibold hover:bg-red-900/70 transition-colors"
                >
                  Randevuyu Sil
                </button>
              )}
              {selectedBooking.status === 'completed' && (
                <p className="text-center text-gray-500 text-sm">
                  Tamamlanan randevular silinemez.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Randevuyu Sil"
        message="Bu randevuyu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmText="Sil"
        cancelText="Vazgeç"
        type="danger"
        onConfirm={handleDeleteBooking}
        onCancel={closeDeleteConfirm}
      />

      {/* Walk-In Modal */}
      <WalkInModal
        isOpen={showWalkInModal}
        onClose={() => setShowWalkInModal(false)}
        onSuccess={() => fetchSchedule(selectedDate)}
        initialDate={selectedDate}
      />

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onSuccess={() => {}} // No need to refresh schedule for expenses
        initialDate={selectedDate}
      />
    </BarberLayout>
  );
}
