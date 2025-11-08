import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../../../shared/components/Button";
import PasswordInput from "./PasswordInput";
import FormInput from "./FormInput";
import AuthRedirectMessage from "./AuthRedirect";

export default function LoginForm() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
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
      await auth.login(phone, password);

      setPhone("");
      setPassword("");
      navigate("/home");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || "Login failed");
    }
  };

  return (
    <form onSubmit={submit}>
      <FormInput
        label="Telefon No"
        value={phone}
        maxLength={10}
        setFunction={setPhone}
        placeholder="5xx xxx xx xx"
      />

      <PasswordInput
        label="Şifre"
        placeholder="6 Haneli PIN"
        password={password}
        setPassword={setPassword}
      />

      <button
        type="button"
        onClick={() => navigate('/forgot-password')}
        className="text-sm text-blue-500 hover:underline transition-all cursor-pointer"
      >
        Şifremi unuttum
      </button>

      <Button content="Giriş Yap" />

      <AuthRedirectMessage
        question="Hesabınız yok mu?"
        linkText="Kayıt Ol"
        linkTo="/register"
      />
    </form>
  );
}
