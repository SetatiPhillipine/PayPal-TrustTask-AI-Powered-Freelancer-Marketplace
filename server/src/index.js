import dns from 'node:dns';
// Keep this to prevent DNS blocking issues with MongoDB Atlas
dns.setServers(['8.8.8.8', '8.8.4.4']);

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import aiRoutes from './routes/ai.js';
import projectRoutes from './routes/projects.js';
import paymentRoutes from './routes/payments.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '100kb' }));
app.use('/api', rateLimit({ windowMs: 60_000, limit: 120 }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/payments', paymentRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Something went wrong' });
});

const port = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    // Added '0.0.0.0' here to fix Windows connection issues
    app.listen(port, '0.0.0.0', () => console.log(`TrustTask API on http://localhost:${port}`));
  })
  .catch((e) => { 
    console.error('MongoDB connection failed:', e.message); 
    process.exit(1); 
  });