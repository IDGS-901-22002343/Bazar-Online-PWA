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

// Datos de productos en memoria (funciona en producción)
const products = [
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
  },
  {
    id: 2,
    title: "Smartphone Pro",
    price: 599.99,
    description: "Teléfono inteligente última generación",
    category: "electronica",
    image: "https://via.placeholder.com/150",
    rating: { rate: 4.3, count: 89 },
    brand: "PhoneTech",
    stock: 25,
    discountPercentage: 5,
    tags: ["smartphone", "mobile", "tech"],
    sku: "SPP002",
    weight: 0.2,
    dimensions: { width: 7, height: 15, depth: 0.8 },
    warrantyInformation: "1 año",
    shippingInformation: "Envío express",
    availabilityStatus: "in_stock",
    reviews: [],
    returnPolicy: "30 días",
    minimumOrderQuantity: 1,
    meta: {},
    thumbnail: "https://via.placeholder.com/50"
  },
  {
    id: 3,
    title: "Auriculares Bluetooth",
    price: 89.99,
    description: "Auriculares inalámbricos con cancelación de ruido",
    category: "electronica",
    image: "https://via.placeholder.com/150",
    rating: { rate: 4.2, count: 67 },
    brand: "AudioPro",
    stock: 30,
    discountPercentage: 15,
    tags: ["audio", "inalámbrico", "música"],
    sku: "AUB003",
    weight: 0.3,
    dimensions: { width: 18, height: 16, depth: 7 },
    warrantyInformation: "1 año",
    shippingInformation: "Envío estándar",
    availabilityStatus: "in_stock",
    reviews: [],
    returnPolicy: "30 días",
    minimumOrderQuantity: 1,
    meta: {},
    thumbnail: "https://via.placeholder.com/50"
  },
  {
    id: 4,
    title: "Mesa de Oficina",
    price: 199.99,
    description: "Mesa ergonómica para home office",
    category: "hogar",
    image: "https://via.placeholder.com/150",
    rating: { rate: 4.4, count: 45 },
    brand: "HomeOffice",
    stock: 10,
    discountPercentage: 8,
    tags: ["oficina", "muebles", "trabajo"],
    sku: "MOF004",
    weight: 15.0,
    dimensions: { width: 120, height: 75, depth: 60 },
    warrantyInformation: "3 años",
    shippingInformation: "Envío en 5 días",
    availabilityStatus: "in_stock",
    reviews: [],
    returnPolicy: "30 días",
    minimumOrderQuantity: 1,
    meta: {},
    thumbnail: "https://via.placeholder.com/50"
  },
  {
    id: 5,
    title: "Silla Ejecutiva",
    price: 299.99,
    description: "Silla cómoda para largas jornadas",
    category: "hogar",
    image: "https://via.placeholder.com/150",
    rating: { rate: 4.6, count: 78 },
    brand: "ComfortSeat",
    stock: 8,
    discountPercentage: 12,
    tags: ["silla", "ergonómica", "oficina"],
    sku: "SEJ005",
    weight: 12.5,
    dimensions: { width: 60, height: 110, depth: 65 },
    warrantyInformation: "5 años",
    shippingInformation: "Envío en 3 días",
    availabilityStatus: "in_stock",
    reviews: [],
    returnPolicy: "30 días",
    minimumOrderQuantity: 1,
    meta: {},
    thumbnail: "https://via.placeholder.com/50"
  }
];

let sales = [];

// Pasar datos a las rutas
app.set('products', products);
app.set('sales', sales);

app.use('/api/items', itemsRoutes);
app.use('/api', salesRoutes);

app.get('/api', (req, res) => {
  res.json({ 
    message: 'API del Bazar Universal funcionando',
    timestamp: new Date().toISOString(),
    status: 'active',
    products_count: products.length,
    sales_count: sales.length
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', server: 'running' });
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
  console.log(`📊 ${products.length} productos cargados en memoria`);
});