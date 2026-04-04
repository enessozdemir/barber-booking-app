import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface WalkInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialDate?: string;
  barberId?: string | null;
}

export default function WalkInModal({ isOpen, onClose, onSuccess, initialDate, barberId }: WalkInModalProps) {
  const [price, setPrice] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const priceInputRef = useRef<HTMLInputElement>(null);

  // Update date when initialDate changes or modal opens
  useEffect(() => {
    if (isOpen && initialDate) {
      setDate(initialDate);
    }
  }, [isOpen, initialDate]);

  // Auto-focus price input when modal opens
  useEffect(() => {
    if (isOpen && priceInputRef.current) {
      // Small delay to ensure modal is fully rendered
      setTimeout(() => {
        priceInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const priceNum = parseFloat(price);
    if (!priceNum || priceNum <= 0) {
      toast.error('Geçerli bir fiyat giriniz');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/earnings/walk-in', {
        amount: Math.round(priceNum),
        date,
        note: note.trim() || undefined,
        barberId: barberId || undefined,
      });

      toast.success('Müşteri kaydedildi');
      setPrice('');
      setNote('');
      setDate(new Date().toISOString().split('T')[0]);
      onSuccess();
      onClose();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Bir hata oluştu');
      } else {
        toast.error('Bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">Müşteri Ekle</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Price Input */}
          <div>
            <label className="block text-gray-300 mb-2 font-medium">
              Fiyat (₺) <span className="text-red-500">*</span>
            </label>
            <input
              ref={priceInputRef}
              type="number"
              step={1}
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Örn: 150"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          {/* Date Input */}
          <div>
            <label className="block text-gray-300 mb-2 font-medium">Tarih</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
            />
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-gray-300 mb-2 font-medium">Not</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Örn: Saç kesimi"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              rows={3}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              disabled={loading}
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
