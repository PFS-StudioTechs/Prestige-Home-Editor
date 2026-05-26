# Contribuer à Prestige Home Editor

## Branches

- `main` — production (protégée, review obligatoire)
- `develop` — intégration
- `feature/xxx` — nouvelles fonctionnalités
- `fix/xxx` — corrections de bugs

## Workflow

1. Créer une branche depuis `develop` : `git checkout -b feature/ma-fonctionnalite`
2. Développer et tester localement
3. Ouvrir une PR vers `develop`
4. La CI (lint + typecheck + tests) doit passer
5. Review obligatoire avant merge

## Commandes

```bash
npm run dev        # Lance tous les packages en dev (Turborepo)
npm run build      # Build complet
npm run lint       # Lint
npm run typecheck  # Vérification TypeScript
npm test           # Tests unitaires
```

## Variables d'environnement

Copie `.env.example` en `.env.local` dans `apps/web/` et renseigne les valeurs.
Ne jamais committer `.env.local`.
