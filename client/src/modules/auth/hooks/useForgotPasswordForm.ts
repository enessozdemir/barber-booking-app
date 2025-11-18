import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import type { RootState } from '../../app/store';
import axios from 'axios';
import { useErrorHandler } from '../../../shared/hooks/useErrorHandler';
import { useFormValidation } from '../../../shared/hooks/useFormValidation';
import {
  resetForgotPasswordForm,
  setForgotPasswordPhone,
  setForgotPasswordEmail,
} from '../store/formSlice';

export const useForgotPasswordForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();
  const { validatePhone, validateEmail } = useFormValidation();
  const [loading, setLoading] = useState(false);

  const form = useSelector((state: RootState) => state.form.forgotPassword);

  const handlePhoneChange = (value: string) => {
    dispatch(setForgotPasswordPhone(value));
  };

  const handleEmailChange = (value: string) => {
    dispatch(setForgotPasswordEmail(value));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!validatePhone(form.phone) || !validateEmail(form.email)) {
      return;
    }

    setLoading(true);
    try {
      console.info('[forgot page] request payload', { phone: form.phone, email: form.email });
      const res = await axios.post('/auth/forgot-password', {
        phone: form.phone,
        email: form.email,
      });
      console.info('[forgot page] response', res?.status, res?.data);
      toast.success(
        'Eğer bilgiler eşleşiyorsa, e-posta adresinize bir reset linki gönderildi'
      );
      dispatch(resetForgotPasswordForm());
      navigate('/login');
    } catch (err: unknown) {
      console.error('forgot-password error', err);
      toast.error(handleError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/login');
  };

  return {
    phone: form.phone,
    email: form.email,
    loading,
    handlePhoneChange,
    handleEmailChange,
    handleSubmit,
    handleBack,
  };
};

