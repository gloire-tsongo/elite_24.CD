# ELITE24.CD - Backend Node.js

Application Express avec vues EJS et base PostgreSQL geree par Prisma.

## Prerequis

- Node.js 20 ou plus recent
- PostgreSQL compatible avec le schema Prisma

## Installation locale

```powershell
cd public_html/API
npm ci
Copy-Item .env.example .env
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
npm run dev
```

Configurer `DATABASE_URL`, `JWT_SECRET` et `ADMIN_PASSWORD` dans `.env`. Ne publiez jamais ce fichier.

## Commandes

```powershell
npm run dev
npm start
npm test
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Le seed cree le compte administrateur et les donnees de demonstration. L'executer une seule fois apres avoir defini `ADMIN_PASSWORD`; `npm start` lance uniquement le serveur.

## cPanel / Passenger

Definir le dossier de l'application sur `public_html/API`, le fichier de demarrage sur `app.js`, et l'URL de l'application sur `/API`. Les routes API seront accessibles sous `/API/api/`. L'application contient aussi des pages EJS dans `src/views`; elles ne constituent pas le frontend statique place a la racine de `public_html`.

Installer les dependances, generer Prisma et appliquer les migrations avant de lancer l'application. Hitech doit fournir une base PostgreSQL ou autoriser une connexion PostgreSQL distante.

## Routes utiles

- `/`
- `/admin/login`
- `/api/health`
