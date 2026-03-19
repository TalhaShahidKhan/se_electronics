import * as schema from "@/db/schema";
import { drizzle } from "drizzle-orm/neon-serverless";

const connectionString = process.env.DATABASE_URL!;



const createDB = () => drizzle(connectionString, { schema });

const globalForDrizzle = globalThis as unknown as {
  db: ReturnType<typeof createDB> | undefined;
};

export const db = globalForDrizzle.db ?? createDB();

if (process.env.NODE_ENV !== "production") globalForDrizzle.db = db;