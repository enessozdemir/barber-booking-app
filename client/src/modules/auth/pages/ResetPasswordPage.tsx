import React from "react";
import Layout from "../components/Layout";
import PasswordInput from "../components/PasswordInput";
import Button from "../../../shared/components/Button";
import { useResetPasswordForm } from "../hooks/useResetPasswordForm";

export default function ResetPasswordPage() {
  const {
    password,
    confirmPassword,
    loading,
    setPassword,
    setConfirmPassword,
    handleSubmit,
  } = useResetPasswordForm();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Layout
        element={
          <form onSubmit={handleSubmit}>
            <PasswordInput
              label="Yeni Şifre"
              placeholder="Yeni şifre"
              password={password}
              setPassword={setPassword}
            />
            <PasswordInput
              label="Yeni Şifre (Tekrar)"
              placeholder="Tekrar"
              password={confirmPassword}
              setPassword={setConfirmPassword}
            />
            <Button content="Şifreyi Güncelle" />
          </form>
        }
      />
    </div>
  );
}
