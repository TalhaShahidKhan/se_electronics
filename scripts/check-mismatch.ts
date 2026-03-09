import { drizzle } from "drizzle-orm/neon-serverless";
import { sql } from 'drizzle-orm';

const DATABASE_URL = "postgresql://neondb_owner:npg_V3CUqaJl0NSE@ep-wandering-wave-a1cgn8so-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function checkDataMismatch() {
    const db = drizzle(DATABASE_URL);
    try {
        console.log("--- Customers ---");
        const customersRes = await db.execute(sql`SELECT "customerId", "name", "phone" FROM "customers" LIMIT 10`);
        console.log(JSON.stringify(customersRes, null, 2));

        console.log("\n--- Services with Null CustomerID ---");
        const servicesRes = await db.execute(sql`SELECT "serviceId", "customerName", "customerPhone", "customerId" FROM "services" WHERE "customerId" IS NULL LIMIT 20`);
        console.log(JSON.stringify(servicesRes, null, 2));

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkDataMismatch();
