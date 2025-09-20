"use client";

import Link from 'next/link';

export default function CommandsPage() {
  const steps = [
    {
      id: 1,
      title: "🚀 Mode Développement Hybride (Recommandé)",
      description: "Backend Docker + Frontend local pour développement optimal",
      commands: [
        {
          command: "./dev-start.sh",
          description: "Démarrer l'environnement de développement hybride"
        },
        {
          command: "./dev-stop.sh",
          description: "Arrêter l'environnement de développement"
        }
      ]
    },
    {
      id: 2,
      title: "🐘 Services Backend (Docker)",
      description: "PostgreSQL + API NestJS dans Docker",
      commands: [
        {
          command: "docker compose up -d postgres",
          description: "Démarrer PostgreSQL"
        },
        {
          command: "docker compose up -d api",
          description: "Démarrer l'API NestJS"
        },
        {
          command: "docker compose exec api npx prisma migrate dev",
          description: "Appliquer les migrations"
        }
      ]
    },
    {
      id: 3,
      title: "🌐 Frontend Local (Développement)",
      description: "Next.js en mode développement local",
      commands: [
        {
          command: "cd apps/web && npm install",
          description: "Installer les dépendances"
        },
        {
          command: "cd apps/web && npm run dev",
          description: "Démarrer Next.js en mode développement"
        }
      ]
    },
    {
      id: 4,
      title: "🗄️ Gestion Base de Données",
      description: "Migrations et outils de gestion",
      commands: [
        {
          command: "./db.sh migrate",
          description: "Appliquer les migrations Prisma"
        },
        {
          command: "./db.sh studio",
          description: "Ouvrir Prisma Studio"
        },
        {
          command: "./db.sh reset",
          description: "Réinitialiser la base de données"
        }
      ]
    },
    {
      id: 5,
      title: "🔧 Mode Production Complet (Docker)",
      description: "Tous les services en Docker pour la production",
      commands: [
        {
          command: "./start.sh",
          description: "Démarrage production automatique"
        },
        {
          command: "docker compose up -d --build",
          description: "Construire et démarrer tous les services"
        }
      ]
    },
    {
      id: 6,
      title: "✅ Vérification et Tests",
      description: "S'assurer que tout fonctionne",
      commands: [
        {
          command: "docker compose ps",
          description: "Vérifier l'état des services Docker"
        },
        {
          command: "curl -s http://localhost:4000",
          description: "Tester l'API"
        },
        {
          command: "curl -s -I http://localhost:3000",
          description: "Tester le frontend"
        }
      ]
    }
  ];

  const quickCommands = [
    {
      title: "🚀 Démarrage Dev (Recommandé)",
      command: "./dev-start.sh",
      description: "Backend Docker + Frontend local"
    },
    {
      title: "� Arrêt Dev",
      command: "./dev-stop.sh",
      description: "Arrêter l'environnement de développement"
    },
    {
      title: "�️ Gestion BDD",
      command: "./db.sh migrate",
      description: "Appliquer les migrations"
    },
    {
      title: "� Studio Prisma",
      command: "./db.sh studio",
      description: "Interface graphique BDD"
    }
  ];

  const troubleshooting = [
    {
      problem: "🚫 Port déjà utilisé",
      solution: "docker compose down && sudo lsof -ti:3000 | xargs kill",
      description: "Libérer les ports occupés"
    },
    {
      problem: "💾 Espace disque insuffisant",
      solution: "docker system prune -a --volumes -f",
      description: "Nettoyer Docker complètement"
    },
    {
      problem: "🗄️ Erreur de base de données",
      solution: "./db.sh reset",
      description: "Réinitialiser la base de données"
    },
    {
      problem: "🔄 Image non mise à jour",
      solution: "docker compose build --no-cache",
      description: "Reconstruire sans cache"
    }
  ];

  const serviceUrls = [
    {
      name: "🌐 Frontend Next.js",
      url: "http://localhost:3000",
      description: "Interface utilisateur principale"
    },
    {
      name: "🚀 API NestJS",
      url: "http://localhost:4000",
      description: "Backend REST API"
    },
    {
      name: "🗄️ Adminer",
      url: "http://localhost:8080",
      description: "Interface de gestion BDD"
    },
    {
      name: "🐘 PostgreSQL",
      url: "localhost:5432",
      description: "Base de données (connexion directe)"
    }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🚀</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Guide de Lancement</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Mon-Appart - Commandes étape par étape</p>
              </div>
            </div>
            <Link 
              href="/"
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              ← Retour Accueil
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Commands */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">⚡ Commandes Rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickCommands.map((cmd, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{cmd.title}</h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded font-mono text-sm mb-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                     onClick={() => copyToClipboard(cmd.command)}>
                  {cmd.command}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">{cmd.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Services URLs */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">🌐 Services Disponibles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {serviceUrls.map((service, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{service.name}</h3>
                <a 
                  href={service.url.startsWith("http") ? service.url : "#"}
                  target={service.url.startsWith("http") ? "_blank" : undefined}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-mono text-sm"
                  rel="noopener noreferrer"
                >
                  {service.url}
                </a>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">{service.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Step by Step Commands */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">📋 Guide Étape par Étape</h2>
          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{step.id}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                      <p className="text-blue-100">{step.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    {step.commands.map((cmd, cmdIndex) => (
                      <div key={cmdIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{cmd.description}</p>
                          <button
                            onClick={() => copyToClipboard(cmd.command)}
                            className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-2 py-1 rounded transition-colors"
                          >
                            📋 Copier
                          </button>
                        </div>
                        <div className="bg-gray-900 dark:bg-gray-950 p-3 rounded-lg">
                          <code className="text-green-400 text-sm font-mono">$ {cmd.command}</code>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Troubleshooting */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">🔧 Dépannage</h2>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-4">Problèmes Courants</h3>
            <div className="space-y-4">
              {troubleshooting.map((item, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-yellow-200 dark:border-gray-700">
                  <div className="flex items-start space-x-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">{item.problem}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{item.description}</p>
                      <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded font-mono text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                           onClick={() => copyToClipboard(item.solution)}>
                        {item.solution}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700 pt-8">
          <div className="mb-4">
            <p className="text-sm">💡 <strong>Astuce :</strong> Cliquez sur les commandes pour les copier dans le presse-papiers</p>
          </div>
          <div className="flex justify-center space-x-4 text-sm">
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">🏠 Accueil</Link>
            <span>•</span>
            <a href="http://localhost:4000" className="hover:text-blue-600 dark:hover:text-blue-400" target="_blank" rel="noopener noreferrer">🚀 API</a>
            <span>•</span>
            <a href="http://localhost:8080" className="hover:text-blue-600 dark:hover:text-blue-400" target="_blank" rel="noopener noreferrer">🗄️ Adminer</a>
          </div>
          <p className="text-xs mt-4">Mon-Appart v1.0.0 - Guide de Lancement</p>
        </footer>
      </div>
    </div>
  );
}
