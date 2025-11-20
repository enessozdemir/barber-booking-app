import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../app/store';
import { setUser } from '../../auth/store/authSlice';
import Header from '../../../shared/components/Header';
import ConfirmModal from '../../../shared/components/ConfirmModal';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useErrorHandler } from '../../../shared/hooks/useErrorHandler';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const { handleError } = useErrorHandler();
  
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isBarber, setIsBarber] = useState(false);
  
  // User info state
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchUserProfile = useCallback(async () => {
    try {
      // Check if user is a barber and get avatar
      const res = await axios.get(`/barbers/${user?.id}`);
      if (res.data.barber) {
        setIsBarber(true);
        if (res.data.barber.avatar_url) {
          setAvatarUrl(res.data.barber.avatar_url);
        }
      }
    } catch {
      // Not a barber or no avatar
      setIsBarber(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Sadece JPG, PNG ve WebP formatları desteklenir');
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await axios.post('/barbers/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setAvatarUrl(res.data.avatarUrl);
      if (user) {
        dispatch(setUser({ ...user, avatar_url: res.data.avatarUrl }));
      }
      toast.success('Profil fotoğrafı güncellendi');
    } catch (err) {
      toast.error(handleError(err));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarDelete = async () => {
    try {
      setUploadingAvatar(true);
      await axios.delete('/barbers/avatar');
      setAvatarUrl(null);
      if (user) {
        dispatch(setUser({ ...user, avatar_url: undefined }));
      }
      toast.success('Profil fotoğrafı silindi');
      setShowDeleteConfirm(false);
    } catch (err) {
      toast.error(handleError(err));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const res = await axios.put('/auth/profile', {
        full_name: fullName,
        email,
        phone
      });
      
      // Update Redux state with new user data
      if (res.data.user) {
        dispatch(setUser(res.data.user));
      }
      
      toast.success('Profil bilgileri güncellendi');
      setIsEditing(false);
    } catch (err) {
      toast.error(handleError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setFullName(user?.full_name || '');
    setEmail(user?.email || '');
    setPhone(user?.phone || '');
    setIsEditing(false);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen p-6 pt-24 bg-dark">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
              Profil Ayarları
            </h1>
            <p className="text-sm sm:text-base text-gray-400">
              Profil bilgilerinizi ve ayarlarınızı yönetin
            </p>
          </div>

          {/* Avatar Section (Barbers Only) */}
          {isBarber && (
            <div className="bg-gray-800 rounded-xl p-6 shadow-xl mb-6">
              <h2 className="text-xl font-bold text-white mb-4">Profil Fotoğrafı</h2>
              <div className="flex items-center gap-6">
                {/* Avatar Preview */}
                <div className="relative">
                  <div 
                    className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-3xl overflow-hidden bg-secondary"
                  >
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt={user?.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user?.full_name?.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>

                {/* Upload/Delete Buttons */}
                <div className="flex flex-col gap-3">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                      className="hidden"
                    />
                    <div 
                      className={`px-6 py-2 rounded-lg font-semibold transition-all text-white text-center ${
                        uploadingAvatar ? 'bg-gray-600' : 'bg-secondary'
                      }`}
                    >
                      {uploadingAvatar ? 'Yükleniyor...' : avatarUrl ? 'Fotoğrafı Değiştir' : 'Fotoğraf Yükle'}
                    </div>
                  </label>
                  {avatarUrl && !uploadingAvatar && (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all"
                    >
                      Fotoğrafı Sil
                    </button>
                  )}
                  <p className="text-xs text-gray-400">
                    Max 5MB • JPG, PNG, WebP
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* User Info Section */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Kullanıcı Bilgileri</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-white rounded-lg font-semibold transition-all bg-secondary"
                >
                  Düzenle
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-gray-300 mb-2">Ad Soyad</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-300 mb-2">E-posta</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-gray-300 mb-2">Telefon</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-gray-300 mb-2">Rol</label>
                <input
                  type="text"
                  value={user?.role === 'barber' ? 'Berber' : 'Müşteri'}
                  disabled
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg opacity-50 cursor-not-allowed"
                />
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex-1 px-6 py-3 text-white rounded-lg font-semibold disabled:opacity-50 transition-all bg-secondary"
                  >
                    {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all disabled:opacity-50"
                  >
                    İptal
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Profil Fotoğrafını Sil"
        message="Profil fotoğrafını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmText="Sil"
        cancelText="Vazgeç"
        type="danger"
        onConfirm={handleAvatarDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
