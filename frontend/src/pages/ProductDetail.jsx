import { Container, Row, Col, Button, Badge, Alert, Spinner, Card, ListGroup } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { productService, saleService } from '../services/api';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const getProduct = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await productService.getProductById(id);
        setProduct(response.data);
      } catch (err) {
        setError('Error al cargar el producto');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    getProduct();
  }, [id]);

  const handlePurchase = async () => {
    try {
      setPurchasing(true);
      const saleData = {
        product_id: product.id,
        product_title: product.title,
        quantity: 1,
        total_price: product.price
      };
      
      await saleService.addSale(saleData);
      alert('Compra registrada exitosamente');
      navigate('/sales');
    } catch (err) {
      alert('Error al registrar la compra');
      console.error('Error:', err);
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <Container className="my-5">
        <div className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Cargando producto...</span>
          </Spinner>
          <p className="mt-3 text-muted">Cargando información del producto...</p>
        </div>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container className="my-5">
        <Alert variant="danger" className="border-0 rounded-3">
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error || 'Producto no encontrado'}
          </div>
        </Alert>
        <div className="text-center mt-4">
          <Link to="/" className="btn btn-primary">
            Volver al Inicio
          </Link>
        </div>
      </Container>
    );
  }

  const discountPrice = product.discountPercentage 
    ? product.price - (product.price * product.discountPercentage / 100)
    : null;

  return (
    <Container className="my-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none">Inicio</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {product.title}
          </li>
        </ol>
      </nav>

      <Row className="g-4">
        {/* Product Image */}
        <Col md={6}>
          <Card className="border-0 shadow-sm">
            <Card.Img 
              variant="top" 
              src={product.image} 
              style={{ maxHeight: '500px', objectFit: 'contain', padding: '20px' }}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x400/ECF0F1/2C3E50?text=Imagen+No+Disponible';
              }}
            />
          </Card>
        </Col>
        
        {/* Product Info */}
        <Col md={6}>
          <div className="mb-3">
            <Badge bg="light" text="dark" className="me-2">
              {product.category}
            </Badge>
            {product.discountPercentage > 0 && (
              <Badge bg="danger" className="me-2">
                -{product.discountPercentage}% OFF
              </Badge>
            )}
            {product.stock < 10 && (
              <Badge bg="warning" text="dark">
                Poco Stock
              </Badge>
            )}
          </div>
          
          <h1 className="h3 fw-bold text-dark mb-2">{product.title}</h1>
          <p className="text-muted mb-3">{product.brand}</p>
          
          {/* Price */}
          <div className="mb-4">
            {discountPrice ? (
              <div>
                <h2 className="text-danger fw-bold">${discountPrice.toFixed(2)}</h2>
                <small className="text-muted text-decoration-line-through h5">
                  ${product.price}
                </small>
              </div>
            ) : (
              <h2 className="text-dark fw-bold">${product.price}</h2>
            )}
          </div>
          
          {/* Rating */}
          <div className="d-flex align-items-center mb-4">
            <div className="text-warning fw-bold me-2">
              ★ {product.rating.rate}
            </div>
            <small className="text-muted">
              ({product.rating.count} evaluaciones)
            </small>
          </div>
          
          {/* Description */}
          <div className="mb-4">
            <h5 className="fw-bold mb-3">Descripción</h5>
            <p className="text-dark" style={{ lineHeight: '1.6' }}>
              {product.description}
            </p>
          </div>
          
          {/* Product Details */}
          <Card className="border-0 bg-light-custom mb-4">
            <Card.Body>
              <h6 className="fw-bold mb-3 text-dark">Información del Producto</h6>
              <ListGroup variant="flush">
                <ListGroup.Item className="bg-transparent px-0 py-2 border-bottom">
                  <strong>Stock disponible:</strong> {product.stock} unidades
                </ListGroup.Item>
                <ListGroup.Item className="bg-transparent px-0 py-2 border-bottom">
                  <strong>SKU:</strong> {product.sku}
                </ListGroup.Item>
                <ListGroup.Item className="bg-transparent px-0 py-2 border-bottom">
                  <strong>Envío:</strong> {product.shippingInformation}
                </ListGroup.Item>
                <ListGroup.Item className="bg-transparent px-0 py-2">
                  <strong>Garantía:</strong> {product.warrantyInformation}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
          
          {/* Purchase Button */}
          <Button 
            variant="success" 
            size="lg" 
            className="w-100 fw-bold py-3"
            onClick={handlePurchase}
            disabled={purchasing || product.stock === 0}
          >
            {purchasing ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Registrando compra...
              </>
            ) : (
              'Registrar Compra'
            )}
          </Button>
          
          {product.stock === 0 && (
            <Alert variant="warning" className="mt-3 border-0 rounded-3">
              <strong>Producto agotado</strong> - No disponible temporalmente
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default ProductDetail;