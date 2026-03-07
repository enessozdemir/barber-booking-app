import { eq, gte, lte, desc, and } from "drizzle-orm";
import { db } from "../../../config/db";
import { dailyEarnings } from "../../../db/schema";

export class DailyEarningsRepository {
  async createEarning(earningData: {
    barber_id: string;
    date: string;
    amount: number;
    booking_id?: string | null;
    source?: string | null;
    notes?: string | null;
  }) {
    const [data] = await db.insert(dailyEarnings).values(earningData).returning();
    if (!data) throw new Error("Failed to create daily earning");
    return data;
  }

  async findEarningsByBarber(barberId: string, date?: string) {
    const whereCond = date
      ? and(eq(dailyEarnings.barber_id, barberId), eq(dailyEarnings.date, date))
      : eq(dailyEarnings.barber_id, barberId);
    return db
      .select()
      .from(dailyEarnings)
      .where(whereCond)
      .orderBy(desc(dailyEarnings.date));
  }

  async findEarningsByBarberAndDateRange(
    barberId: string,
    startDate: string,
    endDate: string
  ) {
    return db
      .select({ amount: dailyEarnings.amount })
      .from(dailyEarnings)
      .where(
        and(
          eq(dailyEarnings.barber_id, barberId),
          gte(dailyEarnings.date, startDate),
          lte(dailyEarnings.date, endDate)
        )
      );
  }
}

export default new DailyEarningsRepository();
