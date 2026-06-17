import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import backupRoutes from './routes/backup.js';

const app = express();

const PORT = process.env.PORT || 3001;

const backupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
});

app.use(
  cors({
    origin: ['http://localhost:5173', 'https://kanji.stef-lev.xyz'],
  })
);

app.use(express.json({ limit: '5mb' }));

app.get('/health', (_, res) => {
  res.json({ ok: true });
});

app.use('/api/backup', backupLimiter);
app.use('/api/backup', backupRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
