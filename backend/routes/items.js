const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const searchQuery = req.query.q || '';
    const products = req.app.get('products');
    
    if (!searchQuery.trim()) {
      return res.json({ items: products, total: products.length });
    }
    
    const filteredProducts = products.filter(product => 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    res.json({
      items: filteredProducts,
      total: filteredProducts.length
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const products = req.app.get('products');
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json(product);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;