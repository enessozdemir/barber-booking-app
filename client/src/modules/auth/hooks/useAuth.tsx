import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../app/store/index";
import { setUser, setAccessToken, logout as logoutAction } from "../store/authSlice";
import API from "../api/api";

export function useAuth() {
  const state = useSelector((s: RootState) => s.auth);
  const dispatch = useDispatch();

  const login = async (phone: string, password: string) => {
    const res = await API.post("/auth/login", { phone, password });
    const { user, accessToken } = res.data;
    dispatch(setUser(user));
    dispatch(setAccessToken(accessToken));
    return res.data;
  };

  const register = async (
    phone: string,
    full_name: string,
    email: string,
    password: string,
    confirm_password: string
  ) => {
    return API.post("/auth/register", {
      phone,
      full_name,
      email,
      password,
      confirm_password,
    });
  };

  const logout = async () => {
    // server will read refresh token from HttpOnly cookie
    await API.post("/auth/logout", {}, { withCredentials: true }).catch(
      () => {}
    );
    dispatch(logoutAction());
  };

  return { state, login, register, logout };
}
