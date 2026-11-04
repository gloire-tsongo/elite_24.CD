require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');
const authRoutes = require('./routes/auth');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');
const webRoutes = require('./routes/web');
const { publicImageUrl } = require('./utils/storage');

if (process.env.NODE_ENV === 'production') {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL est obligatoire en production.');
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET doit contenir au moins 32 caractères en production.');
}

const app = express();
const prisma = new PrismaClient();
const port = Number(process.env.PORT || 3000);

app.locals.prisma = prisma;
app.locals.imageUrl = publicImageUrl;
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const allowedOrigins = String(process.env.FRONTEND_URL || 'https://elite24cd.vercel.app,https://elite-24-cd.onrender.com')
  .split(',')
  .map(value => value.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true
}));
app.use(cookieParser());
if (process.env.NODE_ENV !== 'production') app.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'SAMEORIGIN');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  if (req.path.startsWith('/admin')) res.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
  next();
});
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(express.static(require('path').join(__dirname, 'public'), { maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0 }));
app.set('view engine', 'ejs');
app.set('views', require('path').join(__dirname, 'views'));
app.use('/uploads', express.static(process.env.UPLOAD_DIR || 'uploads', { dotfiles: 'deny', fallthrough: false, maxAge: process.env.NODE_ENV === 'production' ? '30d' : 0, immutable: process.env.NODE_ENV === 'production' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false }), authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', service: 'elite-cd-api', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'error', service: 'elite-cd-api', database: 'disconnected' });
  }
});
app.use('/', webRoutes);
app.use((error, req, res, next) => {
  console.error(error);
  const status = error.statusCode || (error.name === 'MulterError' ? 400 : 500);
  res.status(status).json({ error: status === 500 ? 'Erreur interne du serveur.' : error.message });
});

const server = app.listen(port, () => console.log(`ELITE.CD API démarrée sur le port ${port}`));

async function shutdown() {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
