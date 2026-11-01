# Guide d'insertion d'articles - ELITE24.CD

## Interface administrative

Accédez à la page :

```text
http://127.0.0.1:3000/admin/articles/new
```

La connexion est requise. Le formulaire prend en charge le texte, la vidéo YouTube et les fichiers audio.

## Données du formulaire

- `titre` : titre obligatoire
- `contenu` : contenu HTML obligatoire
- `categoryId` : identifiant numérique de la catégorie
- `statut` : `brouillon` ou `publie`
- `mediaType` : `texte`, `video` ou `audio`
- `mediaUrl` : URL YouTube ou URL audio
- `coverImage` : image de couverture optionnelle
- `audioFile` : fichier MP3, WAV ou format audio accepté

## Route Node.js

La route web sécurisée utilise :

```text
POST /admin/articles
```

Elle vérifie la session JWT, valide les champs obligatoires, nettoie le contenu HTML, traite les fichiers avec Multer et Sharp, puis insère l'article avec Prisma.

## Insertion via API

La route API protégée est :

```text
POST /api/admin/articles
Authorization: Bearer VOTRE_JWT
Content-Type: multipart/form-data
```

Le compte doit posséder le rôle `admin` ou `superadmin`.

## Images

Les images de couverture sont enregistrées dans `backend/uploads/` et transformées au format WebP.

Les images insérées depuis l'éditeur passent par :

```text
POST /admin/editor-images
```

## Vidéo YouTube

Pour `mediaType=video`, fournissez une URL YouTube valide. L'application extrait automatiquement l'identifiant et génère la vidéo intégrée.

## Audio

Pour `mediaType=audio`, utilisez soit `mediaUrl`, soit un fichier envoyé avec le champ `audioFile`. Les fichiers importés sont enregistrés dans `backend/uploads/audio/`.

## Vérifications

1. Connectez-vous sur `/admin/login`.
2. Ouvrez `/admin/articles/new`.
3. Sélectionnez une catégorie et un statut.
4. Ajoutez le titre et le contenu.
5. Publiez ou enregistrez comme brouillon.
6. Vérifiez l'article sur `/` ou `/article/slug`.
