const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const app = express();
const port = 5000;

// Agar website React boleh ambil data
app.use(cors());
app.use(express.json());

// Konfigurasi Database
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'tms_db',
  password: 'admin123',
  port: 5432,
});

// === WHATSAPP CONFIGURATION ===
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  }
});

let qrCodeData = null;
let isClientReady = false;

client.on('qr', (qr) => {
  console.log('QR RECEIVED', qr);
  // Generate QR as Data URL
  qrcode.toDataURL(qr, (err, url) => {
    if (err) {
      console.error('Error generating QR', err);
      return;
    }
    qrCodeData = url;
  });
});

client.on('ready', () => {
  console.log('WhatsApp Client is ready!');
  isClientReady = true;
  qrCodeData = null; // Clear QR after connected
});

client.on('authenticated', () => {
  console.log('WhatsApp Authenticated');
});

client.on('auth_failure', msg => {
  console.error('AUTHENTICATION FAILURE', msg);
});

client.initialize();

// === WA ENDPOINTS ===

// Get QR Code
app.get('/api/whatsapp/qr', (req, res) => {
  if (isClientReady) {
    res.json({ status: 'connected', qr: null });
  } else if (qrCodeData) {
    res.json({ status: 'scanning', qr: qrCodeData });
  } else {
    res.json({ status: 'loading', qr: null });
  }
});

// Send Message Function
const sendWhatsAppMessage = async (number, message) => {
  if (!isClientReady) return false;

  // Format number: remove 0 or +62, add 62, append @c.us
  let formattedNumber = number.replace(/\D/g, '');
  if (formattedNumber.startsWith('0')) {
    formattedNumber = '62' + formattedNumber.slice(1);
  } else if (!formattedNumber.startsWith('62')) {
    formattedNumber = '62' + formattedNumber; // Default to ID
  }
  formattedNumber += '@c.us';

  try {
    await client.sendMessage(formattedNumber, message);
    console.log(`Message sent to ${number}`);
    return true;
  } catch (err) {
    console.error(`Failed to send message to ${number}`, err);
    return false;
  }
};

// === API ENDPOINTS ===



// 1. Ambil Statistik Dashboard
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

// 1.5 Ambil Data Grafik Performance
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

// 2. Ambil Lokasi Kendaraan
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

    // Notify if status isn't Pending (rare case, but possible)
    if (status !== 'Pending') {
      // Dummy number for demo. In real app, we'd have a 'customer_phone' column
      const dummyPhone = 'sender_or_admin_number_here';
      const msg = `TMS Update: New shipment created for ${customer_name}. Status: ${status}.\nItem: ${item_detail}\nRoute: ${origin} -> ${destination}`;
      // await sendWhatsAppMessage(dummyPhone, msg);
    }

    res.json(newShipment.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error: Gagal menambah shipment");
  }
});

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
    const user = await pool.query("SELECT * FROM users WHERE username = $1", [username]);

    if (user.rows.length === 0) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    if (password !== user.rows[0].password) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

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

    // Get shipment info first for notifiction
    const shipmentInfo = await pool.query("SELECT * FROM shipments WHERE id = $1", [id]);
    const customer = shipmentInfo.rows[0].customer_name;
    const item = shipmentInfo.rows[0].item_detail;

    const updateShipment = await pool.query(
      "UPDATE shipments SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    // Kirim Notifikasi WA jika status berubah
    if (isClientReady) {
      // NOTE: In production, use customer's real phone number from DB.
      // Here we send to a default admin/test number or simulate log
      const message = `Halo ${customer}, status paket anda '${item}' telah berubah menjadi: *${status}*. Terima kasih telah menggunakan TMS Elite.`;

      // GANTI NOMOR INI DENGAN NOMOR WA ANDA UNTUK TESTING (Format: 628xxx)
      // Contoh: sendWhatsAppMessage('628123456789', message);
      console.log(`[WA SIMULATION] Sending to ${customer}: ${message}`);
    }

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

// Serve static files from the React app
const path = require('path');
app.use(express.static(path.join(__dirname, '../tms-frontend/dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../tms-frontend/dist/index.html'));
});

app.listen(port, () => {
  console.log(`Server Backend berjalan di http://localhost:${port}`);
});