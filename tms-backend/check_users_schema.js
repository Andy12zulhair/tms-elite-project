const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'tms_db',
    password: 'admin123',
    port: 5432,
});

async function checkSchema() {
    try {
        const res = await pool.query("SELECT * FROM users LIMIT 0");
        console.log("COLUMNS:", JSON.stringify(res.fields.map(f => f.name)));
    } catch (err) {
        console.error(err.message);
    } finally {
        pool.end();
    }
}

checkSchema();
