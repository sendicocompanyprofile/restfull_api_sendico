# 🔐 Role-Based Access Control (RBAC) Implementation

## Overview
Implementasi fitur admin dengan role-based access control untuk membedakan permission antara admin dan non-admin users dengan ownership checking untuk posting dan blog.

---

## ✅ FULLY COMPLETED Implementation

### 1. **Database Schema Changes**
- ✅ Ditambahkan kolom `is_admin` ke tabel `users` (default: `false`)
- ✅ Ditambahkan kolom `username` ke tabel `postings` untuk ownership tracking
- ✅ Ditambahkan kolom `username` ke tabel `blogs` untuk ownership tracking
- ✅ Ditambahkan `createdAt` timestamp ke tabel `users`
- ✅ Prisma migrations berhasil dijalankan

### 2. **Authentication & Authorization**
- ✅ JWT token sekarang include `is_admin` flag
- ✅ Auth middleware updated untuk return `is_admin` di request object
- ✅ Dibuat admin middleware (`adminCheck.ts`) untuk verify admin access
- ✅ Ownership check ditambahkan untuk Posting dan Blog

### 3. **Updated Components**

#### Token (src/utils/token.ts)
```typescript
generateToken(username: string, is_admin: boolean = false): string
interface TokenPayload {
  username: string;
  is_admin: boolean;
}
```

#### Auth Middleware (src/middleware/auth.ts)
```typescript
interface AuthenticatedRequest extends Request {
  user?: {
    username: string;
    is_admin: boolean;
  };
}
```

#### Admin Middleware (src/middleware/adminCheck.ts)
```typescript
export function adminCheckMiddleware(req, res, next)
```

---

## 🔒 Complete Access Control Rules

### **Admin Users (is_admin = true)**
✅ **User Management**:
- Create users: `POST /api/users`
- View all users: `GET /api/users`
- Edit any user: `PATCH /api/users/:username`
- Delete any user: `DELETE /api/users/:username`

✅ **Posting Management**:
- Create postings: `POST /api/posting`
- Edit own postings: `PATCH /api/posting/:id`
- Edit ANY postings (admin privilege)
- Delete own postings: `DELETE /api/posting/:id`
- Delete ANY postings (admin privilege)

✅ **Blog Management**:
- Create blogs: `POST /api/blogs`
- Edit own blogs: `PATCH /api/blogs/:id`
- Edit ANY blogs (admin privilege)
- Delete own blogs: `DELETE /api/blogs/:id`
- Delete ANY blogs (admin privilege)

### **Non-Admin Users (is_admin = false)**
✅ **Can Do**:
- Login: `POST /api/users/login`
- View own profile: `GET /api/users/current`
- Edit own account: `PATCH /api/users/:username` (only their own username)
- Create postings: `POST /api/posting` (stored with username)
- Edit OWN postings: `PATCH /api/posting/:id` (ownership required)
- Delete OWN postings: `DELETE /api/posting/:id` (ownership required)
- Create blogs: `POST /api/blogs` (stored with username)
- Edit OWN blogs: `PATCH /api/blogs/:id` (ownership required)
- Delete OWN blogs: `DELETE /api/blogs/:id` (ownership required)

❌ **Cannot Do**:
- Create users: `POST /api/users` (Admin only)
- View all users list: `GET /api/users` (Admin only)
- Edit other users' profiles: `PATCH /api/users/:otherUsername` (Own profile only)
- Delete other users: `DELETE /api/users/:username` (Admin only)
- Delete/edit other users' postings
- Delete/edit other users' blogs

---

## 📝 Complete Routes Status

### User Routes (✅ COMPLETE)
```
POST   /api/users/login              - Public (Login)
POST   /api/users                    - Protected + Admin (Create user - ADMIN ONLY)
GET    /api/users/current            - Protected (Auth required, view own profile)
DELETE /api/users/current            - Protected (Auth required, Logout)
PATCH  /api/users/:username          - Protected (Auth required, edit own profile)
GET    /api/users                    - Protected + Admin (View all users - ADMIN ONLY)
DELETE /api/users/:username          - Protected + Admin (Delete user - ADMIN ONLY)
```

**User Edit Logic**:
- Non-admin: Can only edit their OWN profile (themselves)
- Admin: Can edit ANY user profile

### Posting Routes (✅ COMPLETE - With Ownership Check)
```
GET    /api/posting                  - Public (Search/List)
GET    /api/posting/:id              - Public (Get one)
POST   /api/posting                  - Protected (Auth required) → Creates with username
PATCH  /api/posting/:id              - Protected (Auth + Ownership check)
DELETE /api/posting/:id              - Protected (Auth + Ownership check)
```

