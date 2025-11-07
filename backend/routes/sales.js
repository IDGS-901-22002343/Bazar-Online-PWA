const express = require('express');
const router = express.Router();

router.post('/addSale', (req, res) => {
  try {
    const { product_id, product_title, quantity = 1, total_price } = req.body;

    if (!product_id || !total_price) {
      return res.status(400).json({ 
        success: false, 
        message: 'product_id y total_price son requeridos' 
      });
    }
    
    const sale = {
      id: req.app.get('sales').length + 1,
      product_id,
      product_title,
      quantity,
      total_price,
      sale_date: new Date().toISOString()
    };
    
    req.app.get('sales').push(sale);
    
    res.json({ 
      success: true, 
      sale_id: sale.id 
    });
    
  } catch (error) {
    console.error('Error registrando venta:', error);
    res.json({ success: false });
  }
});

router.get('/sales', (req, res) => {
  try {
    const sales = req.app.get('sales');
    res.json(sales);
  } catch (error) {
    console.error('Error obteniendo ventas:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;