const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'tms_db',
    password: 'admin123',
    port: 5432,
});

async function updateUsersTable() {
    try {
        console.log("Updating 'users' table...");

        // Add username
        await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;");
        console.log("Added username.");

        // Add password
        await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);");
        console.log("Added password.");

        // Seed admin
        const check = await pool.query("SELECT * FROM users WHERE username = 'admin'");
        if (check.rows.length === 0) {
            // Need email if it's NOT NULL? Assuming it might be nullable or we can provide dummy
            // Check if email is nullable? safer to provide dummy
            await pool.query(
                "INSERT INTO users (username, password, role, name, email) VALUES ($1, $2, $3, $4, $5)",
                ['admin', 'admin123', 'admin', 'Administrator', 'admin@example.com']
            );
            console.log("Admin seeded.");
        } else {
            console.log("Admin exists.");
        }

    } catch (err) {
        console.error("Error updating users:", err.message);
    } finally {
        pool.end();
    }
}

updateUsersTable();
