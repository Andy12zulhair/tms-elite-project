const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'tms_db',
    password: 'admin123',
    port: 5432,
});

// Coordinate boundaries (Around Jakarta)
const LAT_MIN = -6.3000;
const LAT_MAX = -6.1000;
const LNG_MIN = 106.7000;
const LNG_MAX = 106.9000;

// Random movement step
const STEP = 0.001;

async function updateLocations() {
    try {
        const vehicles = await pool.query("SELECT id, current_lat, current_lng FROM vehicles WHERE status != 'maintenance'");

        for (const vehicle of vehicles.rows) {
            let newLat = parseFloat(vehicle.current_lat) + (Math.random() - 0.5) * STEP;
            let newLng = parseFloat(vehicle.current_lng) + (Math.random() - 0.5) * STEP;

            // Keep within bounds (Simple bounce)
            if (newLat < LAT_MIN || newLat > LAT_MAX) newLat = vehicle.current_lat;
            if (newLng < LNG_MIN || newLng > LNG_MAX) newLng = vehicle.current_lng;

            await pool.query(
                "UPDATE vehicles SET current_lat = $1, current_lng = $2 WHERE id = $3",
                [newLat, newLng, vehicle.id]
            );

            console.log(`Vehicle ${vehicle.id} moved to [${newLat.toFixed(4)}, ${newLng.toFixed(4)}]`);
        }
    } catch (err) {
        console.error("Error updating locations:", err.message);
    }
}

console.log("Starting Fleet Simulation... (Press Ctrl+C to stop)");
// Update every 3 seconds
setInterval(updateLocations, 3000);
