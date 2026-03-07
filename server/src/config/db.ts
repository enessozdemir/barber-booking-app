import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../db/schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set in environment");
}

const pool = new Pool({ connectionString });

/**
 * Drizzle DB instance. All backend database transactions should go through this object.
 * Schema is passed for relational queries and type inference.
 */
export const db = drizzle(pool, { schema });
