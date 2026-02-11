const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'tms_db',
    password: 'admin123',
    port: 5432,
});

async function checkSchema() {
    try {
        const res = await pool.query("SELECT * FROM shipments LIMIT 0");
        const columns = res.fields.map(f => f.name);
        fs.writeFileSync('schema_output.txt', JSON.stringify(columns, null, 2));
        console.log("Schema written to schema_output.txt");
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

checkSchema();
