-- ================================================================
-- ELITE.CD — Installation MySQL minimale conforme à Prisma
-- Base : elite_media_node
-- Ce script ne supprime aucune base et n'insère aucune donnée.
-- ================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS elite_media_node
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE elite_media_node;

CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(100) NULL,
  role ENUM('admin', 'superadmin') NOT NULL DEFAULT 'admin',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY users_username_key (username),
  UNIQUE KEY users_email_key (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS categories (
  id INT NOT NULL AUTO_INCREMENT,
  nom VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY categories_slug_key (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS articles (
  id INT NOT NULL AUTO_INCREMENT,
  titre VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL,
  contenu LONGTEXT NOT NULL,
  category_id INT NOT NULL,
  author_id INT NOT NULL,
  cover_image VARCHAR(255) NULL,
  media_type ENUM('texte', 'video', 'audio') NOT NULL DEFAULT 'texte',
  media_url VARCHAR(255) NULL,
  statut ENUM('brouillon', 'publie', 'archive') NOT NULL DEFAULT 'brouillon',
  views_count INT NOT NULL DEFAULT 0,
  published_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY articles_slug_key (slug),
  KEY articles_category_id_idx (category_id),
  KEY articles_statut_published_at_idx (statut, published_at),
  CONSTRAINT articles_category_id_fkey
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT articles_author_id_fkey
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS commentaires (
  id INT NOT NULL AUTO_INCREMENT,
  article_id INT NOT NULL,
  author_name VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  statut ENUM('en_attente', 'approuve', 'rejete') NOT NULL DEFAULT 'en_attente',
  admin_reply TEXT NULL,
  replied_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY commentaires_article_id_statut_idx (article_id, statut),
  CONSTRAINT commentaires_article_id_fkey
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS article_views (
  id INT NOT NULL AUTO_INCREMENT,
  article_id INT NOT NULL,
  ip_address VARCHAR(45) NULL,
  country VARCHAR(100) NULL,
  region VARCHAR(100) NULL,
  city VARCHAR(100) NULL,
  user_agent VARCHAR(255) NULL,
  viewed_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY article_views_article_id_idx (article_id),
  KEY article_views_country_idx (country),
  KEY article_views_region_idx (region),
  KEY article_views_city_idx (city),
  CONSTRAINT article_views_article_id_fkey
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- Vérifications des structures créées
SHOW TABLES;
