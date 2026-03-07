import { eq, gte, lte, and } from "drizzle-orm";
import { db } from "../../../config/db";
import { dailyStats } from "../../../db/schema";

export interface DailyStats {
  date: string;
  pos_amount: number;
  created_at?: string;
  updated_at?: string;
}

class DailyStatsRepository {
  async upsert(stats: DailyStats): Promise<DailyStats> {
    const [data] = await db
      .insert(dailyStats)
      .values({
        date: stats.date,
        pos_amount: stats.pos_amount,
      })
      .onConflictDoUpdate({
        target: dailyStats.date,
        set: {
          pos_amount: stats.pos_amount,
          updated_at: new Date().toISOString(),
        },
      })
      .returning();
    if (!data) throw new Error("Failed to upsert daily stats");
    return data as DailyStats;
  }

  async getByDate(date: string): Promise<DailyStats | null> {
    const [data] = await db
      .select()
      .from(dailyStats)
      .where(eq(dailyStats.date, date))
      .limit(1);
    return (data as DailyStats) ?? null;
  }

  async getByDateRange(
    startDate: string,
    endDate: string
  ): Promise<DailyStats[]> {
    const rows = await db
      .select()
      .from(dailyStats)
      .where(
        and(
          gte(dailyStats.date, startDate),
          lte(dailyStats.date, endDate)
        )
      );
    return rows as DailyStats[];
  }

  async getYearlyStats(year: number): Promise<DailyStats[]> {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    const rows = await db
      .select()
      .from(dailyStats)
      .where(
        and(
          gte(dailyStats.date, startDate),
          lte(dailyStats.date, endDate)
        )
      );
    return rows as DailyStats[];
  }
}

export default new DailyStatsRepository();
