import 'dotenv/config';
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

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
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
