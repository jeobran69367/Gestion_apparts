'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CardMaisonLocation, { MaisonLocation } from '../../components/CardMaisonLocation';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<MaisonLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    city: '',
    minPrice: '',
    maxPrice: '',
    capacity: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProperties, setTotalProperties] = useState(0);

  useEffect(() => {
    fetchProperties();
  }, [page, filters]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(filters.city && { city: filters.city }),
      });

      const response = await fetch(`http://localhost:4000/api/studios?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Adapter les données pour le composant CardMaisonLocation
        const adaptedProperties = data.studios.map((studio: any) => ({
          id: studio.id,
          name: studio.name,
          description: studio.description,
          address: studio.address,
          city: studio.city,
          postalCode: studio.postalCode,
          country: studio.country,
          surface: studio.surface,
          capacity: studio.capacity,
          bedrooms: studio.bedrooms,
          bathrooms: studio.bathrooms,
          pricePerNight: studio.pricePerNight,
          isAvailable: studio.isAvailable,
          images: studio.images || [],
          rating: studio.rating || 4.5,
          reviews: studio.reviews || Math.floor(Math.random() * 50) + 10,
          amenities: studio.amenities || [],
          owner: studio.owner,
          createdAt: studio.createdAt,
          updatedAt: studio.updatedAt,
        }));

        setProperties(adaptedProperties);
        setTotalPages(data.pagination.totalPages);
        setTotalProperties(data.pagination.totalItems);
      } else {
        setError('Erreur lors du chargement des propriétés');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      city: '',
      minPrice: '',
      maxPrice: '',
      capacity: ''
    });
    setPage(1);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPage(1);
  };

  const cities = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Montpellier', 'Strasbourg', 'Bordeaux', 'Lille'];

  return (
    <>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          overflow-x: hidden;
        }
        
        .hero-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          overflow: hidden;
        }
        
        .hero-gradient::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><polygon fill="rgba(255,255,255,0.1)" points="0,0 1000,300 1000,1000 0,700"/></svg>');
          background-size: cover;
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .glass-white {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .hover-lift {
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .hover-lift:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        }
        
        .btn-premium {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px 32px;
          border: none;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }
        
        .btn-premium:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
        }
        
        .btn-outline {
          background: transparent;
          color: #667eea;
          padding: 16px 32px;
          border: 2px solid #667eea;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }
        
        .btn-outline:hover {
          background: #667eea;
          color: white;
          transform: translateY(-2px);
        }
        
        .search-container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          margin-top: -50px;
          position: relative;
          z-index: 10;
        }
        
        .input-premium {
          width: 100%;
          padding: 18px 24px;
          border: 2px solid rgba(102, 126, 234, 0.1);
          border-radius: 16px;
          font-size: 16px;
          transition: all 0.3s ease;
          background: white;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }
        
        .input-premium:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          transform: translateY(-2px);
        }
        
        .select-premium {
          width: 100%;
          padding: 18px 24px;
          border: 2px solid rgba(102, 126, 234, 0.1);
          border-radius: 16px;
          font-size: 16px;
          transition: all 0.3s ease;
          background: white;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
          appearance: none;
          background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" fill="%23667eea" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>');
          background-repeat: no-repeat;
          background-position: right 16px center;
          background-size: 20px;
        }
        
        .select-premium:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          transform: translateY(-2px);
        }
        
        .stats-banner {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px 0;
          text-align: center;
        }
        
        .properties-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          margin: 60px 0;
        }
        
        .pagination-premium {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin-top: 80px;
        }
        
        .page-btn {
          width: 50px;
          height: 50px;
          border: none;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.9);
          color: #667eea;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        .page-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        
        .page-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          transform: scale(1.1);
        }
        
        .nav-btn {
          padding: 16px 24px;
          border: none;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.9);
          color: #667eea;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .nav-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        
        .nav-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }
        
        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 4px solid rgba(102, 126, 234, 0.1);
          border-left: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .empty-state {
          text-align: center;
          padding: 80px 0;
        }
        
        .empty-icon {
          width: 120px;
          height: 120px;
          margin: 0 auto 30px;
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          border-radius: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
        }
        
        @media (max-width: 1024px) {
          .properties-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
          }
        }

        @media (max-width: 768px) {
          .properties-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          
          .search-container {
            margin: 20px;
            padding: 30px 20px;
          }
          
          .pagination-premium {
            flex-wrap: wrap;
            gap: 12px;
          }
        }
            `}</style>

      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
        {/* Hero Section */}
        <section className="hero-gradient" style={{ padding: '120px 0 100px', color: 'white', position: 'relative' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 2 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                background: 'rgba(255,255,255,0.15)', 
                padding: '12px 24px', 
                borderRadius: '30px', 
                display: 'inline-block', 
                marginBottom: '30px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                🏠 {totalProperties} studios disponibles
              </div>
              
              <h1 style={{ 
                fontSize: '4rem', 
                fontWeight: '800', 
                marginBottom: '20px', 
                lineHeight: '1.2' 
              }}>
                Trouvez votre<br/>
                <span style={{
                  background: 'linear-gradient(135deg, #ffd700 0%, #ff6b6b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Studio Parfait
                </span>
              </h1>
              
              <p style={{ 
                fontSize: '1.3rem', 
                marginBottom: '40px', 
                opacity: '0.9',
                maxWidth: '600px',
                margin: '0 auto 40px'
              }}>
                Découvrez notre sélection premium de studios dans toute la France.
                Location simplifiée, qualité garantie.
              </p>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div className="search-container">
            <h2 style={{ 
              fontSize: '1.8rem', 
              fontWeight: '700', 
              marginBottom: '30px', 
              textAlign: 'center',
              color: '#333'
            }}>
              🔍 Rechercher votre studio idéal
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '20px',
              marginBottom: '30px'
            }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600', 
                  color: '#333',
                  fontSize: '14px'
                }}>
                  🏙️ Ville
                </label>
                <select
                  className="select-premium"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                >
                  <option value="">Toutes les villes</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600', 
                  color: '#333',
                  fontSize: '14px'
                }}>
                  💰 Prix min (€/nuit)
                </label>
                <input
                  type="number"
                  className="input-premium"
                  placeholder="50"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600', 
                  color: '#333',
                  fontSize: '14px'
                }}>
                  💰 Prix max (€/nuit)
                </label>
                <input
                  type="number"
                  className="input-premium"
                  placeholder="200"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600', 
                  color: '#333',
                  fontSize: '14px'
                }}>
                  👥 Capacité
                </label>
                <select
                  className="select-premium"
                  value={filters.capacity}
                  onChange={(e) => handleFilterChange('capacity', e.target.value)}
                >
                  <option value="">Toutes capacités</option>
                  <option value="1">1 personne</option>
                  <option value="2">2 personnes</option>
                  <option value="3">3 personnes</option>
                  <option value="4">4+ personnes</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn-premium"
                onClick={() => fetchProperties()}
              >
                <span>🔍</span>
                Rechercher
              </button>
              
              <button
                className="btn-outline"
                onClick={clearFilters}
              >
                <span>🔄</span>
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Stats Banner */}
        <div className="stats-banner" style={{ margin: '60px 0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '30px' 
            }}>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '5px' }}>
                  {totalProperties}
                </div>
                <div style={{ opacity: '0.9' }}>Studios disponibles</div>
              </div>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '5px' }}>
                  98.5%
                </div>
                <div style={{ opacity: '0.9' }}>Satisfaction client</div>
              </div>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '5px' }}>
                  4.9/5
                </div>
                <div style={{ opacity: '0.9' }}>Note moyenne</div>
              </div>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '5px' }}>
                  24h
                </div>
                <div style={{ opacity: '0.9' }}>Réponse moyenne</div>
              </div>
            </div>
          </div>
        </div>

        {/* Properties Section */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 80px' }}>
          {loading ? (
            <div className="loading-container">
              <div>
                <div className="loading-spinner"></div>
                <p style={{ 
                  textAlign: 'center', 
                  marginTop: '20px', 
                  fontSize: '1.2rem', 
                  color: '#667eea',
                  fontWeight: '600'
                }}>
                  Chargement des studios premium...
                </p>
              </div>
            </div>
          ) : error ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '80px 20px',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '24px',
              border: '2px solid rgba(239, 68, 68, 0.2)'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>😞</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '15px', color: '#dc2626' }}>
                Oups, une erreur s'est produite
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '30px' }}>{error}</p>
              <button
                className="btn-premium"
                onClick={() => fetchProperties()}
              >
                <span>🔄</span>
                Réessayer
              </button>
            </div>
          ) : properties.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <span>🏠</span>
              </div>
              <h3 style={{ 
                fontSize: '2rem', 
                fontWeight: '700', 
                marginBottom: '15px', 
                color: '#333' 
              }}>
                Aucun studio trouvé
              </h3>
              <p style={{ 
                color: '#6b7280', 
                marginBottom: '30px', 
                fontSize: '1.1rem',
                maxWidth: '500px',
                margin: '0 auto 30px'
              }}>
                Essayez de modifier vos critères de recherche pour découvrir nos studios premium.
              </p>
              <button
                className="btn-premium"
                onClick={clearFilters}
              >
                <span>🔍</span>
                Voir tous les studios
              </button>
            </div>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                <h2 style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: '700', 
                  marginBottom: '15px', 
                  color: '#333' 
                }}>
                  Studios Premium Disponibles
                </h2>
                <p style={{ 
                  fontSize: '1.1rem', 
                  color: '#6b7280',
                  maxWidth: '600px',
                  margin: '0 auto'
                }}>
                  Sélection triée sur le volet de {properties.length} studios d'exception
                </p>
              </div>

              <div className="properties-grid">
                {properties.map((property) => (
                  <div key={property.id}>
                    <CardMaisonLocation
                      maison={property}
                    />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination-premium">
                  <button
                    className="nav-btn"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    <span>←</span>
                    Précédent
                  </button>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[...Array(Math.min(5, totalPages))].map((_, index) => {
                      const pageNumber = index + 1;
                      return (
                        <button
                          key={pageNumber}
                          className={`page-btn ${page === pageNumber ? 'active' : ''}`}
                          onClick={() => setPage(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    className="nav-btn"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                  >
                    Suivant
                    <span>→</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
