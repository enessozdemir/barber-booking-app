import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ConfirmModal from '../../../shared/components/ConfirmModal';
import EditExpenseModal from './EditExpenseModal';

interface Expense {
  id: string;
  amount: number;
  date: string;
  category: string;
  description: string;
  type: 'personal' | 'business';
  created_at: string;
}

interface ExpensesListProps {
  expenses: Expense[];
  onUpdate: () => void;
}

export default function ExpensesList({ expenses, onUpdate }: ExpensesListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const handleDeleteClick = (expenseId: string) => {
    setConfirmDeleteId(expenseId);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    
    const expenseId = confirmDeleteId;
    setConfirmDeleteId(null);

    try {
      setDeletingId(expenseId);
      await axios.delete(`/expenses/${expenseId}`);
      onUpdate();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Silme başarısız');
      } else {
        toast.error('Silme başarısız');
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditClick = (expense: Expense) => {
    setEditingExpense(expense);
  };

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>Henüz gider kaydı yok</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left py-3 px-4 text-gray-300 font-semibold">Tarih</th>
            <th className="text-left py-3 px-4 text-gray-300 font-semibold">Kategori</th>
            <th className="text-left py-3 px-4 text-gray-300 font-semibold">Açıklama</th>
            <th className="text-right py-3 px-4 text-gray-300 font-semibold">Tutar</th>
            <th className="text-right py-3 px-4 text-gray-300 font-semibold">İşlem</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
              <td className="py-3 px-4 text-white">
                {new Date(expense.date).toLocaleDateString('tr-TR')}
              </td>
              <td className="py-3 px-4">
                <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-700 text-gray-200">
                  {expense.category}
                </span>
              </td>
              <td className="py-3 px-4 text-gray-300 text-sm">
                {expense.description}
              </td>
              <td className="py-3 px-4 text-right">
                <span className="text-red-400 font-semibold">
                  ₺{expense.amount.toFixed(2)}
                </span>
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => handleEditClick(expense)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDeleteClick(expense.id)}
                    disabled={deletingId === expense.id}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors disabled:opacity-50"
                  >
                    Sil
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Gideri Sil"
        message="Bu gideri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmText="Sil"
        cancelText="Vazgeç"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />

      <EditExpenseModal
        isOpen={!!editingExpense}
        expense={editingExpense}
        onClose={() => setEditingExpense(null)}
        onSuccess={() => {
          setEditingExpense(null);
          onUpdate();
        }}
      />
    </div>
  );
}
