const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const searchQuery = req.query.q || '';
    
    if (!searchQuery.trim()) {
      return res.json({ items: [], total: 0 });
    }
    
    const db = new sqlite3.Database('./database/bazar.db');
    
    const sql = `SELECT * FROM products WHERE title LIKE ? OR description LIKE ? OR category LIKE ? OR brand LIKE ?`;
    const searchPattern = `%${searchQuery}%`;
    
    db.all(sql, [searchPattern, searchPattern, searchPattern, searchPattern], (err, rows) => {
      db.close();
      
      if (err) {
        console.error('Error buscando:', err);
        return res.status(500).json({ error: 'Error en la búsqueda' });
      }
      
      const formattedProducts = rows.map(product => ({
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
      }));
      
      res.json({
        items: formattedProducts,
        total: formattedProducts.length
      });
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    const db = new sqlite3.Database('./database/bazar.db');
    
    const sql = `SELECT * FROM products WHERE id = ?`;
    
    db.get(sql, [productId], (err, product) => {
      db.close();
      
      if (err) {
        console.error('Error obteniendo producto:', err);
        return res.status(500).json({ error: 'Error interno' });
      }
      
      if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      
      const productDetail = {
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
      
      res.json(productDetail);
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;