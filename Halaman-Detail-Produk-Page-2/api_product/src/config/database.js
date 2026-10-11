import pg from "pg";
import { env } from "./env.js";

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: env.DATABASE_POOL_MAX,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 5_000,
  ssl: env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
});

pool.on("error", (error) => console.error("Unexpected PostgreSQL pool error", error));
