import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

export default function AppInitializer() {
  const { tryRefreshToken } = useAuth();

  useEffect(() => {
    // Try to refresh token on app mount
    const initializeAuth = async () => {
      try {
        console.log('[AppInitializer] Attempting to refresh token...');
        await tryRefreshToken();
        console.log('[AppInitializer] Token refresh attempt completed');
      } catch (error) {
        console.error('[AppInitializer] Token refresh failed:', error);
      }
    };

    initializeAuth();
  }, [tryRefreshToken]);

  return null;
}
