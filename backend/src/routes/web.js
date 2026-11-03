const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const sanitizeHtml = require('sanitize-html');
const { uniqueSlug } = require('../utils/slug');
const { youtubeEmbedUrl } = require('../utils/youtube');
const rateLimit = require('express-rate-limit');
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });

const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/tiff', 'image/bmp', 'image/svg+xml'];
const audioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/webm', 'audio/aac', 'audio/mp4', 'audio/m4a'];
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 }, fileFilter: (req, file, cb) => cb(null, imageTypes.includes(file.mimetype) || audioTypes.includes(file.mimetype)) });
const allowedHtml = { allowedTags: ['p', 'br', 'strong', 'em', 'u', 'h2', 'h3', 'blockquote', 'ul', 'ol', 'li', 'a', 'img'], allowedAttributes: { a: ['href', 'target', 'rel'], img: ['src', 'alt', 'title', 'loading'] }, allowedSchemes: ['http', 'https', 'mailto'] };

function readToken(req) {
  const match = (req.headers.cookie || '').match(/elite_token=([^;]+)/);
  if (!match) return null;
  try { return jwt.verify(decodeURIComponent(match[1]), process.env.JWT_SECRET); } catch { return null; }
}

router.get('/', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const [articles, popularArticles, categories] = await Promise.all([
      prisma.article.findMany({ where: { statut: 'publie' }, orderBy: { publishedAt: 'desc' }, take: 10, include: { category: true } }),
      prisma.article.findMany({ where: { statut: 'publie' }, orderBy: [{ viewsCount: 'desc' }, { publishedAt: 'desc' }], include: { category: true } }),
      prisma.category.findMany({ where: { articles: { some: { statut: 'publie' } } }, orderBy: { nom: 'asc' } })
    ]);
    const recentArticles = [...articles].sort((a, b) => {
      const dateA = new Date(a.publishedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.publishedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });
    res.render('home', { articles: recentArticles, categories, title: null, featured: recentArticles[0] || null, popular: popularArticles, tvArticles: recentArticles.filter(article => article.mediaType !== 'texte').slice(0, 3) });
  } catch (error) { next(error); }
});

router.get('/a-propos', (req, res) => res.render('about'));
router.get('/contact', (req, res) => res.render('contact'));

