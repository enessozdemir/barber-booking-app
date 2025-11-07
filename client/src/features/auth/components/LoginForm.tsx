import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function LoginForm() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    try {
      await auth.login(phone, password);
      toast.success('Giriş başarılı', { autoClose: 3000 });
  // clear inputs
  setPhone('');
  setPassword('');
  // redirect to home
  
  navigate('/home');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="p-4 max-w-md mx-auto">
      <h2 className="text-white text-2xl mb-4">Giriş Yap</h2>
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telefon (0... geri kalan kısmı girin)" className="w-full mb-3 p-3 rounded bg-gray-800 text-white" />
      <input
        inputMode="numeric"
        pattern="[0-9]*"
        value={password}
        onChange={(e) => setPassword(e.target.value.replace(/\D/g, '').slice(0, 6))}
        onKeyDown={(e) => {
          // allow navigation keys
          if (e.key.length === 1 && /\D/.test(e.key)) e.preventDefault();
          if (password.length >= 6 && e.key !== 'Backspace' && e.key !== 'Delete' && e.key.length === 1) e.preventDefault();
        }}
        placeholder="6 haneli PIN"
        className="w-full mb-3 p-3 rounded bg-gray-800 text-white"
      />
      <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 rounded text-white cursor-pointer">{loading ? 'Bekleyin...' : 'Giriş'}</button>
    </form>
  );
}
