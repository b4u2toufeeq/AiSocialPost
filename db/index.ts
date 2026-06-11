import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { env } from "@/lib/env";

if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in the environment variables.");
}

const sql = neon(env.DATABASE_URL);
export const db = drizzle(sql, { schema });
