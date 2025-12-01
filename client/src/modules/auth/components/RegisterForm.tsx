import Button from "../../../shared/components/Button";
import PasswordInput from "./PasswordInput";
import FormInput from "./FormInput";
import AuthRedirectMessage from "./AuthRedirect";
import { useRegisterForm } from "../hooks/useRegisterForm";

export default function RegisterForm() {
  const {
    phone,
    fullName,
    email,
    password,
    confirmPassword,
    handlePhoneChange,
    handleFullNameChange,
    handleEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleSubmit,
  } = useRegisterForm();

  return (
    <form onSubmit={handleSubmit}>
      <FormInput
        label="Telefon No"
        value={phone}
        maxLength={10}
        setFunction={handlePhoneChange}
        placeholder="5xx xxx xx xx"
      />

      <FormInput
        label="Tam Ad"
        value={fullName}
        maxLength={35}
        setFunction={handleFullNameChange}
        placeholder="Ad Soyad"
      />

      <FormInput
        label="Email"
        value={email}
        maxLength={35}
        setFunction={handleEmailChange}
        placeholder="kullanici@xyz.com"
      />

      <PasswordInput
        label="Şifre"
        placeholder="6 Haneli PIN"
        password={password}
        setPassword={handlePasswordChange}
      />

      <PasswordInput
        label="Şifre Onayı"
        placeholder="6 Haneli PIN (Tekrar)"
        password={confirmPassword}
        setPassword={handleConfirmPasswordChange}
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
