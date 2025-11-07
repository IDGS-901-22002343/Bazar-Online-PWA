const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const itemsRoutes = require('./routes/items');
const salesRoutes = require('./routes/sales');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// BASE DE DATOS EN MEMORIA CON TODOS LOS PRODUCTOS REALES
class MemoryDatabase {
  constructor() {
    this.products = this.loadProducts();
    this.sales = [];
    console.log(`📊 ${this.products.length} productos cargados`);
    console.log(`💰 ${this.sales.length} ventas registradas`);
  }

  loadProducts() {
    try {
      const productsPath = path.join(__dirname, 'data', 'products.json');
      if (fs.existsSync(productsPath)) {
        const rawData = fs.readFileSync(productsPath, 'utf8');
        const data = JSON.parse(rawData);
        const products = data.products || data;
        console.log(`✅ ${products.length} productos REALES cargados desde JSON`);
        return products.map(product => this.normalizeProduct(product));
      }
    } catch (error) {
      console.error('❌ Error cargando productos:', error);
    }

    console.log('⚠️ Usando productos de ejemplo');
    return this.getSampleProducts();
  }

  normalizeProduct(product) {
    return {
      id: product.id,
      title: product.title,
      price: product.price,
      description: product.description,
      category: product.category,
      image: product.image || product.images?.[0] || product.thumbnail || '',
      rating: {
        rate: product.rating || (product.rating && product.rating.rate) || 4.0,
        count: product.rating_count || (product.rating && product.rating.count) || product.reviews?.length || 0
      },
      brand: product.brand || '',
      stock: product.stock || 10,
      discountPercentage: product.discountPercentage || product.discount_percentage || 0,
      tags: product.tags || [],
      sku: product.sku || '',
      weight: product.weight || 0,
      dimensions: product.dimensions || {},
      warrantyInformation: product.warrantyInformation || product.warranty_information || '',
      shippingInformation: product.shippingInformation || product.shipping_information || '',
      availabilityStatus: product.availabilityStatus || product.availability_status || 'in_stock',
      reviews: product.reviews || [],
      returnPolicy: product.returnPolicy || product.return_policy || '',
      minimumOrderQuantity: product.minimumOrderQuantity || product.minimum_order_quantity || 1,
      meta: product.meta || {},
      thumbnail: product.thumbnail || ''
    };
  }

  getSampleProducts() {
    return [
      {
        id: 1,
        title: "Laptop Gamer",
        price: 1299.99,
        description: "Laptop para gaming de alta gama",
        category: "electronica",
        image: "https://via.placeholder.com/150",
        rating: { rate: 4.5, count: 120 },
        brand: "TechBrand",
        stock: 15,
        discountPercentage: 10,
        tags: ["gaming", "laptop", "performance"],
        sku: "LTG001",
        weight: 2.5,
        dimensions: { width: 35, height: 25, depth: 2 },
        warrantyInformation: "2 años",
        shippingInformation: "Envío gratis",
        availabilityStatus: "in_stock",
        reviews: [],
        returnPolicy: "30 días",
        minimumOrderQuantity: 1,
        meta: {},
        thumbnail: "https://via.placeholder.com/50"
      }
    ];
  }

  // Métodos de búsqueda
  searchProducts(query) {
    if (!query.trim()) return this.products;
    
    const searchTerm = query.toLowerCase();
    return this.products.filter(product => 
      product.title.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      product.brand.toLowerCase().includes(searchTerm) ||
      (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
    );
  }

  getProductById(id) {
    return this.products.find(p => p.id === id);
  }

  addSale(saleData) {
    const sale = {
      id: this.sales.length + 1,
      ...saleData,
      sale_date: new Date().toISOString()
    };
    this.sales.push(sale);
    return sale;
  }

  getAllSales() {
    return this.sales;
  }
}

// Inicializar base de datos
const db = new MemoryDatabase();
app.set('db', db);

// Middleware para inyectar db en las rutas
app.use((req, res, next) => {
  req.db = db;
  next();
});

app.use('/api/items', itemsRoutes);
app.use('/api', salesRoutes);

// Ruta de debug para ver todos los productos
app.get('/api/debug/products', (req, res) => {
  const products = req.db.products;
  res.json({
    total_products: products.length,
    categories: [...new Set(products.map(p => p.category))],
    sample_products: products.slice(0, 10).map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      price: p.price,
      brand: p.brand
    }))
  });
});

// Ruta para buscar productos específicos
app.get('/api/debug/search/:query', (req, res) => {
  const query = req.params.query;
  const results = req.db.searchProducts(query);
  res.json({
    query: query,
    results_count: results.length,
    results: results.map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      price: p.price
    }))
  });
});

app.get('/api', (req, res) => {
  res.json({ 
    message: 'API del Bazar Universal funcionando',
    timestamp: new Date().toISOString(),
    status: 'active',
    products_count: req.db.products.length,
    sales_count: req.db.sales.length,
    database: 'MemoryDB',
    search_example: '/api/items?q=laptop'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    server: 'running',
    products_count: req.db.products.length,
    sales_count: req.db.sales.length
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Error del servidor:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📦 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 ${db.products.length} productos cargados en memoria`);
  console.log(`🔍 Ejemplo de búsqueda: http://localhost:${PORT}/api/items?q=mascara`);
});