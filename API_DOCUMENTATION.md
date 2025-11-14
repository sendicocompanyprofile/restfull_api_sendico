# Restfull API Sendico - Dokumentasi Endpoint

## Base URL
```
http://localhost:3000/api
```

## Authentication
Endpoints yang dilindungi memerlukan header:
```
X-API-TOKEN: <token>
```

---

## 📝 USER ENDPOINTS

### 1. Register User (Public)
**POST** `/users`

Register user baru dengan username, password, dan nama.

**Request Body:**
```json
{
  "username": "string (3-100 chars)",
  "password": "string (6-20 chars)",
  "name": "string (1-20 chars)"
}
```

**Response (201 Created):**
```json
{
  "data": {
    "username": "user123",
    "name": "John Doe"
  }
}
```

**Error (400 Bad Request):**
```json
{
  "errors": "Username must be at least 3 characters"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user123",
    "password": "password123",
    "name": "John Doe"
  }'
```

---

### 2. Login User (Public)
**POST** `/users/login`

Login dengan username dan password untuk mendapatkan token.

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
    "username": "user123",
    "name": "John Doe",
    "token": "uuid-token-string"
  }
}
```

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
    "username": "user123",
    "password": "password123"
  }'
```

---

### 3. Get Current User (Protected)
**GET** `/users/current`

Mendapatkan informasi user yang sedang login.

**Headers:**
```
X-API-TOKEN: uuid-token-string
```

**Response (200 OK):**
```json
{
  "data": {
    "username": "user123",
    "name": "John Doe",
    "token": "uuid-token-string"
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
  -H "X-API-TOKEN: uuid-token-string"
```

---

### 4. Update User (Protected)
**PATCH** `/users/current`

Update informasi user (nama dan/atau password).

**Headers:**
```
X-API-TOKEN: uuid-token-string
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "string (1-20 chars, optional)",
  "password": "string (6-20 chars, optional)"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "username": "user123",
    "name": "Jane Doe",
    "token": "uuid-token-string"
  }
}
```

**Error (400 Bad Request):**
```json
{
  "errors": "Name must not exceed 20 characters"
}
```

**cURL Example:**
```bash
curl -X PATCH http://localhost:3000/api/users/current \
  -H "X-API-TOKEN: uuid-token-string" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "password": "newpassword123"
  }'
```

---

### 5. Logout User (Protected)
**DELETE** `/users/current`

Logout user dan clear token.

**Headers:**
```
X-API-TOKEN: uuid-token-string
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
  "errors": "Unauthorized - Invalid token"
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/api/users/current \
  -H "X-API-TOKEN: uuid-token-string"
```

---

## 📸 POSTING ENDPOINTS

### 1. Create Posting (Protected)
**POST** `/posting`

Membuat posting baru dengan judul, deskripsi, tanggal, dan file gambar (opsional).

**Headers:**
```
X-API-TOKEN: uuid-token-string
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
    "pictures": [
      "https://cloud-url.com/image1.jpg"
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

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/posting \
  -H "X-API-TOKEN: uuid-token-string" \
  -F "title=Postingan Pertama" \
  -F "description=Ini adalah deskripsi postingan" \
  -F "date=2025-11-13" \
  -F "pictures=@/path/to/image1.jpg" \
  -F "pictures=@/path/to/image2.jpg"
```

---

### 2. Get All Postings (Public)
**GET** `/posting`

Mendapatkan daftar semua postings dengan pagination dan search.

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
      "pictures": ["https://cloud-url.com/image1.jpg"],
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

### 3. Get Posting by ID (Public)
**GET** `/posting/:id`

Mendapatkan detail posting berdasarkan ID.

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
    "pictures": ["https://cloud-url.com/image1.jpg"],
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

### 4. Update Posting (Protected)
**PATCH** `/posting/:id`

Update posting berdasarkan ID. Bisa update judul, deskripsi, tanggal, atau gambar.

**Headers:**
```
X-API-TOKEN: uuid-token-string
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
    "pictures": ["https://cloud-url.com/image1.jpg"],
    "createdAt": "2025-11-13T07:00:11.000Z",
    "updatedAt": "2025-11-13T07:10:00.000Z"
  }
}
```

**cURL Example:**
```bash
curl -X PATCH http://localhost:3000/api/posting/uuid-string \
  -H "X-API-TOKEN: uuid-token-string" \
  -F "title=Postingan Updated" \
  -F "pictures=@/path/to/new-image.jpg"
```

---

### 5. Delete Posting (Protected)
**DELETE** `/posting/:id`

Menghapus posting berdasarkan ID.

