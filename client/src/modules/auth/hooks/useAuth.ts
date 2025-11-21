import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../app/store/index";
import { setUser, setAccessToken, logout as logoutAction, setInitialized } from "../store/authSlice";
import axios from "axios";

export function useAuth() {
  const state = useSelector((s: RootState) => s.auth);
  const dispatch = useDispatch();

  const login = async (phone: string, password: string) => {
    const res = await axios.post("/auth/login", { phone, password });
    const { user, accessToken } = res.data;
    dispatch(setUser(user));
    dispatch(setAccessToken(accessToken));
    dispatch(setInitialized(true));
    return res.data;
  };

  const register = async (
    phone: string,
    full_name: string,
    email: string,
    password: string,
    confirm_password: string
  ) => {
    return axios.post("/auth/register", {
      phone,
      full_name,
      email,
      password,
      confirm_password,
    });
  };

  const logout = async () => {
    // server will read refresh token from HttpOnly cookie
    await axios.post("/auth/logout", {}, { withCredentials: true }).catch(
      () => { }
    );
    dispatch(logoutAction());
  };

  const tryRefreshToken = async () => {
    try {
      // attempt to refresh using HttpOnly cookie
      const res = await axios.post("/auth/refresh", {}, { withCredentials: true });
      const { accessToken, user } = res.data;
      dispatch(setAccessToken(accessToken));
      dispatch(setUser(user));
    } catch {
      // Token refresh failed, user needs to login
    } finally {
      // mark initialization as complete
      dispatch(setInitialized(true));
    }
  };

  return { state, login, register, logout, tryRefreshToken };
}
