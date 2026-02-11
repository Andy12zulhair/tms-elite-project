const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'tms_db',
    password: 'admin123',
    port: 5432,
});

async function createUsersTable() {
    try {
        console.log("Creating 'users' table...");

        await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log("Table 'users' verified.");

        // Check if admin exists
        const res = await pool.query("SELECT * FROM users WHERE username = 'admin'");
        if (res.rows.length === 0) {
            console.log("Seeding default admin account...");
            await pool.query("INSERT INTO users (username, password, role) VALUES ($1, $2, $3)", ['admin', 'admin123', 'admin']);
            console.log("Admin account created.");
        } else {
            console.log("Admin account already exists.");
        }

    } catch (err) {
        console.error("Error creating users table:", err.message); // Print only message
    } finally {
        pool.end();
    }
}

createUsersTable();
