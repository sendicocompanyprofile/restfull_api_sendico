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
// app.use(cors());
// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000', // Example for local development
  'http://192.168.100.4:3000', // TODO: Add your production frontend domain
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

app.use(cors(corsOptions));
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
