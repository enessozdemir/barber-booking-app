import { eq, and, asc } from "drizzle-orm";
import { db } from "../../../config/db";
import { barbers, users } from "../../../db/schema";

export class BarberRepository {
  async findActiveBarbers() {
    const rows = await db
      .select({
        id: barbers.id,
        active: barbers.active,
        created_at: barbers.created_at,
        avatar_url: barbers.avatar_url,
        user: {
          id: users.id,
          full_name: users.full_name,
          phone: users.phone,
          email: users.email,
          role: users.role,
        },
      })
      .from(barbers)
      .innerJoin(users, eq(barbers.id, users.id))
      .where(and(eq(barbers.active, true), eq(users.role, "barber")))
      .orderBy(asc(barbers.created_at));

    return rows.map((r) => ({
      id: r.id,
      active: r.active,
      created_at: r.created_at,
      avatar_url: r.avatar_url,
      users: r.user,
    }));
  }

  async findBarberById(barberId: string) {
    const [row] = await db
      .select({
        id: barbers.id,
        active: barbers.active,
        created_at: barbers.created_at,
        avatar_url: barbers.avatar_url,
        user: {
          id: users.id,
          full_name: users.full_name,
          phone: users.phone,
          email: users.email,
        },
      })
      .from(barbers)
      .innerJoin(users, eq(barbers.id, users.id))
      .where(eq(barbers.id, barberId))
      .limit(1);

    if (!row) return null;
    return { ...row, users: row.user };
  }

  async findBarberByUserId(userId: string) {
    const [data] = await db.select().from(barbers).where(eq(barbers.id, userId)).limit(1);
    return data ?? null;
  }

  async updateBarberAvatar(userId: string, avatarUrl: string | null) {
    await db.update(barbers).set({ avatar_url: avatarUrl }).where(eq(barbers.id, userId));
    return true;
  }
}

export default new BarberRepository();
