import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../api/api';
import { useErrorHandler } from '../../../shared/hooks/useErrorHandler';
import { useFormValidation } from '../../../shared/hooks/useFormValidation';

export const useResetPasswordForm = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { getErrorMessage } = useErrorHandler();
  const { validatePassword, validatePasswordMatch } = useFormValidation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const id = params.id ?? '';
  const token = params.token ?? '';

  useEffect(() => {
    if (!id || !token) return;
    API.get(`/auth/reset-password/${id}/${token}`).catch(() => {
      toast.error('Geçersiz veya süresi dolmuş reset linki');
      navigate('/login');
    });
  }, [id, token, navigate]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!validatePassword(password) || !validatePasswordMatch(password, confirmPassword)) {
      return;
    }

    if (!id || !token) {
      toast.error('Eksik token');
      return;
    }

    setLoading(true);
    try {
      await API.post(`/auth/reset-password/${id}/${token}`, { password });
      toast.success('Şifre başarıyla güncellendi — lütfen giriş yapın');
      navigate('/login');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || 'Şifre sıfırlanamadı');
    } finally {
      setLoading(false);
    }
  };

  return {
    password,
    confirmPassword,
    loading,
    setPassword,
    setConfirmPassword,
    handleSubmit,
  };
};

