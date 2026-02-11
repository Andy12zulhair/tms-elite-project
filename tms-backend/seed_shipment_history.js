const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'tms_db',
    password: 'admin123',
    port: 5432,
});

const ITEMS = ['Electronics', 'Furniture', 'Textiles', 'Auto Parts', 'Chemicals', 'Food Stuffs', 'Raw Materials'];
const CITIES = ['Jakarta', 'Bandung', 'Surabaya', 'Semarang', 'Yogyakarta', 'Bogor', 'Depok', 'Tangerang', 'Bekasi'];
const STATUSES = ['delivered', 'delivered', 'delivered', 'active', 'pending', 'cancelled']; // Weighted towards delivered

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seedHistory() {
    try {
        console.log("Seeding shipment history for the last 7 days...");

        // Clear existing shipments to avoid clutter (Optional, but good for clean chart)
        // await pool.query("TRUNCATE shipments RESTART IDENTITY CASCADE"); 

        const today = new Date();
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 7);

        for (let i = 0; i < 50; i++) { // Add 50 random shipments
            const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
            const origin = CITIES[Math.floor(Math.random() * CITIES.length)];
            const destination = CITIES[Math.floor(Math.random() * CITIES.length)];
            const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
            const createdAt = randomDate(lastWeek, today);

            await pool.query(
                "INSERT INTO shipments (item_detail, origin, destination, status, created_at, customer_name, description) VALUES ($1, $2, $3, $4, $5, $6, $7)",
                [item, origin, destination, status, createdAt, 'Historical Customer', 'Auto-seeded for analytics']
            );
        }

        console.log("Seeding complete. Added 50 shipments.");

    } catch (err) {
        console.error("Error seeding:", err.message);
    } finally {
        pool.end();
    }
}

seedHistory();
