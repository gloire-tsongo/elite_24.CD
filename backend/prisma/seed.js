require('dotenv').config();
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const categories = [
  ['Culture', 'culture'],
  ['Éducation', 'education'],
  ['Économie', 'economie'],
  ['Environnement', 'environnement'],
  ['Développement', 'developpement'],
  ['Justice', 'justice'],
  ['Santé', 'sante'],
  ['Politique', 'politique'],
  ['Religion', 'religion'],
  ['Sciences', 'sciences'],
  ['Société', 'societe'],
  ['Sécurité', 'securite'],
  ['Sport', 'sport'],
  ['Diplomatie', 'diplomatie'],
  ['ELITE TV', 'elite-tv'],
  ['Catastrophe', 'catastrophe'],
  ['International', 'international'],
  ['Infrastructure', 'infrastructure']
];
const articles = [
  { titre: 'RDC : Vers une modernisation accélérée des infrastructures à Kinshasa.', slug: 'rdc-modernisation-infrastructures-kinshasa', contenu: '<p>Les grands chantiers de Kinshasa redessinent progressivement les mobilités et les services urbains. Cette transformation appelle un suivi attentif et une information accessible.</p>', category: 'politique', mediaType: 'texte' },
  { titre: 'Mines : Hausse de la production de cobalt dans le Haut-Katanga', slug: 'hausse-production-cobalt-haut-katanga', contenu: '<p>Le secteur minier poursuit sa croissance, porté par la demande mondiale et les investissements dans les chaînes de valeur locales.</p>', category: 'economie', mediaType: 'texte' },
  { titre: 'Numérisation des procédures judiciaires en RDC', slug: 'numerisation-procedures-judiciaires-rdc', contenu: '<p>La transformation numérique des services publics ouvre une nouvelle étape pour simplifier les démarches et améliorer l’accès à l’information.</p>', category: 'justice', mediaType: 'texte' },
  { titre: 'ELITE TV : Le grand format numérique', slug: 'elite-tv-grand-format-numerique', contenu: '<p>Retrouvez notre émission consacrée aux initiatives qui transforment le quotidien des Congolais.</p>', category: 'elite-tv', mediaType: 'video', mediaUrl: 'https://www.youtube.com/' }
];

async function main() {
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'changez-moi', 12);
  await prisma.user.upsert({ where: { username: 'admin' }, update: { passwordHash }, create: { username: 'admin', email: 'admin@elite.cd', passwordHash, role: 'superadmin' } });
  for (const [nom, slug] of categories) await prisma.category.upsert({ where: { slug }, update: { nom }, create: { nom, slug } });
  const author = await prisma.user.findUnique({ where: { username: 'admin' } });
  for (const article of articles) {
    const category = await prisma.category.findUnique({ where: { slug: article.category } });
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: { titre: article.titre, contenu: article.contenu, categoryId: category.id, mediaType: article.mediaType, mediaUrl: article.mediaUrl || null, statut: 'publie', publishedAt: new Date() },
      create: { titre: article.titre, slug: article.slug, contenu: article.contenu, categoryId: category.id, authorId: author.id, mediaType: article.mediaType, mediaUrl: article.mediaUrl || null, statut: 'publie', publishedAt: new Date() }
    });
  }
}

main().finally(() => prisma.$disconnect());
