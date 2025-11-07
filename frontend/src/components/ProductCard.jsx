import { Card, Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function ProductCard({ product }) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/item/${product.id}`);
  };

  const discountPrice = product.discountPercentage 
    ? product.price - (product.price * product.discountPercentage / 100)
    : null;

  return (
    <Card className="h-100 product-card">
      <div className="position-relative">
        <Card.Img 
          variant="top" 
          src={product.image} 
          style={{ height: '220px', objectFit: 'cover' }}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x220/ECF0F1/2C3E50?text=Imagen+No+Disponible';
          }}
        />
        {product.discountPercentage > 0 && (
          <Badge 
            bg="danger" 
            className="position-absolute top-0 end-0 m-2"
          >
            -{product.discountPercentage}%
          </Badge>
        )}
      </div>
      
      <Card.Body className="d-flex flex-column p-3">
        <div className="mb-2">
          <Badge bg="light" text="dark" className="me-1">
            {product.category}
          </Badge>
          {product.stock < 10 && (
            <Badge bg="warning" text="dark">
              Poco Stock
            </Badge>
          )}
        </div>
        
        <Card.Title 
          className="h6 fw-bold mb-2" 
          style={{ minHeight: '48px', lineHeight: '1.3' }}
        >
          {product.title}
        </Card.Title>
        
        <Card.Text 
          className="text-muted small flex-grow-1 mb-3" 
          style={{ minHeight: '60px', lineHeight: '1.4' }}
        >
          {product.description.substring(0, 100)}...
        </Card.Text>
        
        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              {discountPrice ? (
                <>
                  <span className="h5 fw-bold text-danger">${discountPrice.toFixed(2)}</span>
                  <small className="text-muted text-decoration-line-through ms-2">
                    ${product.price}
                  </small>
                </>
              ) : (
                <span className="h5 fw-bold text-dark">${product.price}</span>
              )}
            </div>
            <div className="text-warning small fw-medium">
              ★ {product.rating.rate} <span className="text-muted">({product.rating.count})</span>
            </div>
          </div>
          
          <div className="d-flex justify-content-between align-items-center small text-muted mb-3">
            <span className="fw-medium">{product.brand}</span>
            <span>Stock: {product.stock}</span>
          </div>
          
          <Button 
            variant="primary" 
            onClick={handleViewDetails}
            className="w-100 fw-medium"
            size="sm"
          >
            Ver Detalles
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default ProductCard;