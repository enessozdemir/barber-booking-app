import { eq, and, ne } from "drizzle-orm";
import { db } from "../../../config/db";
import { users } from "../../../db/schema";

export class AuthRepository {
  async findUserByPhone(phone: string) {
    const [data] = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
    return data ?? null;
  }

  async findUserByEmail(email: string) {
    const [data] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return data ?? null;
  }

  async findUserById(id: string) {
    const [data] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return data ?? null;
  }

  async createUser(user: {
    phone: string;
    email: string;
    password: string;
    full_name: string;
    role: string;
  }) {
    const [data] = await db.insert(users).values(user).returning();
    return data ?? null;
  }

  async updateUserPassword(id: string, password: string) {
    await db.update(users).set({ password }).where(eq(users.id, id));
    return true;
  }

  async updateUser(
    id: string,
    data: Partial<{ phone: string; email: string; full_name: string; role: string }>
  ) {
    const [updated] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning({ id: users.id, phone: users.phone, email: users.email, full_name: users.full_name, role: users.role });
    if (!updated) throw new Error("User not found");
    return updated;
  }

  async findUserByPhoneExcludingId(phone: string, excludeId: string) {
    const [data] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.phone, phone), ne(users.id, excludeId)))
      .limit(1);
    return data ?? null;
  }

  async findUserByEmailExcludingId(email: string, excludeId: string) {
    const [data] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, email), ne(users.id, excludeId)))
      .limit(1);
    return data ?? null;
  }
}

export default new AuthRepository();
