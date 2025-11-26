import crypto from "crypto";
import tokenRepository from "../repositories/token.repository";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function saveRefreshToken(
  rawToken: string,
  userId: string,
  expiresAt?: string
) {
  const tokenHash = hashToken(rawToken);
  const ttl =
    expiresAt ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  return tokenRepository.createRefreshToken({
    user_id: userId,
    token: tokenHash,
    expires_at: ttl,
    revoked: false,
  });
}

export async function findValidRefreshToken(rawToken: string) {
  const tokenHash = hashToken(rawToken);
  const data = await tokenRepository.findRefreshToken(tokenHash);

  if (!data) return null;
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null;
  return data;
}

export async function revokeRefreshTokenById(id: string) {
  const now = new Date().toISOString();
  return tokenRepository.revokeRefreshTokenById(id, now);
}

export async function revokeRefreshTokenByRaw(rawToken: string) {
  const row = await findValidRefreshToken(rawToken);
  if (!row) return null;
  return revokeRefreshTokenById(row.id);
}

export async function revokeAllForUser(userId: string) {
  const now = new Date().toISOString();
  return tokenRepository.revokeAllForUser(userId, now);
}

export async function rotateRefreshToken(
  oldRaw: string,
  newRaw: string,
  userId?: string
) {
  if (!userId) throw new Error("userId required for rotateRefreshToken");

  // Insert new token
  const newRow = await saveRefreshToken(newRaw, userId, undefined);

  // Try to find and revoke old token (if exists)
  const old = await findValidRefreshToken(oldRaw);
  if (old) {
    // Old token exists, revoke it
    const now = new Date().toISOString();
    const revokedOld = await tokenRepository.revokeRefreshTokenById(old.id, now);
    return { newRow, old: revokedOld };
  }

  // Old token doesn't exist - that's okay, just return new token
  // This can happen when switching between different user accounts
  return { newRow, old: null };
}
