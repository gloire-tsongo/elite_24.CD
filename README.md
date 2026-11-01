# ELITE.CD - Plateforme Médias en Ligne

Site de publication d'articles avec système d'administration pour journalistes et rédacteurs.

## 📋 Prérequis

- **PHP** 7.4 ou supérieur
- **MySQL** 5.7 ou supérieur
- **Serveur web** (Apache, Nginx, etc.)
- **SSL/HTTPS** activé (recommandé en production)

## 🚀 Installation

### 1. Cloner ou télécharger le projet
```bash
git clone <votre-repo> elite_cd
cd elite_cd
```

### 2. Configurer la base de données

#### a) Créer la base de données avec le fichier SQL fourni
```bash
mysql -u root -p < database.sql
```

#### b) Ou manuellement via phpMyAdmin
- Importer le fichier `database.sql` dans phpMyAdmin
- Vérifier que la base `elite_media_db` est créée

### 3. Configurer les variables d'environnement

1. Copier le fichier d'exemple :
```bash
cp .env.example .env
```

2. Éditer `.env` avec vos paramètres :
```env
DB_HOST=localhost
DB_NAME=elite_media_db
DB_USER=root
DB_PASS=votre_mot_de_passe
APP_ENV=production
```

### 4. Vérifier les permissions des dossiers
```bash
# Linux/Mac
chmod 755 uploads/
chmod 755 assets/
chmod 644 .env
```

### 5. Accéder au site

- **Site public** : `http://votre-domaine.com`
- **Admin** : `http://votre-domaine.com/admin/login.php`

## 🔐 Identifiants par défaut

**Utilisateur** : `admin`  
**Mot de passe** : `admin123`

⚠️ **IMPORTANT** : Changer immédiatement après la première connexion !

## 📁 Structure du projet

```
elite_cd/
├── backend/               # API Node.js, Prisma et vues EJS
├── frontend/              # Page d'entrée, ressources et ancien PHP
│   ├── admin/
│   ├── assets/
│   ├── images/
│   ├── includes/
│   └── index.html
├── docs/                  # Guides du projet
├── private/                # Fichiers SQL et éléments privés
├── uploads/               # Images téléversées par le backend
├── logs/                  # Journaux de l'application
├── .env                   # Configuration PHP historique (à ne pas pusher)
└── .gitignore

```

## 🔒 Sécurité

- Les identifiants sont stockés dans un fichier `.env` (non versionné)
- Les mots de passe sont hashés avec `bcrypt`
- Protection contre les injections SQL avec PDO prepared statements
- Les sessions expirent après 1 heure d'inactivité

## 🐛 Dépannage

### Erreur "Erreur de connexion à la base de données"
- Vérifier que MySQL est démarré
- Vérifier les identifiants dans `.env`
- Vérifier que la base de données existe

### Erreur "Session not found"
- Vérifier que `session_start()` est appelé en haut des fichiers PHP

### Erreur "Permission denied" sur `/uploads`
- Vérifier les permissions : `chmod 755 uploads/`

## 📞 Support

Pour toute question ou bug, veuillez ouvrir une issue sur le repository.

## 📝 Licence

Propriétaire - ELITE.CD
