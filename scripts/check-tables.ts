import { drizzle } from "drizzle-orm/neon-serverless";
import { sql } from 'drizzle-orm';

const DATABASE_URL = "postgresql://neondb_owner:npg_V3CUqaJl0NSE@ep-wandering-wave-a1cgn8so-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function checkTables() {
    const db = drizzle(DATABASE_URL);
    try {
        const tables = ['services', 'applications', 'customers', 'invoices', 'products', 'staffs'];
        for (const table of tables) {
            const res = await db.execute(sql`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = ${table}
            `);
            const rows = Array.isArray(res) ? res : (res as any).rows || [];
            console.log(`Table: ${table} - Columns: ${rows.length}`);
            if (rows.length === 0) {
                console.log(`WARNING: Table ${table} NOT FOUND or EMPTY`);
            }
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkTables();
