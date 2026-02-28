const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// --- Products API ---

app.get('/api/products', (req, res) => {
    db.all('SELECT * FROM products', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        // Parse harvestDate and lastUpdated back to Date strings/objects if needed, though frontend handles strings
        res.json(rows);
    });
});

app.post('/api/products', (req, res) => {
    const { name, category, quantity, unit, minStock, harvestDate, lastUpdated } = req.body;
    const id = Date.now().toString(); // Use timestamp as simple ID string
    const sql = 'INSERT INTO products (id, name, category, quantity, unit, minStock, harvestDate, lastUpdated) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

    db.run(sql, [id, name, category, quantity, unit, minStock, harvestDate, lastUpdated], function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
            res.status(201).json(row);
        });
    });
});

app.put('/api/products/:id', (req, res) => {
    const { name, category, quantity, unit, minStock, harvestDate, lastUpdated } = req.body;
    const sql = 'UPDATE products SET name = ?, category = ?, quantity = ?, unit = ?, minStock = ?, harvestDate = ?, lastUpdated = ? WHERE id = ?';

    db.run(sql, [name, category, quantity, unit, minStock, harvestDate, lastUpdated, req.params.id], function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
            res.json(row);
        });
    });
});

app.delete('/api/products/:id', (req, res) => {
    db.run('DELETE FROM products WHERE id = ?', req.params.id, function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: 'Deleted', changes: this.changes });
    });
});

// --- Schedules API ---

app.get('/api/schedules', (req, res) => {
    db.all('SELECT * FROM schedules', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/schedules', (req, res) => {
    const { cropName, category, plantingDate, harvestDate, area, estimatedYield, status, notes } = req.body;
    const id = Date.now().toString();
    const sql = 'INSERT INTO schedules (id, cropName, category, plantingDate, harvestDate, area, estimatedYield, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

    db.run(sql, [id, cropName, category, plantingDate, harvestDate, area, estimatedYield, status, notes], function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        db.get('SELECT * FROM schedules WHERE id = ?', [id], (err, row) => {
            res.status(201).json(row);
        });
    });
});

app.put('/api/schedules/:id', (req, res) => {
    const { cropName, category, plantingDate, harvestDate, area, estimatedYield, status, notes } = req.body;
    const sql = 'UPDATE schedules SET cropName = ?, category = ?, plantingDate = ?, harvestDate = ?, area = ?, estimatedYield = ?, status = ?, notes = ? WHERE id = ?';

    db.run(sql, [cropName, category, plantingDate, harvestDate, area, estimatedYield, status, notes, req.params.id], function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        db.get('SELECT * FROM schedules WHERE id = ?', [req.params.id], (err, row) => {
            res.json(row);
        });
    });
});

app.delete('/api/schedules/:id', (req, res) => {
    db.run('DELETE FROM schedules WHERE id = ?', req.params.id, function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: 'Deleted', changes: this.changes });
    });
});

// --- Price History API ---

app.get('/api/price-history', (req, res) => {
    db.all('SELECT * FROM price_history ORDER BY id ASC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        // Parse cropData string back to object
        const formattedRows = rows.map(r => ({
            date: r.date,
            ...JSON.parse(r.cropData)
        }));
        res.json(formattedRows);
    });
});

// --- Activity Logs API ---

app.get('/api/activity-logs', (req, res) => {
    db.all('SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 50', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/activity-logs', (req, res) => {
    const { action, type, itemName, user, timestamp, details } = req.body;
    const id = Date.now().toString();
    const sql = 'INSERT INTO activity_logs (id, action, type, itemName, user, timestamp, details) VALUES (?, ?, ?, ?, ?, ?, ?)';

    db.run(sql, [id, action, type, itemName, user, timestamp, details], function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.status(201).json({ id, action, type, itemName, user, timestamp, details });
    });
});

// --- Start Server ---

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});
