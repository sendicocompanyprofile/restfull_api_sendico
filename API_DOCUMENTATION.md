# Restfull API Sendico - Dokumentasi Endpoint

## Base URL
```
http://restfull-api-sendico.vercel.app/api
```

## ⚠️ Important - Request Content-Type

### For JSON Endpoints (User Management)
Use `Content-Type: application/json` with `-d` flag:
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"pass123"}'
```

### For File Upload Endpoints (Posting & Blog)
Use `Content-Type: multipart/form-data` with `-F` flag (NOT `-d`):
```bash
curl -X POST http://localhost:3000/api/posting \
  -H "Authorization: Bearer <token>" \
  -F "title=My Post" \
  -F "description=Description" \
  -F "date=2025-12-30" \
  -F "pictures=@/path/to/image.jpg"
```

**⚠️ IMPORTANT:** Do NOT use `-d` for file uploads. Always use `-F` for form-data with files!

---

## 🔐 Authentication

### Token Type: JWT (JSON Web Token)
Endpoints yang dilindungi memerlukan salah satu dari:

**Option 1: X-API-TOKEN Header**
```
X-API-TOKEN: <jwt-token>
```

**Option 2: Authorization Bearer Header**
```
Authorization: Bearer <jwt-token>
```

### Token Format
```
Header.Payload.Signature

Payload contains:
{
  "username": "string",
  "is_admin": boolean,
  "iat": number (issued at),
  "exp": number (expiration - 7 days)
}
```

### Token Expiration
- **Default**: 7 days
- **Configurable via**: `JWT_EXPIRATION` environment variable

### Security Requirements
- Tokens expire after 7 days
- Use HTTPS in production
- Never share tokens publicly
- Keep JWT_SECRET secure in environment

---

## 📝 USER ENDPOINTS

### Access Control Overview
| Endpoint | Public | Auth Required | Note |
|----------|--------|---------------|------|
| POST /users | ✅ Yes | ❌ No | Register new user |
| POST /users/login | ✅ Yes | ❌ No | Login user |
| GET /users/current | ❌ No | ✅ Yes | Get current user info |
| PATCH /users/:username | ❌ No | ✅ Yes | Update own profile only |
| DELETE /users/current | ❌ No | ✅ Yes | Logout |
| GET /users | ❌ No | ✅ Yes | Get all users |
| DELETE /users/:username | ❌ No | ✅ Yes | Delete user |

### How to Get Token
1. **Register** atau **Login** terlebih dahulu (Public endpoints)
2. Response akan include JWT token
3. Gunakan token untuk protected endpoints dengan Authorization header

---

### 1. Register User (Public) ✅
**POST** `/users`

Register user baru dengan username, password, nama, dan opsi is_admin. User baru akan memiliki `is_admin = false` secara default jika tidak dispesifikasi. Endpoint ini bersifat publik - siapa saja dapat mendaftar tanpa perlu authentication.

**Access**: Public (No authentication required)

**Request Body:**
```json
{
  "username": "string (3-30 chars, alphanumeric + underscore only)",
  "password": "string (min 8 chars: uppercase, lowercase, number, special char)",
  "name": "string (1-50 chars)",
  "is_admin": "boolean (optional, default: false)"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)
- At least 1 special character (!@#$%^&*)

**Username Rules:**
- 3-30 characters
- Only alphanumeric characters and underscore
- Must be unique

**Response (201 Created):**
```json
{
  "data": {
    "username": "john_doe",
    "name": "John Doe"
  }
}
```

**Error (400 Bad Request):**
```json
{
  "errors": "Password must contain uppercase, lowercase, number, and special character"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "SecurePass123!",
    "name": "John Doe",
    "is_admin": false
  }'
```

---

### 2. Login User (Public) ✅
**POST** `/users/login`

Login dengan username dan password untuk mendapatkan JWT token. Token akan di-generate dan disimpan ke database untuk tracking.

**Access**: Public (No authentication required)

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200 OK):**
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

