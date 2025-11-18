import { Request, Response } from "express";
import * as authService from "../services/auth.service";

export async function register(req: Request, res: Response) {
  try {
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

    return res.status(201).json({ user, message: "Registered successfully" });
  } catch (err: any) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({
      error: {
        code: err.code || 'INTERNAL_SERVER_ERROR',
        message: err.message || 'Registration failed'
      }
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
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
    return res.json({ user, accessToken });
  } catch (err: any) {
    const statusCode = err.statusCode || 401;
    return res.status(statusCode).json({
      error: {
        code: err.code || 'INTERNAL_SERVER_ERROR',
        message: err.message || 'Login failed'
      }
    });
  }
}

export async function refresh(req: Request, res: Response) {
  try {
    // read refresh token from HttpOnly cookie
    const refreshToken =
      (req.cookies && req.cookies.refreshToken) || req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({
        error: {
          code: 'MISSING_REFRESH_TOKEN',
          message: 'Missing refreshToken'
        }
      });
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
    return res.json({ accessToken: data.accessToken, user: data.user });
  } catch (err: any) {
    const statusCode = err.statusCode || 401;
    return res.status(statusCode).json({
      error: {
        code: err.code || 'INTERNAL_SERVER_ERROR',
        message: err.message || 'Refresh failed'
      }
    });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const refreshToken =
      (req.cookies && req.cookies.refreshToken) || req.body?.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({
        error: {
          code: 'MISSING_REFRESH_TOKEN',
          message: 'Missing refreshToken'
        }
      });
    }
    await authService.logout(refreshToken);
    // clear cookie
    res.clearCookie("refreshToken");
    return res.json({ message: "Logged out" });
  } catch (err: any) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({
      error: {
        code: err.code || 'INTERNAL_SERVER_ERROR',
        message: err.message || 'Logout failed'
      }
    });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { phone, email } = req.body;
    if (!phone || !email) {
      return res.status(400).json({
        error: {
          code: 'MISSING_FIELDS',
          message: 'Missing fields'
        }
      });
    }

    await authService.forgotPassword(phone, email);
    return res.json({ message: "Reset link sent if user exists" });
  } catch (err: any) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({
      error: {
        code: err.code || 'INTERNAL_SERVER_ERROR',
        message: err.message
      }
    });
  }
}

// 🔹 2. GET /reset-password/:id/:token → sadece token kontrol
export async function verifyResetToken(req: Request, res: Response) {
  try {
    const { id, token } = req.params;
    await authService.verifyResetToken(id, token);
    return res.json({ valid: true });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
}

// 🔹 3. POST /reset-password/:id/:token → şifre güncelle
export async function resetPassword(req: Request, res: Response) {
  try {
    const { id, token } = req.params;
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({
        error: {
          code: 'MISSING_PASSWORD',
          message: 'Missing password'
        }
      });
    }

    await authService.resetPassword(id, token, password);
    return res.json({ message: "Password updated successfully" });
  } catch (err: any) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({
      error: {
        code: err.code || 'INTERNAL_SERVER_ERROR',
        message: err.message
      }
    });
  }
}
