const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const itemsRoutes = require('./routes/items');
const salesRoutes = require('./routes/sales');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS para producción
app.use(cors({
  origin: true, // Permite todos los orígenes en producción
  credentials: true
}));

app.use(bodyParser.json());

// SERVIR ARCHIVOS ESTÁTICOS DEL FRONTEND - CORREGIDO
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// API Routes
app.use('/api/items', itemsRoutes);
app.use('/api', salesRoutes);

app.get('/api', (req, res) => {
  res.json({ 
    message: 'API del Bazar Universal funcionando',
    timestamp: new Date().toISOString(),
    status: 'active'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', server: 'running' });
});

const initDatabase = () => {
  const db = new sqlite3.Database('./database/bazar.db');
  
  db.serialize(() => {
    // Tabla de productos COMPLETA
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      category TEXT,
      image TEXT,
      rating_rate REAL,
      rating_count INTEGER,
      brand TEXT,
      stock INTEGER,
      discount_percentage REAL,
      tags TEXT,
      sku TEXT,
      weight REAL,
      dimensions TEXT,
      warranty_information TEXT,
      shipping_information TEXT,
      availability_status TEXT,
      reviews TEXT,
      return_policy TEXT,
      minimum_order_quantity INTEGER,
      meta TEXT,
      thumbnail TEXT
    )`, (err) => {
      if (err) {
        console.error('Error creando tabla products:', err);
        return;
      }
      console.log('Tabla products creada');
    });
    
    // Tabla de ventas
    db.run(`CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      product_title TEXT,
      quantity INTEGER DEFAULT 1,
      total_price REAL,
      sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products (id)
    )`, (err) => {
      if (err) {
        console.error('Error creando tabla sales:', err);
        return;
      }
      console.log('Tabla sales creada');
    });
    
    // Verificar y cargar productos
    db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
      if (err) {
        console.error('Error contando productos:', err);
        db.close();
        return;
      }
      
      if (row.count === 0) {
        console.log('Cargando productos desde JSON...');
        
        try {
          const productsData = require('./data/products.json').products;
          const stmt = db.prepare(`INSERT INTO products 
            (id, title, price, description, category, image, rating_rate, rating_count, 
             brand, stock, discount_percentage, tags, sku, weight, dimensions,
             warranty_information, shipping_information, availability_status, reviews,
             return_policy, minimum_order_quantity, meta, thumbnail) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
          
          let loadedCount = 0;
          
          productsData.forEach(product => {
            const imageUrl = product.image || product.images?.[0] || product.thumbnail;
            const ratingCount = product.rating_count || product.reviews?.length || 50;
            const tags = product.tags ? JSON.stringify(product.tags) : '[]';
            const dimensions = product.dimensions ? JSON.stringify(product.dimensions) : '{}';
            const reviews = product.reviews ? JSON.stringify(product.reviews) : '[]';
            const meta = product.meta ? JSON.stringify(product.meta) : '{}';
            
            stmt.run([
              product.id,
              product.title,
              product.price,
              product.description,
              product.category,
              imageUrl,
              product.rating || 4.0,
              ratingCount,
              product.brand || 'Generic',
              product.stock || 10,
              product.discountPercentage || 0,
              tags,
              product.sku || '',
              product.weight || 0,
              dimensions,
              product.warrantyInformation || '',
              product.shippingInformation || '',
              product.availabilityStatus || '',
              reviews,
              product.returnPolicy || '',
              product.minimumOrderQuantity || 1,
              meta,
              product.thumbnail || ''
            ], (err) => {
              if (err && !err.message.includes('UNIQUE')) {
                console.error('Error insertando:', product.title, err.message);
              } else {
                loadedCount++;
              }
            });
          });
          
          stmt.finalize(() => {
            console.log(`Productos cargados: ${loadedCount}`);
            db.close();
          });
          
        } catch (error) {
          console.error('Error cargando JSON:', error);
          db.close();
        }
        
      } else {
        console.log(`Base de datos lista con ${row.count} productos`);
        db.close();
      }
    });
  });
};

app.use((err, req, res, next) => {
  console.error('Error del servidor:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// RUTA CATCH-ALL PARA SPA - DEBE IR AL FINAL
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📦 Entorno: ${process.env.NODE_ENV || 'development'}`);
  initDatabase();
});