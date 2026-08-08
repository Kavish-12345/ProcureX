import 'dotenv/config';
import { config } from './config/index.js';
import {authRateLimiter} from './middleware/rateLimiter.js';
import express, { type NextFunction, type Request, type Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import logger from './lib/logger.js';
import requestLogger from './middleware/requestLogger.js';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import ledgerRoutes from './routes/ledger.routes.js';
import connectionRoutes from './routes/connection.routes.js';
import discoveryRoutes from './routes/discovery.routes.js';


const app = express();

app.use(helmet());
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// API Routes
app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders' , orderRoutes); 
app.use('/api/ledger', ledgerRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api', discoveryRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Catches anything a controller didn't already handle in its own try/catch
// (Express 5 auto-forwards thrown/rejected errors from async handlers here).
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  logger.error(`Unhandled error on ${req.method} ${req.originalUrl}:`, err);
  if (res.headersSent) return;
  res.status(500).json({ success: false, message: 'Internal server error' });
});

export default app;