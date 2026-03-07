import { eq, gte, lte, and, desc, asc } from "drizzle-orm";
import { db } from "../../../config/db";
import { earnings, barbers, users } from "../../../db/schema";

export interface Earning {
  id: string;
  barber_id: string;
  booking_id: string | null;
  amount: number;
  date: string;
  type: "booking" | "walk_in";
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateEarningDTO {
  barber_id: string;
  booking_id?: string;
  amount: number;
  date: string;
  type: "booking" | "walk_in";
  note?: string;
}

export interface EarningWithBarber extends Earning {
  barbers?: {
    users: {
      full_name: string;
    };
  };
}

class EarningsRepository {
  async create(data: CreateEarningDTO): Promise<Earning> {
    const [earning] = await db
      .insert(earnings)
      .values({
        barber_id: data.barber_id,
        booking_id: data.booking_id ?? null,
        amount: data.amount,
        date: data.date,
        type: data.type,
        note: data.note ?? null,
      })
      .returning();
    if (!earning) throw new Error("Failed to create earning");
    return earning as Earning;
  }

  async upsertByBookingId(data: CreateEarningDTO): Promise<Earning> {
    if (data.booking_id) {
      const [existing] = await db
        .select()
        .from(earnings)
        .where(eq(earnings.booking_id, data.booking_id))
        .limit(1);
      if (existing) {
        const [updated] = await db
          .update(earnings)
          .set({
            amount: data.amount,
            date: data.date,
            note: data.note ?? null,
          })
          .where(eq(earnings.id, existing.id))
          .returning();
        if (updated) return updated as Earning;
      }
    }
    return this.create(data);
  }

  async getByBarberAndDate(barberId: string, date: string): Promise<Earning[]> {
    const rows = await db
      .select()
      .from(earnings)
      .where(and(eq(earnings.barber_id, barberId), eq(earnings.date, date)))
      .orderBy(desc(earnings.created_at));
    return rows as Earning[];
  }

  async getByBarberAndDateRange(
    barberId: string,
    startDate: string,
    endDate: string
  ): Promise<Earning[]> {
    const rows = await db
      .select()
      .from(earnings)
      .where(
        and(
          eq(earnings.barber_id, barberId),
          gte(earnings.date, startDate),
          lte(earnings.date, endDate)
        )
      )
      .orderBy(asc(earnings.date));
    return rows as Earning[];
  }

  async getAllByDate(date: string): Promise<EarningWithBarber[]> {
    const rows = await db
      .select({
        earning: earnings,
        barber_full_name: users.full_name,
      })
      .from(earnings)
      .innerJoin(barbers, eq(earnings.barber_id, barbers.id))
      .innerJoin(users, eq(barbers.id, users.id))
      .where(eq(earnings.date, date))
      .orderBy(desc(earnings.created_at));
    return rows.map((r) => ({
      ...r.earning,
      barbers: { users: { full_name: r.barber_full_name } },
    })) as EarningWithBarber[];
  }

  async createWalkIn(
    barberId: string,
    amount: number,
    date: string,
    note?: string
  ): Promise<Earning> {
    const [data] = await db
      .insert(earnings)
      .values({
        barber_id: barberId,
        amount,
        date,
        note: note ?? null,
        type: "walk_in",
      })
      .returning();
    if (!data) throw new Error("Failed to create walk-in earning");
    return data as Earning;
  }

  async updateEarning(
    id: string,
    updates: { amount?: number; note?: string; date?: string }
  ) {
    const [data] = await db
      .update(earnings)
      .set(updates)
      .where(eq(earnings.id, id))
      .returning();
    if (!data) throw new Error("Earning not found");
    return data;
  }

  async getById(id: string): Promise<Earning | null> {
    const [data] = await db
      .select()
      .from(earnings)
      .where(eq(earnings.id, id))
      .limit(1);
    return (data as Earning) ?? null;
  }

  async getAllByDateRange(
    startDate: string,
    endDate: string
  ): Promise<EarningWithBarber[]> {
    const rows = await db
      .select({
        earning: earnings,
        barber_full_name: users.full_name,
      })
      .from(earnings)
      .innerJoin(barbers, eq(earnings.barber_id, barbers.id))
      .innerJoin(users, eq(barbers.id, users.id))
      .where(
        and(
          gte(earnings.date, startDate),
          lte(earnings.date, endDate)
        )
      )
      .orderBy(asc(earnings.date));
    return rows.map((r) => ({
      ...r.earning,
      barbers: { users: { full_name: r.barber_full_name } },
    })) as EarningWithBarber[];
  }

  async getTotalByBarberAndDate(barberId: string, date: string): Promise<number> {
    const list = await this.getByBarberAndDate(barberId, date);
    return list.reduce((sum, e) => sum + Number(e.amount), 0);
  }

  async getTotalByBarberAndDateRange(
    barberId: string,
    startDate: string,
    endDate: string
  ): Promise<number> {
    const list = await this.getByBarberAndDateRange(
      barberId,
      startDate,
      endDate
    );
    return list.reduce((sum, e) => sum + Number(e.amount), 0);
  }

  async delete(id: string): Promise<void> {
    await db.delete(earnings).where(eq(earnings.id, id));
  }

  async deleteByBookingId(bookingId: string): Promise<void> {
    await db.delete(earnings).where(eq(earnings.booking_id, bookingId));
  }
}

export default new EarningsRepository();
