const router = require('express').Router();
const sanitizeHtml = require('sanitize-html');

const articleSelect = {
  id: true, titre: true, slug: true, contenu: true, coverImage: true, mediaType: true,
  mediaUrl: true, statut: true, viewsCount: true, publishedAt: true,
  category: { select: { id: true, nom: true, slug: true } },
  author: { select: { id: true, username: true } }
};

router.get('/home', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const articles = await prisma.article.findMany({ where: { statut: 'publie' }, orderBy: { publishedAt: 'desc' }, take: 10, select: articleSelect });
    const categories = await prisma.category.findMany({ where: { articles: { some: { statut: 'publie' } } }, orderBy: { nom: 'asc' } });
    res.json({ featured: articles[0] || null, articles, categories });
  } catch (error) { next(error); }
});

router.get('/categories/:slug/articles', async (req, res, next) => {
  try {
    const category = await req.app.locals.prisma.category.findUnique({ where: { slug: req.params.slug }, include: { articles: { where: { statut: 'publie' }, orderBy: { publishedAt: 'desc' }, select: articleSelect } } });
    if (!category) return res.status(404).json({ error: 'Catégorie introuvable.' });
    res.json(category);
  } catch (error) { next(error); }
});

router.get('/articles/:identifier', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const value = req.params.identifier;
    const article = await prisma.article.findFirst({ where: { OR: [{ slug: value }, ...(Number.isInteger(Number(value)) ? [{ id: Number(value) }] : [])], statut: 'publie' }, select: articleSelect });
    if (!article) return res.status(404).json({ error: 'Article introuvable.' });
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
    await prisma.$transaction([
      prisma.article.update({ where: { id: article.id }, data: { viewsCount: { increment: 1 } } }),
      prisma.articleView.create({ data: { articleId: article.id, ipAddress: ip, userAgent: (req.get('user-agent') || '').slice(0, 255) } })
    ]);
    const comments = await prisma.comment.findMany({ where: { articleId: article.id, statut: 'approuve' }, orderBy: { createdAt: 'desc' } });
    res.json({ ...article, viewsCount: article.viewsCount + 1, comments });
  } catch (error) { next(error); }
});

router.post('/articles/:id/comments', async (req, res, next) => {
  try {
    const authorName = String(req.body.authorName || '').trim();
    const message = String(req.body.message || '').trim();
    if (!authorName || !message) return res.status(400).json({ error: 'Le nom et le message sont obligatoires.' });
    const comment = await req.app.locals.prisma.comment.create({ data: { articleId: Number(req.params.id), authorName: sanitizeHtml(authorName, { allowedTags: [], allowedAttributes: {} }), message: sanitizeHtml(message, { allowedTags: [], allowedAttributes: {} }) } });
    res.status(201).json({ message: 'Commentaire en attente de modération.', commentId: comment.id });
  } catch (error) { next(error); }
});

module.exports = router;
