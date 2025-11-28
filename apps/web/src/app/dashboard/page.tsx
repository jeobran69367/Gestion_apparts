"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";

export default function DashboardPage() {
  const { isLoggedIn, isAdmin, user, mounted } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (mounted && !isLoggedIn) {
      router.push("/auth/login");
    }
  }, [mounted, isLoggedIn, router]);

  if (!mounted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{textAlign: 'center'}}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e2e8f0',
            borderTopColor: '#667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{color: '#64748b', fontSize: '1rem'}}>Chargement...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
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

        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .hover-lift:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
      `}</style>

      <div style={{minHeight: '100vh', background: isAdmin ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'}}>
        {/* Main Content */}
        <main style={{padding: '40px 0 60px'}}>
          <div className="container">
            {/* Welcome Section */}
            <div style={{marginBottom: '40px'}}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '18px'}}>
                  <div style={{
                    width: '70px',
                    height: '70px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)'
                  }}>
                    <span style={{fontSize: '36px'}}>{isAdmin ? '⚙️' : '👤'}</span>
                  </div>
                  <div>
                    <h1 style={{
                      color: isAdmin ? 'white' : '#1e293b',
                      fontSize: '2rem',
                      fontWeight: '800',
                      margin: 0,
                      letterSpacing: '-0.03em'
                    }}>
                      {isAdmin ? 'Espace Administrateur' : 'Mon Espace Personnel'}
                    </h1>
                    <p style={{
                      color: isAdmin ? 'rgba(255,255,255,0.6)' : '#64748b',
                      fontSize: '1rem',
                      margin: '6px 0 0'
                    }}>
                      Bienvenue, {user?.firstName || 'Utilisateur'} • {isAdmin ? 'Gestion complète de la plateforme' : 'Gérez vos réservations'}
                    </p>
                  </div>
                </div>
                <div style={{
                  background: isAdmin ? 'rgba(16, 185, 129, 0.15)' : 'white',
                  border: isAdmin ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: isAdmin ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
                }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    background: isAdmin ? '#10b981' : '#667eea',
                    borderRadius: '50%',
                    boxShadow: `0 0 10px ${isAdmin ? '#10b981' : 'rgba(102, 126, 234, 0.6)'}`
                  }}></div>
                  <span style={{
                    color: isAdmin ? '#10b981' : '#475569',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>
                    {isAdmin ? 'Admin connecté' : 'Utilisateur connecté'}
                  </span>
                </div>
              </div>
            </div>

            {/* Dashboard Cards */}
            {isAdmin ? (
              /* Admin Dashboard */
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px'
              }}>
                <Link href="/studios/my-studios" style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)',
                  borderRadius: '20px',
                  padding: '32px',
                  textDecoration: 'none',
                  color: '#1e293b',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.1)',
                  position: 'relative',
                  overflow: 'hidden'
                }} className="hover-lift">
                  <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)'}}></div>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 6px 20px rgba(59, 130, 246, 0.35)'
                    }}>
                      <span style={{fontSize: '28px'}}>🏠</span>
                    </div>
                    <span style={{fontSize: '24px', color: '#94a3b8'}}>→</span>
                  </div>
                  <div>
                    <h3 style={{fontSize: '1.3rem', fontWeight: '700', margin: '0 0 6px', color: '#1e293b'}}>Mes Studios</h3>
                    <p style={{fontSize: '0.9rem', color: '#64748b', margin: 0, lineHeight: '1.5'}}>Gérez et modifiez vos propriétés existantes</p>
                  </div>
                </Link>
                <Link href="/studios/reservations" style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)',
                  borderRadius: '20px',
                  padding: '32px',
                  textDecoration: 'none',
                  color: '#1e293b',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.1)',
                  position: 'relative',
                  overflow: 'hidden'
                }} className="hover-lift">
                  <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: 'linear-gradient(90deg, #f59e0b, #d97706)'}}></div>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 6px 20px rgba(245, 158, 11, 0.35)'
                    }}>
                      <span style={{fontSize: '28px'}}>📊</span>
                    </div>
                    <span style={{fontSize: '24px', color: '#94a3b8'}}>→</span>
                  </div>
                  <div>
                    <h3 style={{fontSize: '1.3rem', fontWeight: '700', margin: '0 0 6px', color: '#1e293b'}}>Gestion des Réservations</h3>
                    <p style={{fontSize: '0.9rem', color: '#64748b', margin: 0, lineHeight: '1.5'}}>Suivez et gérez toutes les réservations</p>
                  </div>
                </Link>

                <Link href="/studios/create" style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)',
                  borderRadius: '20px',
                  padding: '32px',
                  textDecoration: 'none',
                  color: '#1e293b',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.1)',
                  position: 'relative',
                  overflow: 'hidden'
                }} className="hover-lift">
                  <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: 'linear-gradient(90deg, #10b981, #059669)'}}></div>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)'
                    }}>
                      <span style={{fontSize: '28px'}}>✨</span>
                    </div>
                    <span style={{fontSize: '24px', color: '#94a3b8'}}>→</span>
                  </div>
                  <div>
                    <h3 style={{fontSize: '1.3rem', fontWeight: '700', margin: '0 0 6px', color: '#1e293b'}}>Nouveau Studio</h3>
                    <p style={{fontSize: '0.9rem', color: '#64748b', margin: 0, lineHeight: '1.5'}}>Créez et publiez une nouvelle propriété</p>
                  </div>
                </Link>

                <Link href="/studios/studio-payments" style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)',
                  borderRadius: '20px',
                  padding: '32px',
                  textDecoration: 'none',
                  color: '#1e293b',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.1)',
                  position: 'relative',
                  overflow: 'hidden'
                }} className="hover-lift">
                  <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: 'linear-gradient(90deg, #f59e0b, #d97706)'}}></div>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 6px 20px rgba(245, 158, 11, 0.35)'
                    }}>
                      <span style={{fontSize: '28px'}}>📊</span>
                    </div>
                    <span style={{fontSize: '24px', color: '#94a3b8'}}>→</span>
                  </div>
                  <div>
                    <h3 style={{fontSize: '1.3rem', fontWeight: '700', margin: '0 0 6px', color: '#1e293b'}}>Gestion Paiement des Réservations</h3>
                      <p style={{fontSize: '0.9rem', color: '#64748b', margin: 0, lineHeight: '1.5'}}>Suivez et gérez toutes les paiements des réservations</p>
                    </div>
                </Link>

                <Link href="/studios" style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)',
                  borderRadius: '20px',
                  padding: '32px',
                  textDecoration: 'none',
                  color: '#1e293b',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.1)',
                  position: 'relative',
                  overflow: 'hidden'
                }} className="hover-lift">
                  <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: 'linear-gradient(90deg, #8b5cf6, #7c3aed)'}}></div>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 6px 20px rgba(139, 92, 246, 0.35)'
                    }}>
                      <span style={{fontSize: '28px'}}>🔍</span>
                    </div>
                    <span style={{fontSize: '24px', color: '#94a3b8'}}>→</span>
                  </div>
                  <div>
                    <h3 style={{fontSize: '1.3rem', fontWeight: '700', margin: '0 0 6px', color: '#1e293b'}}>Catalogue Studios</h3>
                    <p style={{fontSize: '0.9rem', color: '#64748b', margin: 0, lineHeight: '1.5'}}>Explorez tous les studios disponibles</p>
                  </div>
                </Link>

                <Link href="/studios/my-bookings" style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)',
                  borderRadius: '20px',
                  padding: '32px',
                  textDecoration: 'none',
                  color: '#1e293b',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.1)',
                  position: 'relative',
                  overflow: 'hidden'
                }} className="hover-lift">
                  <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: 'linear-gradient(90deg, #ec4899, #db2777)'}}></div>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 6px 20px rgba(236, 72, 153, 0.35)'
                    }}>
                      <span style={{fontSize: '28px'}}>🎫</span>
                    </div>
                    <span style={{fontSize: '24px', color: '#94a3b8'}}>→</span>
                  </div>
                  <div>
                    <h3 style={{fontSize: '1.3rem', fontWeight: '700', margin: '0 0 6px', color: '#1e293b'}}>Mes Réservations</h3>
                    <p style={{fontSize: '0.9rem', color: '#64748b', margin: 0, lineHeight: '1.5'}}>Consultez vos réservations personnelles</p>
                  </div>
                </Link>

                <Link href="/dashboard/wallet" style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)',
                  borderRadius: '20px',
                  padding: '32px',
                  textDecoration: 'none',
                  color: '#1e293b',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.1)',
                  position: 'relative',
                  overflow: 'hidden'
                }} className="hover-lift">
                  <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: 'linear-gradient(90deg, #10b981, #059669)'}}></div>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)'
                    }}>
                      <span style={{fontSize: '28px'}}>💰</span>
                    </div>
                    <span style={{fontSize: '24px', color: '#94a3b8'}}>→</span>
                  </div>
                  <div>
                    <h3 style={{fontSize: '1.3rem', fontWeight: '700', margin: '0 0 6px', color: '#1e293b'}}>Wallet PawaPay</h3>
                    <p style={{fontSize: '0.9rem', color: '#64748b', margin: 0, lineHeight: '1.5'}}>Consultez vos soldes et effectuez des transferts</p>
                  </div>
                </Link>
              </div>
            ) : (
              /* User Dashboard */
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px'
              }}>
                <Link href="/studios" style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '32px',
                  textDecoration: 'none',
                  color: '#1e293b',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                  border: '1px solid #e2e8f0',
                  position: 'relative',
                  overflow: 'hidden'
                }} className="hover-lift">
                  <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #667eea, #764ba2)'}}></div>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)'
                    }}>
                      <span style={{fontSize: '28px'}}>🏘️</span>
                    </div>
                    <span style={{fontSize: '22px', color: '#cbd5e1'}}>→</span>
                  </div>
                  <div>
                    <h3 style={{fontSize: '1.3rem', fontWeight: '700', margin: '0 0 6px', color: '#1e293b'}}>Découvrir les Studios</h3>
                    <p style={{fontSize: '0.9rem', color: '#64748b', margin: 0, lineHeight: '1.5'}}>Parcourez notre catalogue de propriétés et réservez votre prochain séjour</p>
                  </div>
                </Link>

                <Link href="/studios/my-bookings" style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '32px',
                  textDecoration: 'none',
                  color: '#1e293b',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                  border: '1px solid #e2e8f0',
                  position: 'relative',
                  overflow: 'hidden'
                }} className="hover-lift">
                  <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #10b981, #059669)'}}></div>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)'
                    }}>
                      <span style={{fontSize: '28px'}}>📋</span>
                    </div>
                    <span style={{fontSize: '22px', color: '#cbd5e1'}}>→</span>
                  </div>
                  <div>
                    <h3 style={{fontSize: '1.3rem', fontWeight: '700', margin: '0 0 6px', color: '#1e293b'}}>Mes Réservations</h3>
                    <p style={{fontSize: '0.9rem', color: '#64748b', margin: 0, lineHeight: '1.5'}}>Consultez et gérez toutes vos réservations en cours et passées</p>
                  </div>
                </Link>
              </div>
            )}

            {/* Quick Stats for Admin */}
            {isAdmin && (
              <div style={{marginTop: '40px'}}>
                <h2 style={{
                  color: 'white',
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span>📈</span> Accès Rapide
                </h2>
                <div style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <p style={{color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', margin: 0, lineHeight: '1.6'}}>
                    En tant qu'administrateur, vous avez accès à toutes les fonctionnalités de gestion de la plateforme. 
                    Utilisez les cartes ci-dessus pour naviguer rapidement vers les différentes sections.
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer style={{
          background: isAdmin ? 'rgba(0,0,0,0.3)' : 'white',
          borderTop: isAdmin ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
          padding: '24px 0'
        }}>
          <div className="container">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <p style={{
                color: isAdmin ? 'rgba(255,255,255,0.5)' : '#94a3b8',
                fontSize: '0.85rem',
                margin: 0
              }}>
                © 2024 StudioRent. Tous droits réservés.
              </p>
              <Link href="/" style={{
                color: isAdmin ? 'rgba(255,255,255,0.6)' : '#64748b',
                fontSize: '0.85rem',
                textDecoration: 'none'
              }}>
                Retour à l'accueil →
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
