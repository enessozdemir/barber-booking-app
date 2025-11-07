import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Button from "../../../shared/components/Button";
import PasswordInput from "./PasswordInput";
import FormInput from "./FormInput";
import AuthRedirectMessage from "./AuthRedirect";

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
      toast.success("Kayıt başarılı — lütfen giriş yapın", { autoClose: 3000 });
      setPhone("");
      setFullName("");
      setPassword("");
      setConfirm("");
      navigate("/login");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || "Kayıt başarısız");
    }
  };

  return (
    <form onSubmit={submit}>
      <FormInput
        label="Telefon Numarası"
        value={phone}
        maxLength={10}
        setFunction={setPhone}
        placeholder="5xx xxx xx xx"
      />

      <FormInput
        label="Tam Ad"
        value={fullName}
        maxLength={35}
        setFunction={setFullName}
        placeholder="Ad Soyad"
      />

      <PasswordInput
        label="Şifre"
        placeholder="6 Haneli PIN"
        password={password}
        setPassword={setPassword}
      />

      <PasswordInput
        label="Şifre Onayı"
        placeholder="6 Haneli PIN (Tekrar)"
        password={password}
        setPassword={setPassword}
      />

      <Button content="Kayıt Ol" />

      <AuthRedirectMessage
        question="Zaten bir hesabınız var mı?"
        linkText="Giriş Yap"
        linkTo="/login"
      />
    </form>
  );
}