**Token Behavior:**
- ✅ Token di-generate dengan JWT algorithm
- ✅ Token di-return ke client dalam response
- ✅ Token di-simpan ke database column `users.token`
- ✅ Token berlaku 7 hari (configurable via JWT_EXPIRATION)
- ✅ Token di-clear saat logout

**Error (401 Unauthorized):**
```json
{
  "errors": "Username or password is incorrect"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "SecurePass123!"
  }'
```

**Verify Token di Database:**
```sql
SELECT username, token FROM users WHERE username = 'john_doe';
-- token column akan punya value, bukan NULL
```

---

### 3. Get Current User (Protected - Auth Required) ✅
**GET** `/users/current`

Mendapatkan informasi user yang sedang login.

**Access**: Protected - Authentication required

**Headers:**
```
Authorization: Bearer <jwt-token>
```
or
```
X-API-TOKEN: <jwt-token>
```

**Response (200 OK):**
```json
{
  "data": {
    "username": "john_doe",
    "name": "John Doe",
    "is_admin": false
  }
}
```

**Error (401 Unauthorized):**
```json
{
  "errors": "Unauthorized - Token required"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/users/current \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 4. Update User Profile (Protected - Auth Required, Ownership enforced) 🔒
**PATCH** `/users/:username`

Update informasi user. Setiap user hanya dapat mengedit profil mereka sendiri.

**Access**: Protected - Authentication required
- **All Users**: Hanya dapat mengedit profil mereka sendiri

**Path Parameters:**
- `username`: string (required, username user yang ingin diupdate)

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "string (1-50 chars, optional)",
  "password": "string (min 8 chars with complexity, optional)"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "username": "john_doe",
    "name": "Jane Doe",
    "is_admin": false
  }
}
```

**Error (403 Forbidden - Non-Admin trying to edit others):**
```json
{
  "errors": "Forbidden - You can only update your own profile"
}
```

**cURL Example:**
```bash
# Update profil user sendiri
curl -X PATCH http://localhost:3000/api/users/john_doe \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe"
  }'
```

---

### 5. Logout User (Protected - Auth Required) ✅
**DELETE** `/users/current`

Logout user dan clear token dari database.

**Access**: Protected - Authentication required

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**
```json
{
  "data": "OK"
}
```

**Token Behavior on Logout:**
- ✅ Token di-clear dari database (SET to NULL)
- ✅ Client harus discard token dari local storage/cookies
- ✅ Token masih valid untuk 7 hari (JWT tidak dicek database untuk setiap request)
- ✅ Recommendation: Client implement token blacklist untuk immediate revocation

**Error (401 Unauthorized):**
```json
{
  "errors": "Unauthorized - Invalid token"
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/api/users/current \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Verify Token Cleared di Database:**
```sql
SELECT username, token FROM users WHERE username = 'john_doe';
-- token column akan NULL setelah logout
```

---

### 6. Get All Users (Protected - Auth Required) 🔓
**GET** `/users`

Mendapatkan daftar semua user yang terdaftar. Semua user autentikasi dapat mengakses endpoint ini.

**Access**: Protected - Authentication required (any authenticated user)

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "username": "john_doe",
      "name": "John Doe",
      "is_admin": false
    },
    {
      "username": "admin_user",
      "name": "Admin User",
      "is_admin": true
    }
  ]
}
```

**Error (401 Unauthorized):**
```json
{
  "errors": "Unauthorized - Token required"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <token>"
```

---

### 7. Delete User (Protected - Auth Required) 🔓
**DELETE** `/users/:username`

Menghapus user berdasarkan username. Semua user autentikasi dapat menghapus user.

**Access**: Protected - Authentication required (any authenticated user)

**Path Parameters:**
- `username`: string (required, username of the user to be deleted)

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**
```json
{
  "data": {}
}
```

**Error (401 Unauthorized):**
```json
{
  "errors": "Unauthorized - Token required"
}
```

**Error (404 Not Found):**
```json
{
  "errors": "User not found"
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/api/users/john_doe \
  -H "Authorization: Bearer <token>"
```

