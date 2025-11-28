"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";

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
    // Clear messages when user starts typing
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

      const response = await fetch(`http://localhost:4000/users/${user.id}`, {
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

      // Update user in localStorage and auth state
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
    // Reset form data to original user data
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

        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .form-input {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 16px;
          transition: all 0.3s ease;
          box-sizing: border-box;
          background: white;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-input:disabled {
          background: #f8fafc;
          color: #64748b;
          cursor: not-allowed;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .btn-primary {
          padding: 14px 28px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          padding: 14px 28px;
          background: white;
          color: #64748b;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-secondary:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #ffffff;
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          display: inline-block;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'}}>
        {/* Main Content */}
        <main style={{padding: '40px 0 60px'}}>
          <div className="container">
            {/* Header Section */}
            <div style={{marginBottom: '40px', textAlign: 'center'}}>
              <div style={{
                width: '100px',
                height: '100px',
                background: isAdmin 
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '25px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isAdmin 
                  ? '0 15px 40px rgba(16, 185, 129, 0.4)'
                  : '0 15px 40px rgba(102, 126, 234, 0.4)',
                margin: '0 auto 24px'
              }}>
                <span style={{fontSize: '48px'}}>👤</span>
              </div>
              <h1 style={{
                color: '#1e293b',
                fontSize: '2rem',
                fontWeight: '800',
                margin: '0 0 8px',
                letterSpacing: '-0.03em'
              }}>
                Mon Profil
              </h1>
              <p style={{
                color: '#64748b',
                fontSize: '1rem',
                margin: 0
              }}>
                Gérez vos informations personnelles
              </p>
              {isAdmin && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '12px',
                  padding: '8px 16px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '20px',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  <span style={{fontSize: '14px'}}>⚙️</span>
                  <span style={{color: '#10b981', fontSize: '0.85rem', fontWeight: '600'}}>Administrateur</span>
                </div>
              )}
            </div>

            {/* Profile Card */}
            <div style={{
              background: 'white',
              borderRadius: '24px',
              padding: '40px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0',
              marginBottom: '24px'
            }}>
              {/* Messages */}
              {error && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  marginBottom: '24px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span>❌</span>
                  {error}
                </div>
              )}

              {success && (
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#16a34a',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  marginBottom: '24px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span>✅</span>
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Name Row */}
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                  <div className="form-group">
                    <label className="form-label">Prénom</label>
                    <input
                      type="text"
                      name="firstName"
                      className="form-input"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                      placeholder="Votre prénom"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nom</label>
                    <input
                      type="text"
                      name="lastName"
                      className="form-input"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                      placeholder="Votre nom"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                    placeholder="votre@email.com"
                  />
                </div>

                {/* Phone */}
                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>

                {/* Role (Read-only) */}
                <div className="form-group">
                  <label className="form-label">Rôle</label>
                  <input
                    type="text"
                    className="form-input"
                    value={user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' ? 'Administrateur' : 'Utilisateur'}
                    disabled
                    style={{background: '#f1f5f9'}}
                  />
                </div>

                {/* Account Creation Date (Read-only) */}
                <div className="form-group">
                  <label className="form-label">Membre depuis</label>
                  <input
                    type="text"
                    className="form-input"
                    value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Non disponible'}
                    disabled
                    style={{background: '#f1f5f9'}}
                  />
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  marginTop: '32px',
                  justifyContent: 'flex-end'
                }}>
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={handleCancel}
                        disabled={loading}
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="loading-spinner"></span>
                        ) : (
                          'Enregistrer'
                        )}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => setIsEditing(true)}
                    >
                      ✏️ Modifier le profil
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Quick Links */}
            <div style={{
              background: 'white',
              borderRadius: '24px',
              padding: '32px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0'
            }}>
              <h2 style={{
                color: '#1e293b',
                fontSize: '1.2rem',
                fontWeight: '700',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span>🔗</span> Accès rapide
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px'
              }}>
                <Link href="/studios" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: '#475569',
                  transition: 'all 0.2s ease',
                  border: '1px solid transparent'
                }}>
                  <span style={{fontSize: '20px'}}>🏘️</span>
                  <span style={{fontWeight: '500'}}>Explorer les studios</span>
                </Link>
                <Link href="/studios/my-bookings" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: '#475569',
                  transition: 'all 0.2s ease',
                  border: '1px solid transparent'
                }}>
                  <span style={{fontSize: '20px'}}>📋</span>
                  <span style={{fontWeight: '500'}}>Mes réservations</span>
                </Link>
                {isAdmin && (
                  <>
                    <Link href="/studios/my-studios" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px',
                      background: '#f8fafc',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      color: '#475569',
                      transition: 'all 0.2s ease',
                      border: '1px solid transparent'
                    }}>
                      <span style={{fontSize: '20px'}}>🏠</span>
                      <span style={{fontWeight: '500'}}>Mes studios</span>
                    </Link>
                    <Link href="/studios/reservations" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px',
                      background: '#f8fafc',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      color: '#475569',
                      transition: 'all 0.2s ease',
                      border: '1px solid transparent'
                    }}>
                      <span style={{fontSize: '20px'}}>📊</span>
                      <span style={{fontWeight: '500'}}>Gestion réservations</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer style={{
          background: 'white',
          borderTop: '1px solid #e2e8f0',
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
                color: '#94a3b8',
                fontSize: '0.85rem',
                margin: 0
              }}>
                © 2024 StudioRent. Tous droits réservés.
              </p>
              <Link href="/" style={{
                color: '#64748b',
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
