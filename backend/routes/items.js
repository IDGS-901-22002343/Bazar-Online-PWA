const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const searchQuery = req.query.q || '';
    const db = req.db;
    
    console.log(`Búsqueda solicitada: "${searchQuery}"`);
    
    const results = db.searchProducts(searchQuery);
    
    console.log(`Encontrados ${results.length} productos para "${searchQuery}"`);
    
    res.json({
      items: results,
      total: results.length
    });
    
  } catch (error) {
    console.error('Error en búsqueda:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
});

router.get('/:id', (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const db = req.db;
    
    const product = db.getProductById(productId);
    
    if (!product) {
      return res.status(404).json({ 
        error: 'Producto no encontrado',
        productId: productId
      });
    }
    
    res.json(product);
    
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
});

module.exports = router;