const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'tms_db',
    password: 'admin123',
    port: 5432,
});

async function createTransactionsTable() {
    try {
        console.log("Creating 'transactions' table...");

        await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        description VARCHAR(255) NOT NULL,
        amount NUMERIC(15, 2) NOT NULL,
        type VARCHAR(20) CHECK (type IN ('Income', 'Expense')),
        category VARCHAR(50),
        status VARCHAR(20) DEFAULT 'Paid',
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Seed some initial data if empty
        const countRes = await pool.query("SELECT COUNT(*) FROM transactions");
        if (parseInt(countRes.rows[0].count) === 0) {
            console.log("Seeding initial finance data...");
            await pool.query(`
        INSERT INTO transactions (description, amount, type, category, status) VALUES
        ('Invoice INV-001 PT Global', 45000000, 'Income', 'Logistics', 'Paid'),
        ('Fuel Refill Truck A', 1500000, 'Expense', 'Fuel', 'Paid'),
        ('Maintenance Truck B', 2500000, 'Expense', 'Maintenance', 'Paid'),
        ('Toll Fees Java Route', 500000, 'Expense', 'Toll', 'Paid'),
        ('Invoice INV-002 PT Maju', 12500000, 'Income', 'Logistics', 'Pending');
      `);
        }

        console.log("Table 'transactions' ready!");
    } catch (err) {
        console.error("Error creating table:", err);
    } finally {
        pool.end();
    }
}

createTransactionsTable();
