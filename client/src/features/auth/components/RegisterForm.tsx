import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function RegisterForm() {
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const auth = useAuth();
  const navigate = useNavigate();

  const getErrorMessage = (err: unknown) => {
    if (err instanceof Error) return err.message;
    if (typeof err === 'object' && err !== null) {
      const maybe = err as Record<string, unknown>;
      const response = maybe.response;
      if (typeof response === 'object' && response !== null) {
        const data = (response as Record<string, unknown>).data;
        if (typeof data === 'object' && data !== null) {
          const msg = (data as Record<string, unknown>).message;
          if (typeof msg === 'string') return msg;
        }
      }
    }
    return String(err);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await auth.register(phone, fullName, password, confirm);
      // show success toast
      toast.success('Kayıt başarılı — lütfen giriş yapın', { autoClose: 3000 });
      // clear inputs
      setPhone('');
      setFullName('');
      setPassword('');
      setConfirm('');
      // redirect to login
      navigate('/login');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || 'Kayıt başarısız');
    }
  };

  return (
    <form onSubmit={submit} className="p-4 max-w-md mx-auto">
      <h2 className="text-white text-2xl mb-4">Kayıt Ol</h2>
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telefon (+90...)" className="w-full mb-3 p-3 rounded bg-gray-800 text-white" />
      <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ad Soyad" className="w-full mb-3 p-3 rounded bg-gray-800 text-white" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Şifre" className="w-full mb-3 p-3 rounded bg-gray-800 text-white" />
      <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Şifre Tekrar" className="w-full mb-3 p-3 rounded bg-gray-800 text-white" />
      <button type="submit" className="w-full py-3 bg-indigo-600 rounded text-white">Kayıt Ol</button>
    </form>
  );
}
