import FormInput from "./FormInput";
import { useForgotPasswordForm } from "../hooks/useForgotPasswordForm";

const ForgotPassword = () => {
  const {
    phone,
    email,
    loading,
    handlePhoneChange,
    handleEmailChange,
    handleSubmit,
    handleBack,
  } = useForgotPasswordForm();

  return (
    <div className="w-xl max-w-11/12 border border-lighter rounded-2xl p-6 shadow-sm shadow-lighter">
      <form onSubmit={handleSubmit}>
        <h3 className="text-center text-xl font-semibold mb-7">
          Şifremi Unuttum
        </h3>
        <FormInput
          label="Telefon No"
          value={phone}
          setFunction={handlePhoneChange}
          placeholder="5xx xxx xx xx"
          maxLength={10}
        />
        <FormInput
          label="Email"
          value={email}
          setFunction={handleEmailChange}
          placeholder="kullanici@xyz.com"
        />

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            className="flex-1 py-3 rounded-xl border cursor-pointer"
            onClick={handleBack}
            disabled={loading}
          >
            Geri
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 py-3 rounded-xl bg-navy text-white font-semibold cursor-pointer ${
              loading ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"
            }`}
          >
            {loading ? "Gönderiliyor..." : "Gönder"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
