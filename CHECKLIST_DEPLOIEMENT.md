# ✅ Checklist de Déploiement - Gestion Apparts

Utilisez cette checklist pour vous assurer que tout est correctement configuré lors du déploiement.

---

## 🎯 Phase 1: Préparation (Avant le Déploiement)

### Code et Configuration

- [ ] Le code est commité et poussé sur GitHub
- [ ] Tous les tests passent localement
- [ ] Les fichiers `.env.example` sont créés
- [ ] Le fichier `railway.toml` existe à la racine
- [ ] Le fichier `vercel.json` existe à la racine
- [ ] Les fichiers `.gitignore` excluent les fichiers sensibles
- [ ] Les secrets ne sont pas committés dans le code

### Base de Code

- [ ] `apps/api/package.json` contient tous les scripts nécessaires
- [ ] `apps/web/package.json` contient tous les scripts nécessaires
- [ ] Les dépendances sont à jour (`npm outdated`)
- [ ] Pas de vulnérabilités critiques (`npm audit`)

### Documentation

- [ ] `GUIDE_DEPLOIEMENT_COMPLET.md` est lu et compris
- [ ] `COMMANDES_DEPLOIEMENT.md` est disponible pour référence
- [ ] Les URLs et identifiants sont notés en lieu sûr

---

## 🚂 Phase 2: Déploiement Backend (Railway)

### Création du Projet

- [ ] Compte Railway créé et vérifié
- [ ] Nouveau projet créé sur Railway
- [ ] Repository GitHub connecté à Railway
- [ ] Railway a détecté le projet correctement

### Base de Données PostgreSQL

- [ ] Base de données PostgreSQL créée sur Railway
- [ ] `DATABASE_URL` est disponible dans les variables
- [ ] Connexion à la base de données testée

### Variables d'Environnement

Vérifiez que toutes ces variables sont configurées:

