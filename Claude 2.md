# CLAUDE.md — Nexio

> Ce fichier définit les règles de travail pour Claude Code sur ce projet.
> Il complète le CLAUDE.md global sans le dupliquer.

---

## Contexte du projet

Nexio est une application de suivi de recherche d'emploi.
Elle permet de gérer les contacts LinkedIn, automatiser les relances, centraliser les templates de messages et piloter la prospection via un kanban visuel.

Double objectif :

- Outil concret pour optimiser la recherche d'emploi de Gilles
- Projet agentique pour monter en compétence sur Claude Code de façon structurée

---

## Stack

### Frontend

- React 18 + TypeScript + Tailwind + Vite
- Zustand (état global, access token)
- TanStack Query (requêtes serveur)
- React Hook Form (formulaires)
- Axios (client HTTP avec intercepteur AT)
- shadcn/ui (composants UI)

### Backend

- Node.js + Express + TypeScript
- Prisma + PostgreSQL (Supabase)
- JWT (access token + refresh token)
- Zod (validation)

### Infrastructure

- Supabase dev séparé du Supabase prod
- Frontend : Vercel (preview auto sur branche dev)
- Backend : Render
- CI/CD : GitHub Actions (à mettre en place)

---

## Règles de workflow — OBLIGATOIRES

### Branches

- `main` est protégée. Claude Code ne touche jamais main directement.
- Tout le développement se fait sur `dev`.
- Preview Vercel automatique sur chaque push sur `dev`.
- Merge sur main uniquement après validation manuelle de Gilles.

### Avant chaque session

- Toujours définir le besoin en français avant de lancer l'exécution.
- Utiliser le plan mode pour valider l'approche avant toute génération de code.
- Un seul sujet par session — pas de multi-tâches.

### Après chaque génération

- Review du diff Git obligatoire — lire chaque fichier modifié.
- Vérifier : pas de console.log oublié, pas de secret en dur, pas de catch vide.
- Identifier les FIXME avant de merger.
- Si un fichier n'est pas compris : demander à Claude d'expliquer avant de continuer.
- Claude Code ne push jamais seul — Gilles valide avant chaque push.
- Commits conventionnels obligatoires.

---

## Setup obligatoire — à faire AVANT la première ligne de code

- [ ] Repo cloné en local
- [ ] Branche `dev` créée et configurée comme branche de travail
- [ ] Branche `main` protégée sur GitHub
- [ ] Preview Vercel connectée sur branche `dev`
- [ ] Supabase dev créé (séparé du Supabase prod)
- [ ] `.env.example` créé et à jour
- [ ] Seeds de BDD configurées (données de test multi-profils)
- [ ] CLAUDE.md global vérifié et à jour
- [ ] Environnement local fonctionnel (front + back avec hot reload)

---

## Règles métier — issues de ChouxFleurs2

Ces erreurs ont été faites sur ChouxFleurs2. Ne pas les reproduire.

- Zéro push direct sur main
- Zéro modification à la volée sans planification
- Zéro test uniquement sur son propre téléphone
- Zéro commit sans review du diff
- Toujours créer une route `/health` publique sur le backend
- Ne jamais hardcoder les URLs CORS — toujours via variable d'environnement
- Rôle par défaut sur User = `guest`, jamais `admin`
- Pas de données de test hardcodées dans le frontend
- Navbar fixe en haut lors du scroll sur toutes les pages
- Tout changement de route remet le scroll en haut de page
- Les modales se positionnent au-dessus du clavier virtuel iOS
- Safe area et `viewport-fit=cover` obligatoires dès le départ sur les PWA iOS
- Toujours prévoir une marge au-dessus des formulaires
- Après une action (renommage, sauvegarde) : retour en haut de la page courante
- Loader systématique avant tout état vide ou message erreur : utiliser `isPending` (pas `isLoading`)

---

## Règles frontend — spécifiques Nexio

- Toujours utiliser `store.getState()` pour accéder au store Zustand hors composant React (intercepteurs Axios)
- Interfaces TypeScript : préfixe `I` obligatoire (ex: `IContact`, `ICompany`)
- Nommage des fichiers : `camelCase` (ex: `contactCard.tsx`, `useContacts.ts`)
- Si une fonctionnalité dépasse 3 fichiers : créer un dossier dédié
- Les composants UI n'ont que de la logique d'affichage — la logique métier va dans les custom hooks
- Providers et configurations dans `main.tsx`, jamais dans `App.tsx`

---

## Règles backend — spécifiques Nexio

- Architecture en couches : route > middleware > controller > service
- Le service ne connaît pas `req` et `res` — il reçoit des données, retourne un résultat ou lance une exception
- Validation Zod sur toutes les entrées
- Pas de `console.log` en production
- `.env.example` toujours à jour après ajout d'une variable

---

## Tests

- Tester sur au moins 3 configs avant chaque merge : iPhone Safari, Android Chrome, desktop
- Tester les deux rôles (admin/user) avant chaque merge sur main
- Seeds de BDD avec plusieurs profils préconfigurés (admin, guest)

---

## Journal des décisions (ADR)

- [2026-06-17] Choix du nom Nexio — application de suivi de recherche d'emploi
- [2026-06-17] Stack identique à Cerithe côté backend (Express + Prisma + Zod) pour cohérence et montée en compétence progressive
- [2026-06-17] Supabase dev séparé dès le départ — leçon apprise sur ChouxFleurs2
