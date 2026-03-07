import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  date,
  real,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// --- users ---
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  phone: varchar("phone", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  full_name: varchar("full_name", { length: 255 }).notNull(),
  password: text("password"),
  role: varchar("role", { length: 50 }).notNull().default("user"),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
});

// --- barbers (id is same as user id) ---
export const barbers = pgTable("barbers", {
  id: uuid("id").primaryKey(), // references users(id)
  active: boolean("active").notNull().default(true),
  avatar_url: text("avatar_url"),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
});

// --- refresh_tokens ---
export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  expires_at: timestamp("expires_at", { withTimezone: true, mode: "string" }).notNull(),
  revoked: boolean("revoked").notNull().default(false),
  revoked_at: timestamp("revoked_at", { withTimezone: true, mode: "string" }),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
});

// --- bookings ---
export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  barber_id: uuid("barber_id")
    .notNull()
    .references(() => barbers.id, { onDelete: "cascade" }),
  customer_id: uuid("customer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  start_time: varchar("start_time", { length: 10 }).notNull(),
  end_time: varchar("end_time", { length: 10 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  price: real("price"),
  note: text("note"),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
});

// --- daily_earnings ---
export const dailyEarnings = pgTable("daily_earnings", {
  id: uuid("id").defaultRandom().primaryKey(),
  barber_id: uuid("barber_id")
    .notNull()
    .references(() => barbers.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  amount: real("amount").notNull(),
  booking_id: uuid("booking_id").references(() => bookings.id, { onDelete: "set null" }),
  source: varchar("source", { length: 50 }),
  notes: text("notes"),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
});

// --- daily_stats ---
export const dailyStats = pgTable("daily_stats", {
  date: date("date").primaryKey(),
  pos_amount: real("pos_amount").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow(),
});

// --- expenses ---
export const expenses = pgTable("expenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  barber_id: uuid("barber_id").references(() => barbers.id, { onDelete: "set null" }),
  amount: real("amount").notNull(),
  date: date("date").notNull(),
  category: varchar("category", { length: 255 }).notNull(),
  description: text("description").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'personal' | 'business'
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow(),
});

// --- earnings ---
export const earnings = pgTable("earnings", {
  id: uuid("id").defaultRandom().primaryKey(),
  barber_id: uuid("barber_id")
    .notNull()
    .references(() => barbers.id, { onDelete: "cascade" }),
  booking_id: uuid("booking_id").references(() => bookings.id, { onDelete: "set null" }),
  amount: real("amount").notNull(),
  date: date("date").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'booking' | 'walk_in'
  note: text("note"),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow(),
});

// --- Relations ---
export const usersRelations = relations(users, ({ one, many }) => ({
  barber: one(barbers),
  refreshTokens: many(refreshTokens),
  customerBookings: many(bookings),
}));

export const barbersRelations = relations(barbers, ({ one, many }) => ({
  user: one(users, { fields: [barbers.id], references: [users.id] }),
  bookings: many(bookings),
  dailyEarnings: many(dailyEarnings),
  expenses: many(expenses),
  earnings: many(earnings),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, { fields: [refreshTokens.user_id], references: [users.id] }),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  barber: one(barbers, { fields: [bookings.barber_id], references: [barbers.id] }),
  customer: one(users, { fields: [bookings.customer_id], references: [users.id] }),
  earnings: many(earnings),
}));

export const dailyEarningsRelations = relations(dailyEarnings, ({ one }) => ({
  barber: one(barbers, { fields: [dailyEarnings.barber_id], references: [barbers.id] }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  barber: one(barbers, { fields: [expenses.barber_id], references: [barbers.id] }),
}));

export const earningsRelations = relations(earnings, ({ one }) => ({
  barber: one(barbers, { fields: [earnings.barber_id], references: [barbers.id] }),
  booking: one(bookings, { fields: [earnings.booking_id], references: [bookings.id] }),
}));
