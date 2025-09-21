#!/bin/bash

echo "🚀 Démarrage professionnel de l'application Mon-Appart"
echo "=================================================="

# Nettoyer les anciens containers et volumes si nécessaire
echo "🧹 Nettoyage des anciens containers..."
docker compose down -v 2>/dev/null || true

# Construire et démarrer les services
echo "🔨 Construction et démarrage des services..."
docker compose up -d --build

# Attendre que PostgreSQL soit prêt
echo "⏳ Attente de PostgreSQL..."
until docker compose exec postgres pg_isready -U postgres > /dev/null 2>&1; do
  echo "   PostgreSQL n'est pas encore prêt, attente..."
  sleep 2
done

echo "✅ PostgreSQL est prêt!"

# Vérifier les logs de l'API pour s'assurer que les migrations sont bien exécutées
echo "📋 Vérification des logs de l'API..."
sleep 5
docker compose logs api

echo ""
echo "🎉 Application démarrée avec succès!"
echo "📊 Services disponibles:"
echo "   🌐 Web App:     http://localhost:3000"
echo "   🚀 API:         http://localhost:4000"
echo "   🗄️  Adminer:     http://localhost:8080"
echo "   🐘 PostgreSQL:  localhost:5432"
echo ""
echo "💡 Commandes utiles:"
echo "   docker compose logs api     # Voir les logs de l'API"
echo "   docker compose logs web     # Voir les logs du frontend"
echo "   docker compose exec api sh  # Accéder au container API"
echo ""
