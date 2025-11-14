# Architecture & Design Decisions

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      HTTP Requests                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
           ┌───────────────────────┐
           │   Express Router      │
           │  (routes/*.routes.ts) │
           └───────────┬───────────┘
                       │
                       ▼
       ┌───────────────────────────────────┐
       │    Middleware Chain               │
       ├───────────────────────────────────┤
       │ 1. JSON Parser                    │
       │ 2. Auth Middleware (for protected)│
       └───────────┬───────────────────────┘
                   │
                   ▼
       ┌───────────────────────────────┐
       │  Controllers                  │
       │  (controllers/*.controller.ts)│
       │  - Request handling           │
       │  - Validation delegation      │
       └───────────┬───────────────────┘
                   │
                   ▼
    ┌──────────────────────────────┐
    │  Validators (Zod)            │
    │ (validators/*.validator.ts)  │
    │ - Input validation           │
    │ - Type coercion              │
    └───────────┬──────────────────┘
                │ (validated data)
                ▼
    ┌──────────────────────────────┐
    │  Services                    │
    │  (services/*.service.ts)     │
    │  - Business logic            │
    │  - Data transformation       │
    └───────────┬──────────────────┘
                │
                ▼
    ┌──────────────────────────────┐
    │  Prisma Client               │
    │  - ORM layer                 │
    │  - Query building            │
    └───────────┬──────────────────┘
                │
                ▼
    ┌──────────────────────────────┐
    │  MySQL Database              │
    │  - Data persistence          │
    └──────────────────────────────┘
```

---

## Layered Architecture

### 1. **Route Layer** (`src/routes/`)

**Responsibility**: Define HTTP endpoints and routing

**Files**:
- `user.routes.ts` - User endpoint definitions
- `posting.routes.ts` - Posting endpoint definitions

**Example**:
```typescript
userRouter.post('/users', (req, res) => 
  userController.register(req as any, res)
);
```

**Key Principles**:
- Clean separation of endpoints
- Middleware attachment at route level
- Simple pass-through to controllers

---

### 2. **Middleware Layer** (`src/middleware/`)

**Responsibility**: Cross-cutting concerns

**Files**:
- `auth.ts` - Token validation and user extraction

**Example**:
```typescript
export async function authMiddleware(req, res, next) {
  const token = req.headers['x-api-token'];
  if (!token) return sendError(res, 'Unauthorized', 401);
  req.user = { username: token };
  next();
}
```

**Key Principles**:
- Generic and reusable
- Non-blocking operations
- Clear error responses

---

### 3. **Controller Layer** (`src/controllers/`)

**Responsibility**: Request handling and orchestration

**Files**:
- `user.controller.ts` - User request handlers
- `posting.controller.ts` - Posting request handlers

**Example**:
```typescript
async register(req, res) {
  const validatedData = RegisterUserSchema.safeParse(req.body);
  if (!validatedData.success) {
    sendError(res, formatZodErrors(validatedData.error), 400);
    return;
  }
  const result = await userService.register(validatedData.data);
  sendSuccess(res, result, 201);
}
```

**Key Principles**:
- Orchestrate request flow
- Delegate validation to validators
- Delegate business logic to services
- Format and send responses

---

### 4. **Validation Layer** (`src/validators/`)

**Responsibility**: Input validation and transformation

**Files**:
- `user.validator.ts` - User schema definitions
- `posting.validator.ts` - Posting schema definitions

**Technology**: Zod v4.1.12

**Example**:
```typescript
export const CreatePostingSchema = z.object({
  title: z.string().min(1).max(255),
  pictures: z.array(z.string().url()).min(1).max(3)
});
```

**Key Principles**:
- Declarative schema definitions
- Type-safe validation
- Clear error messages
- Early validation (before service layer)

---

### 5. **Service Layer** (`src/services/`)

**Responsibility**: Business logic and data manipulation

**Files**:
- `user.service.ts` - User business logic
- `posting.service.ts` - Posting business logic

**Example**:
```typescript
async createPosting(request) {
  const posting = await prisma.posting.create({
    data: {
      title: request.title,
      pictures: JSON.stringify(request.pictures)
    }
  });
  return this.formatPosting(posting);
}
```

**Key Principles**:
- Pure business logic
- Data transformation
- Error handling
- Database operations coordination

---

### 6. **Data Access Layer** (Prisma ORM)

**Responsibility**: Database queries and operations

**Technology**: Prisma v6.19.0

**Example**:
```typescript
const user = await prisma.user.findUnique({
  where: { username }
});

const posting = await prisma.posting.create({
  data: { /* ... */ }
});
```

**Key Principles**:
- Type-safe queries
- Automatic migrations
- Query optimization
- Connection pooling

---

### 7. **Utility Layer** (`src/utils/`)

**Responsibility**: Helper functions

**Files**:
- `response.ts` - Response formatting
- `password.ts` - Password hashing
- `token.ts` - Token generation

**Example**:
```typescript
// response.ts
export function sendSuccess(res, data, statusCode = 200) {
  return res.status(statusCode).json({ data });
}

