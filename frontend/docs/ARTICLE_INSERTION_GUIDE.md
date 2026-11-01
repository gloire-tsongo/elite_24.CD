# 📝 Guide : Insertion d'articles - ELITE.CD

## 🎯 Fonctionnalités

Le fichier `admin/ajouter_article.php` permet d'insérer des articles dans la base de données avec :

✅ Formulaire sécurisé  
✅ Upload d'image avec nom unique  
✅ Support de 3 types de médias (texte, vidéo, audio)  
✅ Validation des données  
✅ Messages d'erreur explicites  

---

## 📊 Données POST récupérées

Le script traite les données suivantes :

```php
POST['titre']              // Titre de l'article (obligatoire)
POST['auteur']             // Nom de l'auteur (défaut: "Anonyme")
POST['categorie']          // ID de la catégorie (obligatoire)
POST['type_m']             // Type: texte, video, audio (défaut: texte)
POST['contenu']            // Contenu HTML/texte (obligatoire)
FILES['image_couverture']  // Image de couverture (obligatoire)
```

---

## 🖼️ Upload d'image

### Chemin de stockage
```
../images/
└── article_XXXXXXXXXX.extension
```

### Nom généré automatiquement
```php
uniqid('article_', true) . '.' . $ext;
// Exemple: article_65d8f1a2c3d4e1.jpg
```

**Avantages du nom unique** :
- ✅ Pas de collision de fichiers
- ✅ Pas de risque de remplacement
- ✅ Facilement traçable (timestamp microseconde)

### Extensions autorisées
- jpg, jpeg, png, gif, webp
- Taille max : 5 MB

---

## 🗄️ Insertion en base de données

### Requête SQL exécutée
```sql
INSERT INTO articles 
(titre, contenu, cat_id, auteur, type_m, image_principale, statut, date_publication)
VALUES 
(?, ?, ?, ?, ?, ?, 'publie', NOW())
```

### Champs insérés
| Champ | Source |
|-------|--------|
| `titre` | POST['titre'] |
| `contenu` | POST['contenu'] |
| `cat_id` | POST['categorie'] |
| `auteur` | POST['auteur'] |
| `type_m` | POST['type_m'] ← **NOUVEAU** |
| `image_principale` | Nom d'image généré |
| `statut` | 'publie' (automatique) |
| `date_publication` | NOW() (automatique) |

---

## 🔒 Sécurité

### Mesures implementées

1. **Vérification de session**
   ```php
   if (!isset($_SESSION['admin'])) {
       header("Location: login.php");
       exit();
   }
   ```

2. **Validation des données**
   - Trim des espaces
   - Vérification des champs obligatoires
   - Vérification du type_m (enum)

3. **Upload sécurisé**
   ```php
   move_uploaded_file($file['tmp_name'], $destination)
   ```

4. **Injection SQL prévenue**
   ```php
   $stmt = $pdo->prepare(...);
   $stmt->execute([...]);  // Paramètres séparés
   ```

5. **Protection du dossier images/**
   - Fichier `.htaccess` bloque les PHP
   - Permet seulement les images (jpg, png, gif, webp, svg)
   - Cache-Control activé

---

## 📝 Exemple d'utilisation

### Formulaire HTML
```html
<form method="POST" enctype="multipart/form-data">
    <input type="text" name="titre" placeholder="Titre" required>
    <input type="text" name="auteur" placeholder="Auteur" required>
    
    <select name="categorie" required>
        <option value="1">Justice</option>
        <option value="2">Politique</option>
    </select>
    
    <select name="type_m">
        <option value="texte">Texte</option>
        <option value="video">Vidéo</option>
        <option value="audio">Audio</option>
    </select>
    
    <textarea name="contenu" required></textarea>
    <input type="file" name="image_couverture" accept="image/*" required>
    
    <button type="submit">Publier</button>
</form>
```

### Via cURL (API)
```bash
curl -X POST http://localhost/elite_cd/admin/ajouter_article.php \
  -F "titre=Mon Article" \
  -F "auteur=Jean Dupont" \
  -F "categorie=1" \
  -F "type_m=texte" \
  -F "contenu=Contenu de l'article..." \
  -F "image_couverture=@image.jpg" \
  -H "Cookie: ELITE_SESSION=your_session_id"
```

---

## ⚠️ Erreurs possibles

### "Veuillez sélectionner une image"
- L'utilisateur n'a pas fourni d'image
- **Solution** : Vérifier que `enctype="multipart/form-data"` dans le formulaire

### "Format non autorisé"
- L'extension n'est pas jpg, jpeg, png, gif, webp
- **Solution** : Convertir l'image ou utiliser un format autorisé

### "L'image dépasse 5 MB"
- Le fichier est trop volumineux
- **Solution** : Compresser l'image avant l'upload

### "Impossible d'enregistrer l'image"
- Permissions insuffisantes sur le dossier `images/`
- **Solution** : `chmod 755 images/`

### "Erreur lors de l'insertion en base"
- Problème de connexion à la BD
- La catégorie n'existe pas
- **Solution** : Vérifier la base de données et les identifiants

---

## 🔧 Customisation

### Changer la taille maximale
```php
$maxFileSize = 10 * 1024 * 1024; // 10 MB
```

### Ajouter d'autres extensions
```php
$allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
```

### Modifier le statut par défaut
```php
// Dans la requête INSERT
'publie'  // Remplacer par 'brouillon' ou 'archive'
```

---

## 📌 Notes importantes

1. **Le champ `auteur` est ajouté par défaut** avec la valeur "Anonyme" si vide
2. **Les images sont stockées dans** `elite_cd/images/`
3. **Les noms d'images uniques empêchent les collisions**
4. **La session admin est vérifiée** au début
5. **En cas d'erreur, l'image est supprimée** pour éviter les orphelins

---

## 🧪 Test

Pour tester le script :

1. Accédez à `http://localhost/elite_cd/admin/ajouter_article.php`
2. Remplissez le formulaire
3. Téléchargez une image
4. Cliquez "Publier l'article"
5. Vérifiez que l'article apparaît dans la BD et l'image dans `/images/`

---

**Besoin d'aide ?** Consultez `DEPLOYMENT.md` ou la documentation PHP.
