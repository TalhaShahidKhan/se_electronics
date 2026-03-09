import { drizzle } from "drizzle-orm/neon-serverless";
import { sql } from 'drizzle-orm';

const DATABASE_URL = "postgresql://neondb_owner:npg_V3CUqaJl0NSE@ep-wandering-wave-a1cgn8so-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function fixLinks() {
    const db = drizzle(DATABASE_URL);
    try {
        const phone = "01911304121";
        const customerId = "CID98P0K0X";

        console.log(`Linking services for phone ${phone} to customerId ${customerId}...`);

        const res = await db.execute(sql`
            UPDATE "services" 
            SET "customerId" = ${customerId} 
            WHERE "customerPhone" = ${phone} 
            AND "customerId" IS NULL
        `);

        console.log("Update successful.");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

fixLinks();
