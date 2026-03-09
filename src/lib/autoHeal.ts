import { sql } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";
import * as schema from "@/db/schema";

/**
 * Auto-heal database by adding missing columns defined in schema.
 * This is a basic implementation that checks for columns and adds them if missing.
 */
export async function autoHealDatabase(db: any) {
    try {
        console.log("Checking database for missing columns...");

        // Get all tables from schema
        const tables = Object.entries(schema).filter(([key, value]) => {
            return value && typeof value === 'object' && 'id' in (value as any) && (value as any).constructor.name === 'PgTable';
        });

        for (const [tableName, tableObj] of tables) {
            const table = tableObj as any;
            const actualTableName = table[pgTable.Symbol.Name];

            // Get existing columns for this table from postgres system tables
            const columnsResult = await db.execute(sql`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = ${actualTableName}
            `);

            const existingColumns = new Set(columnsResult.map(r => r.column_name));

            // Get columns defined in Drizzle schema
            const schemaColumns = Object.keys(table[pgTable.Symbol.Columns]);

            for (const colName of schemaColumns) {
                if (!existingColumns.has(colName)) {
                    console.log(`Column ${colName} is missing in table ${actualTableName}. Healing...`);

                    const columnDef = table[pgTable.Symbol.Columns][colName];
                    const dataType = columnDef.getSQLType();

                    // Add the column
                    await db.execute(sql.raw(`ALTER TABLE "${actualTableName}" ADD COLUMN IF NOT EXISTS "${colName}" ${dataType}`));
                    console.log(`Successfully added column ${colName} to ${actualTableName}`);
                }
            }
        }

        console.log("Database auto-heal check complete.");
    } catch (error) {
        console.error("Database auto-heal failed:", error);
    }
}
