import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialDate?: string;
  barberId?: string | null;
}

const categories = [
  'Kira',
  'Elektrik',
  'Su',
  'İnternet',
  'Malzeme',
  'Maaş',
  'Diğer',
];

export default function ExpenseModal({ isOpen, onClose, onSuccess, initialDate, barberId }: ExpenseModalProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(initialDate || new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' }));
  const [loading, setLoading] = useState(false);

  // Update date when initialDate changes or modal opens
  useEffect(() => {
    if (isOpen && initialDate) {
      setDate(initialDate);
    }
  }, [isOpen, initialDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Lütfen geçerli bir tutar girin');
      return;
    }

    if (!category) {
      toast.error('Lütfen kategori seçin');
      return;
    }

    if (!description.trim()) {
      toast.error('Lütfen açıklama girin');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/expenses', {
        amount: parseFloat(amount),
        date,
        category,
        description,
        type: barberId ? 'personal' : 'business', // Personal for barber-specific, business otherwise
        barberId: barberId || undefined,
      });

      setAmount('');
      setCategory('');
      setDescription('');
      setDate(new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' }));
      onSuccess();
      onClose();
    } catch (error: unknown) {
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
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Gider Ekle</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Input */}
          <div>
            <label className="block text-gray-300 mb-2 font-medium">
              Tutar (₺) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          {/* Category Select */}
          <div>
            <label className="block text-gray-300 mb-2 font-medium">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              required
            >
              <option value="">Seçiniz</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-gray-300 mb-2 font-medium">
              Açıklama <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Gider detayı"
              rows={3}
              required
            />
          </div>

          {/* Type Radio - Removed as per request, using prop passed from parent */}
          {/* <div>
            <label className="block text-gray-300 mb-2 font-medium">Tür</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="business"
                  checked={type === 'business'}
                  onChange={(e) => setType(e.target.value as 'business')}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                />
                <span className="text-white">İşletme</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="personal"
                  checked={type === 'personal'}
                  onChange={(e) => setType(e.target.value as 'personal')}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                />
                <span className="text-white">Kişisel</span>
              </label>
            </div>
          </div> */}

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
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