**Headers:**
```
X-API-TOKEN: uuid-token-string
```

**URL Parameters:**
- `id`: string (required, posting ID)

**Response (200 OK):**
```json
{
  "data": {}
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
curl -X DELETE http://localhost:3000/api/posting/uuid-string \
  -H "X-API-TOKEN: uuid-token-string"
```

---

## 📚 BLOG ENDPOINTS

### 1. Create Blog (Protected)
**POST** `/blogs`

Membuat blog post baru dengan judul, deskripsi, tanggal, dan file gambar (opsional).

**Headers:**
```
X-API-TOKEN: uuid-token-string
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
    "picture": "https://cloud-url.com/blog-image.jpg",
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

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/blogs \
  -H "X-API-TOKEN: uuid-token-string" \
  -F "title=Blog Post Pertama" \
  -F "description=Ini adalah deskripsi blog post" \
  -F "date=2025-11-13" \
  -F "picture=@/path/to/blog-image.jpg"
```

---

### 2. Get All Blogs (Public)
**GET** `/blogs`

Mendapatkan daftar semua blog posts dengan pagination dan search.

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
      "picture": "https://cloud-url.com/blog-image.jpg",
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

### 3. Get Blog by ID (Public)
**GET** `/blogs/:id`

Mendapatkan detail blog post berdasarkan ID.

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
    "picture": "https://cloud-url.com/blog-image.jpg",
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

### 4. Update Blog (Protected)
**PATCH** `/blogs/:id`

Update blog post berdasarkan ID. Bisa update judul, deskripsi, tanggal, atau gambar.

**Headers:**
```
X-API-TOKEN: uuid-token-string
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
    "picture": "https://cloud-url.com/new-blog-image.jpg",
    "create_at": "2025-11-13T07:00:11.000Z",
    "update_at": "2025-11-13T07:10:00.000Z"
  }
}
```

**cURL Example:**
```bash
curl -X PATCH http://localhost:3000/api/blogs/uuid-string \
  -H "X-API-TOKEN: uuid-token-string" \
  -F "title=Blog Post Updated" \
  -F "picture=@/path/to/new-blog-image.jpg"
```

---

### 5. Delete Blog (Protected)
**DELETE** `/blogs/:id`

Menghapus blog post berdasarkan ID.

**Headers:**
```
X-API-TOKEN: uuid-token-string
```

**URL Parameters:**
- `id`: string (required, blog ID)

**Response (200 OK):**
```json
{
  "data": {}
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
curl -X DELETE http://localhost:3000/api/blogs/uuid-string \
  -H "X-API-TOKEN: uuid-token-string"
```

---

## 🔍 Error Responses

### 400 Bad Request
```json
{
  "errors": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "errors": "Unauthorized - Token required"
}
```

### 404 Not Found
```json
{
  "errors": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "errors": "Failed to process request"
}
```

---

## 📋 Validation Rules

### User Validation
- **Username**: Min 3 chars, Max 100 chars, unique
- **Password**: Min 6 chars, Max 20 chars
- **Name**: Min 1 char, Max 20 chars

### Posting Validation
- **Title**: Max 255 chars
- **Description**: Required
- **Date**: Format YYYY-MM-DD
- **Pictures**: Max 3 files, each max 10MB

### Blog Validation
- **Title**: Max 255 chars
- **Description**: Required
- **Date**: Format YYYY-MM-DD
- **Picture**: Max 1 file, max 10MB

---

## 🔐 Authentication Flow

1. **Register** → POST `/users` → Create account
2. **Login** → POST `/users/login` → Get token
3. **Use Token** → Add `X-API-TOKEN` header to protected requests
4. **Access Protected Resources** → GET/POST/PATCH/DELETE with token
5. **Logout** → DELETE `/users/current` → Clear token

---

## 🚀 Testing dengan Postman

1. Import collection atau setup manual dengan:
   - **BASE_URL**: `http://localhost:3000/api`
   - **TOKEN**: Simpan dari login response
   - **User-Agent**: Postman

2. Atau gunakan cURL commands di atas

---

## 📦 Response Format

Semua response mengikuti format:

**Success:**
```json
{
  "data": { ... },
  "paging": { ... }  // Optional
}
```

**Error:**
```json
{
  "errors": "Error message"
}
```

---

## ✅ Status Codes

- **200 OK** - Request berhasil
- **201 Created** - Resource berhasil dibuat
- **400 Bad Request** - Validation error
- **401 Unauthorized** - Token invalid/missing
- **404 Not Found** - Resource tidak ditemukan
- **500 Internal Server Error** - Server error

---

**Last Updated**: November 13, 2025
**API Version**: 1.0.0
