import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, isDbConnected } from './src/config/db.js';
import { errorHandler } from './src/middleware/errorMiddleware.js';

// Route Handlers
import authRoutes from './src/routes/authRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import subscriptionRoutes from './src/routes/subscriptionRoutes.js';
import presetRoutes from './src/routes/presetRoutes.js';
import usageRoutes from './src/routes/usageRoutes.js';

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5050;

// Security & Parsing Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'FormFit AI Pro SaaS Engine',
    version: '1.0.0',
    database: isDbConnected() ? 'MongoDB Atlas (Connected)' : 'In-Memory Safe Store (Active)',
    timestamp: new Date().toISOString(),
  });
});

// Mount SaaS APIs
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/presets', presetRoutes);
app.use('/api/usage', usageRoutes);

// Centralized Error Handling
app.use(errorHandler);

// Server Startup
const isDirectRun =
  process.argv[1] && (process.argv[1].endsWith('server.js') || process.argv[1].endsWith('server'));

if (isDirectRun && process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`[FormFit SaaS Backend] Server running on port ${PORT}`);
    });
  });
}

export default app;
