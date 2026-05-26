# Prestige Home Editor

Outil de visualisation de covering mobilier pour **Prestige Home 33**.  
Permet à un client final de simuler l'application de films Cover Styl' sur sa cuisine depuis un smartphone.

## Stack

- **Front-end** : Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui
- **Vision IA** : Grounding DINO + SAM 2 (Fal.ai) · PixiJS (rendu WebGL)
- **Back-end** : Supabase (Postgres · Auth · Storage · Edge Functions)
- **Déploiement** : Vercel
- **Monorepo** : Turborepo

## Démarrage rapide

```bash
# 1. Cloner
git clone https://github.com/PFS-StudioTechs/Prestige-Home-Editor.git
cd prestige-home-editor

# 2. Variables d'environnement
cp .env.example apps/web/.env.local
# Renseigner les valeurs dans apps/web/.env.local

# 3. Dépendances
npm install

# 4. Lancer en dev
npm run dev
# → http://localhost:3000
```

## Structure

```
apps/web/                  — Application Next.js
packages/ui/               — Composants partagés
packages/vision/           — Segmentation + rendu texture
packages/catalog-ingestion/ — Scraper catalogue Cover Styl'
supabase/migrations/       — Schéma base de données
supabase/functions/        — Edge Functions (IA, devis)
```

## Ingestion catalogue Cover Styl'

```bash
# Dry run (pas d'écriture en base)
npm run scrape:dry --workspace=@prestige-home/catalog-ingestion

# Ingestion complète (requiert SUPABASE_SERVICE_ROLE_KEY dans .env.local)
npm run scrape --workspace=@prestige-home/catalog-ingestion
```

> Autorisation écrite Cover Styl'/Tego requise avant usage en production.
