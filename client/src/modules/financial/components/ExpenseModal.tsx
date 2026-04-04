import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialDate?: string;
  barberId?: string | null;
}

interface Barber {
  id: string;
  users: {
    full_name: string;
  };
}

const categories = [
  'Yemek',
  'Kira',
  'Fatura',
  'İnternet',
  'Malzeme',
  'Avans',
  'Diğer',
];

export default function ExpenseModal({ isOpen, onClose, onSuccess, initialDate, barberId }: ExpenseModalProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(initialDate || new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' }));
  const [loading, setLoading] = useState(false);
  const [selectedBarberId, setSelectedBarberId] = useState<string>('');
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const amountInputRef = useRef<HTMLInputElement>(null);

  // Update date when initialDate changes or modal opens
  useEffect(() => {
    if (isOpen && initialDate) {
      setDate(initialDate);
    }
  }, [isOpen, initialDate]);

  // Auto-focus amount input when modal opens
  useEffect(() => {
    if (isOpen && amountInputRef.current) {
      // Small delay to ensure modal is fully rendered
      setTimeout(() => {
        amountInputRef.current?.focus();
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

  // Fetch barbers list for advance payments
  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        const response = await axios.get('/barbers');
        setBarbers(response.data.barbers || []);
      } catch (error) {
        console.error('Failed to fetch barbers:', error);
      }
    };

    if (isOpen) {
      fetchBarbers();
    }
  }, [isOpen]);

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

    // For advance payments, require barber selection
    if (category === 'Avans') {
      if (!selectedBarberId) {
        toast.error('Lütfen berber seçin');
        return;
      }
    } else {
      // For other categories, require description
      if (!description.trim()) {
        toast.error('Lütfen açıklama girin');
        return;
      }
    }

    try {
      setLoading(true);
      
      // For advance payments, use barber name as description
      let finalDescription = description;
      let finalBarberId = barberId;
      
      if (category === 'Avans') {
        const selectedBarber = barbers.find(b => b.id === selectedBarberId);
        finalDescription = selectedBarber ? selectedBarber.users.full_name : 'Avans';
        finalBarberId = selectedBarberId;
      }
      
      await axios.post('/expenses', {
        amount: Math.round(amountNum),
        date,
        category,
        description: finalDescription,
        type: barberId ? 'personal' : 'business',
        barberId: finalBarberId || undefined,
      });

      setAmount('');
      setCategory('');
      setDescription('');
      setSelectedBarberId('');
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
              ref={amountInputRef}
              type="number"
              step={1}
              min={1}
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

          {/* Conditional: Barber Selection for Avans OR Description for others */}
          {category === 'Avans' ? (
            <div>
              <label className="block text-gray-300 mb-2 font-medium">
                Berber <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedBarberId}
                onChange={(e) => setSelectedBarberId(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                required
              >
                <option value="">Berber Seçiniz</option>
                {barbers.map((barber) => (
                  <option key={barber.id} value={barber.id}>
                    {barber.users.full_name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
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
          )}

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
