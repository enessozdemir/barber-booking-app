import crypto from 'crypto';
import { supabase } from '../../../config/supabase';

type RefreshTokenRow = {
  id: string;
  user_id: string;
  token: string; // stores SHA-256 hash of the refresh token
  expires_at: string | null;
  revoked: boolean;
  created_at: string;
  revoked_at?: string | null;
};

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function saveRefreshToken(rawToken: string, userId: string, expiresAt?: string) {
  const tokenHash = hashToken(rawToken);
  const ttl = expiresAt ?? new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('refresh_tokens')
    .insert({ user_id: userId, token: tokenHash, expires_at: ttl, revoked: false })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function findValidRefreshToken(rawToken: string) {
  const tokenHash = hashToken(rawToken);

  const { data, error } = await supabase
    .from('refresh_tokens')
    .select('*')
    .eq('token', tokenHash)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  if (data.revoked) return null;
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null;
  return data;
}

export async function revokeRefreshTokenById(id: string) {
  const now = new Date().toISOString();
  try {
    const { data, error } = await supabase
      .from('refresh_tokens')
      .update({ revoked: true, revoked_at: now })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (err: any) {
    const msg = String(err?.message || err);
    if (msg.includes("Could not find the 'revoked_at' column") || msg.includes('column "revoked_at"') || msg.includes('unknown column')) {
      const { data, error } = await supabase
        .from('refresh_tokens')
        .update({ revoked: true })
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    }
    throw err;
  }
}

export async function revokeRefreshTokenByRaw(rawToken: string) {
  const row = await findValidRefreshToken(rawToken);
  if (!row) return null;
  return revokeRefreshTokenById(row.id);
}

export async function revokeAllForUser(userId: string) {
  const now = new Date().toISOString();
  try {
    const { data, error } = await supabase
      .from('refresh_tokens')
      .update({ revoked: true, revoked_at: now })
      .eq('user_id', userId)
      .select();

    if (error) throw error;
    return data;
  } catch (err: any) {
    const msg = String(err?.message || err);
    if (msg.includes("Could not find the 'revoked_at' column") || msg.includes('column "revoked_at"') || msg.includes('unknown column')) {
      const { data, error } = await supabase
        .from('refresh_tokens')
        .update({ revoked: true })
        .eq('user_id', userId)
        .select();

      if (error) throw error;
      return data;
    }
    throw err;
  }
}

export async function rotateRefreshToken(oldRaw: string, newRaw: string, userId?: string) {
  if (!userId) throw new Error('userId required for rotateRefreshToken');

  // insert new (hash will be stored by saveRefreshToken)
  const newRow = await saveRefreshToken(newRaw, userId, undefined);

  // find old
  const old = await findValidRefreshToken(oldRaw);
  if (!old) throw new Error('Old refresh token not found');

  // mark old revoked (try with revoked_at, fallback without)
  try {
    const { data, error } = await supabase
      .from('refresh_tokens')
      .update({ revoked: true, revoked_at: new Date().toISOString() })
      .eq('id', old.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return { newRow, old: data };
  } catch (err: any) {
    const msg = String(err?.message || err);
    if (msg.includes("Could not find the 'revoked_at' column") || msg.includes('column "revoked_at"') || msg.includes('unknown column')) {
      const { data, error } = await supabase
        .from('refresh_tokens')
        .update({ revoked: true })
        .eq('id', old.id)
        .select()
        .maybeSingle();

      if (error) throw error;
      return { newRow, old: data };
    }
    throw err;
  }
}
