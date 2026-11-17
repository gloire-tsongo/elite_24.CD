# ELITE24.CD

Plateforme d'information developpee avec Node.js, Express, EJS et Prisma.

## Prerequis

- Node.js 20 ou superieur
- npm 10 ou superieur
- PostgreSQL compatible avec le schema Prisma
- Git

## Structure du projet

```text
elite_cd/
|-- public_html/
|   |-- assets/    Ressources statiques du frontend
|   |-- images/
|   |-- includes/
|   `-- API/       Application Node.js, Express, EJS et Prisma
|-- docs/
|-- README.md
|-- render.yaml
`-- vercel.json
```

Pour cPanel, le contenu de `public_html/` correspond à la racine publique et `public_html/API/` contient l'application Node.js. La page `public_html/index.html` charge les actualités depuis l'API; les pages d'article et d'administration restent rendues par EJS dans `public_html/API/src/views`.

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

Configurer `DATABASE_URL` PostgreSQL, `JWT_SECRET` et `ADMIN_PASSWORD` dans `public_html/API/.env` en local. Ne publiez jamais ce fichier. En production, executer le seed une seule fois; `npm start` lance le serveur sans reinitialiser le compte admin.

L'application est disponible sur `http://127.0.0.1:3000/`.

## Variables d'environnement

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/elite_media_node?schema=public
JWT_SECRET=une_chaine_secrete_longue
UPLOAD_DIR=uploads
ADMIN_PASSWORD=un_mot_de_passe_admin_securise
```

## Interfaces principales

- Accueil : `http://127.0.0.1:3000/`
- A propos : `http://127.0.0.1:3000/a-propos`
- Contact : `http://127.0.0.1:3000/contact`
- Connexion : `http://127.0.0.1:3000/admin/login`
- Tableau de bord : `http://127.0.0.1:3000/admin`
- Sante API : `http://127.0.0.1:3000/api/health`

## Stack technique

- Node.js et Express
- EJS pour le rendu HTML cote serveur
- Prisma ORM et PostgreSQL
- JWT, bcrypt, Multer, Sharp et sanitize-html

## Securite

- Ne jamais publier `public_html/API/.env`
- Utiliser une valeur `JWT_SECRET` longue et aleatoire
- Utiliser un mot de passe administrateur unique
- Activer HTTPS en production
- Sauvegarder regulierement PostgreSQL et les fichiers televerses

## Deploiement

Le fichier `render.yaml` configure Render. Le guide de deploiement se trouve dans `docs/DEPLOYMENT.md`.
