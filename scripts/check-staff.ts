import { drizzle } from "drizzle-orm/neon-serverless";
import { sql } from 'drizzle-orm';

const DATABASE_URL = "postgresql://neondb_owner:npg_V3CUqaJl0NSE@ep-wandering-wave-a1cgn8so-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function checkStaff() {
    const db = drizzle(DATABASE_URL);
    try {
        const res = await db.execute(sql`
            SELECT "staffId", "name", "username", "role" 
            FROM "staffs" 
            LIMIT 5
        `);
        const rows = Array.isArray(res) ? res : (res as any).rows || [];
        console.log("Staff Members:");
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkStaff();
