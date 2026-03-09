import { drizzle } from "drizzle-orm/neon-serverless";
import { sql } from 'drizzle-orm';

const DATABASE_URL = "postgresql://neondb_owner:npg_V3CUqaJl0NSE@ep-wandering-wave-a1cgn8so-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function checkSpecificId() {
    const db = drizzle(DATABASE_URL);
    try {
        const res = await db.execute(sql`SELECT * FROM "customers" WHERE "customerId" = 'CID98P0K0X'`);
        console.log("Search for CID98P0K0X:", JSON.stringify(res.rows, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkSpecificId();
