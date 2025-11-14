# Quick Start: Winston Logger

## Installation Done ✅
Winston v3.18.3 sudah terinstall dan siap digunakan.

## 5 Menit Setup

### Step 1: Import Logger
```typescript
import { logger } from '../utils/logger.js';
```

### Step 2: Use in Your Code
```typescript
// Sukses
logger.info('User registered', { userId: 123, username: 'john' });

// Error
logger.error('Failed to register user', { 
  error: error.message,
  email: email
});

// Warning
logger.warn('Multiple failed login attempts', { 
  username: 'john',
  attempts: 5
});
```

### Step 3: Run Server
```bash
npm run dev
```

### Step 4: Check Logs
```bash
# Linux/Mac
cat logs/combined.log
tail -f logs/combined.log

# Windows PowerShell
Get-Content logs/combined.log
Get-Content logs/combined.log -Tail 10 -Wait
```

## Common Use Cases

### 1. Database Operations
```typescript
try {
  const user = await db.user.create(data);
  logger.info('User created in database', { userId: user.id });
} catch (error) {
  logger.error('Database insert failed', { 
    table: 'users',
    error: error.message 
  });
}
```

### 2. API Requests
```typescript
logger.info('API request received', {
  requestId: req.id,
  method: req.method,
  path: req.path,
  userId: req.user?.id,
});
```

### 3. File Upload
```typescript
logger.info('File upload started', { 
  requestId: req.id,
  filename: file.originalname,
  size: file.size,
});

logger.info('File upload completed', {
  requestId: req.id,
  filename: file.originalname,
  url: cloudUrl,
});
```

### 4. Authentication
```typescript
logger.info('User logged in', { 
  username: user.username,
  ip: req.ip,
});

logger.warn('Login failed', { 
  username: username,
  ip: req.ip,
  reason: 'invalid_password'
});
```

## Log Levels Cheat Sheet

```typescript
// Critical - Stop everything
logger.fatal('Database connection lost, shutting down...');

// Something went wrong
logger.error('Failed to process payment', { error: error.message });

// Be careful about this
logger.warn('Cache is full, clearing old entries');

// Standard info
logger.info('Payment processed successfully', { orderId: 123 });

// For debugging only
logger.debug('Request body:', { body: req.body });

// Very detailed debugging
logger.trace('Executing database query', { query: sql });
```

## Files Created

✅ `src/utils/logger.ts` - Logger configuration
✅ `src/middleware/logging.ts` - Request logging
✅ `WINSTON_LOGGER.md` - Full documentation

## Environment Setup

### Development
```bash
# .env
NODE_ENV=development
```
Logs akan ditampilkan di console dengan warna + disimpan di file

### Production
```bash
# .env
NODE_ENV=production
```
Hanya logs disimpan di file (production.log), console disabled

## Testing Logger

```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Watch logs
# Linux/Mac
tail -f logs/combined.log

# Windows PowerShell
Get-Content logs/combined.log -Tail 10 -Wait

# Terminal 3: Make API request
curl http://localhost:3000/api/users/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
```

Anda akan melihat logs muncul di terminal 2!

## Tips

1. **Always add request ID for tracing**:
   ```typescript
   // Request ID sudah otomatis ditambah by middleware
   logger.info('Something', { requestId: req.id });
   ```

2. **Don't log passwords or tokens**:
   ```typescript
   // ❌ Bad
   logger.info('Login', { username, password });
   
   // ✅ Good
   logger.info('Login', { username });
   ```

3. **Use consistent format**:
   ```typescript
   // ✅ Good
   logger.info('User registered', { 
     userId: 123,
     username: 'john',
     email: 'john@example.com'
   });
   ```

4. **Check logs regularly**:
   ```bash
   # Count errors
   grep "error" logs/combined.log | wc -l
   
   # Find specific user
   grep "john" logs/combined.log
   
   # Get last 100 lines
   tail -100 logs/combined.log
   ```

## No More console.log()

Gunakan logger di tempat console.log():

```typescript
// Old ❌
console.log('User created');
console.error('Error occurred', error);

// New ✅
logger.info('User created', { userId: 123 });
logger.error('Error occurred', { error: error.message });
```

That's it! Happy logging! 🎉
