const express = require('express');
const router = express.Router();

router.post('/addSale', (req, res) => {
  try {
    const { product_id, product_title, quantity = 1, total_price } = req.body;
    const db = req.db;

    if (!product_id || !total_price) {
      return res.status(400).json({ 
        success: false, 
        message: 'product_id y total_price son requeridos' 
      });
    }
    
    const sale = db.addSale({
      product_id,
      product_title,
      quantity,
      total_price
    });
    
    console.log(`💰 Venta registrada: ${product_title} - $${total_price}`);
    
    res.json({ 
      success: true, 
      sale_id: sale.id 
    });
    
  } catch (error) {
    console.error('❌ Error registrando venta:', error);
    res.json({ success: false, error: error.message });
  }
});

router.get('/sales', (req, res) => {
  try {
    const db = req.db;
    const sales = db.getAllSales();
    res.json(sales);
  } catch (error) {
    console.error('❌ Error obteniendo ventas:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;