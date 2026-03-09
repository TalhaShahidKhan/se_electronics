import { drizzle } from "drizzle-orm/neon-serverless";
import { sql } from 'drizzle-orm';

const DATABASE_URL = "postgresql://neondb_owner:npg_V3CUqaJl0NSE@ep-wandering-wave-a1cgn8so-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function checkServices() {
    const db = drizzle(DATABASE_URL);
    try {
        const res = await db.execute(sql`
            SELECT "serviceId", "customerName", "customerId", "isActive", "type", "createdAt" 
            FROM "services" 
            ORDER BY "createdAt" DESC 
            LIMIT 5
        `);
        const rows = Array.isArray(res) ? res : (res as any).rows || [];
        console.log("Recent Services:");
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkServices();
