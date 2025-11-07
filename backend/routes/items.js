const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const searchQuery = req.query.q || '';
    const db = req.db;
    
    console.log(`🔍 Búsqueda: "${searchQuery}"`);
    
    if (!searchQuery.trim()) {
      const products = db.prepare('SELECT * FROM products LIMIT 50').all();
      return res.json({ 
        items: products.map(formatProduct),
        total: products.length 
      });
    }
    
    const sql = `SELECT * FROM products 
                WHERE title LIKE ? OR description LIKE ? OR category LIKE ? OR brand LIKE ? 
                LIMIT 50`;
    const searchPattern = `%${searchQuery}%`;
    
    const rows = db.prepare(sql).all(searchPattern, searchPattern, searchPattern, searchPattern);
    
    console.log(`✅ Encontrados ${rows.length} productos para "${searchQuery}"`);
    
    res.json({
      items: rows.map(formatProduct),
      total: rows.length
    });
    
  } catch (error) {
    console.error('❌ Error en búsqueda:', error);
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
    
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json(formatProduct(product));
    
  } catch (error) {
    console.error('❌ Error obteniendo producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Función para formatear producto
function formatProduct(product) {
  return {
    id: product.id,
    title: product.title,
    price: product.price,
    description: product.description,
    category: product.category,
    image: product.image,
    rating: {
      rate: product.rating_rate,
      count: product.rating_count
    },
    brand: product.brand,
    stock: product.stock,
    discountPercentage: product.discount_percentage,
    tags: JSON.parse(product.tags || '[]'),
    sku: product.sku,
    weight: product.weight,
    dimensions: JSON.parse(product.dimensions || '{}'),
    warrantyInformation: product.warranty_information,
    shippingInformation: product.shipping_information,
    availabilityStatus: product.availability_status,
    reviews: JSON.parse(product.reviews || '[]'),
    returnPolicy: product.return_policy,
    minimumOrderQuantity: product.minimum_order_quantity,
    meta: JSON.parse(product.meta || '{}'),
    thumbnail: product.thumbnail
  };
}

module.exports = router;