import { readdir, readFile } from "node:fs/promises";
import { pool } from "../src/config/database.js";

const migrationDirectory = new URL("../migrations/", import.meta.url);
const files = (await readdir(migrationDirectory)).filter((file) => file.endsWith(".sql")).sort();
await pool.query("CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())");
for (const file of files) {
  const applied = await pool.query("SELECT 1 FROM schema_migrations WHERE name = $1", [file]);
  if (applied.rowCount) continue;
  const sql = await readFile(new URL(file, migrationDirectory), "utf8");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
    await client.query("COMMIT");
    console.log(`Applied ${file}`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally { client.release(); }
}
await pool.end();
