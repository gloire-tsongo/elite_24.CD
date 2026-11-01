const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const sanitizeHtml = require('sanitize-html');
const { requireAuth, requireRole } = require('../middleware/auth');
const { uniqueSlug } = require('../utils/slug');
const { youtubeVideoId } = require('../utils/youtube');

const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/tiff', 'image/bmp', 'image/svg+xml'];
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: (req, file, cb) => cb(null, imageTypes.includes(file.mimetype)) });
router.use(requireAuth);
const allowedHtml = { allowedTags: ['p', 'br', 'strong', 'em', 'u', 'h2', 'h3', 'blockquote', 'ul', 'ol', 'li', 'a', 'img'], allowedAttributes: { a: ['href', 'target', 'rel'], img: ['src', 'alt', 'title', 'loading'] }, allowedSchemes: ['http', 'https', 'mailto'] };

router.get('/dashboard', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const [articles, categories, pendingComments, comments, recentArticles, recentComments] = await Promise.all([
      prisma.article.count(), prisma.category.count(), prisma.comment.count({ where: { statut: 'en_attente' } }), prisma.comment.count(),
      prisma.article.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, titre: true, statut: true, createdAt: true } }),
      prisma.comment.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { article: { select: { titre: true } } } })
    ]);
    res.json({ metrics: { articles, categories, pendingComments, comments }, recentArticles, recentComments });
  } catch (error) { next(error); }
});

router.post('/articles', requireRole('admin', 'superadmin'), upload.single('coverImage'), async (req, res, next) => {
  let savedPath;
  try {
    const { titre, contenu, categoryId, statut = 'publie', mediaType = 'texte', mediaUrl } = req.body;
    if (!titre || !contenu || !categoryId) return res.status(400).json({ error: 'Titre, contenu et catégorie sont obligatoires.' });
    if (mediaType === 'video' && !youtubeVideoId(mediaUrl)) return res.status(400).json({ error: 'Pour une vidéo, fournissez un lien YouTube valide.' });
    const prisma = req.app.locals.prisma;
    const slug = await uniqueSlug(prisma, 'article', titre);
    let coverImage;
    if (req.file) {
      const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads');
      fs.mkdirSync(uploadDir, { recursive: true });
      coverImage = `${slug}-${Date.now()}.webp`;
      savedPath = path.join(uploadDir, coverImage);
      await sharp(req.file.buffer).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82 }).toFile(savedPath);
    }
    const article = await prisma.article.create({ data: { titre, slug, contenu: sanitizeHtml(contenu, allowedHtml), categoryId: Number(categoryId), authorId: req.user.id, coverImage, mediaType, mediaUrl: mediaUrl || null, statut, publishedAt: statut === 'publie' ? new Date() : null } });
    res.status(201).json(article);
  } catch (error) {
    if (savedPath && fs.existsSync(savedPath)) fs.unlinkSync(savedPath);
    next(error);
  }
});

router.patch('/comments/:id', requireRole('admin', 'superadmin'), async (req, res, next) => {
  try {
    const data = {};
    if (['en_attente', 'approuve', 'rejete'].includes(req.body.statut)) data.statut = req.body.statut;
    if (typeof req.body.adminReply === 'string') { data.adminReply = sanitizeHtml(req.body.adminReply, { allowedTags: [], allowedAttributes: {} }); data.repliedAt = new Date(); }
    const comment = await req.app.locals.prisma.comment.update({ where: { id: Number(req.params.id) }, data });
    res.json(comment);
  } catch (error) { next(error); }
});

router.get('/users', requireRole('superadmin'), async (req, res, next) => {
  try { res.json(await req.app.locals.prisma.user.findMany({ where: { role: { in: ['admin', 'superadmin'] } }, select: { id: true, username: true, email: true, role: true, createdAt: true } })); } catch (error) { next(error); }
});

router.delete('/users/:id', requireRole('superadmin'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (id === req.user.id) return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte.' });
    await req.app.locals.prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch (error) { next(error); }
});

module.exports = router;
