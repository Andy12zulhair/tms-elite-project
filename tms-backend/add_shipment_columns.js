const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'tms_db',
    password: 'admin123',
    port: 5432,
});

async function addColumns() {
    try {
        console.log("Adding columns to 'shipments' table...");

        // Add item_detail
        await pool.query("ALTER TABLE shipments ADD COLUMN IF NOT EXISTS item_detail VARCHAR(255);");
        console.log("Added item_detail.");

        // Add customer_name
        await pool.query("ALTER TABLE shipments ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);");
        console.log("Added customer_name.");

        // Add description
        await pool.query("ALTER TABLE shipments ADD COLUMN IF NOT EXISTS description TEXT;");
        console.log("Added description.");

        console.log("All columns added successfully!");
    } catch (err) {
        console.error("Error adding columns:", err);
    } finally {
        pool.end();
    }
}

addColumns();
