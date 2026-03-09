import { drizzle } from "drizzle-orm/neon-serverless";
import { sql } from 'drizzle-orm';

const DATABASE_URL = "postgresql://neondb_owner:npg_V3CUqaJl0NSE@ep-wandering-wave-a1cgn8so-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function verify() {
    const db = drizzle(DATABASE_URL);
    try {
        const countRes = await db.execute(sql`SELECT count(*) FROM "customers"`);
        console.log("Total Customers:", countRes.rows[0].count);

        const allRes = await db.execute(sql`SELECT "customerId", "phone", "name" FROM "customers"`);
        console.log("All Customers:", JSON.stringify(allRes.rows, null, 2));

        const phoneSearch = await db.execute(sql`SELECT * FROM "customers" WHERE "phone" = '01911304121'`);
        console.log("Phone Search:", JSON.stringify(phoneSearch.rows, null, 2));

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

verify();
