import 'dotenv/config.js';
import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import userRouter from '../src/routes/user.routes.js';
import postingRouter from '../src/routes/posting.routes.js';
import blogRouter from '../src/routes/blog.routes.js';
import { requestLoggingMiddleware } from '../src/middleware/logging.js';
import { errorHandler } from '../src/middleware/errorHandler.js';
import { logger } from '../src/utils/logger.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLoggingMiddleware);

// Routes
app.use('/api', userRouter);
app.use('/api', postingRouter);
app.use('/api', blogRouter);

// Health check
app.get('/health', (req: Request, res: Response) => {
  logger.info('Health check', { requestId: req.id });
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware (MUST be last)
app.use(errorHandler);

export default app;
