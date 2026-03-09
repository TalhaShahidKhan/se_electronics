import * as schema from "@/db/schema";
import { drizzle } from "drizzle-orm/neon-serverless";
import { autoHealDatabase } from "@/lib/autoHeal";

export const db = drizzle(process.env.DATABASE_URL!, { schema })

// Run auto-heal on initialization (non-blocking) in development
// if (process.env.NODE_ENV === 'development') {
//     autoHealDatabase(db).catch(err => console.error("Database auto-heal on init failed", err));
// }