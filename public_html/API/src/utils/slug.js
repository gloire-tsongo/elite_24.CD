const slugify = require('slugify');

async function uniqueSlug(prisma, model, value, currentId) {
  const base = slugify(value, { lower: true, strict: true, trim: true }) || 'article';
  let slug = base;
  let suffix = 1;
  while (true) {
    const existing = await prisma[model].findUnique({ where: { slug } });
    if (!existing || existing.id === currentId) return slug;
    slug = `${base}-${suffix++}`;
  }
}

module.exports = { uniqueSlug };
