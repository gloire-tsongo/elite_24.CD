# ELITE24.CD - Backend Node.js

Backend Express.js avec vues EJS et base MySQL gérée par Prisma.

## Installation

```powershell
cd backend
npm ci
Copy-Item .env.example .env
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
npm run dev
```

## Variables d'environnement

| Variable | Obligatoire | Exemple |
|---|---:|---|
| `DATABASE_URL` | Oui | `mysql://root:@localhost:3306/elite_media_node` |
| `JWT_SECRET` | Oui | chaîne secrète longue et aléatoire |
| `NODE_ENV` | Oui | `development` ou `production` |
| `PORT` | Non | `3000` |
| `UPLOAD_DIR` | Non | `uploads` |
| `ADMIN_PASSWORD` | Oui pour le seed | mot de passe administrateur sécurisé |

Ne publiez jamais `.env`. Utilisez `.env.example` comme modèle.

## Commandes

```powershell
npm run dev          # Serveur avec Nodemon
npm start            # Serveur de production
npm test             # Tests Node.js
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

## Routes web

- `GET /`
- `GET /a-propos`
- `GET /contact`
- `GET /admin/login`
- `GET /admin`
- `GET /admin/articles/new`
- `GET /article/:identifier`

## Routes API

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/public/home`
- `GET /api/public/categories/:slug/articles`
- `GET /api/public/articles/:identifier`
- `POST /api/public/articles/:id/comments`
- `GET /api/admin/dashboard`
- `POST /api/admin/articles`
- `PATCH /api/admin/comments/:id`
- `GET /api/admin/users`
- `DELETE /api/admin/users/:id`

Les routes privées administrateur utilisent le cookie `elite_token` ou le jeton JWT de l'en-tête `Authorization: Bearer <token>`.
