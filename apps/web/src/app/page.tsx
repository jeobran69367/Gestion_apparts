"use client";

import Link from "next/link";
import { useAuth } from "../hooks/useAuth";

export default function Home() {
  const { isLoggedIn, isAdmin, mounted, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const testimonials = [
    {
      name: "Marie Dubois",
      location: "Paris, France",
      rating: 5,
      comment: "Service exceptionnel ! Mon studio a été loué en moins de 48h. L'équipe est réactive et professionnelle.",
      image: "👩‍💼",
      revenue: "2,400Fcfa/mois"
    },
    {
      name: "Thomas Martin",
      location: "Lyon, France", 
      rating: 5,
      comment: "Interface intuitive, gestion simplifiée. Mes 3 appartements génèrent maintenant des revenus stables.",
      image: "👨‍💻",
      revenue: "5,800Fcfa/mois"
    },
    {
      name: "Sophie Bernard",
      location: "Marseille, France",
      rating: 5,
      comment: "Excellent support client ! Chaque réservation est gérée automatiquement. Je recommande vivement.",
      image: "👩‍🎨",
      revenue: "3,200Fcfa/mois"
    }
  ];

  const features = [
    {
      icon: "🏠",
      title: "Gestion Simplifiée",
      description: "Ajoutez vos propriétés en quelques clics avec photos, descriptions et tarifs personnalisés."
    },
    {
      icon: "💰",
      title: "Revenus Optimisés",
      description: "Maximisez vos profits avec notre système de tarification dynamique et analytiques avancés."
    },
    {
      icon: "📱",
      title: "Réservations Instantanées",
      description: "Vos clients réservent en ligne 24h/7j avec paiement sécurisé et confirmation automatique."
    },
    {
      icon: "🔒",
      title: "Paiements Sécurisés",
      description: "Transactions protégées par cryptage bancaire avec versement automatique sur votre compte."
    },
    {
      icon: "📊",
      title: "Analytics Détaillés",
      description: "Suivez vos performances, revenus et taux d'occupation en temps réel."
    },
    {
      icon: "🏆",
      title: "Support Premium",
      description: "Équipe dédiée disponible 7j/7 pour vous accompagner dans votre réussite."
    }
  ];

  const stats = [
    { number: "2,847", label: "Studios Loués", icon: "🏠" },
    { number: "98.5%", label: "Satisfaction Client", icon: "⭐" },
    { number: "24h", label: "Temps Moyen Location", icon: "⚡" },
    { number: "4.9/5", label: "Note Moyenne", icon: "🌟" }
  ];

  // Prevent hydration mismatch by not rendering auth-dependent content on server
  if (!mounted) {
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
        }
        `}</style>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-xl">Chargement...</div>
        </div>
      </>
    );
  }

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
        }
        
        .gradient-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .hover-lift {
          transition: all 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px 32px;
          border: none;
          border-radius: 12px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(102, 126, 234, 0.4);
        }
        
        .btn-secondary {
          background: transparent;
          color: #667eea;
          padding: 16px 32px;
          border: 2px solid #667eea;
          border-radius: 12px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }
        
        .btn-secondary:hover {
          background: #667eea;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(102, 126, 234, 0.4);
        }
        
        .section-padding {
          padding: 80px 0;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        .text-center {
          text-align: center;
        }
        
        .grid {
          display: grid;
          gap: 30px;
        }
        
        .grid-2 {
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }
        
        .grid-3 {
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }
        
        .grid-4 {
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        }
        
        .card {
          background: white;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        .nav-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          padding: 20px 0;
        }
        
        .nav-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .logo {
          display: flex;
          align-items: center;
          gap: 15px;
          font-size: 24px;
          font-weight: 700;
          color: #333;
          text-decoration: none;
        }
        
        .logo-icon {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
        }
        
        .nav-links {
          display: flex;
          gap: 15px;
        }
        
        .nav-link {
          padding: 10px 20px;
          background: #f8f9fa;
          color: #333;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .nav-link:hover {
          background: #e9ecef;
          transform: translateY(-1px);
        }
        
        .hero {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 120px 0 80px;
          margin-top: 80px;
          position: relative;
          overflow: hidden;
        }
        
        .hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><polygon fill="rgba(255,255,255,0.1)" points="0,0 1000,300 1000,1000 0,700"/></svg>');
          background-size: cover;
        }
        
        .hero-content {
          position: relative;
          z-index: 2;
        }
        
        .hero h1 {
          font-size: 4rem;
          font-weight: 800;
          margin-bottom: 20px;
          line-height: 1.2;
        }
        
        .hero p {
          font-size: 1.3rem;
          margin-bottom: 40px;
          opacity: 0.9;
        }
        
        .cta-buttons {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 60px;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 30px;
          margin-top: 60px;
        }
        
        .stat-card {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          padding: 30px;
          border-radius: 15px;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .stat-icon {
          font-size: 3rem;
          margin-bottom: 15px;
        }
        
        .stat-number {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 5px;
        }
        
        .stat-label {
          font-size: 1rem;
          opacity: 0.8;
        }
        
        .section-title {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 20px;
          color: #333;
        }
        
        .section-subtitle {
          font-size: 1.2rem;
          color: #666;
          margin-bottom: 60px;
        }
        
        .testimonial-card {
          background: white;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          position: relative;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        .testimonial-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 25px;
        }
        
        .testimonial-avatar {
          font-size: 3rem;
        }
        
        .testimonial-info h3 {
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 5px;
        }
        
        .testimonial-info p {
          color: #666;
          margin-bottom: 10px;
        }
        
        .stars {
          color: #ffd700;
          font-size: 1.2rem;
        }
        
        .testimonial-text {
          font-style: italic;
          line-height: 1.6;
          margin-bottom: 20px;
          font-size: 1.1rem;
        }
        
        .revenue-badge {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 15px 20px;
          border-radius: 12px;
          text-align: center;
          font-weight: 600;
        }
        
        .feature-card {
          background: white;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          text-align: center;
          border: 1px solid rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }
        
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }
        
        .feature-icon {
          font-size: 4rem;
          margin-bottom: 25px;
          display: block;
        }
        
        .feature-title {
          font-size: 1.4rem;
          font-weight: 600;
          margin-bottom: 15px;
          color: #333;
        }
        
        .feature-description {
          color: #666;
          line-height: 1.6;
        }
        
        .cta-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 80px 0;
          position: relative;
          overflow: hidden;
        }
        
        .cta-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><polygon fill="rgba(255,255,255,0.1)" points="1000,0 0,300 0,1000 1000,700"/></svg>');
          background-size: cover;
        }
        
        .cta-content {
          position: relative;
          z-index: 2;
        }
        
        .footer {
          background: #1a1a1a;
          color: white;
          padding: 60px 0 30px;
        }
        
        .footer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 40px;
          margin-bottom: 40px;
        }
        
        .footer-section h4 {
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 20px;
        }
        
        .footer-section p,
        .footer-section a {
          color: #ccc;
          text-decoration: none;
          line-height: 1.6;
          margin-bottom: 10px;
          display: block;
        }
        
        .footer-section a:hover {
          color: white;
        }
        
        .social-links {
          display: flex;
          gap: 15px;
          margin-top: 20px;
        }
        
        .social-link {
          width: 50px;
          height: 50px;
          background: #333;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          transition: all 0.3s ease;
        }
        
        .social-link:hover {
          background: #667eea;
          transform: translateY(-2px);
        }
        
        .footer-bottom {
          border-top: 1px solid #333;
          padding-top: 30px;
          text-align: center;
          color: #999;
        }
        
        @media (max-width: 768px) {
          .hero h1 {
            font-size: 2.5rem;
          }
          
          .section-title {
            font-size: 2rem;
          }
          
          .cta-buttons {
            flex-direction: column;
            align-items: center;
          }
          
          .nav-content {
            flex-direction: column;
            gap: 20px;
          }
          
          .nav-links {
            flex-wrap: wrap;
            justify-content: center;
          }
        }
      `}</style>

      <div>
        {/* Navigation */}
        <nav className="nav-bar">
          <div className="container">
            <div className="nav-content">
              <a href="#" className="logo">
                <div className="logo-icon">🏠</div>
                <div>
                  <div style={{fontSize: '24px', fontWeight: '700'}}>StudioRent</div>
                  <div style={{fontSize: '12px', color: '#666'}}>Location Premium</div>
                </div>
              </a>
                            <div className="nav-links">
                {isLoggedIn ? (
                  <>
                    <Link href="/studios" className="nav-link">
                      🏘️ Studios
                    </Link>
                    {isAdmin && (
                      <>
                        <Link href="/studios/my-studios" className="nav-link">
                          📋 Mes Studios
                        </Link>
                        <Link href="/studios/create" className="nav-link">
                          ➕ Créer un studio
                        </Link>
                        <Link href="/studios/reservations" className="nav-link">
                          📅 Réservations
                        </Link>
                      </>
                    )}
                    <Link href="/studios/my-bookings" className="nav-link">
                      🎫 Mes Réservations
                    </Link>
                    <button onClick={handleLogout} className="nav-link" style={{background: 'none', border: 'none', cursor: 'pointer'}}>
                      🚪 Déconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/studios" className="nav-link">
                      🏘️ Studios
                    </Link>
                    <Link href="/auth/login" className="nav-link">
                      🔑 Connexion
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Admin Dashboard Section - Only visible for admins */}
        {isLoggedIn && isAdmin && (
          <section style={{
            background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
            padding: '30px 0',
            marginTop: '90px'
          }}>
            <div className="container">
              <div style={{marginBottom: '25px'}}>
                <h2 style={{color: 'white', fontSize: '1.8rem', fontWeight: '700', marginBottom: '8px'}}>
                  🛠️ Panel Administrateur
                </h2>
                <p style={{color: 'rgba(255,255,255,0.8)', fontSize: '1rem'}}>
                  Gérez vos studios, réservations et propriétés depuis cet espace
                </p>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px'
              }}>
                <Link href="/studios/my-studios" style={{
                  background: 'rgba(255,255,255,0.95)',
                  borderRadius: '16px',
                  padding: '24px',
                  textDecoration: 'none',
                  color: '#333',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                }} className="hover-lift">
                  <span style={{fontSize: '2.5rem'}}>🏠</span>
                  <h3 style={{fontSize: '1.1rem', fontWeight: '600', margin: 0}}>Mes Studios</h3>
                  <p style={{fontSize: '0.85rem', color: '#666', margin: 0}}>Gérer vos propriétés</p>
                </Link>

                <Link href="/studios/create" style={{
                  background: 'rgba(255,255,255,0.95)',
                  borderRadius: '16px',
                  padding: '24px',
                  textDecoration: 'none',
                  color: '#333',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                }} className="hover-lift">
                  <span style={{fontSize: '2.5rem'}}>➕</span>
                  <h3 style={{fontSize: '1.1rem', fontWeight: '600', margin: 0}}>Créer un Studio</h3>
                  <p style={{fontSize: '0.85rem', color: '#666', margin: 0}}>Ajouter une nouvelle propriété</p>
                </Link>

                <Link href="/studios/reservations" style={{
                  background: 'rgba(255,255,255,0.95)',
                  borderRadius: '16px',
                  padding: '24px',
                  textDecoration: 'none',
                  color: '#333',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                }} className="hover-lift">
                  <span style={{fontSize: '2.5rem'}}>📅</span>
                  <h3 style={{fontSize: '1.1rem', fontWeight: '600', margin: 0}}>Réservations</h3>
                  <p style={{fontSize: '0.85rem', color: '#666', margin: 0}}>Voir toutes les réservations</p>
                </Link>

                <Link href="/studios" style={{
                  background: 'rgba(255,255,255,0.95)',
                  borderRadius: '16px',
                  padding: '24px',
                  textDecoration: 'none',
                  color: '#333',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                }} className="hover-lift">
                  <span style={{fontSize: '2.5rem'}}>🔍</span>
                  <h3 style={{fontSize: '1.1rem', fontWeight: '600', margin: 0}}>Tous les Studios</h3>
                  <p style={{fontSize: '0.85rem', color: '#666', margin: 0}}>Parcourir le catalogue</p>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Hero Section */}
        <section className="hero" style={isLoggedIn && isAdmin ? {marginTop: 0} : {}}>
          <div className="container">
            <div className="hero-content text-center">
              <div style={{background: 'rgba(255,255,255,0.15)', padding: '10px 20px', borderRadius: '25px', display: 'inline-block', marginBottom: '30px'}}>
                🎉 Plus de 2,800 studios déjà en location
              </div>
              
              <h1>
                Louez votre<br/>
                <span style={{background: 'linear-gradient(135deg, #ffd700 0%, #ff6b6b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                  Studio en 24h
                </span>
              </h1>
              
              <p>
                La plateforme n°1 en France pour la location de studios.<br/>
                Propriétaires et locataires nous font confiance pour leurs projets immobiliers.
              </p>
              
              <div className="cta-buttons">
                <Link href="/auth/login" className="btn-primary">
                  <span style={{fontSize: '24px'}}>🏠</span>
                  Ajouter une Maison
                </Link>
                <button className="btn-secondary">
                  <span style={{fontSize: '24px'}}>🔑</span>
                  Louer Maintenant
                </button>
              </div>

              <div className="stats-grid">
                {stats.map((stat, index) => (
                  <div key={index} className="stat-card hover-lift">
                    <div className="stat-icon">{stat.icon}</div>
                    <div className="stat-number">{stat.number}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="section-padding" style={{background: '#f8f9fa'}}>
          <div className="container">
            <div className="text-center">
              <h2 className="section-title">Ils nous font confiance</h2>
              <p className="section-subtitle">
                Découvrez pourquoi plus de 2,800 propriétaires choisissent StudioRent
              </p>
            </div>
            
            <div className="grid grid-3">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="testimonial-card hover-lift">
                  <div className="testimonial-header">
                    <div className="testimonial-avatar">{testimonial.image}</div>
                    <div className="testimonial-info">
                      <h3>{testimonial.name}</h3>
                      <p>{testimonial.location}</p>
                      <div className="stars">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <span key={i}>⭐</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <blockquote className="testimonial-text">
                    "{testimonial.comment}"
                  </blockquote>
                  
                  <div className="revenue-badge">
                    <div style={{fontSize: '12px', opacity: '0.8'}}>Revenus mensuels</div>
                    <div style={{fontSize: '18px', fontWeight: '700'}}>{testimonial.revenue}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="section-padding">
          <div className="container">
            <div className="text-center">
              <h2 className="section-title">Pourquoi choisir StudioRent ?</h2>
              <p className="section-subtitle">
                Une plateforme complète pour maximiser vos revenus locatifs
              </p>
            </div>
            
            <div className="grid grid-3">
              {features.map((feature, index) => (
                <div key={index} className="feature-card hover-lift">
                  <span className="feature-icon">{feature.icon}</span>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-content text-center">
              <h2 style={{fontSize: '3rem', fontWeight: '700', marginBottom: '20px'}}>
                Prêt à maximiser vos revenus ?
              </h2>
              <p style={{fontSize: '1.3rem', marginBottom: '40px', opacity: '0.9'}}>
                Rejoignez les milliers de propriétaires qui génèrent des revenus passifs avec StudioRent
              </p>
              
              <div className="cta-buttons">
                <Link href="/auth/login" className="btn-primary" style={{background: 'white', color: '#667eea'}}>
                  <span style={{fontSize: '24px'}}>🏠</span>
                  Commencer Maintenant
                </Link>
                <button className="btn-secondary" style={{borderColor: 'white', color: 'white'}}>
                  <span style={{fontSize: '24px'}}>📞</span>
                  Nous Contacter
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="container">
            <div className="footer-grid">
              <div className="footer-section">
                <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px'}}>
                  <div className="logo-icon">🏠</div>
                  <div>
                    <h4>StudioRent</h4>
                    <p style={{margin: '0', fontSize: '12px'}}>Location Premium</p>
                  </div>
                </div>
                <p>
                  La première plateforme française dédiée à la location de studios. 
                  Nous connectons propriétaires et locataires pour créer des expériences exceptionnelles.
                </p>
                <div className="social-links">
                  <div className="social-link">📧</div>
                  <div className="social-link">📱</div>
                  <div className="social-link">🌐</div>
                </div>
              </div>
              
              <div className="footer-section">
                <h4>Services</h4>
                <a href="#">Location Studios</a>
                <a href="#">Gestion Propriétés</a>
                <a href="#">Support 24/7</a>
                <a href="#">Analytics</a>
              </div>
              
              <div className="footer-section">
                <h4>Développement</h4>
                <a href="http://localhost:5555" target="_blank">Base de Données</a>
                <a href="http://localhost:4000" target="_blank">API REST</a>
                <a href="#">Next.js 15</a>
                <a href="#">PostgreSQL</a>
              </div>
              
              <div className="footer-section">
                <h4>Contact</h4>
                <p>📧 contact@studiorent.fr</p>
                <p>📱 +33 1 23 45 67 89</p>
                <p>📍 Paris, France</p>
              </div>
            </div>
            
            <div className="footer-bottom">
              <p>© 2024 StudioRent. Plateforme de location premium développée avec ❤️</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
