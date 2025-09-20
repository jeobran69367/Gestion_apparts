import Link from "next/link";
export default function Home() {
  const features = [
    {
      icon: "🏠",
      title: "Gestion Complète",
      description: "Gérez facilement vos propriétés, locataires et réservations depuis une interface unique et intuitive."
    },
    {
      icon: "📊",
      title: "Analytics Avancés",
      description: "Suivez vos performances avec des tableaux de bord détaillés et des rapports personnalisés."
    },
    {
      icon: "💰",
      title: "Gestion Financière",
      description: "Automatisez la facturation, suivez les paiements et générez des rapports financiers."
    },
    {
      icon: "🔒",
      title: "Sécurité Renforcée",
      description: "Vos données sont protégées avec un chiffrement de niveau bancaire et des sauvegardes automatiques."
    },
    {
      icon: "📱",
      title: "Multi-plateforme",
      description: "Accédez à votre gestionnaire depuis n'importe quel appareil avec notre interface responsive."
    },
    {
      icon: "⚡",
      title: "Performance Optimisée",
      description: "Application rapide et réactive construite avec les dernières technologies web."
    }
  ];

  const techStack = [
    { name: "Next.js 15", color: "bg-black text-white" },
    { name: "NestJS", color: "bg-red-600 text-white" },
    { name: "TypeScript", color: "bg-blue-600 text-white" },
    { name: "PostgreSQL", color: "bg-blue-800 text-white" },
    { name: "Prisma", color: "bg-indigo-600 text-white" },
    { name: "TailwindCSS", color: "bg-cyan-500 text-white" },
    { name: "Docker", color: "bg-blue-500 text-white" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🏠</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Mon-Appart</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/commands"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                🚀 Guide de Lancement
              </Link>
              <a 
                href="http://localhost:4000" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                API
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium mb-6">
              <span className="mr-2">🎉</span>
              Application en cours de développement
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
              <span className="block">Gestionnaire de</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Propriétés Moderne
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Une solution complète et intuitive pour gérer vos biens immobiliers, 
              optimiser vos revenus et simplifier la relation avec vos locataires.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/commands"
                className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl"
              >
                🚀 Commencer le Déploiement
              </Link>
              <a 
                href="http://localhost:8080" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors font-semibold text-lg"
              >
                🗄️ Base de Données
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Overview */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Architecture Technique
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Construit avec les technologies les plus performantes du marché
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-12">
            {techStack.map((tech, index) => (
              <div
                key={index}
                className={`${tech.color} px-4 py-3 rounded-lg text-center font-medium text-sm shadow-lg hover:shadow-xl transition-shadow`}
              >
                {tech.name}
              </div>
            ))}
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white text-2xl font-bold">🌐</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Frontend</h3>
                <p className="text-gray-600 dark:text-gray-300">Next.js 15 avec React Server Components</p>
                <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm">
                  Port 3000
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white text-2xl font-bold">🚀</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Backend</h3>
                <p className="text-gray-600 dark:text-gray-300">API REST avec NestJS et Prisma ORM</p>
                <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                  Port 4000
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white text-2xl font-bold">🗄️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Database</h3>
                <p className="text-gray-600 dark:text-gray-300">PostgreSQL 15 avec migrations automatiques</p>
                <div className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm">
                  Port 5432
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Fonctionnalités Principales
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Tout ce dont vous avez besoin pour gérer vos propriétés efficacement
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-6">
            Prêt à Démarrer ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Suivez notre guide étape par étape pour lancer l&apos;application en quelques minutes
          </p>
          <Link 
            href="/commands"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl"
          >
            <span className="mr-2">🚀</span>
            Voir le Guide de Lancement
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">🏠</span>
                </div>
                <h3 className="text-lg font-bold">Mon-Appart</h3>
              </div>
              <p className="text-gray-300">
                Solution moderne de gestion immobilière construite avec les dernières technologies web.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <div className="space-y-2">
                <a href="http://localhost:3000" className="block text-gray-300 hover:text-white transition-colors">Frontend (Port 3000)</a>
                <a href="http://localhost:4000" className="block text-gray-300 hover:text-white transition-colors">API REST (Port 4000)</a>
                <a href="http://localhost:8080" className="block text-gray-300 hover:text-white transition-colors">Adminer (Port 8080)</a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Développement</h4>
              <div className="space-y-2">
                <Link href="/commands" className="block text-gray-300 hover:text-white transition-colors">Guide de Lancement</Link>
                <span className="block text-gray-300">Docker Compose</span>
                <span className="block text-gray-300">Hot Reload</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 Mon-Appart. Application en développement.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
