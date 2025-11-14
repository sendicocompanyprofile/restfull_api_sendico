# RESTful API Sendico - Complete Implementation Guide

## 📋 Table of Contents

1. [Project Structure](#project-structure)
2. [Technology Stack](#technology-stack)
3. [Installation & Setup](#installation--setup)
4. [Running the Server](#running-the-server)
5. [API Endpoints](#api-endpoints)
6. [Validation System (Zod)](#validation-system-zod)
7. [Authentication](#authentication)
8. [Error Handling](#error-handling)

---

## Project Structure

```
src/
├── controllers/          # Request handlers
│   ├── user.controller.ts
│   └── posting.controller.ts
├── services/            # Business logic
│   ├── user.service.ts
│   └── posting.service.ts
├── validators/          # Zod schemas
│   ├── user.validator.ts
│   └── posting.validator.ts
├── middleware/          # Express middleware
│   └── auth.ts
├── routes/              # API routes
│   ├── user.routes.ts
│   └── posting.routes.ts
├── utils/               # Utility functions
│   ├── response.ts      # Response formatters
│   ├── password.ts      # Password hashing
│   └── token.ts         # Token generation
├── types/               # TypeScript types
│   └── index.ts
└── index.ts             # Main server file

prisma/
├── schema.prisma        # Database schema
└── migrations/          # Database migrations
```

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Language** | TypeScript | 5.9.3 |
| **Runtime** | Node.js | 18+ |
| **Framework** | Express.js | 5.1.0 |
| **ORM** | Prisma | 6.19.0 |
| **Validation** | Zod | 4.1.12 |
| **Password** | Bcrypt | 6.0.0 |
| **Database** | MySQL | 8.0+ |
| **Module** | ESM | ES2025 |

---

## Installation & Setup

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm atau yarn

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Setup Environment Variables

Create `.env` file:

```properties
DATABASE_URL="mysql://username:password@localhost:3306/restfull_api_sendico"
PORT=3000
```

### Step 3: Setup Database

```bash
# Run migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### Step 4: Build TypeScript

```bash
npm run build
```

---

## Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

Output:
```
🚀 Server is running on http://localhost:3000
```

### Production Mode

```bash
npm run build
npm start
```

### Health Check

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "OK"
}
```

---

## API Endpoints

### User Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/users` | ❌ | Register new user |
| POST | `/api/users/login` | ❌ | Login user |
| GET | `/api/users/current` | ✅ | Get current user info |
| PATCH | `/api/users/current` | ✅ | Update user profile |
| DELETE | `/api/users/current` | ✅ | Logout user |

### Posting Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/posting` | ✅ | Create posting |
| GET | `/api/posting` | ❌ | Search/list postings |
| GET | `/api/posting/:id` | ❌ | Get posting by ID |
| PATCH | `/api/posting/:id` | ✅ | Update posting |
| DELETE | `/api/posting/:id` | ✅ | Delete posting |

---

## Validation System (Zod)

### User Validators

#### Register User

```typescript
RegisterUserSchema = z.object({
  username: z.string().min(3).max(100),
  password: z.string().min(6).max(20),
  name: z.string().min(1).max(20)
})
```

**Example Valid Request**:
```json
{
  "username": "johndoe",
  "password": "securepass123",
  "name": "John Doe"
}
```

#### Login User

```typescript
LoginUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6)
})
```

**Example Valid Request**:
```json
{
  "username": "johndoe",
  "password": "securepass123"
}
```

#### Update User

```typescript
UpdateUserSchema = z.object({
  username: z.string().min(3).max(100).optional(),
  password: z.string().min(6).max(20).optional(),
  name: z.string().min(1).max(20).optional()
})
```

### Posting Validators

#### Create Posting

```typescript
CreatePostingSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  date: z.string().datetime(),
  pictures: z.array(z.string().url()).min(1).max(3)
})
```

**Example Valid Request**:
```json
{
  "title": "Beautiful Sunset",
  "description": "Amazing sunset photos",
  "date": "2025-11-13T10:30:00Z",
  "pictures": [
    "https://example.com/photo1.jpg",
    "https://example.com/photo2.jpg"
  ]
}
```

#### Search Postings

Query Parameters:
- `title` (string, optional): Search by title
- `page` (number, optional, default: 1): Page number
- `size` (number, optional, default: 10): Items per page

**Example Request**:
```
GET /api/posting?title=sunset&page=1&size=10
```

---

## Authentication

### Token-based Authentication

All protected endpoints require `X-API-TOKEN` header:

```http
GET /api/users/current HTTP/1.1
Host: localhost:3000
X-API-TOKEN: your-token-here
Content-Type: application/json
```

### Getting a Token

1. Register user: `POST /api/users`
2. Login: `POST /api/users/login` → returns token
3. Use token in `X-API-TOKEN` header for protected endpoints

### Example Flow

**Step 1: Register**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "securepass123",
    "name": "John Doe"
  }'
```

**Step 2: Login**
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "securepass123"
  }'
```

Response:
```json
{
  "data": {
    "username": "johndoe",
    "name": "John Doe",
    "token": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Step 3: Use Token**
```bash
curl -X GET http://localhost:3000/api/users/current \
  -H "X-API-TOKEN: 550e8400-e29b-41d4-a716-446655440000"
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "errors": "Error message or validation errors object"
}
```

### Validation Error Example

```json
{
  "errors": {
    "username": ["Username must be at least 3 characters"],
    "pictures": ["Maximum 3 pictures allowed"]
  }
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful GET/PATCH |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Missing/invalid token |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Internal error |

### Common Error Scenarios

#### Invalid Token

```bash
curl -X GET http://localhost:3000/api/users/current \
  -H "X-API-TOKEN: invalid-token"
```

Response (401):
```json
{
  "errors": "Unauthorized"
}
```

#### Validation Error

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ab",
    "password": "123",
    "name": ""
  }'
```

Response (400):
```json
{
  "errors": {
    "username": ["Username must be at least 3 characters"],
    "password": ["Password must be at least 6 characters"],
    "name": ["Name is required"]
  }
}
```

#### Missing Required Field

```bash
curl -X POST http://localhost:3000/api/posting \
  -H "X-API-TOKEN: token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test"
  }'
```

Response (400):
```json
{
  "errors": {
    "description": ["Description is required"],
    "date": ["Date is required"],
    "pictures": ["At least 1 picture is required"]
  }
}
```

---

## Response Format

### Success Response

```json
{
  "data": {}
}
```

With Paging:
```json
{
  "data": [],
  "paging": {
    "current_page": 1,
    "total_page": 5,
    "size": 10
  }
}
```

### Error Response

```json
{
  "errors": "Error message"
}
```

Or with validation errors:
```json
{
  "errors": {
    "field": ["Error message 1", "Error message 2"]
  }
}
```

---

## Complete Example Workflow

### 1. Register User

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "sendico",
    "password": "sendico123",
    "name": "Sendico Admin"
  }'
```

Response:
```json
{
  "data": {
    "username": "sendico",
    "name": "Sendico Admin"
  }
}
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "sendico",
    "password": "sendico123"
  }'
```

Response:
```json
{
  "data": {
    "username": "sendico",
    "name": "Sendico Admin",
    "token": "uuid-token-here"
  }
}
```

### 3. Create Posting

```bash
curl -X POST http://localhost:3000/api/posting \
  -H "Content-Type: application/json" \
  -H "X-API-TOKEN: uuid-token-here" \
  -d '{
    "title": "Sendico Launch",
    "description": "Our company official launch event",
    "date": "2025-11-13T14:00:00Z",
    "pictures": [
      "https://example.com/sendico-1.jpg",
      "https://example.com/sendico-2.jpg"
    ]
  }'
```

Response:
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Sendico Launch",
    "description": "Our company official launch event",
    "date": "2025-11-13",
    "pictures": [
      "https://example.com/sendico-1.jpg",
      "https://example.com/sendico-2.jpg"
    ],
    "createdAt": "2025-11-13T14:00:00Z",
    "updatedAt": "2025-11-13T14:00:00Z"
  }
}
```

### 4. Search Postings

```bash
curl http://localhost:3000/api/posting?title=Sendico&page=1&size=10
```

Response:
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Sendico Launch",
      "description": "Our company official launch event",
      "date": "2025-11-13",
      "pictures": [
        "https://example.com/sendico-1.jpg",
        "https://example.com/sendico-2.jpg"
      ],
      "createdAt": "2025-11-13T14:00:00Z",
      "updatedAt": "2025-11-13T14:00:00Z"
    }
  ],
  "paging": {
    "current_page": 1,
    "total_page": 1,
    "size": 10
  }
}
```

---

## Best Practices

### ✅ Do's

- Always validate input data before sending to API
- Use HTTPS URLs for all picture uploads
- Include meaningful error handling in client
- Cache tokens securely
- Use pagination for list endpoints
- Set appropriate Content-Type headers

### ❌ Don'ts

- Don't expose tokens in URLs or logs
- Don't send passwords in plain text (always use HTTPS)
- Don't update array fields partially
- Don't ignore validation errors
- Don't make requests without required headers

---

## Troubleshooting

### Issue: "Database connection failed"

**Solution**: Check DATABASE_URL in .env file and MySQL service is running

### Issue: "Zod validation error on valid data"

**Solution**: Ensure date format is ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)

### Issue: "Token invalid"

**Solution**: Token may have expired. Login again to get a new token

### Issue: "Picture URL validation fails"

**Solution**: Ensure URLs start with http:// or https://

---

## API Testing Tools

### Postman

Import collection from documentation

### cURL

Use examples provided in this guide

### Thunder Client (VS Code)

Extension for quick API testing

---

## Performance Tips

1. Use pagination for large datasets
2. Add database indexes on frequently searched fields
3. Cache responses when appropriate
4. Implement rate limiting (future feature)

---

## Security Considerations

1. ✅ Passwords are hashed with Bcrypt (10 rounds)
2. ✅ Token-based authentication implemented
3. ✅ Input validation with Zod
4. ✅ CORS protection (can be added)
5. ⚠️ Rate limiting not yet implemented
6. ⚠️ HTTPS not enforced in development

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-13 | Initial implementation with User & Posting endpoints |

---

**Last Updated**: 2025-11-13  
**Maintained By**: Agung Maulana
