import { Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SearchBox() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/items?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <Form onSubmit={handleSearch}>
      <Row className="g-2 justify-content-center">
        <Col lg={8}>
          <InputGroup size="lg">
            <Form.Control
              type="text"
              placeholder="Buscar productos, categorías, marcas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-end-0"
            />
            <Button 
              variant="primary" 
              type="submit"
              className="px-4"
            >
              Buscar
            </Button>
          </InputGroup>
          <div className="text-center mt-3">
            <small className="text-light opacity-75">
              Ejemplo: smartphone, belleza, electrónicos, hogar
            </small>
          </div>
        </Col>
      </Row>
    </Form>
  );
}

export default SearchBox;