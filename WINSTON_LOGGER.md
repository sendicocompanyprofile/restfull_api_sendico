# Winston Logger Documentation

## Overview

**Ya, kita SUDAH menggunakan Winston Logger v3.18.3** dalam project ini. Winston adalah library logging yang powerful untuk Node.js yang menyediakan flexible logging dengan multiple transports.

## Current Status

Winston sudah terinstall di dependencies, namun belum diimplementasikan dalam kode saat ini.

```json
"winston": "^3.18.3",
```

## Setup Winston Logger

Saya akan membuat utility file untuk konfigurasi Winston logger:

### File: `src/utils/logger.ts`

```typescript
import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Define custom log levels
const customLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5,
  },
  colors: {
    fatal: 'red',
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
    trace: 'magenta',
  },
};

// Create logger instance
export const logger = winston.createLogger({
  levels: customLevels.levels,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'restful-api-sendico' },
  transports: [
    // Log errors to file
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Log all levels to file
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ colors: customLevels.colors }),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const metaStr = Object.keys(meta).length
            ? JSON.stringify(meta, null, 2)
            : '';
          return `[${timestamp}] ${level}: ${message} ${metaStr}`;
        })
      ),
    })
  );
}

// Add file transport in production
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/production.log',
      level: 'info',
      maxsize: 5242880,
      maxFiles: 10,
    })
  );
}
```

## Usage Examples

### 1. Basic Logging in Services

```typescript
import { logger } from '../utils/logger.js';

export const userService = {
  async createUser(data: CreateUserInput) {
    try {
      logger.info('Creating new user', { email: data.email });
      // ... logic here
      logger.info('User created successfully', { userId: user.id });
      return user;
    } catch (error) {
      logger.error('Failed to create user', {
        email: data.email,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },
};
```

### 2. Logging in Controllers

```typescript
import { logger } from '../utils/logger.js';

export const userController = {
  async register(req: Request, res: Response) {
    const requestId = req.id || 'unknown';
    try {
      logger.debug('Register request received', { requestId, body: req.body });
      const result = await userService.createUser(req.body);
      logger.info('User registered successfully', { requestId, userId: result.id });
      sendSuccess(res, result, 'User registered');
    } catch (error) {
      logger.error('Register failed', {
        requestId,
        error: error instanceof Error ? error.message : String(error),
      });
      sendError(res, 500, 'Internal server error');
    }
  },
};
```

### 3. Logging in Middleware

```typescript
import { logger } from '../utils/logger.js';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
};
```

### 4. Error Logging

```typescript
try {
  // ... async operation
} catch (error) {
  logger.fatal('Critical error occurred', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  });
  
  // Notify admin or send alert
  process.exit(1);
}
```

## Log Levels

Winston supports these log levels (highest to lowest priority):

| Level | Priority | Use Case |
|-------|----------|----------|
| fatal | 0 | Critical errors that require immediate attention |
| error | 1 | Error conditions |
| warn | 2 | Warning conditions |
| info | 3 | Informational messages (default) |
| debug | 4 | Detailed debugging information |
| trace | 5 | Very detailed trace information |

## File Structure

Logs akan disimpan di:

```
project-root/
├── logs/
│   ├── error.log        (errors only)
│   ├── combined.log     (all levels)
│   └── production.log   (production environment)
```

## Configuration Options

### Environment Variables

```bash
NODE_ENV=development          # Enable console logging
NODE_ENV=production           # Disable console, enable file logging
LOG_LEVEL=debug              # Set minimum log level
```

### Log Formats

- **Development**: Colorized console output with readable format
- **Production**: JSON format for easy parsing by log aggregation services
- **File**: JSON format for structured logging

## Best Practices

1. **Use Appropriate Levels**
   - `fatal`: Only for unrecoverable errors
   - `error`: For exceptions that need attention
   - `warn`: For potentially problematic situations
   - `info`: For general application flow
   - `debug`: For development troubleshooting
   - `trace`: For detailed internal operations

2. **Include Context**
   ```typescript
   logger.info('User login', {
     userId: user.id,
     email: user.email,
     ip: req.ip,
     timestamp: new Date(),
   });
   ```

3. **Avoid Logging Sensitive Data**
   ```typescript
   // ❌ BAD - Logs password
   logger.info('User login attempt', { email, password });
   
   // ✅ GOOD - Only logs non-sensitive data
   logger.info('User login attempt', { email, ip });
   ```

4. **Use Error Property Correctly**
   ```typescript
   try {
     // ... code
   } catch (error) {
     logger.error('Operation failed', {
       error: error instanceof Error ? error.message : String(error),
       stack: error instanceof Error ? error.stack : undefined,
     });
   }
   ```

5. **Request Tracking**
   ```typescript
   // Assign requestId to each request
   req.id = uuid();
   logger.info('Request start', { requestId: req.id });
   ```

## Winston Transport Options

### File Transport
- `filename`: Path to log file
- `maxsize`: Maximum file size in bytes (5MB default)
- `maxFiles`: Maximum number of files to keep (5 default)
- `level`: Minimum log level for this transport

### Console Transport
- `colorize`: Enable colored output
- `format`: Output format (customizable)
- `level`: Minimum log level

## Integration with Existing Code

### Step 1: Create logger utility
Create `src/utils/logger.ts` with configuration above

### Step 2: Import in services
```typescript
import { logger } from '../utils/logger.js';
```

### Step 3: Add logging to key operations
- User authentication (register, login)
- Database operations (create, update, delete)
- File uploads (success, failures)
- Error handling (all error paths)

### Step 4: Add request middleware
```typescript
import { logger } from './utils/logger.js';

app.use((req, res, next) => {
  req.id = uuid();
  logger.info('Request received', {
    requestId: req.id,
    method: req.method,
    path: req.path,
  });
  next();
});
```

## Monitoring & Maintenance

1. **Log Rotation**: Winston automatically rotates files based on maxsize/maxFiles
2. **Performance**: Async logging doesn't block request handling
3. **Storage**: Monitor disk space for log files
4. **Archive**: Periodically archive old logs

## Production Considerations

1. **Log Aggregation**: Use services like:
   - ELK Stack (Elasticsearch, Logstash, Kibana)
   - Datadog
   - Splunk
   - CloudWatch (if using AWS)

2. **Sensitive Data**: Never log:
   - Passwords
   - Tokens
   - Credit card numbers
   - Personal identification info

3. **Performance**: 
   - Use appropriate log levels
   - Don't log in tight loops
   - Consider sampling for high-volume logs

4. **Alerts**: Set up alerts for:
   - Fatal errors
   - Repeated errors from same source
   - Unusual patterns

## Summary

✅ Winston logger adalah production-ready logging solution yang:
- Mudah diintegrasikan
- Flexible dengan multiple transports
- Supports structured logging
- Performant dan non-blocking
- Suitable untuk development dan production

Siap untuk diintegrasikan ke seluruh API endpoints, services, dan middleware.
