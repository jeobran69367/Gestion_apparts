"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth, UserRole } from "../../hooks/useAuth";

// API URL - matches existing codebase pattern
const API_URL = 'http://localhost:4000';

// Helper function to get display text for user role
function getRoleDisplayText(role: UserRole | undefined): string {
  if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
    return 'Administrateur';
  }
  return 'Utilisateur';
}

/**
 * Get user initials from first and last name
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @returns Two-letter initials or '?' if names are not available
 */
function getUserInitials(firstName: string | undefined, lastName: string | undefined): string {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return first + last || '?';
}

export default function DashboardPage() {
  const { isLoggedIn, isAdmin, user, mounted, login } = useAuth();
  const router = useRouter();
  
  // Form state for profile editing
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  // Initialize form data when user is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (mounted && !isLoggedIn) {
      router.push("/auth/login");
    }
  }, [mounted, isLoggedIn, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token || !user) {
        throw new Error('Vous devez être connecté pour modifier votre profil');
      }

      const response = await fetch(`${API_URL}/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Une erreur est survenue lors de la mise à jour');
      }

      const updatedUser = {
        ...user,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
      };
      login(token, updatedUser);
      
      setSuccess('Profil mis à jour avec succès !');
      setIsEditing(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  if (!mounted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{textAlign: 'center'}}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '3px solid rgba(255,255,255,0.1)',
            borderTopColor: '#8b5cf6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{color: 'rgba(255,255,255,0.6)', fontSize: '1rem', fontWeight: '500'}}>Chargement de votre profil...</p>
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

  const primaryColor = isAdmin ? '#10b981' : '#8b5cf6';
  const primaryGradient = isAdmin 
    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)';

  return (
    <>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #1e293b;
        }

        .profile-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .profile-input {
          width: 100%;
          padding: 16px 20px;
          border: 2px solid #e2e8f0;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 500;
          transition: all 0.25s ease;
          box-sizing: border-box;
          background: #ffffff;
          color: #1e293b;
        }

        .profile-input:focus {
          outline: none;
          border-color: ${primaryColor};
          box-shadow: 0 0 0 4px ${isAdmin ? 'rgba(16, 185, 129, 0.12)' : 'rgba(139, 92, 246, 0.12)'};
        }

        .profile-input:disabled {
          background: #f8fafc;
          color: #64748b;
          cursor: default;
          border-color: #f1f5f9;
        }

        .profile-input::placeholder {
          color: #94a3b8;
        }

        .profile-label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
          font-weight: 600;
          color: #475569;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .profile-group {
          margin-bottom: 24px;
        }

        .btn-gradient {
          padding: 16px 32px;
          background: ${primaryGradient};
          color: white;
          border: none;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 4px 14px ${isAdmin ? 'rgba(16, 185, 129, 0.35)' : 'rgba(139, 92, 246, 0.35)'};
        }

        .btn-gradient:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px ${isAdmin ? 'rgba(16, 185, 129, 0.45)' : 'rgba(139, 92, 246, 0.45)'};
        }

        .btn-gradient:active:not(:disabled) {
          transform: translateY(-1px);
        }

        .btn-gradient:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .btn-outline {
          padding: 16px 32px;
          background: white;
          color: #64748b;
          border: 2px solid #e2e8f0;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        .btn-outline:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #475569;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }

        .quick-link {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 24px;
          background: white;
          border-radius: 16px;
          text-decoration: none;
          color: #1e293b;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .quick-link:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.12);
          border-color: transparent;
        }

        .quick-link-icon {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeInUp 0.5s ease forwards;
        }

        .animate-delay-1 { animation-delay: 0.1s; opacity: 0; }
        .animate-delay-2 { animation-delay: 0.2s; opacity: 0; }
      `}</style>

      <div style={{minHeight: '100vh', background: '#f8fafc'}}>
        {/* Hero Header */}
        <div style={{
          background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
          padding: '60px 0 120px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative elements */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '500px',
            height: '500px',
            background: `radial-gradient(circle, ${isAdmin ? 'rgba(16, 185, 129, 0.15)' : 'rgba(139, 92, 246, 0.15)'} 0%, transparent 70%)`,
            borderRadius: '50%'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-30%',
            left: '-5%',
            width: '400px',
            height: '400px',
            background: `radial-gradient(circle, ${isAdmin ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)'} 0%, transparent 70%)`,
            borderRadius: '50%'
          }}></div>
          
          <div className="profile-container" style={{position: 'relative', zIndex: 1}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '24px'}}>
                {/* Avatar with initials */}
                <div style={{
                  width: '100px',
                  height: '100px',
                  background: primaryGradient,
                  borderRadius: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 20px 40px ${isAdmin ? 'rgba(16, 185, 129, 0.4)' : 'rgba(139, 92, 246, 0.4)'}`,
                  border: '4px solid rgba(255,255,255,0.2)',
                  fontSize: '36px',
                  fontWeight: '700',
                  color: 'white',
                  letterSpacing: '-0.02em'
                }}>
                  {getUserInitials(user?.firstName, user?.lastName)}
                </div>
                <div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px'}}>
                    <h1 style={{
                      color: 'white',
                      fontSize: '2rem',
                      fontWeight: '700',
                      margin: 0,
                      letterSpacing: '-0.02em'
                    }}>
                      {user?.firstName} {user?.lastName}
                    </h1>
                    {isAdmin && (
                      <span style={{
                        background: 'rgba(16, 185, 129, 0.2)',
                        color: '#34d399',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span aria-hidden="true">✓</span> Admin vérifié
                      </span>
                    )}
                  </div>
                  <p style={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '1rem',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{color: primaryColor}}>●</span>
                    {user?.email}
                  </p>
                </div>
              </div>
              
              {/* Stats badges */}
              <div style={{display: 'flex', gap: '12px'}}>
                <div style={{
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px',
                  padding: '16px 24px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  textAlign: 'center'
                }}>
                  <div style={{color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px'}}>Membre depuis</div>
                  <div style={{color: 'white', fontSize: '16px', fontWeight: '600'}}>
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', {
                      month: 'short',
                      year: 'numeric'
                    }) : '-'}
                  </div>
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px',
                  padding: '16px 24px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  textAlign: 'center'
                }}>
                  <div style={{color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px'}}>Statut</div>
                  <div style={{color: primaryColor, fontSize: '16px', fontWeight: '600'}}>{getRoleDisplayText(user?.role)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - overlapping cards */}
        <main style={{marginTop: '-60px', paddingBottom: '60px'}}>
          <div className="profile-container">
            {/* Profile Card */}
            <div className="animate-fade-in animate-delay-1" style={{
              background: 'white',
              borderRadius: '24px',
              padding: '40px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.1)',
              marginBottom: '24px',
              border: '1px solid rgba(0,0,0,0.05)'
            }}>
              {/* Section Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '32px',
                paddingBottom: '20px',
                borderBottom: '1px solid #f1f5f9'
              }}>
                <div style={{display: 'flex', alignItems: 'center', gap: '14px'}}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: `linear-gradient(135deg, ${isAdmin ? 'rgba(16, 185, 129, 0.1)' : 'rgba(139, 92, 246, 0.1)'} 0%, ${isAdmin ? 'rgba(16, 185, 129, 0.05)' : 'rgba(139, 92, 246, 0.05)'} 100%)`,
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px'
                  }}>
                    👤
                  </div>
                  <div>
                    <h2 style={{color: '#1e293b', fontSize: '1.25rem', fontWeight: '700', margin: 0}}>
                      Informations personnelles
                    </h2>
                    <p style={{color: '#64748b', fontSize: '0.875rem', margin: '2px 0 0'}}>
                      Gérez vos données de profil
                    </p>
                  </div>
                </div>
                {!isEditing && (
                  <button
                    type="button"
                    className="btn-gradient"
                    onClick={() => setIsEditing(true)}
                  >
                    <span>✏️</span>
                    Modifier
                  </button>
                )}
              </div>

              {/* Messages */}
              {error && (
                <div style={{
                  background: 'linear-gradient(135deg, #fef2f2 0%, #fff5f5 100%)',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  marginBottom: '24px',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{
                    width: '32px',
                    height: '32px',
                    background: '#fee2e2',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>❌</span>
                  {error}
                </div>
              )}

              {success && (
                <div style={{
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #f0fff4 100%)',
                  border: '1px solid #bbf7d0',
                  color: '#16a34a',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  marginBottom: '24px',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{
                    width: '32px',
                    height: '32px',
                    background: '#dcfce7',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>✓</span>
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Name Row */}
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px'}}>
                  <div className="profile-group">
                    <label className="profile-label">
                      <span style={{opacity: 0.7}}>👤</span> Prénom
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      className="profile-input"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                      placeholder="Votre prénom"
                    />
                  </div>
                  <div className="profile-group">
                    <label className="profile-label">
                      <span style={{opacity: 0.7}}>👤</span> Nom
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      className="profile-input"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                      placeholder="Votre nom"
                    />
                  </div>
                </div>

                {/* Email & Phone Row */}
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px'}}>
                  <div className="profile-group">
                    <label className="profile-label">
                      <span style={{opacity: 0.7}}>✉️</span> Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="profile-input"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                      placeholder="votre@email.com"
                    />
                  </div>
                  <div className="profile-group">
                    <label className="profile-label">
                      <span style={{opacity: 0.7}}>📱</span> Téléphone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      className="profile-input"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                </div>

                {/* Action Buttons when editing */}
                {isEditing && (
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    marginTop: '32px',
                    paddingTop: '24px',
                    borderTop: '1px solid #f1f5f9',
                    justifyContent: 'flex-end'
                  }}>
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      <span>✕</span>
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="btn-gradient"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="loading-spinner"></span>
                      ) : (
                        <>
                          <span>✓</span>
                          Enregistrer les modifications
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Quick Links Grid */}
            <div className="animate-fade-in animate-delay-2" style={{
              background: 'white',
              borderRadius: '24px',
              padding: '32px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.08)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                marginBottom: '24px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px'
                }}>
                  🚀
                </div>
                <div>
                  <h2 style={{color: '#1e293b', fontSize: '1.25rem', fontWeight: '700', margin: 0}}>
                    Actions rapides
                  </h2>
                  <p style={{color: '#64748b', fontSize: '0.875rem', margin: '2px 0 0'}}>
                    Accédez rapidement à vos fonctionnalités
                  </p>
                </div>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px'
              }}>
                <Link href="/studios" className="quick-link">
                  <div className="quick-link-icon" style={{background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)'}}>
                    🏘️
                  </div>
                  <div>
                    <div style={{fontWeight: '600', fontSize: '15px', marginBottom: '4px'}}>Explorer les studios</div>
                    <div style={{color: '#64748b', fontSize: '13px'}}>Découvrez tous les studios disponibles</div>
                  </div>
                </Link>
                
                <Link href="/studios/my-bookings" className="quick-link">
                  <div className="quick-link-icon" style={{background: 'linear-gradient(135deg, #d1fae5 0%, #dcfce7 100%)'}}>
                    📋
                  </div>
                  <div>
                    <div style={{fontWeight: '600', fontSize: '15px', marginBottom: '4px'}}>Mes réservations</div>
                    <div style={{color: '#64748b', fontSize: '13px'}}>Gérez vos réservations en cours</div>
                  </div>
                </Link>
                
                {isAdmin && (
                  <>
                    <Link href="/studios/my-studios" className="quick-link">
                      <div className="quick-link-icon" style={{background: 'linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%)'}}>
                        🏠
                      </div>
                      <div>
                        <div style={{fontWeight: '600', fontSize: '15px', marginBottom: '4px'}}>Mes studios</div>
                        <div style={{color: '#64748b', fontSize: '13px'}}>Gérez vos propriétés</div>
                      </div>
                    </Link>
                    
                    <Link href="/studios/reservations" className="quick-link">
                      <div className="quick-link-icon" style={{background: 'linear-gradient(135deg, #ede9fe 0%, #e9d5ff 100%)'}}>
                        📊
                      </div>
                      <div>
                        <div style={{fontWeight: '600', fontSize: '15px', marginBottom: '4px'}}>Gestion réservations</div>
                        <div style={{color: '#64748b', fontSize: '13px'}}>Administrez toutes les réservations</div>
                      </div>
                    </Link>
                    
                    <Link href="/studios/create" className="quick-link">
                      <div className="quick-link-icon" style={{background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)'}}>
                        ✨
                      </div>
                      <div>
                        <div style={{fontWeight: '600', fontSize: '15px', marginBottom: '4px'}}>Créer un studio</div>
                        <div style={{color: '#64748b', fontSize: '13px'}}>Ajoutez une nouvelle propriété</div>
                      </div>
                    </Link>
                    
                    <Link href="/studios/studio-payments" className="quick-link">
                      <div className="quick-link-icon" style={{background: 'linear-gradient(135deg, #ccfbf1 0%, #a7f3d0 100%)'}}>
                        💰
                      </div>
                      <div>
                        <div style={{fontWeight: '600', fontSize: '15px', marginBottom: '4px'}}>Paiements</div>
                        <div style={{color: '#64748b', fontSize: '13px'}}>Suivez les transactions</div>
                      </div>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer style={{
          background: '#0f172a',
          padding: '32px 0',
          marginTop: '40px'
        }}>
          <div className="profile-container">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  background: primaryGradient,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px'
                }}>
                  🏠
                </div>
                <span style={{color: 'white', fontWeight: '600', fontSize: '15px'}}>StudioRent</span>
              </div>
              <p style={{
                color: 'rgba(255,255,255,0.4)',
                fontSize: '0.875rem',
                margin: 0
              }}>
                © 2024 StudioRent. Tous droits réservés.
              </p>
              <Link href="/" style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: '0.875rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'color 0.2s ease'
              }}>
                Retour à l'accueil <span>→</span>
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
