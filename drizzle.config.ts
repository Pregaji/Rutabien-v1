import { config } from "dotenv";
config({ path: ".env.local" });
import { defineConfig } from "drizzle-kit";

if (!process.env.DIRECT_DATABASE_URL) {
  throw new Error("DIRECT_DATABASE_URL is missing");
}

export default defineConfig({
  out: "./drizzle",
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DIRECT_DATABASE_URL,
  },
});
