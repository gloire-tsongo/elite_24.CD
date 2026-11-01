# ELITE24.CD

Plateforme d'information moderne développée avec Node.js, Express, EJS et Prisma.

## Prérequis

- Node.js 20 ou supérieur
- npm 10 ou supérieur
- MySQL 8 ou compatible
- Git

## Structure du projet

```text
elite_cd/
├── backend/       API Express, vues EJS, Prisma et fichiers téléversés
├── frontend/      Ressources documentaires et statiques
├── README.md      Présentation générale
└── render.yaml    Déploiement Render
```

## Installation locale

```powershell
cd backend
npm ci
Copy-Item .env.example .env
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
npm run dev
```

Configurer ensuite `DATABASE_URL`, `JWT_SECRET` et les autres variables dans `backend/.env`.

L'application est disponible sur `http://127.0.0.1:3000/`.

## Variables d'environnement

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=mysql://root:@localhost:3306/elite_media_node
JWT_SECRET=une_chaine_secrete_longue
UPLOAD_DIR=uploads
ADMIN_PASSWORD=un_mot_de_passe_admin_securise
```

## Interfaces principales

- Accueil : `http://127.0.0.1:3000/`
- À propos : `http://127.0.0.1:3000/a-propos`
- Contact : `http://127.0.0.1:3000/contact`
- Connexion : `http://127.0.0.1:3000/admin/login`
- Tableau de bord : `http://127.0.0.1:3000/admin`
- Santé API : `http://127.0.0.1:3000/api/health`

## Stack technique

- Node.js et Express
- EJS pour les vues HTML côté serveur
- Prisma ORM
- MySQL
- JWT pour l'authentification
- bcrypt pour les mots de passe
- Multer, Sharp et sanitize-html

## Sécurité

- Ne jamais publier `backend/.env`
- Utiliser une valeur `JWT_SECRET` longue et aléatoire
- Utiliser un mot de passe administrateur unique
- Activer HTTPS en production
- Sauvegarder régulièrement MySQL et les fichiers téléversés

## Déploiement

Le fichier `render.yaml` configure le déploiement sur Render.com. Consulter `frontend/docs/DEPLOYMENT.md` pour les étapes détaillées.