- [ ] `DATABASE_URL` (automatique avec PostgreSQL)
- [ ] `PORT` (automatique sur Railway)
- [ ] `JWT_SECRET` (généré et sécurisé)
- [ ] `JWT_EXPIRES_IN` (ex: "7d")
- [ ] `EMAIL_HOST` (ex: smtp.gmail.com)
- [ ] `EMAIL_PORT` (ex: 587)
- [ ] `EMAIL_SECURE` (ex: false)
- [ ] `EMAIL_USER` (votre email)
- [ ] `EMAIL_PASSWORD` (mot de passe d'application)
- [ ] `EMAIL_FROM` (email d'expédition)
- [ ] `PAWAPAY_API_KEY` (clé API PawaPay)
- [ ] `PAWAPAY_API_URL` (URL API PawaPay)
- [ ] `FRONTEND_URL` (URL Vercel - à ajouter après déploiement frontend)
- [ ] `NODE_ENV=production`
- [ ] `MAX_FILE_SIZE=100mb`

### Build et Déploiement

- [ ] Le build Railway s'est terminé avec succès
- [ ] Les migrations Prisma ont été appliquées
- [ ] L'application démarre sans erreurs
- [ ] Un domaine public a été généré
- [ ] L'URL de l'API a été copiée (ex: `https://xxx.railway.app`)

### Tests Backend

- [ ] L'endpoint API est accessible: `https://xxx.railway.app/api/studios`
- [ ] Les logs Railway ne montrent pas d'erreurs critiques
- [ ] La connexion à la base de données fonctionne
- [ ] Les requêtes API retournent des réponses valides

---

## ▲ Phase 3: Déploiement Frontend (Vercel)

### Création du Projet

- [ ] Compte Vercel créé et vérifié
- [ ] Nouveau projet importé depuis GitHub
- [ ] Framework Next.js détecté automatiquement

### Configuration Build

- [ ] **Root Directory: `apps/web`** (OBLIGATOIRE pour monorepo)
- [ ] Framework Preset: Next.js (auto-détecté)
- [ ] Build Command: Laisser par défaut ou vide (auto-détection)
- [ ] Output Directory: Laisser par défaut ou vide (auto-détection)
- [ ] Install Command: Laisser par défaut ou vide (auto-détection)

### Variables d'Environnement

Vérifiez que toutes ces variables sont configurées:

- [ ] `NEXT_PUBLIC_API_URL` (URL Railway copiée précédemment)
- [ ] `PAWAPAY_API_KEY` (même clé que backend)
- [ ] `NEXT_PUBLIC_APP_NAME` (nom de l'app)
- [ ] `NEXT_PUBLIC_APP_URL` (sera l'URL Vercel)

### Build et Déploiement

- [ ] Le build Vercel s'est terminé avec succès
- [ ] Aucune erreur dans les logs de build
- [ ] L'application est déployée et accessible
- [ ] L'URL Vercel a été copiée (ex: `https://xxx.vercel.app`)

### Tests Frontend

- [ ] Le site web est accessible: `https://xxx.vercel.app`
- [ ] Les pages se chargent correctement
- [ ] Pas d'erreurs dans la console du navigateur
- [ ] Les images et assets se chargent

---

## 🔗 Phase 4: Connexion Backend ↔ Frontend

### Mise à Jour CORS

- [ ] Retour sur Railway
- [ ] Variable `FRONTEND_URL` mise à jour avec l'URL Vercel
- [ ] Railway a redéployé automatiquement
- [ ] Pas d'erreurs CORS dans la console du navigateur

### Tests de Connectivité

- [ ] Le frontend peut appeler l'API
- [ ] Les requêtes API ne retournent pas d'erreur CORS
- [ ] L'authentification fonctionne
- [ ] Les données sont récupérées depuis l'API

---

## 🧪 Phase 5: Tests Fonctionnels

### Tests Utilisateur

- [ ] Inscription d'un nouvel utilisateur fonctionne
- [ ] Connexion avec email/mot de passe fonctionne
- [ ] Déconnexion fonctionne
- [ ] Les tokens JWT sont valides

### Tests Fonctionnalités Principales

- [ ] Affichage de la liste des studios
- [ ] Création d'un nouveau studio (si accès admin)
- [ ] Modification d'un studio (si accès)
- [ ] Création d'une réservation
- [ ] Affichage des réservations
- [ ] Modification du statut de réservation

### Tests Paiements

- [ ] Initialisation d'un paiement
- [ ] Intégration PawaPay fonctionne
- [ ] Les paiements sont enregistrés dans la base
- [ ] Les statuts de paiement sont mis à jour

### Tests Emails

- [ ] Les emails de confirmation sont envoyés
- [ ] Les emails arrivent dans la boîte de réception
- [ ] Le format des emails est correct
- [ ] Les liens dans les emails fonctionnent

### Tests Upload/Images

- [ ] Upload de photos de studios fonctionne
- [ ] Les images sont affichées correctement
- [ ] Les images en Base64 sont gérées
- [ ] Pas de dépassement de limite de taille

---

## 🔒 Phase 6: Sécurité

### Vérifications de Sécurité

- [ ] JWT_SECRET est fort et unique (32+ caractères)
- [ ] Pas de secrets dans le code source (vérifier avec `git log --all -S "password"`)
- [ ] CORS configuré avec les bons domaines uniquement
- [ ] HTTPS activé (automatique sur Railway et Vercel)
- [ ] Variables d'environnement sensibles protégées
- [ ] Mot de passe email utilise un "mot de passe d'application"
- [ ] NODE_ENV=production sur Railway

### Audit de Sécurité

- [ ] `npm audit` exécuté sur backend (apps/api)
- [ ] `npm audit` exécuté sur frontend (apps/web)
- [ ] Vulnérabilités critiques corrigées
- [ ] Dépendances à jour

---

## 📊 Phase 7: Monitoring et Documentation

### Monitoring

- [ ] Logs Railway accessibles et compréhensibles
- [ ] Logs Vercel accessibles
- [ ] Métriques Railway configurées
- [ ] Pas d'erreurs critiques dans les logs

### Documentation

- [ ] URL de l'API notée: `_______________________`
- [ ] URL du Frontend notée: `_______________________`
- [ ] URL de la base de données notée: `_______________________`
- [ ] Identifiants Railway sauvegardés
- [ ] Identifiants Vercel sauvegardés
- [ ] Clés API documentées dans un lieu sûr

### Accès d'Équipe

- [ ] Membres de l'équipe ajoutés sur Railway
- [ ] Membres de l'équipe ajoutés sur Vercel
- [ ] Accès GitHub configurés
- [ ] Guide de déploiement partagé avec l'équipe

---

## 🚀 Phase 8: Post-Déploiement

### Déploiements Automatiques

- [ ] Push sur `main` déclenche un déploiement Railway
- [ ] Push sur `main` déclenche un déploiement Vercel
- [ ] Webhooks GitHub configurés
- [ ] Notifications de déploiement activées

### Optimisations

- [ ] Images optimisées (Next.js Image component)
- [ ] Cache configuré
- [ ] Compression activée
- [ ] Performance vérifiée (Lighthouse/PageSpeed)

### Backup

- [ ] Stratégie de backup de base de données définie
- [ ] Premier backup manuel effectué
- [ ] Backups automatiques Railway vérifiés
- [ ] Procédure de restauration testée (en dev)

### Domaines Personnalisés (Optionnel)

- [ ] Domaine acheté
- [ ] DNS configuré pour Railway
- [ ] DNS configuré pour Vercel
- [ ] SSL/HTTPS fonctionne sur domaines personnalisés

---

## 📈 Phase 9: Validation Finale

### Tests de Charge (Optionnel mais Recommandé)

- [ ] Test de charge basique effectué
- [ ] L'application répond correctement sous charge
- [ ] Pas de timeouts
- [ ] Métriques de performance acceptables

### Rollback Plan

- [ ] Procédure de rollback documentée
- [ ] Rollback testé sur un ancien déploiement (test)
- [ ] Équipe formée sur la procédure de rollback

### Go/No-Go Décision

- [ ] Tous les tests critiques passent
- [ ] Aucun bug bloquant identifié
- [ ] Performance acceptable
- [ ] Sécurité validée
- [ ] Équipe prête pour le support

---

## 🎉 Phase 10: Mise en Production

### Annonce

- [ ] Stakeholders informés du déploiement
- [ ] URLs de production communiquées
- [ ] Documentation utilisateur partagée
- [ ] Support/hotline défini

### Monitoring Initial

- [ ] Surveiller les logs pendant les premières heures
- [ ] Vérifier les métriques
- [ ] Répondre aux premiers retours utilisateurs
- [ ] Corriger les bugs critiques immédiatement

---

## 📝 Notes et URLs

### URLs de Production

```
API Backend (Railway): ___________________________________
Frontend (Vercel):     ___________________________________
Base de Données:       ___________________________________
```

### Identifiants Importants

```
Railway Project ID:    ___________________________________
Vercel Project ID:     ___________________________________
Database Password:     ___________________________________
```

### Contacts

```
Admin Railway:         ___________________________________
Admin Vercel:          ___________________________________
Admin GitHub:          ___________________________________
```

---

## 🆘 En Cas de Problème

### Contacts d'Urgence

- **Railway Support**: [railway.app/support](https://railway.app/support)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Team Lead**: _______________________
- **DevOps**: _______________________

### Procédure d'Urgence

1. ⚠️ Identifier le problème (logs)
2. 🔍 Vérifier si c'est un problème connu
3. 🔙 Rollback si nécessaire
4. 📞 Contacter le support si besoin
5. 📝 Documenter l'incident

---

## ✅ Validation Finale

- [ ] **TOUT** est coché ci-dessus
- [ ] L'application fonctionne en production
- [ ] Les utilisateurs peuvent accéder à l'application
- [ ] Aucun bug critique
- [ ] L'équipe est formée

### Signature

```
Date de déploiement: _______________
Déployé par:        _______________
Validé par:         _______________
```

---

**🎊 Félicitations! Votre application est en production! 🎊**

---

**Version**: 1.0  
**Dernière mise à jour**: Décembre 2024
