import { toast } from 'react-toastify';

export const useFormValidation = () => {
  const validatePhone = (phone: string): boolean => {
    const phoneDigits = (phone || '').replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      toast.error('Lütfen 10 haneli telefon numarası girin');
      return false;
    }
    return true;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Lütfen geçerli bir e-posta adresi girin');
      return false;
    }
    return true;
  };

  const validatePassword = (password: string, minLength: number = 6): boolean => {
    if (password.length < minLength) {
      toast.error(`Şifre en az ${minLength} karakter olmalıdır`);
      return false;
    }
    return true;
  };

  const validatePasswordMatch = (password: string, confirmPassword: string): boolean => {
    if (password !== confirmPassword) {
      toast.error('Şifreler eşleşmiyor');
      return false;
    }
    return true;
  };

  const validateFullName = (fullName: string): boolean => {
    if (!fullName || fullName.trim().length < 2) {
      toast.error('Lütfen geçerli bir ad soyad girin');
      return false;
    }
    return true;
  };

  return {
    validatePhone,
    validateEmail,
    validatePassword,
    validatePasswordMatch,
    validateFullName,
  };
};

