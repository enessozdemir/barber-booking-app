import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";
import { NavLink, useNavigate } from "react-router-dom";
import Button from "../../../shared/components/Button";

export default function RegisterForm() {
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const auth = useAuth();
  const navigate = useNavigate();

  const getErrorMessage = (err: unknown) => {
    if (err instanceof Error) return err.message;
    if (typeof err === "object" && err !== null) {
      const maybe = err as Record<string, unknown>;
      const response = maybe.response;
      if (typeof response === "object" && response !== null) {
        const data = (response as Record<string, unknown>).data;
        if (typeof data === "object" && data !== null) {
          const msg = (data as Record<string, unknown>).message;
          if (typeof msg === "string") return msg;
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
      toast.success("Kayıt başarılı — lütfen giriş yapın", { autoClose: 3000 });
      // clear inputs
      setPhone("");
      setFullName("");
      setPassword("");
      setConfirm("");
      // redirect to login
      navigate("/login");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || "Kayıt başarısız");
    }
  };

  return (
    <form onSubmit={submit}>
      <div className="flex flex-col gap-1">
        <label htmlFor="phone-number" className="text-sm">
          Telefon Numarası
        </label>
        <input
          id="phone-number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="5xx xxx xx xx"
          className="w-full mb-3 p-3 rounded bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex flex-col gap-1 mt-2">
        <label htmlFor="full-name" className="text-sm">
          Tam Ad
        </label>
        <input
          id="full-name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Ad Soyad"
          className="w-full mb-3 p-3 rounded bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex flex-col gap-1 mt-2">
        <label htmlFor="password" className="text-sm">
          Şifre
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="6 Haneli PIN"
          className="w-full mb-3 p-3 rounded bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex flex-col gap-1 mt-2">
        <label htmlFor="confirm-password" className="text-sm">
          Şifre Onayı
        </label>
        <input
          id="confirm-password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="6 Haneli PIN (Tekrar)"
          className="w-full mb-3 p-3 rounded bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <Button content="Kayıt Ol" />
      <p className="mt-3 text-center text-sm text-lighter">
        Zaten bir hesabınız var mı?{" "}
        <NavLink
          to="/login"
          className="text-blue-500 hover:underline transition-all"
        >
          Giriş Yap
        </NavLink>
      </p>
    </form>
  );
}
