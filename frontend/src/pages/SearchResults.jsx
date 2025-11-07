import { Container, Row, Col, Alert, Spinner, Breadcrumb } from 'react-bootstrap';
import { useSearchParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { productService } from '../services/api';
import ProductCard from '../components/ProductCard';

function SearchResults() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const searchProducts = async () => {
      if (!searchQuery) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const response = await productService.searchProducts(searchQuery);
        setProducts(response.data?.items || []);
      } catch (err) {
        setError('Error al buscar productos');
        console.error('Error:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    searchProducts();
  }, [searchQuery]);

  if (loading) {
    return (
      <Container className="my-5">
        <div className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Buscando productos...</span>
          </Spinner>
          <p className="mt-3 text-muted">Buscando productos...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>Inicio</Breadcrumb.Item>
        <Breadcrumb.Item active>Resultados de Búsqueda</Breadcrumb.Item>
      </Breadcrumb>

      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h2 className="h4 fw-bold text-dark mb-2">
            Resultados para: "{searchQuery}"
          </h2>
          <p className="text-muted mb-0">
            {products.length} producto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
          </p>
        </Col>
      </Row>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" className="border-0 rounded-3">
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        </Alert>
      )}

      {/* No Results */}
      {products.length === 0 && !error && (
        <div className="text-center py-5">
          <div className="text-muted mb-3" style={{ fontSize: '4rem' }}>🔍</div>
          <h4 className="text-dark mb-3">No se encontraron productos</h4>
          <p className="text-muted mb-4">
            No hay resultados para "<strong>{searchQuery}</strong>".<br />
            Intenta con otros términos de búsqueda.
          </p>
          <Link to="/" className="btn btn-primary">
            Volver al Inicio
          </Link>
        </div>
      )}

      {/* Products Grid */}
      {products.length > 0 && (
        <Row>
          {products.map(product => (
            <Col key={product.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default SearchResults;