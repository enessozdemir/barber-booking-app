import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import type { RootState } from '../../app/store';
import { useAuth } from './useAuth';
import { useErrorHandler } from '../../../shared/hooks/useErrorHandler';
import { useFormValidation } from '../../../shared/hooks/useFormValidation';
import { resetLoginForm, setLoginPhone } from '../store/formSlice';

export const useLoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useAuth();
  const { getErrorMessage } = useErrorHandler();
  const { validatePhone, validatePassword } = useFormValidation();

  // Phone stored in Redux (non-sensitive)
  const phone = useSelector((state: RootState) => state.form.login.phone);
  
  // Password stored in local state only (sensitive data - never in Redux)
  const [password, setPassword] = useState('');

  const handlePhoneChange = (value: string) => {
    dispatch(setLoginPhone(value));
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePhone(phone) || !validatePassword(password)) {
      return;
    }

    try {
      await auth.login(phone, password);
      dispatch(resetLoginForm());
      setPassword(''); // Clear password from local state
      navigate('/home');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || 'Login failed');
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return {
    phone,
    password,
    handlePhoneChange,
    handlePasswordChange,
    handleSubmit,
    handleForgotPassword,
  };
};

