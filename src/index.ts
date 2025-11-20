import 'dotenv/config.js';
import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import userRouter from './routes/user.routes.js';
import postingRouter from './routes/posting.routes.js';
import blogRouter from './routes/blog.routes.js';
import { requestLoggingMiddleware } from './middleware/logging.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// CORS Configuration - Allow all origins temporarily
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLoggingMiddleware);

// CORS Configuration
// const allowedOrigins = [
//   'http://localhost:3000', // Example for local development
//   'https://your-frontend-domain.com', // TODO: Add your production frontend domain
// ];

// const corsOptions: cors.CorsOptions = {
//   origin: (origin, callback) => {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
// };

// app.use(cors(corsOptions));


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
