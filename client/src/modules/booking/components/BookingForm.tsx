import React from 'react';
import type { Barber } from '../../../types/barber';
import type { BookingSlot } from '../../../types/booking';

interface BookingFormProps {
  selectedBarber: Barber;
  selectedDate: string;
  selectedTime: string;
  notes: string;
  personCount: number;
  minDate: string;
  availableSlots: BookingSlot[];
  onDateChange: (date: string) => void;
  onTimeSelect: (time: string) => void;
  onPersonCountChange: (count: number) => void;
  onNotesChange: (notes: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function BookingForm({
  selectedBarber,
  selectedDate,
  selectedTime,
  notes,
  personCount,
  minDate,
  availableSlots,
  onDateChange,
  onTimeSelect,
  onPersonCountChange,
  onNotesChange,
  onSubmit,
  onClose,
}: BookingFormProps) {
  return (
    <div className="lg:col-span-8">
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Randevu Oluştur - {selectedBarber.users.full_name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Tarih</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              min={minDate}
              onKeyDown={(e) => e.preventDefault()}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              required
            />
          </div>

          {selectedDate && (
            <div>
              <label className="block text-gray-300 mb-2">Saat</label>
              {availableSlots.length > 0 ? (
                <div className="space-y-4">
                  {/* Person Count Selector */}
                  <div className="bg-gray-700/50 p-3 sm:p-4 rounded-lg border border-gray-600">
                    <label className="block text-gray-300 mb-1 sm:mb-2 font-medium text-sm sm:text-base">Kişi Sayısı</label>
                    <div className="flex gap-2 mt-2">
                      {[1, 2, 3, 4].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => {
                            onPersonCountChange(n);
                            onTimeSelect('');
                          }}
                          className={`flex-1 px-3 py-2 rounded-lg font-semibold transition-all text-base sm:text-lg ${personCount === n ? 'bg-secondary text-white' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-400 mt-3">
                      * Seçtiğiniz kişi sayısına göre ardışık {personCount} slot otomatik rezerve edilecektir.
                    </p>
                  </div>

                  <div className="booking-grid pr-2">
                    <style>{`
                      .booking-grid {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 0.5rem; /* gap-2 */
                        --cols: 2;
                      }
                      @media (min-width: 640px) { .booking-grid { --cols: 3; } }
                      @media (min-width: 768px) { .booking-grid { --cols: 4; } }
                      
                      .booking-slot {
                        flex-grow: 1;
                        /* Formula: ((100% + gap) * span) / cols - gap */
                        width: calc( ((100% + 0.5rem) * var(--span)) / var(--cols) - 0.5rem );
                        max-width: 100%;
                      }
                    `}</style>
                    {availableSlots.map((slot, index) => {
                      // If slot is booked and not the start, don't render it (it's covered by the previous merged slot)
                      if (!slot.available && slot.isStart === false) {
                        return null;
                      }

                      const endTime = new Date(`2000-01-01T${slot.time}`);
                      const durationMinutes = !slot.available && slot.span ? slot.span * 30 : 30;
                      endTime.setMinutes(endTime.getMinutes() + durationMinutes);
                      const endTimeStr = endTime.toTimeString().slice(0, 5);
                      
                      // Check if consecutive slots are available (only for available slots)
                      let isConsecutiveAvailable = true;
                      if (slot.available && personCount > 1) {
                        for (let i = 0; i < personCount; i++) {
                          const nextSlot = availableSlots[index + i];
                          if (!nextSlot || !nextSlot.available) {
                            isConsecutiveAvailable = false;
                            break;
                          }
                        }
                      }

                      const isDisabled = !slot.available || (personCount > 1 && !isConsecutiveAvailable);
                      const span = !slot.available && slot.span ? slot.span : 1;
                      
                      // Determine if this slot or any consecutive slots are selected
                      let isSelected = false;
                      if (selectedTime) {
                        const selectedIndex = availableSlots.findIndex(s => s.time === selectedTime);
                        if (selectedIndex !== -1 && slot.available) {
                          // Check if this slot is within the selected range
                          isSelected = index >= selectedIndex && index < selectedIndex + personCount;
                        }
                      }

                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => onTimeSelect(slot.time)}
                          disabled={isDisabled}
                          className={`booking-slot px-3 py-2 rounded-lg font-semibold transition-all text-xs sm:text-sm border-2 ${
                            isSelected
                              ? 'bg-secondary text-white border-secondary'
                              : !slot.available
                              ? 'bg-red-800/40 border-red-600 text-red-300 cursor-not-allowed'
                              : isDisabled
                              ? 'bg-gray-900 border-gray-700 text-gray-600 cursor-not-allowed'
                              : 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:border-gray-600'
                          }`}
                          style={{ '--span': span } as React.CSSProperties}
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
            <label className="block text-gray-300 mb-1 sm:mb-2 text-sm sm:text-base">Not (Opsiyonel)</label>
            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              className="w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-700 text-white text-sm sm:text-base rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows={4}
              placeholder="Özel bir isteğiniz varsa buraya yazabilirsiniz..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!selectedDate || !selectedTime}
              className={`w-full py-3 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${selectedDate && selectedTime ? 'bg-secondary' : 'bg-gray-700'}`}
            >
              Randevu Oluştur
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all cursor-pointer"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
