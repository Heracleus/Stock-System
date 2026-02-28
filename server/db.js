const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.serialize(() => {
            // Create products table
            db.run(`CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit TEXT NOT NULL,
        minStock INTEGER NOT NULL,
        harvestDate TEXT,
        lastUpdated TEXT NOT NULL
      )`);

            // Create schedules table
            db.run(`CREATE TABLE IF NOT EXISTS schedules (
        id TEXT PRIMARY KEY,
        cropName TEXT NOT NULL,
        category TEXT NOT NULL,
        plantingDate TEXT NOT NULL,
        harvestDate TEXT NOT NULL,
        area REAL NOT NULL,
        estimatedYield REAL,
        status TEXT NOT NULL,
        notes TEXT
      )`);

            // Create price_history table
            db.run(`CREATE TABLE IF NOT EXISTS price_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        cropData TEXT NOT NULL
      )`);

            // Create activity_logs table
            db.run(`CREATE TABLE IF NOT EXISTS activity_logs (
        id TEXT PRIMARY KEY,
        action TEXT NOT NULL,
        type TEXT NOT NULL,
        itemName TEXT NOT NULL,
        user TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        details TEXT NOT NULL
      )`);

            // Seed Initial Data (only if tables are empty)
            db.get('SELECT count(*) as count FROM products', (err, row) => {
                if (err) {
                    console.error(err.message);
                    return;
                }
                if (row.count === 0) {
                    const initialProducts = [
                        { id: "1", name: "ข้าวหอมมะลิ", category: "ข้าว", quantity: 1500, unit: "กิโลกรัม", minStock: 200, harvestDate: "2026-10-30T00:00:00.000Z", lastUpdated: "2026-02-20T00:00:00.000Z" },
                        { id: "2", name: "มะม่วงน้ำดอกไม้", category: "ผลไม้", quantity: 85, unit: "กิโลกรัม", minStock: 30, harvestDate: "2026-03-31T00:00:00.000Z", lastUpdated: "2026-02-23T00:00:00.000Z" },
                        { id: "3", name: "ผักกาดหอม", category: "ผักสด", quantity: 45, unit: "กิโลกรัม", minStock: 20, harvestDate: "2026-02-15T00:00:00.000Z", lastUpdated: "2026-02-23T00:00:00.000Z" },
                        { id: "4", name: "มะเขือเทศ", category: "ผักสด", quantity: 120, unit: "กิโลกรัม", minStock: 40, harvestDate: "2026-03-25T00:00:00.000Z", lastUpdated: "2026-02-22T00:00:00.000Z" },
                        { id: "5", name: "กล้วยหอม", category: "ผลไม้", quantity: 180, unit: "หวี", minStock: 50, harvestDate: "2026-02-10T00:00:00.000Z", lastUpdated: "2026-02-21T00:00:00.000Z" },
                        { id: "6", name: "มันฝรั่ง", category: "พืชผล", quantity: 350, unit: "กิโลกรัม", minStock: 100, harvestDate: "2026-03-01T00:00:00.000Z", lastUpdated: "2026-02-19T00:00:00.000Z" }
                    ];

                    const insertProduct = db.prepare('INSERT INTO products (id, name, category, quantity, unit, minStock, harvestDate, lastUpdated) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
                    initialProducts.forEach(p => {
                        insertProduct.run([p.id, p.name, p.category, p.quantity, p.unit, p.minStock, p.harvestDate, p.lastUpdated]);
                    });
                    insertProduct.finalize();
                    console.log('Seed products data.');
                }
            });

            db.get('SELECT count(*) as count FROM schedules', (err, row) => {
                if (err) return;
                if (row.count === 0) {
                    const initialSchedules = [
                        { id: "1", cropName: "ข้าวหอมมะลิ", category: "ข้าว", plantingDate: "2026-05-01T00:00:00.000Z", harvestDate: "2026-09-30T00:00:00.000Z", area: 10, estimatedYield: 5000, status: "planned", notes: "เตรียมพื้นที่และปรับสภาพดินให้พร้อม" },
                        { id: "2", cropName: "มะม่วงน้ำดอกไม้", category: "ผลไม้", plantingDate: "2026-01-15T00:00:00.000Z", harvestDate: "2026-04-30T00:00:00.000Z", area: 5, estimatedYield: 800, status: "planted", notes: "ดูแลรักษาและให้น้ำสม่ำเสมอ" },
                        { id: "3", cropName: "ผักกาดหอม", category: "ผักสด", plantingDate: "2026-01-10T00:00:00.000Z", harvestDate: "2026-02-20T00:00:00.000Z", area: 2, estimatedYield: 300, status: "harvested", notes: "เก็บเกี่ยวเสร็จแล้ว คุณภาพดี" }
                    ];
                    const insertSchedule = db.prepare('INSERT INTO schedules (id, cropName, category, plantingDate, harvestDate, area, estimatedYield, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
                    initialSchedules.forEach(s => {
                        insertSchedule.run([s.id, s.cropName, s.category, s.plantingDate, s.harvestDate, s.area, s.estimatedYield, s.status, s.notes]);
                    });
                    insertSchedule.finalize();
                    console.log('Seed schedules data.');
                }
            });

            db.get('SELECT count(*) as count FROM price_history', (err, row) => {
                if (err) return;
                if (row.count === 0) {
                    const initialPriceHistory = [
                        { date: "2026-01", data: { "ข้าวหอมมะลิ": 25, "มะม่วงน้ำดอกไม้": 55, "ผักกาดหอม": 32, "มะเขือเทศ": 18, "กล้วยหอม": 22 } },
                        { date: "2026-02", data: { "ข้าวหอมมะลิ": 26, "มะม่วงน้ำดอกไม้": 60, "ผักกาดหอม": 35, "มะเขือเทศ": 20, "กล้วยหอม": 25 } },
                        { date: "2026-03", data: { "ข้าวหอมมะลิ": 24, "มะม่วงน้ำดอกไม้": 65, "ผักกาดหอม": 30, "มะเขือเทศ": 22, "กล้วยหอม": 28 } },
                    ];
                    const insertPrice = db.prepare('INSERT INTO price_history (date, cropData) VALUES (?, ?)');
                    initialPriceHistory.forEach(ph => {
                        insertPrice.run([ph.date, JSON.stringify(ph.data)]);
                    });
                    insertPrice.finalize();
                    console.log('Seed price history data.');
                }
            });

        });
    }
});

module.exports = db;