// password.ts
export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

// token.ts
export function generateToken() {
  return v4();
}
```

---

## Data Flow Diagram

### Create Posting Request

```
Client Request
    │
    ├─ POST /api/posting
    ├─ Header: X-API-TOKEN
    └─ Body: { title, description, date, pictures }
            │
            ▼
    Router matches /api/posting POST
            │
            ▼
    Auth Middleware validates token
            │
            ▼
    PostingController.createPosting()
            │
            ├─ Parse request body
            ├─ Call CreatePostingSchema.safeParse()
            │
            ▼
    If validation fails: sendError() → Response 400
    If validation passes: ↓
            │
            ├─ Call postingService.createPosting()
            │
            ▼
    PostingService
            │
            ├─ Prepare data
            ├─ JSON.stringify(pictures)
            ├─ Create database record via Prisma
            │
            ▼
    Prisma generates SQL:
    INSERT INTO postings (id, title, ..., pictures) VALUES (...)
            │
            ▼
    MySQL executes query
            │
            ▼
    Service returns formatted response
            │
            ▼
    Controller calls sendSuccess()
            │
            ▼
    Response sent to client: 201 Created
```

---

## Design Patterns Used

### 1. **MVC (Model-View-Controller)**
- **Model**: Prisma schema defines data models
- **View**: JSON responses
- **Controller**: `*Controller` classes

### 2. **Service Layer Pattern**
- Encapsulates business logic
- Makes testing easier
- Promotes code reuse

### 3. **Singleton Pattern**
```typescript
export const userService = new UserService();
export const postingService = new PostingService();
```

### 4. **Factory Pattern** (Zod Schemas)
```typescript
export const CreatePostingSchema = z.object({ /* ... */ });
// Used in multiple controllers
```

### 5. **Middleware Chain Pattern**
```typescript
app.use(express.json());
app.use(authMiddleware);
```

### 6. **Repository Pattern** (via Prisma)
```typescript
// Abstraction layer for database access
prisma.user.findUnique()
prisma.posting.create()
```

---

## Error Handling Strategy

### 1. **Validation Errors** (400)
Caught at Controller level:
```typescript
const validated = Schema.safeParse(data);
if (!validated.success) {
  sendError(res, formatZodErrors(validated.error), 400);
}
```

### 2. **Authentication Errors** (401)
Caught at Middleware level:
```typescript
if (!token) {
  sendError(res, 'Unauthorized', 401);
}
```

### 3. **Business Logic Errors** (400/500)
Caught at Service level, re-thrown to Controller:
```typescript
if (!user) {
  throw new Error('User not found');
}
```

### 4. **Server Errors** (500)
Caught at Controller level:
```typescript
try {
  // logic
} catch (error) {
  sendError(res, error.message, 500);
}
```

---

## Database Design Decisions

### User Model
```prisma
model User {
  username String @id              // Natural primary key
  password String                  // Bcrypt hashed
  name     String
  token    String? @db.VarChar(100)// Session token
}
```

**Reasoning**:
- Username as PK simplifies lookups
- Optional token for logout capability
- VarChar for token allows null/undefined

### Posting Model
```prisma
model Posting {
  id          String   @id @default(uuid())
  title       String   @db.VarChar(255)
  description String   @db.Text
  date        DateTime @db.Date         // Business date
  pictures    Json     @default("[]")   // Array of URLs
  createdAt   DateTime @default(now())  // Audit trail
  updatedAt   DateTime @updatedAt       // Audit trail
}
```

**Reasoning**:
- UUID for distributed systems readiness
- Json column for flexible array storage
- Timestamps for audit trail
- Separate `date` field for business date

### JSON for Pictures (not Separate Table)

**Why JSON instead of relation?**
- ✅ Simple queries (no JOIN needed)
- ✅ Consistent with frontend
- ✅ MySQL supports JSON well
- ✅ Validation in application layer

**When to use separate table:**
- If more than 10 pictures per posting
- If need to query pictures independently
- If need separate permissions on pictures

---

## Type Safety Strategy

### 1. **Request Type Safety**
```typescript
// Validators generate TypeScript types
export type CreatePostingRequest = 
  z.infer<typeof CreatePostingSchema>;
