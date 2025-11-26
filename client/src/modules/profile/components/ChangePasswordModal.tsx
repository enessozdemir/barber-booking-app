import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useErrorHandler } from '../../../shared/hooks/useErrorHandler';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const { handleError } = useErrorHandler();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Tüm alanlar doldurulmalıdır');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Yeni şifre en az 6 karakter olmalıdır');
      return;
    }

    if (oldPassword === newPassword) {
      toast.error('Yeni şifre eski şifre ile aynı olamaz');
      return;
    }

    // Check for sequential numbers
    const hasSequentialNumbers = (password: string): boolean => {
      for (let i = 0; i < password.length - 2; i++) {
        const char1 = password.charCodeAt(i);
        const char2 = password.charCodeAt(i + 1);
        const char3 = password.charCodeAt(i + 2);
        
        // Check ascending (123, 234, etc.)
        if (
          char1 >= 48 && char1 <= 57 &&
          char2 === char1 + 1 &&
          char3 === char2 + 1
        ) {
          return true;
        }
        
        // Check descending (321, 432, etc.)
        if (
          char1 >= 48 && char1 <= 57 &&
          char2 === char1 - 1 &&
          char3 === char2 - 1
        ) {
          return true;
        }
      }
      return false;
    };

    if (hasSequentialNumbers(newPassword)) {
      toast.error('Şifre ardışık sayılar içeremez');
      return;
    }

    try {
      setLoading(true);
      await axios.put('/auth/change-password', {
        oldPassword,
        newPassword,
        confirmPassword,
      });

      toast.success('Şifre başarıyla değiştirildi');
      onClose();
    } catch (error) {
      toast.error(handleError(error));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />
      
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl relative animate-scaleIn border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">Şifre Değiştir</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Old Password */}
          <div>
            <label className="block text-gray-300 mb-2 font-medium">
              Eski Şifre <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="6 Haneli PIN"
              required
              disabled={loading}
              maxLength={6}
              minLength={6}
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-gray-300 mb-2 font-medium">
              Yeni Şifre <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="6 Haneli PIN"
              required
              disabled={loading}
              maxLength={6}
              minLength={6}
            />
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-gray-300 mb-2 font-medium">
              Yeni Şifre Tekrar <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="6 Haneli PIN"
              required
              disabled={loading}
              maxLength={6}
              minLength={6}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium disabled:opacity-50"
              disabled={loading}
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg hover:opacity-90 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
