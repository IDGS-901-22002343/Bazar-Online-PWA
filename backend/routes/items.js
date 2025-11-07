const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const router = express.Router();

const dbPath = path.join(__dirname, '../database/bazar.db');
const db = new Database(dbPath);

router.get('/', (req, res) => {
  try {
    const searchQuery = req.query.q || '';
    
    if (!searchQuery.trim()) {
      return res.json({ items: [], total: 0 });
    }
    
    const sql = `SELECT * FROM products WHERE title LIKE ? OR description LIKE ? OR category LIKE ? OR brand LIKE ?`;
    const searchPattern = `%${searchQuery}%`;
    
    const rows = db.prepare(sql).all(searchPattern, searchPattern, searchPattern, searchPattern);
    
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
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    const sql = `SELECT * FROM products WHERE id = ?`;
    const product = db.prepare(sql).get(productId);
    
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
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;