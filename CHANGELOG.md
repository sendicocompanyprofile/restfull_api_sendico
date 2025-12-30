# Changelog - December 30, 2025

## Summary
Menyelesaikan masalah token dan content-type pada API endpoints, serta menghapus semua privilege admin check.

## Changes Made

### 1. ✅ Removed is_admin Privilege Checks
**Files Modified:**
- `src/routes/user.routes.ts` - Removed `adminCheckMiddleware` from GET /users dan DELETE /users/:username
- `src/controllers/user.controller.ts` - Removed is_admin check dari updateUser
- `src/services/blog.service.ts` - Removed is_admin parameter dari updateBlog dan deleteBlog
- `src/services/posting.service.ts` - Removed is_admin parameter dari updatePosting dan deletePosting
- `src/controllers/blog.controller.ts` - Updated calls tanpa is_admin
- `src/controllers/posting.controller.ts` - Updated calls tanpa is_admin

**Impact:** Semua user sekarang memiliki akses yang sama (tidak ada privilege admin khusus)

---

### 2. ✅ Extended Token Field in Database
**Files Modified:**
- `prisma/schema.prisma` - Changed `token` field dari `@db.VarChar(100)` menjadi `@db.Text`
- Created migration: `20251230133458_extend_token_field`

**Reason:** JWT token bisa mencapai 200+ karakter, VarChar(100) terlalu kecil

---

### 3. ✅ Fixed Content-Type Error for File Uploads
**Files Modified:**
- `src/index.ts` - Restructured body parser middleware untuk skip JSON/form parsing pada file upload routes

**Issue:** express.json() and express.urlencoded() middleware menyebabkan error "Content-Type was not multipart/form-data"

**Solution:** Apply body parsers hanya pada /api/users routes, skip untuk /api/posting dan /api/blogs yang menggunakan multer

---

### 4. ✅ Updated API Documentation
**Files Modified:**
- `API_DOCUMENTATION.md` - Updated semua endpoint descriptions untuk reflect ownership-based access (tanpa admin privilege)

**Changes:**
- GET /users → Changed dari "Admin Only" menjadi "Protected - Auth Required"
- PATCH /users/:username → Removed admin privilege mention
- DELETE /users/:username → Changed dari "Admin Only" menjadi "Protected - Auth Required"
- PATCH /posting/:id → Removed admin privilege examples
- DELETE /posting/:id → Removed admin privilege examples
- PATCH /blogs/:id → Removed admin privilege examples
- DELETE /blogs/:id → Removed admin privilege examples

---

### 5. ✅ Created Testing Guide
**New Files:**
- `API_TESTING_GUIDE.md` - Comprehensive guide untuk testing semua endpoints

**Includes:**
- Token information untuk user test1
- Example curl commands untuk setiap endpoint
- Explanation dari common issues dan solutions
- Instructions untuk Postman/Insomnia

---

### 6. ✅ Created Token Generation Scripts
**New Files:**
- `generate-token.ts` - Script untuk generate JWT token (standalone, no DB required)
- `generate-password-hash.ts` - Script untuk generate bcrypt password hash
- `UPDATE_TEST1_TOKEN.sql` - SQL script untuk update token di database
- `UPDATE_USER_TOKEN.sql` - SQL template untuk update user tokens

---

## Database Changes

### Migration Applied
```sql
-- 20251230133458_extend_token_field
ALTER TABLE `users` MODIFY `token` TEXT NULL;
```

### User Setup for Testing
```sql
-- Insert or Update test1 user
INSERT INTO `users` (`username`, `name`, `password`, `is_admin`, `createdAt`, `updatedAt`) 
VALUES ('test1', 'Test1', '$2b$10$oGfUe2KulA4xh.dR30Y32eP7g3cfZx5/Qh.44Vu7rJDjxnF5lAJUC', 0, NOW(), NOW());

-- Update token
UPDATE `users` SET `token` = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QxIiwiaXNfYWRtaW4iOmZhbHNlLCJpYXQiOjE3NjcxMDE0NjksImV4cCI6MTc2NzcwNjI2OX0.ATcVKVHcGOOsC6BVsyoF7HG7EgH5J5o4CmBZpfEmgGg' 
WHERE `username` = 'test1';
```

---

## Testing Instructions

### 1. Setup User in Database
```bash
# Use the provided SQL script to insert test1 user with token
mysql -u your_user -p your_database < UPDATE_TEST1_TOKEN.sql
```

### 2. Test User Endpoints
```bash
# All requires Authorization header
curl -X GET http://localhost:3000/api/users/current \
  -H "Authorization: Bearer <TOKEN>"
```

### 3. Test File Upload Endpoints (Posting/Blog)
```bash
# Use -F flag for form data (NOT -d)
curl -X POST http://localhost:3000/api/posting \
  -H "Authorization: Bearer <TOKEN>" \
  -F "title=Test" \
  -F "description=Test" \
  -F "date=2025-12-30" \
  -F "pictures=@/path/to/image.jpg"
```

---

## Endpoints Summary

### User Management (All Protected)
- POST `/users` - Register user (Public)
- POST `/users/login` - Login (Public)
- GET `/users/current` - Get current user (Auth required)
- PATCH `/users/:username` - Update own profile (Auth required + Ownership)
- DELETE `/users/current` - Logout (Auth required)
- GET `/users` - Get all users (Auth required)
- DELETE `/users/:username` - Delete user (Auth required)

### Posting (All Protected except GET)
- POST `/posting` - Create posting (Auth required)
- GET `/posting` - Get all postings (Public)
- GET `/posting/:id` - Get posting by ID (Public)
- PATCH `/posting/:id` - Update posting (Auth required + Ownership)
- DELETE `/posting/:id` - Delete posting (Auth required + Ownership)

### Blog (All Protected except GET)
- POST `/blogs` - Create blog (Auth required)
- GET `/blogs` - Get all blogs (Public)
- GET `/blogs/:id` - Get blog by ID (Public)
- PATCH `/blogs/:id` - Update blog (Auth required + Ownership)
- DELETE `/blogs/:id` - Delete blog (Auth required + Ownership)

---

## Access Control Summary

### Before Changes
- Admin: Full access to everything
- Regular User: Can only CRUD their own content

### After Changes
- All Users: Equal access level (no admin privilege)
- Ownership enforced: Can only CRUD their own content
- Some endpoints now publicly accessible (create disabled, but read always allowed)

---

## Known Issues & Resolutions

### Issue 1: "Unauthorized - Token required"
- **Cause:** Missing Authorization header
- **Fix:** Always include `Authorization: Bearer <TOKEN>` header

### Issue 2: "Content-Type was not multipart/form-data"
- **Cause:** Using `-d` instead of `-F` in curl for file upload
- **Fix:** Use `-F` flag for form data with file uploads

### Issue 3: Token size too large
- **Cause:** VarChar(100) field too small for JWT tokens
- **Fix:** Extended to TEXT field with migration

---

## Next Steps (Optional)

1. **Add Blacklist Token on Logout** - Prevent using logout token
2. **Add Role-Based Access Control** - If admin privilege needed in future
3. **Add Request Rate Limiting per User** - Prevent abuse
4. **Add API Key Authentication** - Alternative to JWT
5. **Add Refresh Token** - For better security

---

## Commits
- Checkpoint-1: Removed is_admin checks from various controllers and services
- Updated API documentation and schema to reflect changes in user and posting ownership enforcement
