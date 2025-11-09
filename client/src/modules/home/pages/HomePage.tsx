import { useHomePage } from "../hooks/useHomePage";

export default function HomePage() {
  const { user, handleLogout, getUserDisplayName } = useHomePage();
  const displayName = getUserDisplayName();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl text-white mb-4">
        Hoş geldiniz{displayName ? `, ${displayName}` : ""}!
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
