import { drizzle } from "drizzle-orm/neon-serverless";
import { sql } from 'drizzle-orm';

const DATABASE_URL = "postgresql://neondb_owner:npg_V3CUqaJl0NSE@ep-wandering-wave-a1cgn8so-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function checkInvoices() {
    const db = drizzle(DATABASE_URL);
    try {
        const res = await db.execute(sql`SELECT * FROM "invoices" WHERE "customerPhone" = '01911304121'`);
        console.log("Invoices for 01911304121:", JSON.stringify(res.rows, null, 2));

        const allServRes = await db.execute(sql`SELECT "serviceId", "customerId" FROM "services" WHERE "customerId" IS NOT NULL`);
        console.log("Services with CustomerID:", JSON.stringify(allServRes.rows, null, 2));

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkInvoices();
