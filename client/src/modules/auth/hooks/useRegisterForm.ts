import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import type { RootState } from '../../app/store';
import { useAuth } from './useAuth';
import { useErrorHandler } from '../../../shared/hooks/useErrorHandler';
import { useFormValidation } from '../../../shared/hooks/useFormValidation';
import {
  resetRegisterForm,
  setRegisterPhone,
  setRegisterEmail,
  setRegisterFullName,
} from '../store/formSlice';

export const useRegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useAuth();
  const { handleError } = useErrorHandler();
  const { validatePhone, validateEmail, validatePassword, validatePasswordMatch, validateFullName } =
    useFormValidation();

  // Non-sensitive fields stored in Redux
  const form = useSelector((state: RootState) => state.form.register);

  // Sensitive fields (passwords) stored in local state only - never in Redux
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePhoneChange = (value: string) => {
    dispatch(setRegisterPhone(value));
  };

  const handleFullNameChange = (value: string) => {
    dispatch(setRegisterFullName(value));
  };

  const handleEmailChange = (value: string) => {
    dispatch(setRegisterEmail(value));
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !validatePhone(form.phone) ||
      !validateFullName(form.fullName) ||
      !validateEmail(form.email) ||
      !validatePassword(password) ||
      !validatePasswordMatch(password, confirmPassword)
    ) {
      return;
    }

    try {
      await auth.register(
        form.phone,
        form.fullName,
        form.email,
        password,
        confirmPassword
      );
      toast.success('Başarıyla Kayıt Olundu', { autoClose: 3000 });
      dispatch(resetRegisterForm());
      setPassword(''); // Clear passwords from local state
      setConfirmPassword('');
      navigate('/login');
    } catch (err: unknown) {
      toast.error(handleError(err));
    }
  };

  return {
    phone: form.phone,
    fullName: form.fullName,
    email: form.email,
    password,
    confirmPassword,
    handlePhoneChange,
    handleFullNameChange,
    handleEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleSubmit,
  };
};

