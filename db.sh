#!/bin/bash

echo "🗄️ Gestionnaire de Base de Données - Mon Appart"
echo "=============================================="

case "$1" in
  "migrate")
    echo "🔄 Application des migrations..."
    docker compose exec api npx prisma migrate deploy
    ;;
  "studio")
    echo "🎨 Ouverture de Prisma Studio..."
    docker compose exec api npx prisma studio --hostname 0.0.0.0
    ;;
  "reset")
    echo "⚠️ ATTENTION: Ceci va supprimer toutes les données!"
    read -p "Êtes-vous sûr? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      docker compose exec api npx prisma migrate reset --force
    fi
    ;;
  "seed")
    echo "🌱 Seeding de la base de données..."
    docker compose exec api npx prisma db seed
    ;;
  "generate")
    echo "⚙️ Génération du client Prisma..."
    docker compose exec api npx prisma generate
    ;;
  "status")
    echo "📊 Statut des migrations..."
    docker compose exec api npx prisma migrate status
    ;;
  *)
    echo "Usage: $0 {migrate|studio|reset|seed|generate|status}"
    echo ""
    echo "Commandes disponibles:"
    echo "  migrate   - Appliquer les migrations"
    echo "  studio    - Ouvrir Prisma Studio"
    echo "  reset     - Réinitialiser la base de données"
    echo "  seed      - Seeder la base de données"
    echo "  generate  - Générer le client Prisma"
    echo "  status    - Voir le statut des migrations"
    ;;
esac
