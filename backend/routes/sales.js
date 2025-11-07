const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const router = express.Router();

const dbPath = path.join(__dirname, '../database/bazar.db');
const db = new Database(dbPath);

router.post('/addSale', (req, res) => {
  try {
    const { product_id, product_title, quantity = 1, total_price } = req.body;

    if (!product_id || !total_price) {
      return res.status(400).json({ 
        success: false, 
        message: 'product_id y total_price son requeridos' 
      });
    }
    
    const sql = `INSERT INTO sales (product_id, product_title, quantity, total_price) VALUES (?, ?, ?, ?)`;
    const stmt = db.prepare(sql);
    const result = stmt.run(product_id, product_title, quantity, total_price);
    
    res.json({ 
      success: true, 
      sale_id: result.lastInsertRowid 
    });
    
  } catch (error) {
    console.error('Error registrando venta:', error);
    res.json({ success: false });
  }
});

router.get('/sales', (req, res) => {
  try {
    const sql = `SELECT * FROM sales ORDER BY sale_date DESC`;
    const rows = db.prepare(sql).all();
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo ventas:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;