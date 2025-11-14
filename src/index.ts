import 'dotenv/config.js';
import express from 'express';
import type { Request, Response } from 'express';
import userRouter from './routes/user.routes.js';
import postingRouter from './routes/posting.routes.js';
import blogRouter from './routes/blog.routes.js';
import { requestLoggingMiddleware } from './middleware/logging.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
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
  res.json({ status: 'OK' });
});

// Error handling middleware (MUST be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server is running on http://localhost:${PORT}`);
});
