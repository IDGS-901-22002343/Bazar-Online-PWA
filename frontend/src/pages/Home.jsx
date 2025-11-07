import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/items?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const goToSales = () => {
    navigate('/sales');
  };

  return (
    <>
      {/* Header Minimalista */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo">Bazar Universal</div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <h1 className="hero-title">
            Encuentra Productos Excepcionales
          </h1>
          <p className="hero-subtitle">
            Busca entre nuestro catálogo premium y descubre la mejor relación calidad-precio
          </p>
          
          <div className="search-container">
            <form onSubmit={handleSearch} className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Buscar productos, categorías, marcas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="search-button">
                Buscar
              </button>
            </form>
            
            <button onClick={goToSales} className="secondary-button">
              Ver Ventas Registradas
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;