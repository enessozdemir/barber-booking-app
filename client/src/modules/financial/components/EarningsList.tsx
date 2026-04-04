import { useState } from 'react';
import axios from 'axios';
import { formatTryInteger } from '../../../shared/utils/formatters';
import { toast } from 'react-toastify';

interface Earning {
  id: string;
  amount: number;
  date: string;
  type: 'booking' | 'walk_in';
  note: string | null;
  booking_id: string | null;
  created_at: string;
  barbers?: {
    users: {
      full_name: string;
    };
  };
}

interface EarningsListProps {
  earnings: Earning[];
  onUpdate: () => void;
  showBarber?: boolean;
}

export default function EarningsList({ earnings, onUpdate, showBarber = false }: EarningsListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleEdit = (earning: Earning) => {
    setEditingId(earning.id);
    setEditPrice(String(Math.round(earning.amount)));
  };

  const handleSave = async (earningId: string, bookingId: string | null) => {
    const price = parseFloat(editPrice);
    if (!price || price <= 0) {
      toast.error('Geçerli bir fiyat giriniz');
      return;
    }

    try {
      if (bookingId) {
        await axios.patch(`/bookings/${bookingId}/price`, { price: Math.round(price) });
      } else {
        // For walk-ins, use the earnings update endpoint
        await axios.patch(`/earnings/${earningId}`, { amount: Math.round(price) });
      }
      
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

  const handleDelete = async (earningId: string, type: string) => {
    if (type !== 'walk_in') {
      toast.error('Sadece müşteri kayıtları silinebilir');
      return;
    }

    setDeletingId(earningId);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;

    try {
      await axios.delete(`/earnings/${deletingId}`);
      setDeletingId(null);
      onUpdate();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Silme başarısız');
      } else {
        toast.error('Silme başarısız');
      }
    }
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  if (earnings.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>Henüz kazanç kaydı yok</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-gray-300 font-semibold">Tarih</th>
              <th className="text-left py-3 px-4 text-gray-300 font-semibold">
                {showBarber ? 'Berber' : 'Not'}
              </th>
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
                  {showBarber 
                    ? (earning.barbers?.users?.full_name || '-')
                    : (earning.note || '-')
                  }
                </td>
                <td className="py-3 px-4 text-right">
                  {editingId === earning.id ? (
                    <input
                      type="number"
                      step={1}
                      min={1}
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-24 px-2 py-1 bg-gray-700 text-white rounded text-right"
                      autoFocus
                    />
                  ) : (
                    <span className="text-green-400 font-semibold">
                      ₺{formatTryInteger(earning.amount)}
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
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleEdit(earning)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                      >
                        Düzenle
                      </button>
                      {earning.type === 'walk_in' && (
                        <button
                          onClick={() => handleDelete(earning.id, earning.type)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                        >
                          Sil
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Gelir Kaydını Sil</h3>
            <p className="text-gray-300 mb-6">Bu gelir kaydını silmek istediğinizden emin misiniz?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
