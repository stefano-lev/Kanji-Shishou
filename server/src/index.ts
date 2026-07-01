import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import backupRoutes from './routes/backup.js';

const app = express();

const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_ORIGIN,
].filter(Boolean) as string[];

const backupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
});

app.use(
  cors({
    origin: allowedOrigins,
  })
);

app.use(express.json({ limit: '5mb' }));

app.get('/health', (_, res) => {
  res.json({
    ok: true,
    message: 'Kanji Shishou API is running',
  });
});

app.get('/api/health', (_, res) => {
  res.json({
    ok: true,
    message: 'Kanji Shishou API is running',
  });
});

app.use('/api/backup', backupLimiter);
app.use('/api/backup', backupRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Allowed origins:', allowedOrigins);
});
