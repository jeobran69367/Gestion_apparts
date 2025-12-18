"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import API_BASE_URL from '../../config/api';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Une erreur est survenue');
      }

      // Stocker le token dans localStorage
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Rediriger vers le dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }

        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .login-card {
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 450px;
          position: relative;
          overflow: hidden;
        }

        .login-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .login-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .login-logo {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 28px;
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .login-title {
          font-size: 28px;
          font-weight: 700;
          color: #333;
          margin-bottom: 8px;
        }

        .login-subtitle {
          color: #666;
          font-size: 16px;
        }

        .auth-tabs {
          display: flex;
          background: #f8f9fa;
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 30px;
        }

        .auth-tab {
          flex: 1;
          padding: 12px;
          text-align: center;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: #666;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .auth-tab.active {
          background: white;
          color: #667eea;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #333;
          font-size: 14px;
        }

        .form-input {
          width: 100%;
          padding: 15px;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          font-size: 16px;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .error-message {
          background: #fee;
          border: 1px solid #fcc;
          color: #c33;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .submit-button {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 20px;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .back-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #667eea;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .back-link:hover {
          color: #764ba2;
        }

        .oauth-section {
          margin-top: 30px;
          padding-top: 30px;
          border-top: 1px solid #e9ecef;
        }

        .oauth-title {
          text-align: center;
          color: #666;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .oauth-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .oauth-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 14px;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          background: white;
          color: #333;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .oauth-button:hover {
          border-color: #667eea;
          background: #f8f9ff;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #ffffff;
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .login-card {
            padding: 30px 20px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">🏠</div>
            <h1 className="login-title">
              {isLogin ? 'Connexion' : 'Créer un compte'}
            </h1>
            <p className="login-subtitle">
              {isLogin 
                ? 'Connectez-vous pour gérer vos studios' 
                : 'Rejoignez StudioRent et louez vos propriétés'
              }
            </p>
          </div>

          <div className="auth-tabs">
            <button 
              className={`auth-tab ${isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              Connexion
            </button>
            <button 
              className={`auth-tab ${!isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(false)}
            >
              Inscription
            </button>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Prénom</label>
                  <input
                    type="text"
                    name="firstName"
                    className="form-input"
                    value={formData.firstName}
                    onChange={handleInputChange}
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
                    required
                    placeholder="Votre nom"
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="votre@email.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <input
                type="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder={isLogin ? 'Votre mot de passe' : 'Minimum 6 caractères'}
                minLength={6}
              />
              {isLogin && (
                <div style={{ marginTop: '8px', textAlign: 'right' }}>
                  <Link href="/auth/forgot-password" style={{ color: '#667eea', fontSize: '14px', textDecoration: 'none' }}>
                    Mot de passe oublié ?
                  </Link>
                </div>
              )}
            </div>

            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Téléphone (optionnel)</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
            )}

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? (
                <div className="loading-spinner"></div>
              ) : (
                isLogin ? 'Se connecter' : 'Créer mon compte'
              )}
            </button>
          </form>

          <div className="oauth-section">
            <p className="oauth-title">Ou continuez avec</p>
            <div className="oauth-buttons">
              <a href="#" className="oauth-button">
                <span style={{fontSize: '20px'}}>🔍</span>
                Google
              </a>
              <a href="#" className="oauth-button">
                <span style={{fontSize: '20px'}}>🐙</span>
                GitHub
              </a>
            </div>
          </div>

          <Link href="/" className="back-link">
            <span>←</span>
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </>
  );
}
