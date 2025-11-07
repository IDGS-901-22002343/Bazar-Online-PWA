const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
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

// CONFIGURACIÓN DE BASE DE DATOS
const getDatabasePath = () => {
  if (process.env.NODE_ENV === 'production') {
    return '/tmp/bazar.db'; // Railway tiene permisos en /tmp
  } else {
    const dbDir = './database';
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    return path.join(dbDir, 'bazar.db');
  }
};

// INICIALIZAR BASE DE DATOS
const initDatabase = (callback) => {
  const dbPath = getDatabasePath();
  console.log(`📦 Ruta de base de datos: ${dbPath}`);
  
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ Error conectando a SQLite:', err.message);
      callback(err, null);
      return;
    }
    console.log('✅ Conectado a la base de datos SQLite');
    
    // Crear tablas
    db.serialize(() => {
      // Tabla de productos
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
          console.error('❌ Error creando tabla products:', err);
        } else {
          console.log('✅ Tabla products lista');
        }
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
          console.error('❌ Error creando tabla sales:', err);
        } else {
          console.log('✅ Tabla sales lista');
        }
      });
      
      // Verificar y cargar productos
      db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
        if (err) {
          console.error('❌ Error contando productos:', err);
          callback(null, db);
          return;
        }
        
        if (!row || row.count === 0) {
          console.log('🔄 Cargando productos desde JSON...');
          cargarProductosDesdeJSON(db, () => {
            callback(null, db);
          });
        } else {
          console.log(`📊 Base de datos lista con ${row.count} productos`);
          callback(null, db);
        }
      });
    });
  });
};

// CARGAR PRODUCTOS DESDE JSON
const cargarProductosDesdeJSON = (db, callback) => {
  try {
    const productsPath = path.join(__dirname, 'data', 'products.json');
    
    if (!fs.existsSync(productsPath)) {
      console.log('❌ Archivo products.json no encontrado');
      callback();
      return;
    }

    const rawData = fs.readFileSync(productsPath, 'utf8');
    const data = JSON.parse(rawData);
    const productsData = data.products || data;
    
    console.log(`📥 Encontrados ${productsData.length} productos en JSON`);

    const stmt = db.prepare(`INSERT INTO products 
      (id, title, price, description, category, image, rating_rate, rating_count, 
       brand, stock, discount_percentage, tags, sku, weight, dimensions,
       warranty_information, shipping_information, availability_status, reviews,
       return_policy, minimum_order_quantity, meta, thumbnail) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    
    let loadedCount = 0;
    let errors = 0;

    const insertNext = (index) => {
      if (index >= productsData.length) {
        stmt.finalize();
        console.log(`✅ ${loadedCount} productos cargados en BD, ${errors} errores`);
        callback();
        return;
      }

      const product = productsData[index];
      try {
        const imageUrl = product.image || product.images?.[0] || product.thumbnail || '';
        const ratingCount = product.rating_count || product.reviews?.length || 0;
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
          product.rating || 0,
          ratingCount,
          product.brand || '',
          product.stock || 0,
          product.discountPercentage || product.discount_percentage || 0,
          tags,
          product.sku || '',
          product.weight || 0,
          dimensions,
          product.warrantyInformation || product.warranty_information || '',
          product.shippingInformation || product.shipping_information || '',
          product.availabilityStatus || product.availability_status || '',
          reviews,
          product.returnPolicy || product.return_policy || '',
          product.minimumOrderQuantity || product.minimum_order_quantity || 1,
          meta,
          product.thumbnail || ''
        ], function(err) {
          if (err) {
            if (!err.message.includes('UNIQUE')) {
              console.error(`❌ Error insertando producto ${product.id}:`, err.message);
            }
            errors++;
          } else {
            loadedCount++;
          }
          insertNext(index + 1);
        });
      } catch (error) {
        console.error(`❌ Error procesando producto ${product.id}:`, error.message);
        errors++;
        insertNext(index + 1);
      }
    };

    insertNext(0);
    
  } catch (error) {
    console.error('❌ Error cargando JSON:', error);
    callback();
  }
};

// Inicializar base de datos al iniciar el servidor
let db;

initDatabase((err, database) => {
  if (err) {
    console.error('💥 Error crítico con la base de datos:', err);
    process.exit(1);
  }
  
  db = database;
  app.set('db', db);
  console.log('🎉 Base de datos inicializada correctamente');
  
  // Iniciar servidor
  app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
    console.log(`📦 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️ Base de datos: SQLite`);
  });
});

// Middleware para inyectar db en las rutas
app.use((req, res, next) => {
  req.db = db;
  next();
});

app.use('/api/items', itemsRoutes);
app.use('/api', salesRoutes);

// Ruta de debug
app.get('/api/debug/db', (req, res) => {
  req.db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    req.db.all("SELECT id, title, category FROM products LIMIT 5", (err, products) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json({
        database_status: 'connected',
        total_products: row.count,
        sample_products: products,
        database_path: getDatabasePath()
      });
    });
  });
});

app.get('/api', (req, res) => {
  req.db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    res.json({ 
      message: 'API del Bazar Universal funcionando',
      timestamp: new Date().toISOString(),
      status: 'active',
      products_count: row.count,
      database: 'SQLite'
    });
  });
});

app.get('/health', (req, res) => {
  req.db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
    if (err) {
      return res.status(500).json({ 
        status: 'ERROR', 
        error: err.message 
      });
    }
    
    res.json({ 
      status: 'OK', 
      server: 'running',
      database: 'connected',
      products_count: row.count
    });
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Error del servidor:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});