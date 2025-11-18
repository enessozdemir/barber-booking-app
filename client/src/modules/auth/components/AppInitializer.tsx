import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

type Props = {
  children: React.ReactNode;
};

export default function AppInitializer({ children }: Props) {
  const { tryRefreshToken } = useAuth();

  useEffect(() => {
    // Try to refresh token on app mount
    tryRefreshToken();
  }, []);

  return <>{children}</>;
}
