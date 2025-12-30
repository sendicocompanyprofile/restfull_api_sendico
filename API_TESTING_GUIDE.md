# Testing Guide - User Management API

## Token Information
Token untuk user `test1` (berlaku 7 hari):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QxIiwiaXNfYWRtaW4iOmZhbHNlLCJpYXQiOjE3NjcxMDE0NjksImV4cCI6MTc2NzcwNjI2OX0.ATcVKVHcGOOsC6BVsyoF7HG7EgH5J5o4CmBZpfEmgGg
```

## 1. User Management Endpoints

### Create/Register User (Public)
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "SecurePass123!",
    "name": "New User"
  }'
```

**Expected Response (201 Created):**
```json
{
  "data": {
    "username": "newuser",
    "name": "New User"
  }
}
```

---

### Login User (Public)
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test1",
    "password": "test2711"
  }'
```

**Expected Response (200 OK):**
```json
{
  "data": {
    "username": "test1",
    "name": "Test1",
    "is_admin": false,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Get Current User (Protected - Auth Required)
```bash
curl -X GET http://localhost:3000/api/users/current \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QxIiwiaXNfYWRtaW4iOmZhbHNlLCJpYXQiOjE3NjcxMDE0NjksImV4cCI6MTc2NzcwNjI2OX0.ATcVKVHcGOOsC6BVsyoF7HG7EgH5J5o4CmBZpfEmgGg"
```

**OR** using X-API-TOKEN header:
```bash
curl -X GET http://localhost:3000/api/users/current \
  -H "X-API-TOKEN: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QxIiwiaXNfYWRtaW4iOmZhbHNlLCJpYXQiOjE3NjcxMDE0NjksImV4cCI6MTc2NzcwNjI2OX0.ATcVKVHcGOOsC6BVsyoF7HG7EgH5J5o4CmBZpfEmgGg"
```

**Expected Response (200 OK):**
```json
{
  "data": {
    "username": "test1",
    "name": "Test1",
    "is_admin": false
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "errors": "Unauthorized - Token required"
}
```

---

### Update User Profile (Protected - Ownership enforced)
```bash
curl -X PATCH http://localhost:3000/api/users/test1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QxIiwiaXNfYWRtaW4iOmZhbHNlLCJpYXQiOjE3NjcxMDE0NjksImV4cCI6MTc2NzcwNjI2OX0.ATcVKVHcGOOsC6BVsyoF7HG7EgH5J5o4CmBZpfEmgGg" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User Updated"
  }'
```

**Expected Response (200 OK):**
```json
{
  "data": {
    "username": "test1",
    "name": "Test User Updated"
  }
}
```

**Error Response (403 Forbidden - trying to update other user):**
```json
{
  "errors": "Forbidden - You can only update your own profile"
}
```

---

### Get All Users (Protected - Auth Required)
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QxIiwiaXNfYWRtaW4iOmZhbHNlLCJpYXQiOjE3NjcxMDE0NjksImV4cCI6MTc2NzcwNjI2OX0.ATcVKVHcGOOsC6BVsyoF7HG7EgH5J5o4CmBZpfEmgGg"
```

**Expected Response (200 OK):**
```json
{
  "data": [
    {
      "username": "test1",
      "name": "Test1",
      "is_admin": false
    },
    {
      "username": "newuser",
      "name": "New User",
      "is_admin": false
    }
  ]
}
```

---

### Delete User (Protected - Auth Required)
```bash
curl -X DELETE http://localhost:3000/api/users/newuser \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QxIiwiaXNfYWRtaW4iOmZhbHNlLCJpYXQiOjE3NjcxMDE0NjksImV4cCI6MTc2NzcwNjI2OX0.ATcVKVHcGOOsC6BVsyoF7HG7EgH5J5o4CmBZpfEmgGg"
```

**Expected Response (200 OK):**
```json
{
  "data": "OK"
}
```

---

## 2. Posting Endpoints (with File Upload)

### Create Posting (Protected - Auth Required)
```bash
curl -X POST http://localhost:3000/api/posting \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QxIiwiaXNfYWRtaW4iOmZhbHNlLCJpYXQiOjE3NjcxMDE0NjksImV4cCI6MTc2NzcwNjI2OX0.ATcVKVHcGOOsC6BVsyoF7HG7EgH5J5o4CmBZpfEmgGg" \
  -F "title=My First Posting" \
  -F "description=This is my first posting" \
  -F "date=2025-12-30" \
  -F "pictures=@/path/to/image1.jpg" \
  -F "pictures=@/path/to/image2.jpg"
```

**Important: Use `-F` for form data, NOT `-d`**

**Expected Response (201 Created):**
```json
{
  "data": {
    "id": "uuid-string",
    "title": "My First Posting",
    "description": "This is my first posting",
    "date": "2025-12-30",
    "pictures": ["https://..."],
    "createdAt": "2025-12-30T...",
    "updatedAt": "2025-12-30T..."
  }
}
```

---

### Update Posting (Protected - Auth Required, Ownership enforced)
```bash
curl -X PATCH http://localhost:3000/api/posting/uuid-string \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QxIiwiaXNfYWRtaW4iOmZhbHNlLCJpYXQiOjE3NjcxMDE0NjksImV4cCI6MTc2NzcwNjI2OX0.ATcVKVHcGOOsC6BVsyoF7HG7EgH5J5o4CmBZpfEmgGg" \
  -F "title=Updated Title" \
  -F "description=Updated description" \
  -F "pictures=@/path/to/new-image.jpg"
```

---

### Delete Posting (Protected - Auth Required, Ownership enforced)
```bash
curl -X DELETE http://localhost:3000/api/posting/uuid-string \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QxIiwiaXNfYWRtaW4iOmZhbHNlLCJpYXQiOjE3NjcxMDE0NjksImV4cCI6MTc2NzcwNjI2OX0.ATcVKVHcGOOsC6BVsyoF7HG7EgH5J5o4CmBZpfEmgGg"
```

---

## 3. Blog Endpoints (with File Upload)

### Create Blog (Protected - Auth Required)
```bash
curl -X POST http://localhost:3000/api/blogs \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QxIiwiaXNfYWRtaW4iOmZhbHNlLCJpYXQiOjE3NjcxMDE0NjksImV4cCI6MTc2NzcwNjI2OX0.ATcVKVHcGOOsC6BVsyoF7HG7EgH5J5o4CmBZpfEmgGg" \
  -F "title=My Blog Post" \
  -F "description=This is my blog post" \
  -F "date=2025-12-30" \
  -F "picture=@/path/to/blog-image.jpg"
```

**Important: Use `-F` for form data, NOT `-d`**

---

## Common Issues & Solutions

### Issue: "Unauthorized - Token required"
**Solution:** Make sure to include Authorization header:
```bash
-H "Authorization: Bearer YOUR_TOKEN_HERE"
```
or
```bash
-H "X-API-TOKEN: YOUR_TOKEN_HERE"
```

### Issue: "Content-Type was not one of multipart/form-data"
**Solution:** Use `-F` flag for form data, NOT `-d`:
```bash
# WRONG:
curl -X POST ... -d '...'

# CORRECT:
curl -X POST ... -F "field=value"
```

### Issue: Token expired
**Solution:** Generate new token using:
```bash
cd "d:\Materi Kuliah\Smt 7\PT Sendico\Code\BackEnd\Restfull API Sendico"
npx tsx generate-token.ts test1
```

Then update database with new token using the SQL command provided.

---

## Using Postman/Insomnia

### Setting Authorization Header
1. Go to "Authorization" tab
2. Select "Bearer Token"
3. Paste your token in the token field

### Setting Form Data for File Upload
1. Go to "Body" tab
2. Select "form-data"
3. Add fields:
   - `title` (text)
   - `description` (text)
   - `date` (text)
   - `pictures` (file) - click to select file

---

## PowerShell Testing Script

Use the included `test-api.ps1` script:
```powershell
.\test-api.ps1
```

This script will:
1. Register a new user
2. Login and get token
3. Test all CRUD operations
4. Test posting and blog creation
