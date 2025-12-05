"use client";

import Link from "next/link";
import { useAuth } from "../hooks/useAuth";

export default function Home() {
  const { mounted } = useAuth();

  const testimonials = [
    {
      name: "Marie Dubois",
      location: "Paris, France",
      rating: 5,
      comment: "Service exceptionnel ! Mon studio a été loué en moins de 48h. L'équipe est réactive et professionnelle.",
      image: "👩‍💼",
      revenue: "2,400 Fcfa/mois"
    },
    {
      name: "Thomas Martin",
      location: "Lyon, France", 
      rating: 5,
      comment: "Interface intuitive, gestion simplifiée. Mes 3 appartements génèrent maintenant des revenus stables.",
      image: "👨‍💻",
      revenue: "5,800 Fcfa/mois"
    },
    {
      name: "Sophie Bernard",
      location: "Marseille, France",
      rating: 5,
      comment: "Excellent support client ! Chaque réservation est gérée automatiquement. Je recommande vivement.",
      image: "👩‍🎨",
      revenue: "3,200 Fcfa/mois"
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

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-dual mb-4 mx-auto"></div>
          <p className="text-xl text-gray-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section with Modern Gradient */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-secondary-600 to-primary-700 pt-20 pb-32">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '48px 48px'
          }}></div>
        </div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-500/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>

        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold mb-8 border border-white/30">
              <span className="animate-pulse">🎉</span>
              <span>Plus de 2,800 studios déjà en location</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-black text-white mb-6 leading-tight">
              Louez votre
              <br />
              <span className="bg-gradient-to-r from-accent-300 via-accent-200 to-accent-100 bg-clip-text text-transparent">
                Studio en 24h
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto mb-12 font-medium leading-relaxed">
              La plateforme n°1 en France pour la location de studios.<br />
              <span className="text-white/80">Propriétaires et locataires nous font confiance pour leurs projets immobiliers.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link href="/auth/login" className="btn btn-accent group">
                <span className="text-2xl">🏠</span>
                <span>Ajouter une Maison</span>
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link href="/studios" className="btn bg-white text-primary-700 hover:bg-gray-50 hover:shadow-xl group">
                <span className="text-2xl">🔑</span>
                <span>Louer Maintenant</span>
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="card-glass p-6 text-center card-hover-lift animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-5xl mb-3 animate-float" style={{ animationDelay: `${index * 0.2}s` }}>
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-black text-white mb-1">
                    {stat.number}
                  </div>
                  <div className="text-sm font-medium text-white/80">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
              <span>⭐</span>
              <span>Témoignages Clients</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-display font-bold text-gray-900 mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez pourquoi plus de 2,800 propriétaires choisissent StudioRent
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="card p-8 hover:shadow-glow-lg group animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="text-5xl">{testimonial.image}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {testimonial.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{testimonial.location}</p>
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="text-amber-400 text-lg">⭐</span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <blockquote className="text-gray-700 leading-relaxed mb-6 italic">
                  &ldquo;{testimonial.comment}&rdquo;
                </blockquote>
                
                <div className="pt-4 border-t border-gray-100">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-success-500 to-success-600 text-white rounded-xl font-semibold text-sm shadow-lg">
                    <span>💰</span>
                    <span>Revenus: {testimonial.revenue}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-100 text-secondary-700 rounded-full text-sm font-semibold mb-4">
              <span>🚀</span>
              <span>Fonctionnalités</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-display font-bold text-gray-900 mb-4">
              Pourquoi choisir StudioRent ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une plateforme complète pour maximiser vos revenus locatifs
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="card p-8 text-center group hover:shadow-glow-lg animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-6xl mb-6 inline-block transform transition-transform group-hover:scale-110 group-hover:rotate-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-primary-600 via-secondary-600 to-primary-700">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '48px 48px'
          }}></div>
        </div>

        <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h2 className="text-4xl sm:text-5xl font-display font-black text-white mb-6">
              Prêt à maximiser vos revenus ?
            </h2>
            <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
              Rejoignez les milliers de propriétaires qui génèrent des revenus passifs avec StudioRent
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/login" className="btn bg-white text-primary-700 hover:bg-gray-50 hover:shadow-2xl group text-lg px-8 py-4">
                <span className="text-2xl">🏠</span>
                <span>Commencer Maintenant</span>
                <svg className="w-6 h-6 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link href="#contact" className="btn btn-outline border-2 border-white text-white hover:bg-white hover:text-primary-700 text-lg px-8 py-4">
                <span className="text-2xl">📞</span>
                <span>Nous Contacter</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl">🏠</div>
                <div>
                  <h4 className="text-xl font-bold">StudioRent</h4>
                  <p className="text-sm text-gray-400">Location Premium</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                La première plateforme française dédiée à la location de studios. 
                Nous connectons propriétaires et locataires pour créer des expériences exceptionnelles.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-12 h-12 bg-gray-800 hover:bg-primary-600 rounded-xl flex items-center justify-center transition-all text-xl">📧</a>
                <a href="#" className="w-12 h-12 bg-gray-800 hover:bg-primary-600 rounded-xl flex items-center justify-center transition-all text-xl">📱</a>
                <a href="#" className="w-12 h-12 bg-gray-800 hover:bg-primary-600 rounded-xl flex items-center justify-center transition-all text-xl">🌐</a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Services</h4>
              <ul className="space-y-3">
                <li><Link href="/studios" className="text-gray-400 hover:text-white transition-colors">Location Studios</Link></li>
                <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Gestion Propriétés</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Support 24/7</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Analytics</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Développement</h4>
              <ul className="space-y-3">
                <li><a href="http://localhost:5555" target="_blank" className="text-gray-400 hover:text-white transition-colors">Base de Données</a></li>
                <li><a href="http://localhost:4000" target="_blank" className="text-gray-400 hover:text-white transition-colors">API REST</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Next.js 15</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">PostgreSQL</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-gray-400">
                  <span>📧</span>
                  <span>contact@studiorent.fr</span>
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <span>📱</span>
                  <span>+33 1 23 45 67 89</span>
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <span>📍</span>
                  <span>Paris, France</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>© 2024 StudioRent. Plateforme de location premium développée avec ❤️</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