---

## 📸 POSTING ENDPOINTS

### Access Control Overview
| Endpoint | Public | Auth Required | Note |
|----------|--------|---------------|------|
| POST /posting | ❌ No | ✅ Yes | Create posting |
| GET /posting | ✅ Yes | ❌ No | Get all postings |
| GET /posting/:id | ✅ Yes | ❌ No | Get posting by ID |
| PATCH /posting/:id | ❌ No | ✅ Yes | Update own posting only |
| DELETE /posting/:id | ❌ No | ✅ Yes | Delete own posting only |

### Important Notes
- **File uploads require `-F` flag** (form-data), NOT `-d`
- **Content-Type**: `multipart/form-data` (set automatically with `-F`)
- **Max file size**: 10MB per file
- **Allowed formats**: jpg, jpeg, png, gif, webp
- **Max files per request**: 3 files

---

### 1. Create Posting (Protected - Auth Required) ✅
**POST** `/posting`

Membuat posting baru dengan judul, deskripsi, tanggal, dan file gambar (opsional). Posting akan disimpan dengan username pembuat.

**Access**: Protected - Authentication required

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
- `title`: string (required, max 255 chars)
- `description`: string (required)
- `date`: string (required, format: YYYY-MM-DD)
- `pictures`: file (optional, max 3 files, supported: jpg, jpeg, png, gif, webp)

**Response (201 Created):**
```json
{
  "data": {
    "id": "uuid-string",
    "title": "Postingan Pertama",
    "description": "Ini adalah deskripsi postingan",
    "date": "2025-11-13",
    "username": "john_doe",
    "pictures": [
      "https://s3.amazonaws.com/bucket/randomNameImage_1.jpg",
      "https://s3.amazonaws.com/bucket/randomNameImage_2.jpg"
    ],
    "createdAt": "2025-11-13T07:00:11.000Z",
    "updatedAt": "2025-11-13T07:00:11.000Z"
  }
}
```

**Error (400 Bad Request):**
```json
{
  "errors": "Title is required"
}
```

**Error (401 Unauthorized):**
```json
{
  "errors": "Unauthorized - Token required"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/posting \
  -H "Authorization: Bearer <token>" \
  -F "title=Postingan Pertama" \
  -F "description=Ini adalah deskripsi postingan" \
  -F "date=2025-11-13" \
  -F "pictures=@/path/to/image1.jpg" \
  -F "pictures=@/path/to/image2.jpg"
```

---

### 2. Get All Postings (Public) ✅
**GET** `/posting`

Mendapatkan daftar semua postings dengan pagination dan search.

**Access**: Public (No authentication required)

**Query Parameters:**
- `title`: string (optional, search by title)
- `page`: number (optional, default: 1)
- `size`: number (optional, default: 10, max: 100)

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid-string",
      "title": "Postingan Pertama",
      "description": "Ini adalah deskripsi postingan",
      "date": "2025-11-13",
      "username": "john_doe",
      "pictures": ["https://s3.amazonaws.com/bucket/randomNameImage_1.jpg"],
      "createdAt": "2025-11-13T07:00:11.000Z",
      "updatedAt": "2025-11-13T07:00:11.000Z"
    }
  ],
  "paging": {
    "current_page": 1,
    "total_page": 5,
    "size": 10
  }
}
```

**cURL Example:**
```bash
# Get all postings
curl -X GET "http://localhost:3000/api/posting"

