import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateDailyPosAmount } from '../store/financialSlice';
import { toast } from 'react-toastify';
import { PiCreditCardBold, PiMoneyBold, PiXBold } from 'react-icons/pi';
import type { AppDispatch } from '../../app/store';

interface EndDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  totalEarnings: number;
  currentPosAmount: number;
}

const EndDayModal: React.FC<EndDayModalProps> = ({ isOpen, onClose, date, totalEarnings, currentPosAmount }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [posAmount, setPosAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPosAmount(currentPosAmount > 0 ? currentPosAmount.toString() : '');
    }
  }, [isOpen, currentPosAmount]);

  const amount = posAmount ? parseFloat(posAmount) : 0;
  const isInvalid = amount > totalEarnings;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Safety check, though button should be disabled
    if (isInvalid) return;

    if (isNaN(amount)) {
      toast.error('Geçerli bir tutar giriniz');
      return;
    }

    try {
      setLoading(true);
      await dispatch(updateDailyPosAmount({ date, amount })).unwrap();
      onClose();
    } catch (error) {
      toast.error(error as string || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const calculatedCash = totalEarnings - amount;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-md border border-gray-700 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <PiCreditCardBold className="text-secondary" />
            Gün Sonu Al
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <PiXBold size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>Toplam Gelir</span>
              <span>{new Date(date).toLocaleDateString('tr-TR')}</span>
            </div>
            <div className="text-xl font-bold text-white">₺{totalEarnings.toFixed(2)}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Kredi Kartı / POS Tutarı
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₺</span>
              <input
                type="number"
                value={posAmount}
                onChange={(e) => setPosAmount(e.target.value)}
                className={`w-full bg-gray-900 border text-white rounded-lg pl-8 pr-4 py-2 outline-none transition-all placeholder:text-gray-600 ${
                  isInvalid 
                    ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                    : 'border-gray-700 focus:ring-2 focus:ring-secondary'
                }`}
                placeholder="0.00"
                autoFocus
              />
            </div>
            {isInvalid && (
              <p className="text-red-400 text-xs mt-1">POS tutarı toplam gelirden büyük olamaz</p>
            )}
          </div>

          <div className="bg-green-900/20 p-4 rounded-lg border border-green-900/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-400">
                <PiMoneyBold />
                <span className="font-medium">Hesaplanan Nakit</span>
              </div>
              <div className="text-xl font-bold text-green-400">
                ₺{calculatedCash < 0 ? '0.00' : calculatedCash.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading || isInvalid}
              className="flex-1 px-4 py-2 bg-secondary hover:bg-secondary/90 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EndDayModal;
