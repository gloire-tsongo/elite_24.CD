-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'superadmin');
CREATE TYPE "MediaType" AS ENUM ('texte', 'video', 'audio');
CREATE TYPE "ArticleStatus" AS ENUM ('brouillon', 'publie', 'archive');
CREATE TYPE "CommentStatus" AS ENUM ('en_attente', 'approuve', 'rejete');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "email" VARCHAR(100),
    "role" "UserRole" NOT NULL DEFAULT 'admin',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" SERIAL NOT NULL,
    "titre" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(220) NOT NULL,
    "contenu" TEXT NOT NULL,
    "category_id" INTEGER NOT NULL,
    "author_id" INTEGER NOT NULL,
    "cover_image" VARCHAR(255),
    "media_type" "MediaType" NOT NULL DEFAULT 'texte',
    "media_url" VARCHAR(255),
    "statut" "ArticleStatus" NOT NULL DEFAULT 'brouillon',
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commentaires" (
    "id" SERIAL NOT NULL,
    "article_id" INTEGER NOT NULL,
    "author_name" VARCHAR(100) NOT NULL,
    "message" TEXT NOT NULL,
    "statut" "CommentStatus" NOT NULL DEFAULT 'en_attente',
    "admin_reply" TEXT,
    "replied_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commentaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_views" (
    "id" SERIAL NOT NULL,
    "article_id" INTEGER NOT NULL,
    "ip_address" VARCHAR(45),
    "country" VARCHAR(100),
    "region" VARCHAR(100),
    "city" VARCHAR(100),
    "user_agent" VARCHAR(255),
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");
CREATE INDEX "articles_category_id_idx" ON "articles"("category_id");
CREATE INDEX "articles_statut_published_at_idx" ON "articles"("statut", "published_at");
CREATE INDEX "commentaires_article_id_statut_idx" ON "commentaires"("article_id", "statut");
CREATE INDEX "article_views_article_id_idx" ON "article_views"("article_id");
CREATE INDEX "article_views_country_idx" ON "article_views"("country");
CREATE INDEX "article_views_region_idx" ON "article_views"("region");
CREATE INDEX "article_views_city_idx" ON "article_views"("city");

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "commentaires" ADD CONSTRAINT "commentaires_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "article_views" ADD CONSTRAINT "article_views_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
