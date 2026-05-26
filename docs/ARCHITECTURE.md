# Architecture — Prestige Home Editor

## Vue d'ensemble

```
Client (mobile)
    │
    ▼
Next.js 14 App Router (Vercel)
    │
    ├── /api/segment      → Edge Function segment-image (Fal.ai: DINO + SAM 2)
    ├── /api/texture      → Edge Function apply-texture (mise à jour ref en base)
    └── /api/quote        → Edge Function generate-quote-pdf (email Resend)
    │
    ▼
Supabase
    ├── Auth (Magic Link)
    ├── Postgres (users, references, projects, project_elements)
    └── Storage (user-photos, project-exports)
```

## Flux utilisateur

1. **Upload** — photo stockée dans Supabase Storage `user-photos/{userId}/`
2. **Détection** — appel `segment-image` : DINO détecte les éléments → SAM 2 génère les masques
3. **Ajustement** — outil pinceau/lasso côté client pour corriger les masques
4. **Catalogue** — browse `references` depuis Supabase, filtres par collection/finition
5. **Aperçu** — `applyTextureToMask` (packages/vision) applique la texture sur le canvas WebGL
6. **Export** — photo finale uploadée dans `project-exports/`, appel `generate-quote-pdf`

## Module Vision

- `packages/vision/texture-renderer.ts` — mapping UV + conservation luminance HSV (mode multiply)
- `packages/vision/mask-utils.ts` — décodage masques SAM 2 + estimation surface m²

## Base de données

| Table              | Rôle                                          |
|--------------------|-----------------------------------------------|
| `users`            | Profils liés à `auth.users`                  |
| `references`       | Catalogue Cover Styl' (470 références)        |
| `projects`         | Projets utilisateur                           |
| `project_elements` | Éléments d'un projet + référence appliquée    |

## Décisions clés

- **Fal.ai en phase 1** : évite l'infra GPU. SAM 2 self-hosted en phase 2 si volume important.
- **Rendu WebGL côté client** : interactivité instantanée, pas de latence serveur.
- **Monorepo Turborepo** : partage de types et composants entre apps futures.
- **RLS Supabase** : isolation stricte des données par utilisateur, pas de middleware custom.
