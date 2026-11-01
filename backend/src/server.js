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

const app = express();
const prisma = new PrismaClient();
const port = Number(process.env.PORT || 3000);

app.locals.prisma = prisma;
app.use(helmet());
app.use(cors());
app.use(cookieParser());
if (process.env.NODE_ENV !== 'production') app.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(require('path').join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', require('path').join(__dirname, 'views'));
app.use('/uploads', express.static(process.env.UPLOAD_DIR || 'uploads'));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 20 }), authRoutes);
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
  const status = error.statusCode || 500;
  res.status(status).json({ error: status === 500 ? 'Erreur interne du serveur.' : error.message });
});

const server = app.listen(port, () => console.log(`ELITE.CD API démarrée sur le port ${port}`));

async function shutdown() {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
