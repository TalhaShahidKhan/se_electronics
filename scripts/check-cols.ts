import { drizzle } from "drizzle-orm/neon-serverless";
import { sql } from 'drizzle-orm';
import { getTableConfig } from 'drizzle-orm/pg-core';
import { services } from '../src/db/schema';

const DATABASE_URL = "postgresql://neondb_owner:npg_V3CUqaJl0NSE@ep-wandering-wave-a1cgn8so-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function checkCols() {
    const db = drizzle(DATABASE_URL);
    try {
        console.log("Querying information_schema...");
        const dbColsRes = await db.execute(sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'services'
        `);

        console.log("Result type:", typeof dbColsRes);
        console.log("Is array:", Array.isArray(dbColsRes));

        const rows = Array.isArray(dbColsRes) ? dbColsRes : (dbColsRes as any).rows || [];
        console.log("Found rows:", rows.length);

        const dbCols = new Set(rows.map((r: any) => r.column_name));

        const { columns } = getTableConfig(services);
        const schemaCols = columns.map(c => c.name);

        console.log("Schema columns total:", schemaCols.length);

        const missing = schemaCols.filter(c => !dbCols.has(c));
        console.log("Missing columns:", JSON.stringify(missing, null, 2));

        if (missing.length > 0) {
            console.log("\nAttempting to heal table by adding missing columns...");
            for (const colName of missing) {
                const col = columns.find(c => c.name === colName);
                if (col) {
                    const type = col.getSQLType();
                    console.log(`Adding column: ${colName} of type ${type}`);
                    try {
                        const query = `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "${colName}" ${type}`;
                        await db.execute(sql.raw(query));
                        console.log(`Success: ${colName}`);
                    } catch (err) {
                        console.error(`Failed to add ${colName}:`, err);
                    }
                }
            }
        } else {
            console.log("No missing columns found.");
        }

        console.log("Check complete.");
        process.exit(0);
    } catch (e) {
        console.error("Script failed:", e);
        process.exit(1);
    }
}

checkCols();
