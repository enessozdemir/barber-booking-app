import Header from '../../../shared/components/Header';
import ConfirmModal from '../../../shared/components/ConfirmModal';
import { useCustomerDashboard } from '../hooks/useCustomerDashboard';
import BarberList from '../components/BarberList';
import BookingForm from '../components/BookingForm';
import MyBookingsList from '../components/MyBookingsList';

export default function CustomerDashboard() {
  const {
    booking,
    authState,
    selectedDate,
    selectedTime,
    notes,
    personCount,
    showBookingForm,
    activeTab,
    confirmModal,
    filterStatus,
    filteredBookings,
    minDate,
    setSelectedTime,
    setNotes,
    setPersonCount,
    setActiveTab,
    setConfirmModal,
    setFilterStatus,
    handleBarberSelect,
    handleDateChange,
    handleBookingSubmit,
    handleCancelBooking,
    confirmCancelBooking,
    closeBookingForm,
  } = useCustomerDashboard();

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
          <div className="grid grid-cols-2 sm:flex sm:justify-start gap-3 mb-6 sm:mb-8">
            <button
              onClick={() => setActiveTab('book')}
              className={`px-4 sm:px-6 py-3 rounded-lg font-semibold transition-all text-white cursor-pointer text-sm sm:text-base sm:w-auto ${
                activeTab === 'book'
                  ? 'bg-secondary shadow-lg'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Randevu Al
            </button>
            <button
              onClick={() => setActiveTab('my-bookings')}
              className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold transition-all text-white cursor-pointer text-sm sm:text-base sm:w-auto ${
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
              <BarberList
                loading={booking.loading}
                barbers={booking.barbers}
                selectedBarber={booking.selectedBarber}
                showBookingForm={showBookingForm}
                onBarberSelect={handleBarberSelect}
              />

              {/* Booking Form */}
              {showBookingForm && booking.selectedBarber && (
                <BookingForm
                  selectedBarber={booking.selectedBarber}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  notes={notes}
                  personCount={personCount}
                  minDate={minDate}
                  availableSlots={booking.availableSlots}
                  onDateChange={handleDateChange}
                  onTimeSelect={setSelectedTime}
                  onPersonCountChange={setPersonCount}
                  onNotesChange={setNotes}
                  onSubmit={handleBookingSubmit}
                  onClose={closeBookingForm}
                />
              )}
            </div>
          )}

          {/* My Bookings Tab */}
          {activeTab === 'my-bookings' && (
            <MyBookingsList
              loading={booking.loading}
              myBookings={booking.myBookings}
              filteredBookings={filteredBookings}
              filterStatus={filterStatus}
              onFilterChange={setFilterStatus}
              onCancelBooking={handleCancelBooking}
            />
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
