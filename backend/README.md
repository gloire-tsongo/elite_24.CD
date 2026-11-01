# ELITE.CD - API Node.js

Migration de la logique PHP vers Express.js, Prisma et MySQL. L'ancien projet PHP reste disponible à la racine.

## Installation

1. Installer Node.js 20 ou supérieur.
2. Copier `.env.example` vers `.env` et renseigner `DATABASE_URL` et `JWT_SECRET`.
3. Créer la base MySQL `elite_media_db`.
4. Exécuter :

```powershell
cd C:\xampp\htdocs\elite_cd\backend
npm install
npx prisma generate
npx prisma migrate dev --name initial
npm run prisma:seed
npm run dev
```

L'API démarre sur `http://localhost:3000`.

## Routes principales

- `GET /api/health` : état de l'API
- `POST /api/auth/login` : connexion et émission d'un JWT
- `GET /api/public/home` : accueil, une, dix derniers articles et catégories actives
- `GET /api/public/categories/:slug/articles` : articles publiés d'une catégorie
- `GET /api/public/articles/:identifier` : article par identifiant ou slug et enregistrement d'une vue
- `POST /api/public/articles/:id/comments` : commentaire en attente de modération
- `GET /api/admin/dashboard` : métriques et activité récente
- `POST /api/admin/articles` : publication multipart avec `coverImage`
- `PATCH /api/admin/comments/:id` : statut ou réponse d'un commentaire
- `GET /api/admin/users` : comptes administrateurs, rôle superadmin requis
- `DELETE /api/admin/users/:id` : suppression protégée contre l'auto-suppression

Les routes privées utilisent `Authorization: Bearer <token>`.
