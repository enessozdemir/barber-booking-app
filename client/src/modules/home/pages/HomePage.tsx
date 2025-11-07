import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import { useAuth } from "../../auth/hooks/useAuth";

export default function HomePage() {
  const auth = useSelector((s: RootState) => s.auth);
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl text-white mb-4">
        Hoş geldiniz
        {auth.user ? `, ${auth.user.full_name || auth.user.phone}` : ""}!
      </h1>
      <p className="text-gray-300 mb-6">
        Bu korumalı bir sayfadır. Giriş yaptıktan sonra buraya erişebilirsiniz.
      </p>
      <button
        onClick={handleLogout}
        className="py-2 px-4 bg-red-600 rounded text-white cursor-pointer"
      >
        Çıkış Yap
      </button>
    </div>
  );
}