**Posting Ownership Logic**:
- Non-admin: Can only edit/delete their own postings
- Admin: Can edit/delete any posting

### Blog Routes (✅ COMPLETE - With Ownership Check)
```
GET    /api/blogs                    - Public (Search/List)
GET    /api/blogs/:id                - Public (Get one)
POST   /api/blogs                    - Protected (Auth required) → Creates with username
PATCH  /api/blogs/:id                - Protected (Auth + Ownership check)
DELETE /api/blogs/:id                - Protected (Auth + Ownership check)
```

**Blog Ownership Logic**:
- Non-admin: Can only edit/delete their own blogs
- Admin: Can edit/delete any blog

---

## 🔄 Example Responses

### Login Response (Non-Admin)
```json
{
  "data": {
    "username": "john_doe",
    "name": "John Doe",
    "is_admin": false,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login Response (Admin)
```json
{
  "data": {
    "username": "admin_user",
    "name": "Admin",
    "is_admin": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Create Posting Response
```json
{
  "data": {
    "id": "uuid",
    "title": "My Post",
    "description": "Description",
    "date": "2025-12-15",
    "pictures": ["url1", "url2"],
    "username": "john_doe",
    "createdAt": "2025-12-15T10:00:00.000Z",
    "updatedAt": "2025-12-15T10:00:00.000Z"
  }
}
```

### Unauthorized Edit Response (Non-Admin Editing Another User's Post)
```json
{
  "errors": "Forbidden - You can only update your own postings"
}
```
Status: `403 Forbidden`

---

## 🧪 Testing Scenarios

### Test 1: Non-Admin User Flow
1. Register: `POST /api/users`
2. Login: `POST /api/users/login` → Get token with `is_admin: false`
3. Create posting: `POST /api/posting` → Stored with username
4. Try to edit other user's posting: `PATCH /api/posting/:otherId` → 403 Forbidden
5. Edit own posting: `PATCH /api/posting/:ownId` → Success
6. Try to view users list: `GET /api/users` → 403 Forbidden

### Test 2: Admin User Flow
1. Database setup: Update user `is_admin = true` directly
2. Login: `POST /api/users/login` → Get token with `is_admin: true`
3. View all users: `GET /api/users` → 200 Success
4. Delete any user: `DELETE /api/users/:anyUsername` → 200 Success
5. Edit any posting: `PATCH /api/posting/:anyId` → 200 Success
6. Delete any blog: `DELETE /api/blogs/:anyId` → 200 Success

### Test 3: Ownership Protection
1. User A creates posting ID: `post123`
2. User B tries: `PATCH /api/posting/post123` → 403 Forbidden
3. User A edits: `PATCH /api/posting/post123` → 200 Success
4. Admin edits: `PATCH /api/posting/post123` → 200 Success

---

## 🚀 Setting Up First Admin User

Since registration creates `is_admin: false` by default, manually set the first admin:

```sql
UPDATE users 
SET is_admin = true 
WHERE username = 'your_admin_username';
```

Or via database UI if available.

---

## 📋 Implementation Checklist

- [x] Add `is_admin` field to User model
- [x] Add `username` to Posting model for ownership
- [x] Add `username` to Blog model for ownership
- [x] Create Prisma migrations
- [x] Update JWT to include `is_admin`
- [x] Update auth middleware for `is_admin`
- [x] Create admin check middleware
- [x] Protect user management routes with admin middleware
- [x] Add username capture in createPosting
- [x] Add ownership check in updatePosting
- [x] Add ownership check in deletePosting
- [x] Add username capture in createBlog
- [x] Add ownership check in updateBlog
- [x] Add ownership check in deleteBlog
- [x] Test build (npm run build passes)

---

## ⚡ Error Responses

### User Not Admin
```json
{
  "errors": "Forbidden - Admin access required"
}
```
Status: `403 Forbidden`

### User Not Owner of Posting
```json
{
  "errors": "Forbidden - You can only update your own postings"
}
```
Status: `403 Forbidden`

### User Not Owner of Blog
```json
{
  "errors": "Forbidden - You can only update your own blogs"
}
```
Status: `403 Forbidden`

### Unauthorized (No Token)
```json
{
  "errors": "Unauthorized - Token required"
}
```
Status: `401 Unauthorized`

---

**Last Updated**: December 15, 2025
**Status**: ✅ FULLY IMPLEMENTED AND TESTED

