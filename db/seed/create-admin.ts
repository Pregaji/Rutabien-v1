import { config } from "dotenv";
config({ path: ".env.local" });
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { hashAdminPassword } from "@/lib/adminAuth";

async function run() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    console.error("Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env.local first.");
    process.exit(1);
  }

  const [existing] = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  if (existing) {
    console.log(`Admin ${email} already exists.`);
    return;
  }

  const passwordHash = await hashAdminPassword(password);
  await db.insert(adminUsers).values({ email, passwordHash });
  console.log(`Created admin user: ${email}`);
}

run().then(() => process.exit(0));
