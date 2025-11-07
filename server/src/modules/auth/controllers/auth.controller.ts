import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

export async function register(req: Request, res: Response) {
  try {
    const { phone, full_name, password, confirm_password, role } = req.body;
    if (!phone || !full_name || !password || !confirm_password) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    if (password !== confirm_password) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const user = await authService.registerUser({ phone, full_name, password, role });
    return res.status(201).json({ user, message: 'Registered' });
  } catch (err: any) {
    return res.status(400).json({ message: err.message || 'Registration failed' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ message: 'Missing phone or password' });

    const result = await authService.loginUser({ phone, password });
    // set HttpOnly refresh token cookie and return access token and user
    const { refreshToken, accessToken, user } = result as any;
    const maxAge = 45 * 24 * 60 * 60 * 1000; // 45 days
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge });
    return res.json({ user, accessToken });
  } catch (err: any) {
    return res.status(401).json({ message: err.message || 'Login failed' });
  }
}

export async function refresh(req: Request, res: Response) {
  try {
    // read refresh token from HttpOnly cookie (or fallback to body)
    const refreshToken = (req.cookies && req.cookies.refreshToken) || req.body?.refreshToken;
    if (!refreshToken) return res.status(400).json({ message: 'Missing refreshToken' });
    const data = await authService.refreshAccessToken(refreshToken);
    // data contains new accessToken and new refreshToken (rotation)
    const maxAge = 45 * 24 * 60 * 60 * 1000; // 45 days
    if (data.refreshToken) {
      res.cookie('refreshToken', data.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge });
    }
    return res.json({ accessToken: data.accessToken });
  } catch (err: any) {
    return res.status(401).json({ message: err.message || 'Refresh failed' });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const refreshToken = (req.cookies && req.cookies.refreshToken) || req.body?.refreshToken;
    if (!refreshToken) return res.status(400).json({ message: 'Missing refreshToken' });
    await authService.logout(refreshToken);
    // clear cookie
    res.clearCookie('refreshToken');
    return res.json({ message: 'Logged out' });
  } catch (err: any) {
    return res.status(400).json({ message: err.message || 'Logout failed' });
  }
}
