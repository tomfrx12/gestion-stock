# Gestion de stock

Application Next.js (TypeScript) minimale pour gérer le stock d'articles.

## Présentation

Ce projet est le début de mon apprentisage dans mon stage chez SkyNet Business Services

Ce dépôt contient une petite application Next.js avec l'architecture `app/` (App Router). Elle expose une API pour la gestion du stock dans `app/api/stock/route.ts` et contient la logique d'accès aux données dans `lib/db.ts`.

## Prérequis

- Node.js 16 ou supérieur
- npm

## Installation

1. Installer les dépendances :

```bash
npm install
```

2. Lancer en développement :

```bash
npm run dev
```

3. Construire pour la production :

```bash
npm run build
npm start
```

## Structure principale

- `app/` : pages et routes (App Router)
  - `app/api/stock/route.ts` : endpoints API pour la gestion du stock
- `lib/db.ts` : point d'entrée pour la connexion / accès aux données
- `public/` : fichiers statiques
- `next.config.ts`, `tsconfig.json`, `package.json` : configuration du projet

## Configuration

- Si votre application utilise une base de données, configurez la connexion dans `lib/db.ts` ou via les variables d'environnement que vous y utiliserez.
- Voir le fichier `app/api/stock/route.ts` pour connaître les routes exposées et les méthodes attendues (GET/POST/etc.).

## Utilisation rapide

- Testez les endpoints API avec `curl`, Postman ou Insomnia vers `/api/stock` (ex: `http://localhost:3000/api/stock`).

## Auteur

Tom Fourneaux