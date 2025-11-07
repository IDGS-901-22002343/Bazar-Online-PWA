import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const productService = {
  searchProducts: (query) => 
    api.get(`/items?q=${encodeURIComponent(query)}`),
  
  getProductById: (id) => 
    api.get(`/items/${id}`),
};

export const saleService = {
  addSale: (saleData) => 
    api.post('/addSale', saleData),
  
  getSales: () => 
    api.get('/sales'),
};

export default api;