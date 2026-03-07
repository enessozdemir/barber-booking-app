import { eq, gte, lte, and, desc, asc } from "drizzle-orm";
import { db } from "../../../config/db";
import { expenses } from "../../../db/schema";

export interface Expense {
  id: string;
  barber_id: string | null;
  amount: number;
  date: string;
  category: string;
  description: string;
  type: "personal" | "business";
  created_at: string;
  updated_at: string;
}

export interface CreateExpenseDTO {
  barber_id?: string;
  amount: number;
  date: string;
  category: string;
  description: string;
  type: "personal" | "business";
}

export interface UpdateExpenseDTO {
  amount?: number;
  category?: string;
  description?: string;
  type?: "personal" | "business";
}

class ExpensesRepository {
  async create(data: CreateExpenseDTO): Promise<Expense> {
    const [expense] = await db
      .insert(expenses)
      .values({
        barber_id: data.barber_id ?? null,
        amount: data.amount,
        date: data.date,
        category: data.category,
        description: data.description,
        type: data.type,
      })
      .returning();
    if (!expense) throw new Error("Failed to create expense");
    return expense as Expense;
  }

  async getByBarberAndDate(barberId: string, date: string): Promise<Expense[]> {
    const rows = await db
      .select()
      .from(expenses)
      .where(and(eq(expenses.barber_id, barberId), eq(expenses.date, date)))
      .orderBy(desc(expenses.created_at));
    return rows as Expense[];
  }

  async getByBarberAndDateRange(
    barberId: string,
    startDate: string,
    endDate: string
  ): Promise<Expense[]> {
    const rows = await db
      .select()
      .from(expenses)
      .where(
        and(
          eq(expenses.barber_id, barberId),
          gte(expenses.date, startDate),
          lte(expenses.date, endDate)
        )
      )
      .orderBy(asc(expenses.date));
    return rows as Expense[];
  }

  async getAllByDate(date: string): Promise<Expense[]> {
    const rows = await db
      .select()
      .from(expenses)
      .where(eq(expenses.date, date))
      .orderBy(desc(expenses.created_at));
    return rows as Expense[];
  }

  async getAllByDateRange(startDate: string, endDate: string): Promise<Expense[]> {
    const rows = await db
      .select()
      .from(expenses)
      .where(and(gte(expenses.date, startDate), lte(expenses.date, endDate)))
      .orderBy(asc(expenses.date));
    return rows as Expense[];
  }

  async getBusinessByDate(date: string): Promise<Expense[]> {
    const rows = await db
      .select()
      .from(expenses)
      .where(and(eq(expenses.type, "business"), eq(expenses.date, date)))
      .orderBy(desc(expenses.created_at));
    return rows as Expense[];
  }

  async getBusinessByDateRange(
    startDate: string,
    endDate: string
  ): Promise<Expense[]> {
    const rows = await db
      .select()
      .from(expenses)
      .where(
        and(
          eq(expenses.type, "business"),
          gte(expenses.date, startDate),
          lte(expenses.date, endDate)
        )
      )
      .orderBy(asc(expenses.date));
    return rows as Expense[];
  }

  async update(id: string, data: UpdateExpenseDTO): Promise<Expense> {
    const [expense] = await db
      .update(expenses)
      .set({ ...data, updated_at: new Date().toISOString() })
      .where(eq(expenses.id, id))
      .returning();
    if (!expense) throw new Error("Expense not found");
    return expense as Expense;
  }

  async delete(id: string): Promise<void> {
    await db.delete(expenses).where(eq(expenses.id, id));
  }

  async getById(id: string): Promise<Expense | null> {
    const [data] = await db
      .select()
      .from(expenses)
      .where(eq(expenses.id, id))
      .limit(1);
    return (data as Expense) ?? null;
  }
}

export default new ExpensesRepository();
