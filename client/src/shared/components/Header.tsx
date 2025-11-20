import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../modules/app/store';
import { useAuth } from '../../modules/auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Header() {
  const user = useSelector((state: RootState) => state.auth.user);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll listener for glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 80;
      setIsScrolled(window.scrollY > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch barber avatar if user is a barber
  useEffect(() => {
    const fetchBarberAvatar = async () => {
      if (user?.role === 'barber') {
        try {
          const res = await axios.get(`/barbers/${user.id}`);
          if (res.data.barber?.avatar_url) {
            setAvatarUrl(res.data.barber.avatar_url);
          }
        } catch {
          // No avatar or not a barber
        }
      }
    };

    fetchBarberAvatar();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'py-0' : 'py-4'
      }`}
      style={{
        backgroundColor: isScrolled ? 'transparent' : 'var(--color-dark)',
        borderBottom: isScrolled ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <div 
        className="mx-auto transition-all duration-500 max-w-7xl"
      >
        <div
          className={`flex justify-between items-center transition-all duration-500 ${
            isScrolled
              ? 'bg-gray-900/80 backdrop-blur-md rounded-full py-3 px-6 w-[calc(100%-2rem)] max-w-7xl mx-auto mt-2 shadow-lg border border-white/10'
              : 'bg-transparent border border-transparent px-6 xl:px-0'
          }`}
        >
          {/* Logo */}
          <div className="flex items-center">
            <h1 
              onClick={() => navigate('/home')}
              className="text-lg sm:text-2xl font-bold text-white cursor-pointer hover:opacity-80 transition-opacity"
            >
              Mühendis Berber
            </h1>
          </div>

          {/* User Avatar */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-10 h-10 rounded-full text-white font-semibold flex items-center justify-center hover:opacity-80 transition-all focus:outline-none cursor-pointer overflow-hidden bg-transparent border-2 border-secondary"
            >
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={user?.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials(user?.full_name)
              )}
            </button>

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl py-2 z-50 border border-gray-700">
                <div className="px-4 py-2 border-b border-gray-700">
                  <p className="text-sm font-semibold text-white">{user?.full_name}</p>
                </div>
                <button
                  onClick={() => {
                    navigate('/profile');
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  Profil
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors"
                >
                  Çıkış Yap
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
