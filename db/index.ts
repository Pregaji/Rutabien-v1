import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

type DB = ReturnType<typeof drizzle<typeof schema>>;

let _db: DB | null = null;

function getDb(): DB {
  if (_db) return _db;

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing");
  }

  const sql = neon(process.env.DATABASE_URL);
  _db = drizzle(sql, { schema });
  return _db;
}

// Proxy so existing `import { db } from "@/db"` call sites don't need to change.
// The underlying client is only created the first time a property on `db`
// is actually accessed (i.e. the first real query), not at import time.
export const db: DB = new Proxy({} as DB, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});
