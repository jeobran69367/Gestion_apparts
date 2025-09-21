"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function StudioSuccessPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

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

        .success-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .success-card {
          background: white;
          border-radius: 20px;
          padding: 60px 40px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          text-align: center;
          max-width: 500px;
          width: 100%;
        }

        .success-icon {
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 30px;
          font-size: 48px;
          animation: bounce 0.6s ease-out;
        }

        @keyframes bounce {
          0% { transform: scale(0.3); }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }

        .success-title {
          font-size: 32px;
          font-weight: 700;
          color: #333;
          margin-bottom: 15px;
        }

        .success-message {
          color: #666;
          font-size: 18px;
          line-height: 1.6;
          margin-bottom: 40px;
        }

        .success-actions {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .btn-primary {
          padding: 16px 32px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .btn-secondary {
          padding: 16px 32px;
          background: transparent;
          color: #667eea;
          border: 2px solid #667eea;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .btn-secondary:hover {
          background: #667eea;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 20px;
          margin: 40px 0;
          padding: 30px;
          background: #f8f9fa;
          border-radius: 15px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-size: 24px;
          font-weight: 700;
          color: #667eea;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .success-card {
            padding: 40px 20px;
          }

          .success-actions {
            gap: 10px;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>

      <div className="success-container">
        <div className="success-card">
          <div className="success-icon">
            ✅
          </div>

          <h1 className="success-title">
            Studio créé avec succès !
          </h1>

          <p className="success-message">
            Félicitations {user?.firstName} ! Votre studio a été ajouté à la plateforme StudioRent. 
            Il est maintenant visible par les milliers de voyageurs qui recherchent un hébergement.
          </p>

          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">24h</div>
              <div className="stat-label">Temps moyen location</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">98%</div>
              <div className="stat-label">Taux satisfaction</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">2,847</div>
              <div className="stat-label">Studios loués</div>
            </div>
          </div>

                    <div className="flex gap-4">
            <Link
              href="/studios/my-studios"
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Voir mes studios
            </Link>
            <Link
              href="/studios/create"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ajouter un autre studio
            </Link>
            <Link
              href="/"
              className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Retour à l'accueil
            </Link>
          </div>

          <div style={{marginTop: '30px', padding: '20px', background: '#e8f5e8', borderRadius: '12px', fontSize: '14px', color: '#2d5a2d'}}>
            <strong>Prochaines étapes :</strong><br/>
            • Votre studio sera visible dans les 10 minutes<br/>
            • Vous recevrez un email de confirmation<br/>
            • Les réservations apparaîtront dans votre dashboard
          </div>
        </div>
      </div>
    </>
  );
}
