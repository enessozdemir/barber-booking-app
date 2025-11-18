import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store/index';
import { useAuth } from '../../auth/hooks/useAuth';

export const useHomePage = () => {
  const auth = useSelector((s: RootState) => s.auth);
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const getUserDisplayName = (): string => {
    if (!auth.user) return '';
    return auth.user.full_name || auth.user.phone || '';
  };

  return {
    user: auth.user,
    handleLogout,
    getUserDisplayName,
  };
};