router.get('/categorie/:slug', async (req, res, next) => {
  try {
    const category = await req.app.locals.prisma.category.findUnique({ where: { slug: req.params.slug }, include: { articles: { where: { statut: 'publie' }, orderBy: { publishedAt: 'desc' } } } });
    if (!category) return res.status(404).render('error', { message: 'Catégorie introuvable.' });
    const recentCategoryArticles = [...category.articles].sort((a, b) => {
      const dateA = new Date(a.publishedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.publishedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });
    res.render('home', { articles: recentCategoryArticles, categories: [category], title: category.nom, featured: recentCategoryArticles[0] || null, popular: recentCategoryArticles, tvArticles: [] });
  } catch (error) { next(error); }
});

router.get('/article/:identifier', async (req, res, next) => {
  try {
    const value = req.params.identifier;
    const article = await req.app.locals.prisma.article.findFirst({ where: { OR: [{ slug: value }, ...(Number.isInteger(Number(value)) ? [{ id: Number(value) }] : [])], statut: 'publie' }, include: { category: true } });
    if (!article) return res.status(404).render('error', { message: 'Article introuvable.' });
    await req.app.locals.prisma.article.update({ where: { id: article.id }, data: { viewsCount: { increment: 1 } } });
    const forwardedProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
    const forwardedHost = String(req.headers['x-forwarded-host'] || '').split(',')[0].trim();
    const requestBaseUrl = `${forwardedProto || req.protocol}://${forwardedHost || req.get('host')}`;
    const publicBaseUrl = String(process.env.SITE_URL || process.env.PUBLIC_URL || requestBaseUrl).replace(/\/$/, '');
    const shareUrl = `${publicBaseUrl}/article/${encodeURIComponent(article.slug)}`;
    const plainDescription = String(article.contenu || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const description = plainDescription.length > 180 ? `${plainDescription.slice(0, 177).trim()}...` : plainDescription;
    const socialImageUrl = article.coverImage
      ? `${publicBaseUrl}/uploads/${encodeURIComponent(article.coverImage).replace(/%2F/g, '/')}`
      : null;
    res.render('article', {
      article,
      shareUrl,
      socialImageUrl,
      description,
      publicBaseUrl,
      commentSent: req.query.comment === 'sent',
      videoEmbedUrl: article.mediaType === 'video' ? youtubeEmbedUrl(article.mediaUrl) : null
    });
  } catch (error) { next(error); }
});

router.post('/article/:id/comments', async (req, res, next) => {
  try {
    const article = await req.app.locals.prisma.article.findFirst({ where: { id: Number(req.params.id), statut: 'publie' }, select: { slug: true } });
    if (!article) return res.status(404).render('error', { message: 'Article introuvable.' });
    const authorName = String(req.body.authorName || '').trim();
    const message = String(req.body.message || '').trim();
    if (!authorName || !message) return res.redirect(`/article/${article.slug}?comment=missing`);
    await req.app.locals.prisma.comment.create({ data: { articleId: Number(req.params.id), authorName: sanitizeHtml(authorName, { allowedTags: [], allowedAttributes: {} }), message: sanitizeHtml(message, { allowedTags: [], allowedAttributes: {} }) } });
    res.redirect(`/article/${article.slug}?comment=sent`);
  } catch (error) { next(error); }
});

router.get('/admin/login', (req, res) => res.render('login', { error: null }));
router.post('/admin/login', loginLimiter, async (req, res, next) => {
  try {
    const user = await req.app.locals.prisma.user.findUnique({ where: { username: req.body.username } });
    if (!user || !(await bcrypt.compare(req.body.password || '', user.passwordHash))) return res.status(401).render('login', { error: 'Identifiants incorrects.' });
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('elite_token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 3600000 });
    res.redirect('/admin');
  } catch (error) { next(error); }
});

function requireWebAuth(req, res, next) {
  const user = readToken(req);
  if (!user) return res.redirect('/admin/login');
  req.user = user;
  next();
}

router.post('/admin/editor-images', requireWebAuth, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Sélectionnez une image valide de 10 Mo maximum.' });
    const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads', 'editor');
    fs.mkdirSync(uploadDir, { recursive: true });
    const fileName = `article-${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
    await sharp(req.file.buffer).resize({ width: 1800, withoutEnlargement: true }).webp({ quality: 84 }).toFile(path.join(uploadDir, fileName));
    res.json({ url: `/uploads/editor/${fileName}` });
  } catch (error) { next(error); }
});

router.get('/admin/articles/new', requireWebAuth, async (req, res, next) => {
  try { res.render('article-form', { article: null, categories: await req.app.locals.prisma.category.findMany({ orderBy: { nom: 'asc' } }), error: null }); } catch (error) { next(error); }
});

router.post('/admin/articles', requireWebAuth, upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'audioFile', maxCount: 1 }]), async (req, res, next) => {
  let savedPath;
  let savedAudioPath;
  try {
    const { titre, contenu, categoryId, statut = 'brouillon', mediaType = 'texte', mediaUrl } = req.body;
    if (!titre || !contenu || !categoryId) return res.status(400).render('article-form', { article: req.body, categories: await req.app.locals.prisma.category.findMany({ orderBy: { nom: 'asc' } }), error: 'Le titre, le contenu et la catégorie sont obligatoires.' });
    if (mediaType === 'video' && !youtubeEmbedUrl(mediaUrl)) return res.status(400).render('article-form', { article: req.body, categories: await req.app.locals.prisma.category.findMany({ orderBy: { nom: 'asc' } }), error: 'Pour une vidéo, fournissez un lien YouTube valide.' });
    if (mediaType === 'audio' && !mediaUrl && !(req.files && req.files.audioFile && req.files.audioFile[0])) return res.status(400).render('article-form', { article: req.body, categories: await req.app.locals.prisma.category.findMany({ orderBy: { nom: 'asc' } }), error: 'Pour un podcast, ajoutez un fichier audio ou une URL audio valide.' });
    const prisma = req.app.locals.prisma;
    const slug = await uniqueSlug(prisma, 'article', titre);
    let coverImage;
    const coverFile = req.files && req.files.coverImage ? req.files.coverImage[0] : null;
    if (coverFile) {
      const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads');
      fs.mkdirSync(uploadDir, { recursive: true });
      coverImage = `${slug}-${Date.now()}.webp`;
      savedPath = path.join(uploadDir, coverImage);
      await sharp(coverFile.buffer).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82 }).toFile(savedPath);
    }
    let finalMediaUrl = mediaUrl || null;
    const audioFile = req.files && req.files.audioFile ? req.files.audioFile[0] : null;
    if (mediaType === 'audio' && audioFile) {
      const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads', 'audio');
      fs.mkdirSync(uploadDir, { recursive: true });
      const audioName = `${slug}-${Date.now()}${path.extname(audioFile.originalname) || '.mp3'}`;
      savedAudioPath = path.join(uploadDir, audioName);
      fs.writeFileSync(savedAudioPath, audioFile.buffer);
      finalMediaUrl = `/uploads/audio/${audioName}`;
    }
    await prisma.article.create({ data: { titre, slug, contenu: sanitizeHtml(contenu, allowedHtml), categoryId: Number(categoryId), authorId: req.user.id, coverImage, mediaType, mediaUrl: finalMediaUrl, statut, publishedAt: statut === 'publie' ? new Date() : null } });
    res.redirect('/admin');
  } catch (error) { if (savedPath && fs.existsSync(savedPath)) fs.unlinkSync(savedPath); if (savedAudioPath && fs.existsSync(savedAudioPath)) fs.unlinkSync(savedAudioPath); next(error); }
});

router.get('/admin/articles/:id/edit', requireWebAuth, async (req, res, next) => {
  try {
    const article = await req.app.locals.prisma.article.findUnique({ where: { id: Number(req.params.id) } });
    if (!article) return res.status(404).render('error', { message: 'Article introuvable.' });
    res.render('article-form', { article, categories: await req.app.locals.prisma.category.findMany({ orderBy: { nom: 'asc' } }), error: null });
  } catch (error) { next(error); }
});

router.post('/admin/articles/:id', requireWebAuth, upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'audioFile', maxCount: 1 }]), async (req, res, next) => {
  let savedPath;
  let savedAudioPath;
  try {
    const id = Number(req.params.id);
    const existing = await req.app.locals.prisma.article.findUnique({ where: { id } });
    if (!existing) return res.status(404).render('error', { message: 'Article introuvable.' });
    const { titre, contenu, categoryId, statut = 'brouillon', mediaType = 'texte', mediaUrl } = req.body;
    if (mediaType === 'video' && !youtubeEmbedUrl(mediaUrl)) return res.status(400).render('article-form', { article: { ...req.body, id }, categories: await req.app.locals.prisma.category.findMany({ orderBy: { nom: 'asc' } }), error: 'Pour une vidéo, fournissez un lien YouTube valide.' });
    if (mediaType === 'audio' && !mediaUrl && !(req.files && req.files.audioFile && req.files.audioFile[0])) return res.status(400).render('article-form', { article: { ...req.body, id }, categories: await req.app.locals.prisma.category.findMany({ orderBy: { nom: 'asc' } }), error: 'Pour un podcast, ajoutez un fichier audio ou une URL audio valide.' });
    const data = { titre, contenu: sanitizeHtml(contenu, allowedHtml), categoryId: Number(categoryId), mediaType, mediaUrl: mediaUrl || existing.mediaUrl || null, statut, publishedAt: statut === 'publie' ? (existing.publishedAt || new Date()) : null };
    const coverFile = req.files && req.files.coverImage ? req.files.coverImage[0] : null;
    if (coverFile) {
      const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads');
      fs.mkdirSync(uploadDir, { recursive: true });
      data.coverImage = `${existing.slug}-${Date.now()}.webp`;
      savedPath = path.join(uploadDir, data.coverImage);
      await sharp(coverFile.buffer).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82 }).toFile(savedPath);
      if (existing.coverImage) { const oldPath = path.join(uploadDir, existing.coverImage); if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath); }
    }
    const audioFile = req.files && req.files.audioFile ? req.files.audioFile[0] : null;
    if (mediaType === 'audio' && audioFile) {
      const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads', 'audio');
      fs.mkdirSync(uploadDir, { recursive: true });
      const audioName = `${existing.slug}-${Date.now()}${path.extname(audioFile.originalname) || '.mp3'}`;
      savedAudioPath = path.join(uploadDir, audioName);
      fs.writeFileSync(savedAudioPath, audioFile.buffer);
      data.mediaUrl = `/uploads/audio/${audioName}`;
    }
    await req.app.locals.prisma.article.update({ where: { id }, data });
    res.redirect('/admin');
  } catch (error) { if (savedPath && fs.existsSync(savedPath)) fs.unlinkSync(savedPath); if (savedAudioPath && fs.existsSync(savedAudioPath)) fs.unlinkSync(savedAudioPath); next(error); }
});

router.post('/admin/articles/:id/delete', requireWebAuth, async (req, res, next) => {
  try { await req.app.locals.prisma.article.delete({ where: { id: Number(req.params.id) } }); res.redirect('/admin'); } catch (error) { next(error); }
});

router.post('/admin/comments/:id/status', requireWebAuth, async (req, res, next) => {
  try { await req.app.locals.prisma.comment.update({ where: { id: Number(req.params.id) }, data: { statut: req.body.statut } }); res.redirect('/admin#commentaires'); } catch (error) { next(error); }
});

router.get('/admin', async (req, res, next) => {
  try {
    const user = readToken(req);
    if (!user) return res.redirect('/admin/login');
    const prisma = req.app.locals.prisma;
    const [articles, categories, pendingComments, comments, articleList, commentList] = await Promise.all([
      prisma.article.count(),
      prisma.category.count(),
      prisma.comment.count({ where: { statut: 'en_attente' } }),
      prisma.comment.count(),
      prisma.article.findMany({ orderBy: { createdAt: 'desc' }, include: { category: true }, take: 30 }),
      prisma.comment.findMany({ where: { statut: 'en_attente' }, orderBy: { createdAt: 'desc' }, include: { article: true }, take: 20 })
    ]);
    res.render('dashboard', { user, metrics: { articles, categories, pendingComments, comments }, articleList, commentList });
  } catch (error) { next(error); }
});

router.get('/admin/logout', (req, res) => { res.clearCookie('elite_token'); res.redirect('/'); });
module.exports = router;
