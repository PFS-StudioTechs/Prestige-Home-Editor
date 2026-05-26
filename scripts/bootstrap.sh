#!/usr/bin/env bash
# bootstrap.sh — Setup complet Prestige Home Editor
# Usage : bash scripts/bootstrap.sh
set -euo pipefail

echo "=== Prestige Home Editor — Bootstrap ==="

# 1. Vérifications préalables
command -v node >/dev/null 2>&1 || { echo "Node.js >= 20 requis"; exit 1; }
command -v npm >/dev/null 2>&1  || { echo "npm requis"; exit 1; }
command -v gh >/dev/null 2>&1   || { echo "GitHub CLI (gh) requis"; exit 1; }
command -v vercel >/dev/null 2>&1 || npm install -g vercel@latest
command -v supabase >/dev/null 2>&1 || npm install -g supabase@latest

# 2. Dépendances npm
echo "-> Installation des dépendances..."
npm install

# 3. Supabase — init projet local
echo "-> Init Supabase local..."
supabase init --workdir supabase || true
supabase start

# 4. Supabase — migrations
echo "-> Application des migrations..."
supabase db push

# 5. Génération des types TypeScript
echo "-> Génération des types Supabase..."
supabase gen types typescript --local > apps/web/lib/supabase.types.ts

# 6. GitHub — protections de branche main
echo "-> Configuration protection branche main..."
gh api repos/PFS-StudioTechs/Prestige-Home-Editor/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["Lint + Typecheck + Tests"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":1}' \
  --field restrictions=null \
  --silent && echo "  Protection main OK" || echo "  (branche main pas encore poussée, à faire après le premier push)"

# 7. Vercel — lier le projet
echo "-> Vercel link..."
vercel link --yes --project prestige-home-editor || true

echo ""
echo "=== Bootstrap terminé ==="
echo ""
echo "Prochaines étapes manuelles :"
echo "  1. Copier .env.example en apps/web/.env.local et renseigner les valeurs"
echo "  2. Créer le projet Supabase cloud : supabase projects create prestige-home-editor"
echo "  3. Configurer les secrets Vercel : vercel env add NEXT_PUBLIC_SUPABASE_URL"
echo "  4. Ajouter le secret VERCEL_TOKEN dans GitHub > Settings > Secrets"
