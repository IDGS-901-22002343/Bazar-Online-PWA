import { useState, useEffect } from 'react';
import { saleService } from '../services/api';
import { Link } from 'react-router-dom';

function Sales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSales = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await saleService.getSales();
        setSales(response.data);
      } catch (err) {
        setError('Error al cargar las ventas');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSales();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalSales = sales.reduce((sum, sale) => sum + sale.total_price, 0);
  const totalItems = sales.reduce((sum, sale) => sum + sale.quantity, 0);

  if (loading) {
    return (
      <div className="container">
        <Link to="/" className="back-button">
          ← Volver al Inicio
        </Link>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando historial de ventas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      {/* Header */}
      <Link to="/" className="back-button">
        ← Volver al Inicio
      </Link>

      <div className="mb-4">
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Ventas Registradas
        </h1>
        <p style={{ color: 'var(--text-light)', marginBottom: '0' }}>
          Historial completo de transacciones
        </p>
      </div>

      {error && (
        <div style={{
          background: '#fed7d7',
          color: '#c53030',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          borderLeft: '4px solid #e53e3e'
        }}>
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">${totalSales.toFixed(2)}</div>
          <div className="stat-label">Total en Ventas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalItems}</div>
          <div className="stat-label">Productos Vendidos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{sales.length}</div>
          <div className="stat-label">Transacciones</div>
        </div>
      </div>

      {/* Sales List */}
      {sales.length === 0 ? (
        <div className="empty-state">
          <h3>No hay ventas registradas</h3>
          <p>Comienza registrando tu primera transacción desde la página de productos.</p>
          <Link to="/" className="search-button" style={{ display: 'inline-block', marginTop: '1rem' }}>
            Explorar Productos
          </Link>
        </div>
      ) : (
        <div className="sales-list">
          {sales.map((sale) => (
            <div key={sale.id} className="sale-item">
              <div className="sale-header">
                <div className="sale-product">{sale.product_title}</div>
                <div className="sale-amount">${sale.total_price.toFixed(2)}</div>
              </div>
              <div className="sale-details">
                <div>
                  <strong>Cantidad:</strong> {sale.quantity}
                </div>
                <div>
                  <strong>ID Producto:</strong> {sale.product_id}
                </div>
                <div className="sale-date">
                  {formatDate(sale.sale_date)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Sales;