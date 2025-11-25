"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateStudioPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    surface: '',
    capacity: '2',
    bedrooms: '1',
    bathrooms: '1',
    pricePerNight: '',
    minStay: '1',
    maxStay: '30',
    photos: '',
    amenities: '',
    rules: '',
  });

  useEffect(() => {
    setMounted(true);
    // Vérifier l'authentification
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    setUser(JSON.parse(userData));
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      const token = localStorage.getItem('token');
      
      // Préparer les données
      const studioData = {
        ...formData,
        surface: formData.surface ? parseFloat(formData.surface) : undefined,
        capacity: parseInt(formData.capacity),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        pricePerNight: parseInt(formData.pricePerNight),
        minStay: parseInt(formData.minStay),
        maxStay: parseInt(formData.maxStay),
        photos: formData.photos ? formData.photos.split(',').map(p => p.trim()).filter(p => p) : [],
        amenities: formData.amenities ? formData.amenities.split(',').map(a => a.trim()).filter(a => a) : [],
        rules: formData.rules ? formData.rules.split(',').map(r => r.trim()).filter(r => r) : [],
      };

      const response = await fetch('http://localhost:4000/api/studios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(studioData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Une erreur est survenue');
      }

      // Rediriger vers la page de succès ou liste des studios
      router.push('/studios/success');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return <div>Chargement...</div>;
  }

  return (
    <>
      <style jsx global>{`
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          margin: 0;
          padding: 0;
          background: #f8f9fa;
        }

        .create-container {
          min-height: 100vh;
          padding: 20px;
        }

        .create-header {
          background: white;
          padding: 20px 0;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 30px;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 15px;
          text-decoration: none;
          color: #333;
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
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 15px;
          color: #666;
        }

        .create-content {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .page-title {
          font-size: 32px;
          font-weight: 700;
          color: #333;
          margin-bottom: 10px;
        }

        .page-subtitle {
          color: #666;
          font-size: 16px;
          margin-bottom: 30px;
        }

        .form-section {
          margin-bottom: 40px;
        }

        .section-title {
          font-size: 20px;
          font-weight: 600;
          color: #333;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #f0f0f0;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-row-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 20px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #333;
          font-size: 14px;
        }

        .form-input, .form-textarea, .form-select {
          width: 100%;
          padding: 15px;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          font-size: 16px;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }

        .form-textarea {
          min-height: 120px;
          resize: vertical;
        }

        .form-input:focus, .form-textarea:focus, .form-select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .help-text {
          font-size: 12px;
          color: #666;
          margin-top: 5px;
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

        .form-actions {
          display: flex;
          gap: 15px;
          justify-content: flex-end;
          padding-top: 30px;
          border-top: 1px solid #e9ecef;
        }

        .btn-cancel {
          padding: 15px 30px;
          border: 2px solid #e9ecef;
          background: white;
          color: #666;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
        }

        .btn-cancel:hover {
          border-color: #ccc;
          background: #f8f9fa;
        }

        .btn-submit {
          padding: 15px 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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
          .form-row, .form-row-3 {
            grid-template-columns: 1fr;
          }

          .create-content {
            padding: 30px 20px;
          }

          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="create-container">
        <header className="create-header">
          <div className="header-content">
            <Link href="/" className="logo">
              <div className="logo-icon">🏠</div>
              <div>
                <div style={{fontSize: '20px', fontWeight: '700'}}>StudioRent</div>
                <div style={{fontSize: '12px', color: '#666'}}>Ajouter un studio</div>
              </div>
            </Link>
            <div className="user-info">
              <span>👋 Bonjour {user.firstName}</span>
            </div>
          </div>
        </header>

        <div className="create-content">
          <h1 className="page-title">Ajouter un nouveau studio</h1>
          <p className="page-subtitle">
            Remplissez les informations ci-dessous pour mettre votre studio en location
          </p>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Informations générales */}
            <div className="form-section">
              <h2 className="section-title">📝 Informations générales</h2>
              
              <div className="form-group">
                <label className="form-label">Nom du studio *</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Studio moderne centre-ville"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-textarea"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Décrivez votre studio, ses atouts, l'ambiance..."
                />
                <div className="help-text">Une description attractive augmente vos chances de location</div>
              </div>
            </div>

            {/* Localisation */}
            <div className="form-section">
              <h2 className="section-title">📍 Localisation</h2>
              
              <div className="form-group">
                <label className="form-label">Adresse complète *</label>
                <input
                  type="text"
                  name="address"
                  className="form-input"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  placeholder="15 rue de la République"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Ville *</label>
                  <input
                    type="text"
                    name="city"
                    className="form-input"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    placeholder="Paris"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Code postal *</label>
                  <input
                    type="text"
                    name="postalCode"
                    className="form-input"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                    placeholder="75001"
                  />
                </div>
              </div>
            </div>

            {/* Caractéristiques */}
            <div className="form-section">
              <h2 className="section-title">🏠 Caractéristiques</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Surface (m²)</label>
                  <input
                    type="number"
                    name="surface"
                    className="form-input"
                    value={formData.surface}
                    onChange={handleInputChange}
                    placeholder="25"
                    min="1"
                    step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Capacité *</label>
                  <select
                    name="capacity"
                    className="form-select"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="1">1 personne</option>
                    <option value="2">2 personnes</option>
                    <option value="3">3 personnes</option>
                    <option value="4">4 personnes</option>
                    <option value="5">5 personnes</option>
                    <option value="6">6+ personnes</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Chambres *</label>
                  <select
                    name="bedrooms"
                    className="form-select"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="1">1 chambre</option>
                    <option value="2">2 chambres</option>
                    <option value="3">3 chambres</option>
                    <option value="4">4+ chambres</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Salles de bain *</label>
                  <select
                    name="bathrooms"
                    className="form-select"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="1">1 salle de bain</option>
                    <option value="2">2 salles de bain</option>
                    <option value="3">3+ salles de bain</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Prix et disponibilité */}
            <div className="form-section">
              <h2 className="section-title">💰 Prix et disponibilité</h2>
              
              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">Prix par nuit (Fcfa) *</label>
                  <input
                    type="number"
                    name="pricePerNight"
                    className="form-input"
                    value={formData.pricePerNight}
                    onChange={handleInputChange}
                    required
                    placeholder="65"
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Séjour minimum</label>
                  <select
                    name="minStay"
                    className="form-select"
                    value={formData.minStay}
                    onChange={handleInputChange}
                  >
                    <option value="1">1 nuit</option>
                    <option value="2">2 nuits</option>
                    <option value="3">3 nuits</option>
                    <option value="7">1 semaine</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Séjour maximum</label>
                  <select
                    name="maxStay"
                    className="form-select"
                    value={formData.maxStay}
                    onChange={handleInputChange}
                  >
                    <option value="7">1 semaine</option>
                    <option value="14">2 semaines</option>
                    <option value="30">1 mois</option>
                    <option value="90">3 mois</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Photos et équipements */}
            <div className="form-section">
              <h2 className="section-title">📸 Photos et équipements</h2>
              
              <div className="form-group">
                <label className="form-label">URLs des photos</label>
                <textarea
                  name="photos"
                  className="form-textarea"
                  value={formData.photos}
                  onChange={handleInputChange}
                  placeholder="https://exemple.com/photo1.jpg, https://exemple.com/photo2.jpg"
                />
                <div className="help-text">Séparez les URLs par des virgules</div>
              </div>

              <div className="form-group">
                <label className="form-label">Équipements</label>
                <textarea
                  name="amenities"
                  className="form-textarea"
                  value={formData.amenities}
                  onChange={handleInputChange}
                  placeholder="WiFi, Cuisine équipée, Machine à laver, Parking, Balcon"
                />
                <div className="help-text">Séparez les équipements par des virgules</div>
              </div>

              <div className="form-group">
                <label className="form-label">Règles de la maison</label>
                <textarea
                  name="rules"
                  className="form-textarea"
                  value={formData.rules}
                  onChange={handleInputChange}
                  placeholder="Non fumeur, Pas d'animaux, Respect du voisinage"
                />
                <div className="help-text">Séparez les règles par des virgules</div>
              </div>
            </div>

            <div className="form-actions">
              <Link href="/" className="btn-cancel">
                Annuler
              </Link>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Création en cours...
                  </>
                ) : (
                  <>
                    <span>🏠</span>
                    Créer le studio
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
