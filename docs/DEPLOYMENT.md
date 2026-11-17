# Deploiement de ELITE24.CD

ELITE24.CD utilise Node.js 20+, Express, EJS et Prisma. Le frontend statique se place a la racine de `public_html`; le backend Node.js se trouve dans `public_html/API`. La page `index.html` appelle les routes publiques sous `/API/api/`; les pages d'article et d'administration actuelles restent rendues par EJS dans le backend.

## cPanel avec Hitech Web Hosting

Avant de commander, confirmer avec Hitech que l'offre permet une application Node.js 20+ persistante et l'acces a une base PostgreSQL. Le schema Prisma utilise PostgreSQL, et non MySQL.

### Organisation des fichiers

Pour associer le site a la racine du domaine dans cPanel:

```text
public_html/
|-- index.html
|-- assets/
|   |-- css/
|   |   `-- site.css
|-- images/
|-- includes/
`-- API/
    |-- app.js
    |-- package.json
    |-- prisma/
    `-- src/
```

Dans Setup Node.js App / Passenger, choisir le dossier d'application `public_html/API`, le fichier de demarrage `app.js`, et l'URL de l'application `/API`. Les routes API internes `/api/...` seront alors appelees sous `/API/api/...` (par exemple `/API/api/health`). Le CSS du frontend est servi directement depuis `public_html/assets/css/site.css`. Les pages EJS restent dans `API/src/views`.

Televerser les fichiers construits du frontend a la racine de `public_html`. Dans `API`, televerser le code et les fichiers Prisma, mais pas `node_modules`, `.env`, journaux, ni les donnees locales de `uploads`. Le dossier `frontend` ne doit pas etre televerse comme un sous-dossier distinct.

### Base et variables d'environnement

Creer une base PostgreSQL compatible et renseigner les valeurs dans l'interface de l'application cPanel:

```env
NODE_ENV=production
DATABASE_URL=postgresql://UTILISATEUR:MOT_DE_PASSE@HOTE:5432/NOM_BASE?schema=public
JWT_SECRET=UNE_CLE_ALEATOIRE_PRIVEE_D_AU_MOINS_32_CARACTERES
ADMIN_PASSWORD=UN_MOT_DE_PASSE_ADMIN_FORT
SITE_URL=https://votre-domaine.com
UPLOAD_DIR=/chemin/persistant/hors-de-public_html/uploads
```

Laisser l'hebergeur definir `PORT`. Ne jamais televerser `.env` dans `public_html` ni l'ajouter a Git.

### Installation et demarrage

Dans le terminal cPanel:

```bash
cd ~/public_html/API
npm ci
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
```

Executer le seed une seule fois, apres avoir configure `ADMIN_PASSWORD`. Il cree le compte administrateur et des donnees de demonstration; il ne copie pas une base de donnees locale existante. Redemarrer ensuite l'application depuis cPanel. `npm start` lance seulement le serveur.

Le dossier indique par `UPLOAD_DIR` doit exister ou etre creat par l'application et etre accessible en ecriture. Utiliser un emplacement persistant. Les variables Cloudinary peuvent etre configurees pour stocker les images; les fichiers audio locaux necessitent aussi un stockage persistant.

### Verification

- `https://votre-domaine.com/`
- `https://votre-domaine.com/API/api/health` (doit indiquer `database: connected`)
- `https://votre-domaine.com/API/admin/login` (interface EJS actuelle)

Tester la connexion, la publication d'un article, les images et les fichiers audio.

## Render

Le depot contient un `render.yaml`. La base configuree doit etre PostgreSQL. Renseigner les variables demandees dans Render et verifier `/api/health` apres le deploiement.

## Liens

- [Offres mutualisees Hitech](https://hitechwebhosting.com/cd/shared-hosting/)
- [VPS Hitech](https://hitechwebhosting.com/cd/vps-server/)
- [Support Hitech](https://hitechwebhosting.com/cd/contact-us/)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation PostgreSQL](https://www.postgresql.org/docs/)