```

### 2. **Response Type Safety**
```typescript
// Type definitions in src/types/
export interface PostingResponse {
  id: string;
  title: string;
  // ...
}
```

### 3. **Service Type Safety**
```typescript
async createPosting(request: CreatePostingRequest): Promise<PostingResponse>
```

### 4. **Database Type Safety**
```typescript
// Prisma generates types automatically
const user: User = await prisma.user.findUnique(...)
```

---

## Performance Considerations

### 1. **Database Query Optimization**
```typescript
// Good: Pagination to limit results
await prisma.posting.findMany({
  skip: (page - 1) * size,
  take: size,
  orderBy: { createdAt: 'desc' }
});

// Bad: No pagination
await prisma.posting.findMany();
```

### 2. **JSON Handling**
```typescript
// Store as string, parse on retrieval
pictures: JSON.stringify(request.pictures)
// Later:
JSON.parse(posting.pictures)
```

### 3. **Connection Pooling**
Prisma handles automatically via datasource configuration

### 4. **Caching** (Future)
Can add Redis layer without changing business logic

---

## Security Architecture

### 1. **Password Security**
```typescript
// Bcrypt with 10 salt rounds
const hashedPassword = await bcrypt.hash(password, 10);
```

### 2. **Token Security**
```typescript
// UUID-based, stored in database
const token = generateToken(); // v4 UUID
await prisma.user.update({ data: { token } });
```

### 3. **Input Validation**
```typescript
// Zod validates all inputs before processing
CreatePostingSchema.safeParse(req.body)
```

### 4. **Authentication Flow**
```
Client sends token → Middleware validates → req.user set → Service verifies
```

---

## Testing Strategy (Future)

### Unit Tests
- Validators: Test schema validations
- Services: Test business logic
- Utils: Test helper functions

### Integration Tests
- Controller-Service integration
- Database queries via Prisma

### E2E Tests
- Complete request flow
- Authentication flow
- Error scenarios

---

## Deployment Considerations

### 1. **Environment Configuration**
```env
DATABASE_URL=...
PORT=3000
NODE_ENV=production
```

### 2. **Build Process**
```bash
npm run build  # Compile TypeScript → dist/
```

### 3. **Runtime**
```bash
npm start      # Run compiled JavaScript
```

### 4. **Database Migrations**
```bash
npx prisma migrate deploy  # Production-safe
```

---

## Technology Choices Justification

| Choice | Rationale |
|--------|-----------|
| TypeScript | Type safety, better DX, fewer runtime errors |
| Express | Lightweight, widely adopted, great ecosystem |
| Prisma | Type-safe ORM, auto migrations, great DX |
| Zod | Runtime validation + static types, no decorators |
| Bcrypt | Industry standard for password hashing |
| MySQL | Required by client, reliable, good support |
| ESM | Future standard, better tree-shaking |

---

## Future Improvements

1. **Rate Limiting**: Prevent brute force attacks
2. **Logging**: Winston integration
3. **Caching**: Redis for frequent queries
4. **Testing**: Unit & E2E test suite
5. **API Documentation**: Swagger/OpenAPI
6. **Error Tracking**: Sentry integration
7. **Database**: Read replicas for scaling

---

**Last Updated**: 2025-11-13
