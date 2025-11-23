import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Earning {
  id: string;
  amount: number;
  date: string;
  type: 'booking' | 'walk_in';
  note: string | null;
  booking_id: string | null;
  created_at: string;
}

interface EarningsListProps {
  earnings: Earning[];
  onUpdate: () => void;
}

export default function EarningsList({ earnings, onUpdate }: EarningsListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');

  const handleEdit = (earning: Earning) => {
    setEditingId(earning.id);
    setEditPrice(earning.amount.toString());
  };

  const handleSave = async (earningId: string, bookingId: string | null) => {
    const price = parseFloat(editPrice);
    if (!price || price <= 0) {
      toast.error('Geçerli bir fiyat giriniz');
      return;
    }

    try {
      if (bookingId) {
        await axios.patch(`/bookings/${bookingId}/price`, { price });
      } else {
        // For walk-ins, use the earnings update endpoint
        await axios.patch(`/earnings/${earningId}`, { amount: price });
      }
      
      toast.success('Fiyat güncellendi');
      setEditingId(null);
      onUpdate();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Güncelleme başarısız');
      } else {
        toast.error('Güncelleme başarısız');
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditPrice('');
  };

  if (earnings.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>Henüz kazanç kaydı yok</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left py-3 px-4 text-gray-300 font-semibold">Tarih</th>
            <th className="text-left py-3 px-4 text-gray-300 font-semibold">Not</th>
            <th className="text-right py-3 px-4 text-gray-300 font-semibold">Tutar</th>
            <th className="text-right py-3 px-4 text-gray-300 font-semibold">İşlem</th>
          </tr>
        </thead>
        <tbody>
          {earnings.map((earning) => (
            <tr key={earning.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
              <td className="py-3 px-4 text-white">
                {new Date(earning.date).toLocaleDateString('tr-TR')}
              </td>

              <td className="py-3 px-4 text-gray-300 text-sm">
                {earning.note || '-'}
              </td>
              <td className="py-3 px-4 text-right">
                {editingId === earning.id ? (
                  <input
                    type="number"
                    step="0.01"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-24 px-2 py-1 bg-gray-700 text-white rounded text-right"
                    autoFocus
                  />
                ) : (
                  <span className="text-green-400 font-semibold">
                    ₺{earning.amount.toFixed(2)}
                  </span>
                )}
              </td>
              <td className="py-3 px-4 text-right">
                {editingId === earning.id ? (
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleSave(earning.id, earning.booking_id)}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                    >
                      Kaydet
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors"
                    >
                      İptal
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEdit(earning)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                  >
                    Düzenle
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
