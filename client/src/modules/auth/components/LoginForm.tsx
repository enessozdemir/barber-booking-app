import Button from "../../../shared/components/Button";
import PasswordInput from "./PasswordInput";
import FormInput from "./FormInput";
import AuthRedirectMessage from "./AuthRedirect";
import { useLoginForm } from "../hooks/useLoginForm";

export default function LoginForm() {
  const {
    phone,
    password,
    handlePhoneChange,
    handlePasswordChange,
    handleSubmit,
    handleForgotPassword,
  } = useLoginForm();

  return (
    <form onSubmit={handleSubmit}>
      <FormInput
        label="Telefon No"
        value={phone}
        maxLength={10}
        setFunction={handlePhoneChange}
        placeholder="5xx xxx xx xx"
      />

      <PasswordInput
        label="Şifre"
        placeholder="6 Haneli PIN"
        password={password}
        setPassword={handlePasswordChange}
      />

      <button
        type="button"
        onClick={handleForgotPassword}
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
