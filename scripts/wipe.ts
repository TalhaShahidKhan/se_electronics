import { drizzle } from "drizzle-orm/neon-serverless";
import { sql } from "drizzle-orm";

if (typeof (process as any).loadEnvFile === "function") {
  (process as any).loadEnvFile();
}

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set in .env");
  process.exit(1);
}

const db = drizzle(DATABASE_URL);

async function wipe() {
  console.log("🔥 Starting database wipe...");

  try {
    // Drop all tables in public schema
    await db.execute(sql`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
      END $$;
    `);

    // Drop all enums in public schema
    await db.execute(sql`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT t.typname FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'public' AND t.typtype = 'e') LOOP
          EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.typname) || ' CASCADE';
        END LOOP;
      END $$;
    `);

    console.log("✅ Database wipe completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database wipe failed:", error);
    process.exit(1);
  }
}

wipe();
