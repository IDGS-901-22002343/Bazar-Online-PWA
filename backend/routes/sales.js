const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();

router.post('/addSale', (req, res) => {
  const { product_id, product_title, quantity = 1, total_price } = req.body;

  if (!product_id || !total_price) {
    return res.status(400).json({ 
      success: false, 
      message: 'product_id y total_price son requeridos' 
    });
  }

  const db = new sqlite3.Database('./database/bazar.db');
  
  const sql = `INSERT INTO sales (product_id, product_title, quantity, total_price) VALUES (?, ?, ?, ?)`;
  
  db.run(sql, [product_id, product_title, quantity, total_price], function(err) {
    db.close();
    
    if (err) {
      console.error('Error registrando venta:', err);
      return res.json({ success: false });
    }
    
    res.json({ 
      success: true, 
      sale_id: this.lastID 
    });
  });
});

router.get('/sales', (req, res) => {
  const db = new sqlite3.Database('./database/bazar.db');
  
  const sql = `SELECT * FROM sales ORDER BY sale_date DESC`;
  
  db.all(sql, [], (err, rows) => {
    db.close();
    
    if (err) {
      console.error('Error obteniendo ventas:', err);
      return res.status(500).json({ error: 'Error interno' });
    }
    
    res.json(rows);
  });
});

module.exports = router;