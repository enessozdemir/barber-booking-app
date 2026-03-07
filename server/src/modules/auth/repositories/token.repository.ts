import { eq, and, desc } from "drizzle-orm";
import { db } from "../../../config/db";
import { refreshTokens } from "../../../db/schema";

export class TokenRepository {
  async createRefreshToken(data: {
    user_id: string;
    token: string;
    expires_at: string;
    revoked: boolean;
  }) {
    const [result] = await db.insert(refreshTokens).values(data).returning();
    return result ?? null;
  }

  async findRefreshToken(tokenHash: string) {
    const [data] = await db
      .select()
      .from(refreshTokens)
      .where(and(eq(refreshTokens.token, tokenHash), eq(refreshTokens.revoked, false)))
      .orderBy(desc(refreshTokens.created_at))
      .limit(1);
    return data ?? null;
  }

  async revokeRefreshTokenById(id: string, revokedAt: string) {
    const [data] = await db
      .update(refreshTokens)
      .set({ revoked: true, revoked_at: revokedAt })
      .where(eq(refreshTokens.id, id))
      .returning();
    return data ?? null;
  }

  async revokeAllForUser(userId: string, revokedAt: string) {
    try {
      const data = await db
        .update(refreshTokens)
        .set({ revoked: true, revoked_at: revokedAt })
        .where(eq(refreshTokens.user_id, userId))
        .returning();
      return data;
    } catch {
      const data = await db
        .update(refreshTokens)
        .set({ revoked: true })
        .where(eq(refreshTokens.user_id, userId))
        .returning();
      return data;
    }
  }
}

export default new TokenRepository();
