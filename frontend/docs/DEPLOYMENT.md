# Guide de déploiement - ELITE24.CD

Ce guide concerne l'application actuelle Node.js, Express, EJS et Prisma.

## 1. Prérequis

- Node.js 20 ou une version plus récente
- Une base de données MySQL 8 ou compatible
- Un hébergeur capable d'exécuter une application Node.js
- HTTPS activé en production

## 2. Créer la base de données

1. Créer une base de données MySQL et un utilisateur disposant des droits nécessaires.
2. Noter l'hôte, le port, le nom de la base, l'utilisateur et le mot de passe.
3. Utiliser une base vide et appliquer les migrations Prisma depuis le dossier `backend`.

## 3. Installer l'application

Depuis le dossier `backend` :

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm start
```

La commande de démarrage peut être configurée comme commande de lancement sur l'hébergeur :

```bash
npm start
```

## 4. Variables d'environnement

Créer un fichier `.env` localement ou renseigner ces variables dans le tableau de bord de l'hébergeur :

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=mysql://utilisateur:mot_de_passe@hote:3306/base_de_donnees
JWT_SECRET=une_longue_valeur_secrete
UPLOAD_DIR=uploads
```

Ne jamais publier le fichier `.env` dans Git. Utiliser une valeur longue et imprévisible pour `JWT_SECRET`.

## 5. Images et fichiers téléversés

Le dossier `uploads/` doit être accessible en écriture par l'application. Sur un hébergement dont le disque est temporaire, les images doivent être déplacées vers un stockage permanent comme Cloudinary ou un volume persistant.

## 6. Vérifications après déploiement

Tester les adresses suivantes :

- `https://votre-domaine.com/`
- `https://votre-domaine.com/api/health`
- `https://votre-domaine.com/admin/login`

Vérifier également la création d'un article, l'affichage de son image et la connexion à la base de données.

## 7. Sécurité et maintenance

- Modifier immédiatement le compte administrateur par défaut.
- Activer HTTPS.
- Sauvegarder régulièrement la base MySQL et les images.
- Vérifier les journaux de l'application en cas d'erreur.
- Exécuter `npx prisma migrate deploy` après chaque nouvelle migration.

## 8. Ressources

- [Documentation Node.js](https://nodejs.org/docs/latest/api/)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation MySQL](https://dev.mysql.com/doc/)

## 9. Test gratuit recommandé

Le dépôt contient un fichier `render.yaml` prêt à être utilisé avec un service Node.js gratuit. Le service peut s'arrêter après une période d'inactivité, ce qui est normal pour un test gratuit; le premier chargement suivant peut donc être lent.

### Préparer le déploiement

1. Publier le dépôt sur GitHub sans le fichier `.env`.
2. Créer une base MySQL distante gratuite compatible avec le protocole MySQL, puis copier sa `DATABASE_URL`.
3. Dans Render, créer un nouveau service depuis le dépôt et utiliser la configuration `render.yaml`.
4. Renseigner `DATABASE_URL` et `ADMIN_PASSWORD` dans les variables secrètes du service.
5. Après le premier déploiement, ouvrir `/api/health`, puis `/admin/login`.

La commande de build applique les migrations avec `npx prisma migrate deploy`. Le seed est volontairement séparé: exécuter `npm run prisma:seed` une seule fois depuis un environnement autorisé à accéder à la base distante.

Le disque d'un service gratuit peut être temporaire. Les images téléversées sont donc adaptées à un test court, mais doivent être stockées sur Cloudinary, S3 ou un volume persistant avant une utilisation réelle.
