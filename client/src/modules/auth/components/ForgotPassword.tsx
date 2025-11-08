import FormInput from "../components/FormInput";
import API from "../api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const ForgotPassword = () => {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

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

  const validate = () => {
    const phoneDigits = (phone || "").replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      toast.error("Lütfen 10 haneli telefon numarası girin (ör. 5061086117)");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Lütfen geçerli bir e-posta adresi girin");
      return false;
    }
    return true;
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      console.info("[forgot page] request payload", { phone, email });
      const res = await API.post("/auth/forgot-password", { phone, email });
      console.info("[forgot page] response", res?.status, res?.data);
      toast.success(
        "Eğer bilgiler eşleşiyorsa, e-posta adresinize bir reset linki gönderildi"
      );
      setPhone("");
      setEmail("");
      navigate("/login");
    } catch (err: unknown) {
      console.error("forgot-password error", err);
      toast.error(getErrorMessage(err) || "İstek başarısız");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="w-xl max-w-11/12 border border-lighter rounded-2xl p-6 shadow-sm shadow-lighter">
      <form onSubmit={submit}>
        <h3 className="text-center text-xl font-semibold mb-7">
          Şifremi Unuttum
        </h3>
        <FormInput
          label="Telefon No"
          value={phone}
          setFunction={setPhone}
          placeholder="5xx xxx xx xx"
          maxLength={10}
        />
        <FormInput
          label="Email"
          value={email}
          setFunction={setEmail}
          placeholder="user@xyz.com"
        />

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            className="flex-1 py-3 rounded-xl border cursor-pointer"
            onClick={() => navigate("/login")}
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
