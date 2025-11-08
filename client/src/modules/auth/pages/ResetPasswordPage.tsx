import React, { useState } from "react";
import Layout from "../components/Layout";
import PasswordInput from "../components/PasswordInput";
import Button from "../../../shared/components/Button";
import API from "../api/api";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();
  const params = useParams();
  const id = params.id ?? "";
  const token = params.token ?? "";

  React.useEffect(() => {
    if (!id || !token) return;
    API.get(`/auth/reset-password/${id}/${token}`).catch(() => {
      toast.error("Geçersiz veya süresi dolmuş reset linki");
      navigate("/login");
    });
  }, [id, token, navigate]);

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

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      if (!id || !token) throw new Error('Eksik token');
      await API.post(`/auth/reset-password/${id}/${token}`, { password });
      toast.success("Şifre başarıyla güncellendi — lütfen giriş yapın");
      navigate("/login");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || "Şifre sıfırlanamadı");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Layout
        element={
          <form onSubmit={submit}>
            <PasswordInput
              label="Yeni Şifre"
              placeholder="Yeni şifre"
              password={password}
              setPassword={setPassword}
            />
            <PasswordInput
              label="Yeni Şifre (Tekrar)"
              placeholder="Tekrar"
              password={confirm}
              setPassword={setConfirm}
            />
            <Button content="Şifreyi Güncelle" />
          </form>
        }
      />
    </div>
  );
}
