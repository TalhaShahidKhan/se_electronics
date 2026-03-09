import { drizzle } from "drizzle-orm/neon-serverless";
import { sql } from 'drizzle-orm';

const DATABASE_URL = "postgresql://neondb_owner:npg_V3CUqaJl0NSE@ep-wandering-wave-a1cgn8so-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function listCustomers() {
    const db = drizzle(DATABASE_URL);
    try {
        const res = await db.execute(sql`SELECT "customerId", "name", "phone" FROM "customers"`);
        console.log(JSON.stringify(res, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

listCustomers();
