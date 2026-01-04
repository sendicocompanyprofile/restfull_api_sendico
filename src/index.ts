import 'dotenv/config.js';
import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import userRouter from './routes/user.routes.js';
import postingRouter from './routes/posting.routes.js';
import blogRouter from './routes/blog.routes.js';
import { requestLoggingMiddleware } from './middleware/logging.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet - Set HTTP headers for security
app.use(helmet());

// CORS Configuration - Restrict to specific origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'http://localhost:3000', // Local development
      'http://localhost:3001', // Local frontend admin dev
      'http://localhost:3002', // Local frontend CP dev
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3002',
      'https://www.sendico.app', // Production frontend
    ];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Token'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Rate Limiting - Prevent brute force attacks and DoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true, // Don't count successful requests
});

app.use('/api/', limiter); // Apply general rate limit to all /api routes
app.use('/api/users/login', loginLimiter); // Stricter limit for login endpoint

// ============================================
// BODY PARSER MIDDLEWARE
// ============================================

// For routes without file uploads - use strict JSON/form parsing
const jsonParser = express.json({ limit: '50kb' });
const urlencodedParser = express.urlencoded({ limit: '50kb', extended: true });

// Apply parsers to user routes and other non-file endpoints
app.use('/api/users', jsonParser, urlencodedParser);

// For file upload routes, we skip the body parsers since multer will handle it
// Routes like /api/posting and /api/blogs will use multer middleware instead

// ============================================
// LOGGING MIDDLEWARE
// ============================================

app.use(requestLoggingMiddleware);

// ============================================
// ROUTES
// ============================================

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
  logger.info(`✅ CORS enabled for origins: ${allowedOrigins.join(', ')}`);
  logger.info(`✅ Rate limiting enabled`);
  logger.info(`✅ Helmet security headers enabled`);
});
