const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 5000; // Server akan jalan di port 5000

// Agar website React boleh ambil data
app.use(cors());
app.use(express.json());

// Konfigurasi Database (Sesuaikan password jika beda)
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'tms_db',
  password: 'admin123', // Password yang tadi kita buat
  port: 5432,
});

// === API ENDPOINTS (Pintu Masuk Data) ===

// 0. Test Route (Cek apakah server jalan)
app.get('/', (req, res) => {
  res.send('Backend TMS is running! 🚀');
});

// 1. Ambil Statistik Dashboard (Untuk Kotak-kotak Angka)
app.get('/api/dashboard', async (req, res) => {
  try {
    const activeShipments = await pool.query("SELECT COUNT(*) FROM shipments WHERE status = 'active'");
    const availableFleet = await pool.query("SELECT COUNT(*) FROM vehicles WHERE status = 'available'");
    const maintenance = await pool.query("SELECT COUNT(*) FROM vehicles WHERE status = 'maintenance'");
    const pendingOrders = await pool.query("SELECT COUNT(*) FROM shipments WHERE status = 'pending'");

    res.json({
      active_shipments: activeShipments.rows[0].count,
      available_fleet: availableFleet.rows[0].count,
      under_maintenance: maintenance.rows[0].count,
      pending_orders: pendingOrders.rows[0].count
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 1.5 Ambil Data Grafik Performance (Running 7 Hari Terakhir)
app.get('/api/dashboard/performance', async (req, res) => {
  try {
    const query = `
      SELECT 
        TO_CHAR(created_at, 'Dy') AS name, 
        COUNT(*) AS shipments
      FROM shipments 
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY TO_CHAR(created_at, 'Dy'), DATE(created_at)
      ORDER BY DATE(created_at) ASC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 2. Ambil Lokasi Kendaraan (Untuk Peta)
app.get('/api/vehicles', async (req, res) => {
  try {
    const query = `
      SELECT 
        id, 
        plat_nomor AS plat_no, 
        type, 
        capacity_kg, 
        status, 
        current_lat AS latitude, 
        current_lng AS longitude, 
        last_updated 
      FROM vehicles
    `;
    const allVehicles = await pool.query(query);
    res.json(allVehicles.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 3. Tambah Kendaraan Baru
app.post('/api/vehicles', async (req, res) => {
  try {
    const { plat_no, type, capacity_kg, status, latitude, longitude } = req.body;
    const newVehicle = await pool.query(
      "INSERT INTO vehicles (plat_nomor, type, capacity_kg, status, current_lat, current_lng) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [plat_no, type, capacity_kg, status, latitude, longitude]
    );
    res.json(newVehicle.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 4. Update Kendaraan
app.put('/api/vehicles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { plat_no, type, capacity_kg, status, latitude, longitude } = req.body;
    const updateVehicle = await pool.query(
      "UPDATE vehicles SET plat_nomor = $1, type = $2, capacity_kg = $3, status = $4, current_lat = $5, current_lng = $6 WHERE id = $7 RETURNING *",
      [plat_no, type, capacity_kg, status, latitude, longitude, id]
    );
    res.json(updateVehicle.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 5. Hapus Kendaraan
app.delete('/api/vehicles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM vehicles WHERE id = $1", [id]);
    res.json({ message: "Vehicle deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// === SHIPMENT ENDPOINTS ===

// 6. Ambil Semua Shipment
app.get('/api/shipments', async (req, res) => {
  try {
    const allShipments = await pool.query("SELECT * FROM shipments ORDER BY id DESC");
    res.json(allShipments.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 7. Tambah Shipment Baru
app.post('/api/shipments', async (req, res) => {
  try {
    const { item_detail, origin, destination, status, customer_name, description } = req.body;
    const newShipment = await pool.query(
      "INSERT INTO shipments (item_detail, origin, destination, status, customer_name, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [item_detail, origin, destination, status, customer_name, description]
    );
    res.json(newShipment.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error: Gagal menambah shipment");
  }
});

// === DRIVER ENDPOINTS ===

// 10. Ambil Semua Driver
app.get('/api/drivers', async (req, res) => {
  try {
    const allDrivers = await pool.query("SELECT * FROM drivers ORDER BY id DESC");
    res.json(allDrivers.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 11. Tambah Driver Baru
app.post('/api/drivers', async (req, res) => {
  try {
    const { name, sim_type, status, phone } = req.body;
    const newDriver = await pool.query(
      "INSERT INTO drivers (name, sim_type, status, phone, rating, total_trips) VALUES ($1, $2, $3, $4, 5.0, 0) RETURNING *",
      [name, sim_type, status, phone]
    );
    res.json(newDriver.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error: Gagal menambah driver");
  }
});

// 12. Hapus Driver
app.delete('/api/drivers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM drivers WHERE id = $1", [id]);
    res.json({ message: "Driver deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// === FINANCE ENDPOINTS ===

// 13. Ambil Semua Transaksi
app.get('/api/finance', async (req, res) => {
  try {
    const allTransactions = await pool.query("SELECT * FROM transactions ORDER BY date DESC");
    res.json(allTransactions.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 14. Tambah Transaksi Baru
app.post('/api/finance', async (req, res) => {
  try {
    const { description, amount, type, category, status } = req.body;
    const newTransaction = await pool.query(
      "INSERT INTO transactions (description, amount, type, category, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [description, amount, type, category, status]
    );
    res.json(newTransaction.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error: Gagal menambah transaksi");
  }
});

// 15. Hapus Transaksi
app.delete('/api/finance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM transactions WHERE id = $1", [id]);
    res.json({ message: "Transaction deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// === AUTHENTICATION ===

// 16. Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Cari user berdasarkan username
    const user = await pool.query("SELECT * FROM users WHERE username = $1", [username]);

    if (user.rows.length === 0) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    // Cek password (Biasa) - Production harus pakai bcrypt!
    if (password !== user.rows[0].password) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    // Login Sukses
    res.json({
      message: "Login Successful",
      user: {
        id: user.rows[0].id,
        username: user.rows[0].username,
        role: user.rows[0].role,
        name: user.rows[0].name,
        email: user.rows[0].email
      }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 17. Update User Profile
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    // Build dynamic query
    let query = "UPDATE users SET name = $1, email = $2";
    let values = [name, email];
    let counter = 3;

    if (password) {
      query += `, password = $${counter}`;
      values.push(password);
      counter++;
    }

    query += ` WHERE id = $${counter} RETURNING id, username, name, email, role`;
    values.push(id);

    const updatedUser = await pool.query(query, values);
    res.json(updatedUser.rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 8. Update Status Shipment
app.put('/api/shipments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updateShipment = await pool.query(
      "UPDATE shipments SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );
    res.json(updateShipment.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 9. Hapus Shipment
app.delete('/api/shipments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM shipments WHERE id = $1", [id]);
    res.json({ message: "Shipment deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server Backend berjalan di http://localhost:${port}`);
});