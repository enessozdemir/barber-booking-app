import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

export default function AppInitializer() {
  const { tryRefreshToken } = useAuth();

  useEffect(() => {
    // Try to refresh token on app mount
    tryRefreshToken();
  }, []);

  return null;
}
