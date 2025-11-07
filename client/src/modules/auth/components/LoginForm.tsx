import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../../../shared/components/Button";

export default function LoginForm() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    try {
      await auth.login(phone, password);
      toast.success("Giriş başarılı", { autoClose: 3000 });
      // clear inputs
      setPhone("");
      setPassword("");
      // redirect to home

      navigate("/home");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || "Login failed");
    } finally {
      setLoading(false);
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
          <label htmlFor="password" className="text-sm">
            Şifre
          </label>
          <input
            id="password"
            inputMode="numeric"
            pattern="[0-9]*"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            onKeyDown={(e) => {
              if (e.key.length === 1 && /\D/.test(e.key)) e.preventDefault();
              if (
                password.length >= 6 &&
                e.key !== "Backspace" &&
                e.key !== "Delete" &&
                e.key.length === 1
              )
                e.preventDefault();
            }}
            placeholder="6 haneli PIN"
            className="w-full mb-3 p-3 rounded bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button content="Giriş Yap" />
        <p className="mt-3 text-center text-sm text-lighter">
          Hesabınız yok mu?{" "}
          <NavLink to="/register" className="text-blue-500 hover:underline transition-all">
            Kayıt Ol
          </NavLink>
        </p>
      </form>
  );
}
