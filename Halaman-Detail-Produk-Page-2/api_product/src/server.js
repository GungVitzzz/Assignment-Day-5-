import { app } from "./app.js";
import { pool } from "./config/database.js";
import { env } from "./config/env.js";

const server = app.listen(env.PORT, () => console.log(`Product API listening on ${env.PORT}`));
async function shutdown(signal) {
  console.log(`${signal} received; closing server.`);
  server.close(async () => { await pool.end(); process.exit(0); });
}
process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
