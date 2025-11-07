import { Navbar, Nav, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();

  return (
    <Navbar expand="lg" className="navbar">
      <Container>
        <Navbar.Brand 
          style={{ cursor: 'pointer', fontSize: '1.5rem', fontWeight: '700' }}
          onClick={() => navigate('/')}
        >
          Bazar Universal
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link onClick={() => navigate('/')} className="fw-medium">
              Inicio
            </Nav.Link>
            <Nav.Link onClick={() => navigate('/sales')} className="fw-medium">
              Ventas Registradas
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;