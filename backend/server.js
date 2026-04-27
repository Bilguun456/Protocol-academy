import 'dotenv/config';

process.on('uncaughtException',      err => { console.error('[uncaughtException]', err); process.exit(1); });
process.on('unhandledRejection', (reason) => { console.error('[unhandledRejection]', reason); process.exit(1); });

import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import problemRoutes from './routes/problems.js';
import leaderboardRoutes from './routes/leaderboard.js';
import communityRoutes from './routes/community.js';
import commentRoutes from './routes/comments.js';
import dailyTaskRoutes from './routes/dailyTasks.js';
import newsRoutes from './routes/news.js';
import shopRoutes from './routes/shop.js';

const app = express();

// Reflect the request origin back — allows any origin while still
// supporting Authorization headers (required when credentials: true).
app.options('*', cors({ origin: true, credentials: true }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth',        authRoutes);
app.use('/api/users',       userRoutes);
app.use('/api/problems',    problemRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/community',   communityRoutes);
app.use('/api/comments',    commentRoutes);
app.use('/api/daily-tasks', dailyTaskRoutes);
app.use('/api/news',        newsRoutes);
app.use('/api/shop',        shopRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => console.log(`Backend running on port ${PORT}`));
