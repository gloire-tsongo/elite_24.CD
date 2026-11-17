-- Création de la base de données (COPIE DÉPLACÉE)
-- Ce fichier a été déplacé depuis la racine vers private/ pour éviter une exposition publique.

CREATE DATABASE IF NOT EXISTS elite_media_node CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE elite_media_node;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'editor',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des catégories
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom_cat VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des articles
CREATE TABLE IF NOT EXISTS articles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titre VARCHAR(200) NOT NULL,
    contenu LONGTEXT NOT NULL,
    cat_id INT NOT NULL,
    auteur VARCHAR(100) NOT NULL DEFAULT 'Anonyme',
    type_media ENUM('texte', 'video', 'audio') DEFAULT 'texte',
    media_url VARCHAR(255),
    image_couverture VARCHAR(255),
    statut ENUM('brouillon', 'publie', 'archive') DEFAULT 'brouillon',
    vues INT UNSIGNED NOT NULL DEFAULT 0,
    date_publication DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cat_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_cat_id (cat_id),
    INDEX idx_statut (statut),
    INDEX idx_date (date_publication)
);

-- Table des commentaires
CREATE TABLE IF NOT EXISTS commentaires (
    id INT PRIMARY KEY AUTO_INCREMENT,
    article_id INT NOT NULL,
    pseudo VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    est_approuve TINYINT(1) DEFAULT 0,
    reponse_admin TEXT NULL,
    date_reponse DATETIME NULL,
    date_com DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    INDEX idx_article_id (article_id),
    INDEX idx_est_approuve (est_approuve)
);

-- Table des vues d'articles
CREATE TABLE IF NOT EXISTS article_views (
    id INT PRIMARY KEY AUTO_INCREMENT,
    article_id INT NOT NULL,
    ip_address VARCHAR(45) NULL,
    country VARCHAR(100) NULL,
    region VARCHAR(100) NULL,
    city VARCHAR(100) NULL,
    user_agent VARCHAR(255) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    INDEX idx_article_id (article_id),
    INDEX idx_country (country),
    INDEX idx_region (region),
    INDEX idx_city (city)
);

-- Insertions par défaut
INSERT INTO users (username, email, password, role) VALUES 
('admin', 'admin@elite.cd', '$2y$10$YOixf8XeIYq7eEHXYBvkKuK0w.KqMhNUqL4G9h7pM8ZKcZKZq1FQK', 'admin');

INSERT IGNORE INTO categories (nom_cat, description, slug) VALUES 
('Justice', 'Articles relatifs à la justice et au système judiciaire', 'justice'),
('Politique', 'Actualités politiques nationales et internationales', 'politique'),
('Économie', 'Nouvelles économiques et financières', 'economie'),
('Société', 'Sujets sociaux et d\'intérêt général', 'societe'),
('Développement', 'Actualités liées au développement et aux infrastructures', 'developpement'),
('ELITE TV', 'Contenus audiovisuels et reportages vidéo', 'elite-tv'),
('Technologie', 'Actualités technologiques et innovations', 'technologie');
