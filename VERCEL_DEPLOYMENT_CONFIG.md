# Configuration Vercel - Déploiement Conditionnel

Ce guide explique comment configurer Vercel pour qu'il ne déploie que lorsque les tests GitHub Actions réussissent.

## 🎯 Objectif

- ✅ CI/CD se lance à chaque push
- ✅ Vercel déploie seulement si tous les tests passent
- ✅ Merge vers master bloqué si les tests échouent

## 📋 Configuration Requise

### 1. Protection de la Branche Master sur GitHub

1. Aller sur GitHub → Settings → Branches
2. Ajouter une règle de protection pour `master`:
   - ✅ Cocher "Require status checks to pass before merging"
   - ✅ Sélectionner les checks requis:
     - `API - Tests, Lint & Build`
     - `Web - Lint & Build`
     - `All Tests Passed`
   - ✅ Cocher "Require branches to be up to date before merging"
   - ✅ (Optionnel) Cocher "Include administrators"

**Résultat**: Le merge vers master sera impossible si les tests échouent.

### 2. Configuration Vercel - Option A (Recommandée)

#### Dans les Paramètres du Projet Vercel:

1. Aller sur Vercel Dashboard → Votre Projet → Settings
2. Aller dans **Git** → **Deploy Hooks**
3. Configurer:
   - **Production Branch**: `master` uniquement
   - **Deploy Previews**: Activé pour voir les PRs

#### Configurer "Ignored Build Step":

1. Dans Settings → Git → **Ignored Build Step**
2. Activer "Override" et utiliser:
   ```bash
   ./vercel-ignore-build.sh
   ```
   
   **Note**: Le script est placé à la racine du repository (pas dans `apps/web/`) pour être accessible par Vercel.

**Résultat**: Vercel exécutera le script avant chaque build pour décider s'il faut déployer.

### 3. Configuration Vercel - Option B (Branch Protection)

#### Utiliser GitHub Checks Integration:

1. Dans Settings → Git
2. Activer **"Cancel Deployment on Pull Request Close"**
3. Sous **Production Branch**, définir `master` uniquement
4. Dans **Deploy Hooks**, s'assurer que:
   - Production: Seulement `master`
   - Preview: Pull Requests uniquement

#### Workflow Recommandé:

```
┌─────────────────┐
│  Push to PR     │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ GitHub Actions  │  ← Tests, Lint, Build
│   (CI/CD)       │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
   FAIL     PASS
    │         │
    v         v
┌─────────┐ ┌─────────────┐
│ Vercel  │ │ Vercel      │
│ Preview │ │ Preview OK  │
│ (Skip)  │ │             │
└─────────┘ └─────────────┘
                 │
            (Tests OK)
                 │
                 v
         ┌──────────────┐
         │ Merge to     │
         │ Master       │
         └──────┬───────┘
                │
                v
         ┌──────────────┐
         │ Vercel       │
         │ Production   │
         │ Deploy       │
         └──────────────┘
```

## 🔧 Comment ça Marche

### Script `vercel-ignore-build.sh`

Le script vérifie:
1. **Branche Master/Main**: Permet le déploiement (protection GitHub empêche merge si tests échouent)
2. **Autres Branches**: Permet les previews (les développeurs peuvent voir les changements)

### Protection GitHub

La configuration GitHub empêche:
- ❌ Merge si les tests échouent
- ❌ Merge si la branche n'est pas à jour
- ✅ Assure que master contient toujours du code qui passe les tests

## ✅ Vérification

### Tester que ça Fonctionne:

1. **Créer une PR avec tests qui échouent**:
   ```bash
   git checkout -b test-failing
   # Faire un changement qui casse les tests
   git commit -am "test: intentionally breaking"
   git push origin test-failing
   ```

2. **Vérifier**:
   - ✅ GitHub Actions s'exécute et échoue
   - ✅ Preview Vercel peut se créer (pour voir les changements)
   - ✅ Bouton "Merge" est désactivé sur GitHub

3. **Corriger les tests**:
   ```bash
   # Corriger le code
   git commit -am "fix: correct the issue"
   git push origin test-failing
   ```

4. **Vérifier**:
   - ✅ GitHub Actions s'exécute et réussit
   - ✅ Preview Vercel est à jour
   - ✅ Bouton "Merge" est maintenant actif

5. **Merger vers Master**:
   - ✅ GitHub permet le merge
   - ✅ Vercel déploie automatiquement en production

## 🚨 Dépannage

### Problème: Vercel déploie quand même sur les PRs avec tests qui échouent

**Solution 1**: Vérifier que le script `vercel-ignore-build.sh` est exécutable:
```bash
chmod +x vercel-ignore-build.sh
git add vercel-ignore-build.sh
git commit -m "fix: make script executable"
```

**Note**: Le script doit être à la racine du repository pour être accessible par Vercel.

**Solution 2**: Vérifier la configuration Vercel:
- Settings → Git → Ignored Build Step doit être configuré

### Problème: GitHub ne bloque pas le merge

**Solution**: Vérifier les Branch Protection Rules:
1. GitHub → Settings → Branches → master
2. S'assurer que "Require status checks" est activé
3. S'assurer que les 3 checks sont sélectionnés

### Problème: CI/CD ne se lance pas sur tous les push

**Solution**: Vérifier `.github/workflows/ci-cd.yml`:
```yaml
on:
  pull_request:  # Pas de restriction de branche
  push:          # Pas de restriction de branche
```

## 📖 Ressources

- [Vercel Ignored Build Step](https://vercel.com/docs/concepts/projects/overview#ignored-build-step)
- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [Vercel GitHub Integration](https://vercel.com/docs/concepts/git/vercel-for-github)

## 🎯 Résultat Final

Avec cette configuration:

1. **Chaque Push**: CI/CD s'exécute automatiquement
2. **Tests Échouent**: 
   - GitHub bloque le merge vers master
   - Vercel peut créer une preview (pour debug)
3. **Tests Réussissent**: 
   - GitHub permet le merge
   - Vercel déploie en production après merge
4. **Master Protégé**: Contient toujours du code testé et validé

---

**Date**: Décembre 2024  
**Auteur**: Configuration CI/CD pour Gestion Apparts
