import { eq, and, lt, gt, ne, inArray, desc, asc } from "drizzle-orm";
import { db } from "../../../config/db";
import { bookings, barbers, users } from "../../../db/schema";

export class BookingRepository {
  async findBookingsByBarberAndDate(barberId: string, date: string, statuses: string[]) {
    return db
      .select({
        start_time: bookings.start_time,
        end_time: bookings.end_time,
        status: bookings.status,
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.barber_id, barberId),
          eq(bookings.date, date),
          inArray(bookings.status, statuses)
        )
      );
  }

  async findCustomerBookings(customerId: string, date: string, statuses: string[]) {
    const rows = await db
      .select({
        id: bookings.id,
        start_time: bookings.start_time,
        end_time: bookings.end_time,
        barber_full_name: users.full_name,
      })
      .from(bookings)
      .innerJoin(barbers, eq(bookings.barber_id, barbers.id))
      .innerJoin(users, eq(barbers.id, users.id))
      .where(
        and(
          eq(bookings.customer_id, customerId),
          eq(bookings.date, date),
          inArray(bookings.status, statuses)
        )
      );
    return rows.map((r) => ({
      id: r.id,
      start_time: r.start_time,
      end_time: r.end_time,
      barbers: { users: { full_name: r.barber_full_name } },
    }));
  }

  async findOverlappingBookings(
    barberId: string,
    date: string,
    startTime: string,
    endTime: string,
    statuses: string[]
  ) {
    return db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.barber_id, barberId),
          eq(bookings.date, date),
          inArray(bookings.status, statuses),
          lt(bookings.start_time, endTime),
          gt(bookings.end_time, startTime)
        )
      );
  }

  async deleteCancelledBooking(
    barberId: string,
    date: string,
    startTime: string
  ) {
    await db
      .delete(bookings)
      .where(
        and(
          eq(bookings.barber_id, barberId),
          eq(bookings.date, date),
          eq(bookings.start_time, startTime),
          eq(bookings.status, "cancelled")
        )
      );
  }

  async createBooking(bookingData: {
    barber_id: string;
    customer_id: string;
    date: string;
    start_time: string;
    end_time: string;
    status: string;
    price?: number | null;
    note?: string | null;
  }) {
    const [inserted] = await db.insert(bookings).values(bookingData).returning();
    if (!inserted) throw new Error("Failed to create booking");
    const [withBarber] = await db
      .select({
        booking: bookings,
        barber_full_name: users.full_name,
      })
      .from(bookings)
      .innerJoin(barbers, eq(bookings.barber_id, barbers.id))
      .innerJoin(users, eq(barbers.id, users.id))
      .where(eq(bookings.id, inserted.id))
      .limit(1);
    if (!withBarber) return inserted;
    return {
      ...withBarber.booking,
      barbers: { id: inserted.barber_id, users: { full_name: withBarber.barber_full_name } },
    };
  }

  async findUserBookings(userId: string) {
    const rows = await db
      .select({
        booking: bookings,
        barber_id: barbers.id,
        barber_full_name: users.full_name,
        barber_phone: users.phone,
      })
      .from(bookings)
      .innerJoin(barbers, eq(bookings.barber_id, barbers.id))
      .innerJoin(users, eq(barbers.id, users.id))
      .where(eq(bookings.customer_id, userId))
      .orderBy(desc(bookings.date), desc(bookings.start_time));
    return rows.map((r) => ({
      ...r.booking,
      barbers: {
        id: r.barber_id,
        users: { full_name: r.barber_full_name, phone: r.barber_phone },
      },
    }));
  }

  async findBarberBookings(barberId: string, date?: string) {
    const whereCond = date
      ? and(eq(bookings.barber_id, barberId), eq(bookings.date, date))
      : eq(bookings.barber_id, barberId);
    const rows = await db
      .select({
        booking: bookings,
        customer_full_name: users.full_name,
        customer_phone: users.phone,
      })
      .from(bookings)
      .innerJoin(users, eq(bookings.customer_id, users.id))
      .where(whereCond)
      .orderBy(asc(bookings.date), asc(bookings.start_time));
    return rows.map((r) => ({
      ...r.booking,
      customer: { full_name: r.customer_full_name, phone: r.customer_phone },
    }));
  }

  async findBookingById(bookingId: string) {
    const [data] = await db
      .select({
        id: bookings.id,
        barber_id: bookings.barber_id,
        customer_id: bookings.customer_id,
        status: bookings.status,
        date: bookings.date,
      })
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);
    return data ?? null;
  }

  async updateBookingStatus(bookingId: string, status: string, price?: number | null) {
    const updateData: { status: string; price?: number | null } = { status };
    if (price !== undefined) updateData.price = price;
    const [data] = await db
      .update(bookings)
      .set(updateData)
      .where(eq(bookings.id, bookingId))
      .returning();
    if (!data) throw new Error("Booking not found");
    return data;
  }

  async updateBookingPrice(bookingId: string, price: number) {
    const [data] = await db
      .update(bookings)
      .set({ price })
      .where(eq(bookings.id, bookingId))
      .returning();
    if (!data) throw new Error("Booking not found");
    return data;
  }

  async findExistingBookingForReschedule(
    barberId: string,
    date: string,
    startTime: string,
    excludeBookingId: string
  ) {
    const [data] = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.barber_id, barberId),
          eq(bookings.date, date),
          eq(bookings.start_time, startTime),
          ne(bookings.status, "cancelled"),
          inArray(bookings.status, ["pending", "completed"]),
          ne(bookings.id, excludeBookingId)
        )
      )
      .limit(1);
    return data ?? null;
  }

  async updateBookingTime(
    bookingId: string,
    date: string,
    startTime: string,
    endTime: string
  ) {
    const [data] = await db
      .update(bookings)
      .set({ date, start_time: startTime, end_time: endTime })
      .where(eq(bookings.id, bookingId))
      .returning();
    if (!data) throw new Error("Booking not found");
    return data;
  }

  async deleteBooking(bookingId: string) {
    await db.delete(bookings).where(eq(bookings.id, bookingId));
  }
}

export default new BookingRepository();
