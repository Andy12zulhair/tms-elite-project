const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'tms_db',
    password: 'admin123',
    port: 5432,
});

async function createDriverTable() {
    try {
        console.log("Creating 'drivers' table...");

        await pool.query(`
      CREATE TABLE IF NOT EXISTS drivers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        sim_type VARCHAR(50),
        status VARCHAR(50) DEFAULT 'Active',
        phone VARCHAR(50),
        rating DECIMAL(3, 1) DEFAULT 5.0,
        total_trips INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        console.log("Table 'drivers' verified/created successfully!");
    } catch (err) {
        console.error("Error creating table:", err);
    } finally {
        pool.end();
    }
}

createDriverTable();
