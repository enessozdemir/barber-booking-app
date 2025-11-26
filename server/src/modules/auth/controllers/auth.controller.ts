import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import catchAsync from "../../../utils/catchAsync";

export const register = catchAsync(async (req: Request, res: Response) => {
  const { phone, email, full_name, password, confirm_password, role } =
    req.body;

  const user = await authService.registerUser({
    phone,
    email,
    full_name,
    password,
    confirm_password,
    role,
  });

  res.status(201).json({ user, message: "Registered successfully" });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { phone, password } = req.body;

  const result = await authService.loginUser({ phone, password });
  // set HttpOnly refresh token cookie and return access token and user
  const { refreshToken, accessToken, user } = result as any;
  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge,
  });
  res.json({ user, accessToken });
});

export const refresh = catchAsync(async (req: Request, res: Response) => {
  // read refresh token from HttpOnly cookie
  const refreshToken =
    (req.cookies && req.cookies.refreshToken) || req.body?.refreshToken;

  if (!refreshToken) {
    res.status(400).json({
      error: {
        code: 'MISSING_REFRESH_TOKEN',
        message: 'Missing refreshToken'
      }
    });
    return;
  }

  const data = await authService.refreshAccessToken(refreshToken);

  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

  if (data.refreshToken) {
    res.cookie("refreshToken", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
    });
  }
  res.json({ accessToken: data.accessToken, user: data.user });
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  const refreshToken =
    (req.cookies && req.cookies.refreshToken) || req.body?.refreshToken;
  if (!refreshToken) {
    res.status(400).json({
      error: {
        code: 'MISSING_REFRESH_TOKEN',
        message: 'Missing refreshToken'
      }
    });
    return;
  }
  await authService.logout(refreshToken);
  // clear cookie
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out" });
});

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { phone, email } = req.body;
  if (!phone || !email) {
    res.status(400).json({
      error: {
        code: 'MISSING_FIELDS',
        message: 'Missing fields'
      }
    });
    return;
  }

  await authService.forgotPassword(phone, email);
  res.json({ message: "Reset link sent if user exists" });
});

// 🔹 2. GET /reset-password/:id/:token → sadece token kontrol
export const verifyResetToken = catchAsync(async (req: Request, res: Response) => {
  const { id, token } = req.params;
  await authService.verifyResetToken(id, token);
  res.json({ valid: true });
});

// 🔹 3. POST /reset-password/:id/:token → şifre güncelle
export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { id, token } = req.params;
  const { password } = req.body;
  if (!password) {
    res.status(400).json({
      error: {
        code: 'MISSING_PASSWORD',
        message: 'Missing password'
      }
    });
    return;
  }

  await authService.resetPassword(id, token, password);
  res.json({ message: "Password updated successfully" });
});

export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Oturum açmanız gerekli'
      }
    });
    return;
  }

  const { full_name, email, phone } = req.body;

  const updatedUser = await authService.updateUserProfile(userId, {
    full_name,
    email,
    phone
  });

  res.status(200).json({
    user: updatedUser,
    message: "Profil başarıyla güncellendi"
  });
});

export const changePassword = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Oturum açmanız gerekli'
      }
    });
    return;
  }

  const { oldPassword, newPassword, confirmPassword } = req.body;

  await authService.changePassword(userId, oldPassword, newPassword, confirmPassword);

  res.status(200).json({
    message: "Şifre başarıyla değiştirildi"
  });
});

