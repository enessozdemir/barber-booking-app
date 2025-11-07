import bcrypt from 'bcryptjs';
import { supabase } from '../../../config/supabase';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.util';
import * as tokenService from './token.service';

const SALT_ROUNDS = 10;

export async function registerUser({ phone, full_name, password, role = 'user' }: { phone: string; full_name: string; password: string; role?: string }) {
  // check existing using maybeSingle
  try {
    const { data: existing } = await supabase.from('users').select('id').eq('phone', phone).maybeSingle();
    if (existing) {
      throw new Error('Phone already registered');
    }
  } catch (err) {
    // continue; maybeSingle returns undefined when not found
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const { data, error } = await supabase.from('users').insert({ phone, password: hashed, full_name, role }).select().maybeSingle();
  if (error) throw error;
  return data;
}

export async function loginUser({ phone, password }: { phone: string; password: string }) {
  const { data: user, error } = await supabase.from('users').select('*').eq('phone', phone).maybeSingle();
  if (error || !user) throw new Error('Invalid credentials');

  const match = await bcrypt.compare(password, user.password as string);
  if (!match) throw new Error('Invalid credentials');

  const payload = { id: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // store hashed refresh token in DB (token rotation / revocation support)
  await tokenService.saveRefreshToken(refreshToken, user.id);

  // don't return password
  // create shallow copy to avoid mutating supabase return
  const safeUser = { ...user } as any;
  delete safeUser.password;
  return { user: safeUser, accessToken, refreshToken };
}

export async function refreshAccessToken(refreshToken: string) {
  // verify token signature
  const payload = verifyRefreshToken(refreshToken);
  if (!payload || !payload.id) throw new Error('Invalid refresh token');
  // check token exists and is valid (not revoked / expired)
  const row = await tokenService.findValidRefreshToken(refreshToken);
  if (!row) throw new Error('Refresh token not found or revoked');

  // rotation: issue new refresh token and revoke old one
  const newRefresh = signRefreshToken({ id: payload.id, role: payload.role });
  const newAccess = signAccessToken({ id: payload.id, role: payload.role });

  await tokenService.rotateRefreshToken(refreshToken, newRefresh, payload.id);

  return { accessToken: newAccess, refreshToken: newRefresh };
}

export async function logout(refreshToken: string) {
  // revoke the provided refresh token
  await tokenService.revokeRefreshTokenByRaw(refreshToken);
  return true;
}