# Get postings with pagination and search
curl -X GET "http://localhost:3000/api/posting?page=2&size=5&title=pertama"
```

---

### 3. Get Posting by ID (Public) ✅
**GET** `/posting/:id`

Mendapatkan detail posting berdasarkan ID.

**Access**: Public (No authentication required)

**URL Parameters:**
- `id`: string (required, posting ID)

**Response (200 OK):**
```json
{
  "data": {
    "id": "uuid-string",
    "title": "Postingan Pertama",
    "description": "Ini adalah deskripsi postingan",
    "date": "2025-11-13",
    "username": "john_doe",
    "pictures": ["https://s3.amazonaws.com/bucket/randomNameImage_1.jpg"],
    "createdAt": "2025-11-13T07:00:11.000Z",
    "updatedAt": "2025-11-13T07:00:11.000Z"
  }
}
```

**Error (404 Not Found):**
```json
{
  "errors": "Posting not found"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/posting/uuid-string
```

---

### 4. Update Posting (Protected - Auth Required, Ownership enforced) 🔒
**PATCH** `/posting/:id`

Update posting berdasarkan ID. Setiap user hanya dapat mengedit posting mereka sendiri.

**Access**: Protected - Authentication required
- **All Users**: Hanya dapat mengedit posting mereka sendiri (ownership required)

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**URL Parameters:**
- `id`: string (required, posting ID)

**Request Body (Form Data):**
- `title`: string (optional, max 255 chars)
- `description`: string (optional)
- `date`: string (optional, format: YYYY-MM-DD)
- `pictures`: file (optional, max 3 files)

**Response (200 OK):**
```json
{
  "data": {
    "id": "uuid-string",
    "title": "Postingan Updated",
    "description": "Deskripsi yang sudah diupdate",
    "date": "2025-11-14",
    "username": "john_doe",
    "pictures": ["https://s3.amazonaws.com/bucket/randomNameImage_1.jpg"],
    "createdAt": "2025-11-13T07:00:11.000Z",
    "updatedAt": "2025-11-13T07:10:00.000Z"
  }
}
```

**Error (403 Forbidden - Non-Admin trying to edit others' posting):**
```json
{
  "errors": "Forbidden - You can only update your own postings"
}
```

**Error (401 Unauthorized):**
```json
{
  "errors": "Unauthorized - Token required"
}
```

**cURL Example:**
```bash
# Update posting milik sendiri
curl -X PATCH http://localhost:3000/api/posting/uuid-string \
  -H "Authorization: Bearer <token>" \
  -F "title=Postingan Updated" \
  -F "pictures=@/path/to/new-image.jpg"
```

---

### 5. Delete Posting (Protected - Auth Required, Ownership enforced) 🔒
**DELETE** `/posting/:id`

Menghapus posting berdasarkan ID. Setiap user hanya dapat menghapus posting mereka sendiri.

**Access**: Protected - Authentication required
- **All Users**: Hanya dapat menghapus posting mereka sendiri (ownership required)

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**URL Parameters:**
- `id`: string (required, posting ID)

**Response (200 OK):**
```json
{
  "data": {}
}
```

**Error (403 Forbidden - Non-Admin trying to delete others' posting):**
```json
{
  "errors": "Forbidden - You can only delete your own postings"
}
```

**Error (404 Not Found):**
```json
{
  "errors": "Posting not found"
}
```

**Error (401 Unauthorized):**
```json
{
  "errors": "Unauthorized - Token required"
}
```

**cURL Example:**
```bash
# Delete posting milik sendiri
curl -X DELETE http://localhost:3000/api/posting/uuid-string \
  -H "Authorization: Bearer <token>"
```

---

## 📚 BLOG ENDPOINTS

### Access Control Overview
| Endpoint | Public | Auth Required | Note |
|----------|--------|---------------|------|
| POST /blogs | ❌ No | ✅ Yes | Create blog |
| GET /blogs | ✅ Yes | ❌ No | Get all blogs |
| GET /blogs/:id | ✅ Yes | ❌ No | Get blog by ID |
| PATCH /blogs/:id | ❌ No | ✅ Yes | Update own blog only |
| DELETE /blogs/:id | ❌ No | ✅ Yes | Delete own blog only |

### Important Notes
- **File uploads require `-F` flag** (form-data), NOT `-d`
- **Content-Type**: `multipart/form-data` (set automatically with `-F`)
- **Max file size**: 10MB per file
- **Allowed formats**: jpg, jpeg, png, gif, webp
- **Max files per request**: 1 file (single picture for blog)

---

### 1. Create Blog (Protected - Auth Required) ✅
**POST** `/blogs`

Membuat blog post baru dengan judul, deskripsi, tanggal, dan file gambar (opsional). Blog akan disimpan dengan username pembuat.

**Access**: Protected - Authentication required

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
- `title`: string (required, max 255 chars)
- `description`: string (required)
- `date`: string (required, format: YYYY-MM-DD)
- `picture`: file (optional, single file, supported: jpg, jpeg, png, gif, webp)

**Response (201 Created):**
```json
{
  "data": {
    "id": "uuid-string",
    "title": "Blog Post Pertama",
    "description": "Ini adalah deskripsi blog post",
    "date": "2025-11-13",
    "username": "john_doe",
    "picture": "https://s3.amazonaws.com/bucket/blog-randomNameImage.jpg",
    "create_at": "2025-11-13T07:00:11.000Z",
    "update_at": "2025-11-13T07:00:11.000Z"
  }
}
```

**Error (400 Bad Request):**
```json
{
  "errors": "Title is required"
}
```

**Error (401 Unauthorized):**
```json
{
  "errors": "Unauthorized - Token required"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/blogs \
  -H "Authorization: Bearer <token>" \
  -F "title=Blog Post Pertama" \
  -F "description=Ini adalah deskripsi blog post" \
  -F "date=2025-11-13" \
  -F "picture=@/path/to/blog-image.jpg"
```

---

### 2. Get All Blogs (Public) ✅
**GET** `/blogs`

Mendapatkan daftar semua blog posts dengan pagination dan search.

**Access**: Public (No authentication required)

**Query Parameters:**
- `title`: string (optional, search by title)
- `page`: number (optional, default: 1)
- `size`: number (optional, default: 10, max: 100)

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid-string",
      "title": "Blog Post Pertama",
      "description": "Ini adalah deskripsi blog post",
      "date": "2025-11-13",
      "username": "john_doe",
      "picture": "https://s3.amazonaws.com/bucket/blog-randomNameImage.jpg",
      "create_at": "2025-11-13T07:00:11.000Z",
      "update_at": "2025-11-13T07:00:11.000Z"
    }
  ],
  "paging": {
    "current_page": 1,
    "total_page": 3,
    "size": 10
  }
}
```

**cURL Example:**
```bash
# Get all blogs
curl -X GET "http://localhost:3000/api/blogs"

# Get blogs with pagination and search
curl -X GET "http://localhost:3000/api/blogs?page=1&size=5&title=pertama"
```

---

### 3. Get Blog by ID (Public) ✅
**GET** `/blogs/:id`

Mendapatkan detail blog post berdasarkan ID.

**Access**: Public (No authentication required)

**URL Parameters:**
- `id`: string (required, blog ID)

**Response (200 OK):**
```json
{
  "data": {
    "id": "uuid-string",
    "title": "Blog Post Pertama",
    "description": "Ini adalah deskripsi blog post",
    "date": "2025-11-13",
    "username": "john_doe",
    "picture": "https://s3.amazonaws.com/bucket/blog-randomNameImage.jpg",
    "create_at": "2025-11-13T07:00:11.000Z",
    "update_at": "2025-11-13T07:00:11.000Z"
  }
}
```

**Error (404 Not Found):**
```json
{
  "errors": "Blog not found"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/blogs/uuid-string
```

---

### 4. Update Blog (Protected - Auth Required, Ownership enforced) 🔒
**PATCH** `/blogs/:id`

Update blog post berdasarkan ID. Setiap user hanya dapat mengedit blog mereka sendiri.

**Access**: Protected - Authentication required
- **All Users**: Hanya dapat mengedit blog mereka sendiri (ownership required)

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**URL Parameters:**
- `id`: string (required, blog ID)

**Request Body (Form Data):**
- `title`: string (optional, max 255 chars)
- `description`: string (optional)
- `date`: string (optional, format: YYYY-MM-DD)
- `picture`: file (optional, single file)

**Response (200 OK):**
```json
{
  "data": {
    "id": "uuid-string",
    "title": "Blog Post Updated",
    "description": "Deskripsi yang sudah diupdate",
    "date": "2025-11-14",
    "username": "john_doe",
    "picture": "https://s3.amazonaws.com/bucket/blog-randomNameImage.jpg",
    "create_at": "2025-11-13T07:00:11.000Z",
    "update_at": "2025-11-13T07:10:00.000Z"
  }
}
```

**Error (403 Forbidden - Non-Admin trying to edit others' blog):**
```json
{
  "errors": "Forbidden - You can only update your own blogs"
}
```

**Error (401 Unauthorized):**
```json
{
  "errors": "Unauthorized - Token required"
}
```

**cURL Example:**
```bash
# Update blog milik sendiri
curl -X PATCH http://localhost:3000/api/blogs/uuid-string \
  -H "Authorization: Bearer <token>" \
  -F "title=Blog Post Updated" \
  -F "picture=@/path/to/new-blog-image.jpg"
```

---

### 5. Delete Blog (Protected - Auth Required, Ownership enforced) 🔒
**DELETE** `/blogs/:id`

Menghapus blog post berdasarkan ID. Setiap user hanya dapat menghapus blog mereka sendiri.

**Access**: Protected - Authentication required
- **All Users**: Hanya dapat menghapus blog mereka sendiri (ownership required)

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**URL Parameters:**
- `id`: string (required, blog ID)

**Response (200 OK):**
```json
{
  "data": {}
}
```

**Error (403 Forbidden - Non-Admin trying to delete others' blog):**
```json
{
  "errors": "Forbidden - You can only delete your own blogs"
}
```

**Error (404 Not Found):**
```json
{
  "errors": "Blog not found"
}
```

**Error (401 Unauthorized):**
```json
{
  "errors": "Unauthorized - Token required"
}
```

**cURL Example:**
```bash
# Delete blog milik sendiri
curl -X DELETE http://localhost:3000/api/blogs/uuid-string \
  -H "Authorization: Bearer <token>"
```

---

## 🔍 Error Responses

### 400 Bad Request
```json
{
  "errors": "Validation error message"
}
```

**Common causes:**
- Missing required fields
- Invalid format (dates, email, etc.)
- File upload errors
- Invalid query parameters

---

### 401 Unauthorized
```json
{
  "errors": "Unauthorized - Token required"
}
```

**Common causes:**
- Missing authentication token
- Token expired
- Invalid token format
- Token signature mismatch

---

### 403 Forbidden
```json
{
  "errors": "Forbidden - Admin access required"
}
```

or

```json
{
  "errors": "Forbidden - You can only update your own profile"
}
```

**Common causes:**
- Non-admin trying to access admin-only endpoint
- Non-admin trying to edit/delete other users' content
- Insufficient permissions for operation

---

### 404 Not Found
```json
{
  "errors": "Resource not found"
}
```

**Common causes:**
- User/Posting/Blog ID doesn't exist
- Deleted resource
- Invalid ID format

---

### 500 Internal Server Error
```json
{
  "errors": "Failed to process request"
}
```

**Common causes:**
- Database connection error
- File upload to S3 failed
- Server-side validation error
- Unexpected error condition

---

## 📋 Validation Rules

### User Validation
- **Username**:
  - Length: 3-30 characters
  - Format: Alphanumeric + underscore only
  - Must be unique in system
  - Examples: `john_doe`, `user123`, `admin_user`

- **Password**:
  - Length: Minimum 8 characters, Maximum 128 characters
  - Uppercase: At least 1 letter (A-Z)
  - Lowercase: At least 1 letter (a-z)
  - Number: At least 1 digit (0-9)
  - Special Character: At least 1 special char (!@#$%^&*)
  - Examples: `SecurePass123!`, `MyP@ssw0rd`, `Test#Pass2025`

- **Name**:
  - Length: 1-50 characters
  - Trimmed (no leading/trailing spaces)
  - UTF-8 characters supported

### Posting Validation
- **Title**:
  - Max 255 characters
  - Required field

- **Description**:
  - Required field
  - No maximum length

- **Date**:
  - Format: YYYY-MM-DD
  - Required field

- **Pictures**:
  - Maximum 3 files per posting
  - File size: Max 10MB per file
  - Supported formats: jpg, jpeg, png, gif, webp

### Blog Validation
- **Title**:
  - Max 255 characters
  - Required field

- **Description**:
  - Required field
  - No maximum length

- **Date**:
  - Format: YYYY-MM-DD
  - Required field

- **Picture**:
  - Maximum 1 file per blog
  - File size: Max 10MB
  - Supported formats: jpg, jpeg, png, gif, webp

---

## 🔐 Authentication Flow

### 1. Register Account
```
POST /api/users
  └─ Public endpoint
  └─ Creates new account
  └─ New user has is_admin = false by default
```

### 2. Login
```
POST /api/users/login
  └─ Public endpoint
  └─ Returns JWT token with 7-day expiration
  └─ Token contains: username, is_admin, iat, exp
```

### 3. Store Token
```
Save token in:
  ├─ LocalStorage (client-side)
  ├─ SessionStorage (client-side)
  └─ HTTP-only Cookie (recommended for security)
```

### 4. Use Token in Requests
```
Option 1 - Authorization Header (Recommended):
  Authorization: Bearer <jwt-token>

Option 2 - Custom Header:
  X-API-TOKEN: <jwt-token>
```

### 5. Access Protected Resources
```
GET /api/users/current
  ├─ Returns current user profile
  └─ Requires valid JWT

POST /api/posting
  ├─ Create posting with username
  └─ Requires valid JWT

PATCH /api/posting/:id
  ├─ Edit own posting (non-admin) or any posting (admin)
  └─ Requires valid JWT + ownership check
```

### 6. Handle Token Expiration
```
When token expires (401 Unauthorized):
  ├─ Catch 401 error
  ├─ Redirect to login page
  └─ Clear stored token
```

### 7. Logout
```
DELETE /api/users/current
  ├─ Server-side logout (optional)
  └─ Client removes token from storage
```

---

## 🚀 Quick Start Examples

### Register and Login
```bash
# 1. Register new user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "SecurePass123!",
    "name": "John Doe"
  }'

# 2. Login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "SecurePass123!"
  }'

# 3. Store returned token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Create and Edit Posting
```bash
# 1. Create posting (with token)
curl -X POST http://localhost:3000/api/posting \
  -H "Authorization: Bearer <token>" \
  -F "title=My First Post" \
  -F "description=This is my first post" \
  -F "date=2025-11-13" \
  -F "pictures=@image.jpg"

# 2. Get posting ID from response
# 3. Edit your posting
curl -X PATCH http://localhost:3000/api/posting/<posting-id> \
  -H "Authorization: Bearer <token>" \
  -F "title=My Updated Post"

# 4. Try to edit another user's posting (will fail with 403)
curl -X PATCH http://localhost:3000/api/posting/<other-posting-id> \
  -H "Authorization: Bearer <non-admin-token>" \
  -F "title=Hacked!"
  # Result: 403 Forbidden - You can only update your own postings
```

### Admin Operations
```bash
# 1. Get all users (admin only)
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <admin-token>"

# 2. Delete user (admin only)
curl -X DELETE http://localhost:3000/api/users/john_doe \
  -H "Authorization: Bearer <admin-token>"

# 3. Edit any user's profile (admin)
curl -X PATCH http://localhost:3000/api/users/john_doe \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Updated Name"
  }'

# 4. Delete any posting (admin)
curl -X DELETE http://localhost:3000/api/posting/<posting-id> \
  -H "Authorization: Bearer <admin-token>"
```

---

## 🛡️ Security Best Practices

### For Frontend Developers
1. **Never expose token in URL** - Always use headers
2. **Use HTTPS only** - Never send tokens over HTTP
3. **Store tokens securely**:
   - Prefer HTTP-only cookies
   - Avoid LocalStorage for sensitive apps
4. **Clear token on logout** - Remove from storage immediately
5. **Handle 401 responses** - Auto-redirect to login
6. **Validate server SSL certificates** in production

### For API Usage
1. **Token Expiration**: Tokens expire after 7 days
2. **Ownership Enforcement**: 
   - Non-admin cannot edit/delete other users' content
   - Admin can manage all content
3. **Admin Separation**:
   - User management (create/read/delete) is admin-only
   - Public users cannot register others
4. **Rate Limiting**:
   - General: 100 requests per 15 minutes
   - Login: 5 attempts per 15 minutes
5. **Password Policy**:
   - Minimum 8 characters with complexity requirements
   - Stored as bcrypt hash (never plaintext)

---

## 📦 Response Format

### Success Response with Data
```json
{
  "data": {
    "username": "john_doe",
    "name": "John Doe",
    "is_admin": false
  }
}
```

### Success Response with Pagination
```json
{
  "data": [
    { "id": "uuid", "title": "Post 1" },
    { "id": "uuid", "title": "Post 2" }
  ],
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
  "errors": "Error message describing what went wrong"
}
```

---

## ✅ HTTP Status Codes

| Code | Status | Meaning | Example |
|------|--------|---------|---------|
| 200 | OK | Request successful | GET successful, update successful |
| 201 | Created | Resource created | User registered, posting created |
| 400 | Bad Request | Invalid input | Missing required fields |
| 401 | Unauthorized | Authentication required/failed | Missing token, expired token |
| 403 | Forbidden | Insufficient permissions | Non-admin access admin endpoint |
| 404 | Not Found | Resource doesn't exist | User/posting/blog not found |
| 500 | Internal Server Error | Server error | Database error, S3 upload failed |

---

## 🔄 Rate Limiting

### General Rate Limit
- **Limit**: 100 requests
- **Window**: 15 minutes
- **Error**: 429 Too Many Requests

### Login Rate Limit
- **Limit**: 5 attempts
- **Window**: 15 minutes
- **Error**: 429 Too Many Requests
- **Note**: Only counts failed login attempts

---

## � Quick Reference

### Common curl Examples

**Register User:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","password":"Pass123!","name":"User One"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","password":"Pass123!"}'
```

**Create Posting (with file):**
```bash
curl -X POST http://localhost:3000/api/posting \
  -H "Authorization: Bearer <TOKEN>" \
  -F "title=My Post" \
  -F "description=Post description" \
  -F "date=2025-12-30" \
  -F "pictures=@image.jpg"
```

**Create Blog (with file):**
```bash
curl -X POST http://localhost:3000/api/blogs \
  -H "Authorization: Bearer <TOKEN>" \
  -F "title=My Blog" \
  -F "description=Blog description" \
  -F "date=2025-12-30" \
  -F "picture=@blog-image.jpg"
```

### Token Tips
1. Save token from login response
2. Use in ALL protected requests
3. Token valid for 7 days
4. Use either header format:
   - `Authorization: Bearer <TOKEN>`
   - `X-API-TOKEN: <TOKEN>`

### File Upload Tips
1. Always use `-F` flag (NOT `-d`)
2. Max 10MB per file
3. Supported formats: jpg, jpeg, png, gif, webp
4. Posting: max 3 files
5. Blog: max 1 file
6. Content-Type set automatically

---

## �📧 Environment Variables

Required for production:

```bash
# Database
DATABASE_URL=mysql://user:password@host:port/database

# JWT
JWT_SECRET=your-secret-key-here-minimum-32-chars
JWT_EXPIRATION=7d

# AWS S3
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_BUCKET_NAME=your-bucket-name

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Server
PORT=3000
NODE_ENV=production
```

---

## 📞 Support & Contact

For API issues or questions:
- Check documentation in `/doc` folder
- Review error message format
- Verify authentication token is valid
- Check rate limiting status
- Ensure JSON format is correct

---

**Last Updated**: December 2025
**API Version**: 1.1.0
**Authentication Type**: JWT (JSON Web Token)
**Token Expiration**: 7 days
