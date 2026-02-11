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
        console.log("Adding columns to 'drivers' table...");

        // Add sim_type
        await pool.query("ALTER TABLE drivers ADD COLUMN IF NOT EXISTS sim_type VARCHAR(50);");
        console.log("Added sim_type.");

        // Add total_trips
        await pool.query("ALTER TABLE drivers ADD COLUMN IF NOT EXISTS total_trips INTEGER DEFAULT 0;");
        console.log("Added total_trips.");

        // Add created_at if missing
        await pool.query("ALTER TABLE drivers ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;");
        console.log("Verified created_at.");

        console.log("All columns added successfully!");
    } catch (err) {
        console.error("Error adding columns:", err);
    } finally {
        pool.end();
    }
}

addColumns();
