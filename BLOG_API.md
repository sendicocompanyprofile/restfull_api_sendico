# 📚 Blog API - Implementation Complete

**Updated**: 13 November 2025  
**Status**: ✅ READY FOR TESTING

---

## 🎯 Overview

Blog API dengan fitur:
- ✅ Create, Read, Update, Delete (CRUD)
- ✅ Search dengan pagination
- ✅ **File upload untuk single image** (picture field)
- ✅ Auto upload ke cloud storage
- ✅ Max 10MB per file size limit
- ✅ Authentication untuk create/update/delete
- ✅ Public access untuk GET endpoints
- ✅ ISO 8601 date format support
- ✅ Zod validation

---

## 📊 Database Schema

```sql
CREATE TABLE `blogs` (
  `id` CHAR(36) NOT NULL,                           -- UUID primary key
  `title` VARCHAR(255) NOT NULL,                    -- Blog title
  `description` TEXT NOT NULL,                      -- Blog content
  `date` DATE NOT NULL,                             -- Publication date
  `picture` VARCHAR(255) NOT NULL,                  -- Single image URL
  `createdAt` TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0),
  `updatedAt` TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 🔌 API Endpoints

### 1️⃣ Create Blog (Protected)
```
POST /api/blogs
Header: X-API-TOKEN: token
Content-Type: multipart/form-data

Form Data:
- title: "Posting 1"
- description: "ini deskripsi Posting 1"
- date: "2025-11-13T00:00:00Z"
- picture: @/path/to/photo.jpg (max 10MB, image only)

Response 201 Created:
{
  "data": {
    "id": "dacx5ac5a1c5a",
    "title": "Posting 1",
    "description": "ini deskripsi Posting 1",
    "date": "2025-11-13",
    "picture": "https://cdn.example.com/uploads/photo.jpg",
    "create_at": "2025-11-13T10:30:00Z",
    "update_at": "2025-11-13T10:30:00Z"
  }
}

Response 400 (File Error):
{
  "errors": "Picture is required"
  // or
  "errors": "File too large. Maximum size is 10MB"
  // or
  "errors": "Invalid file type"
}

Response 400 (Validation Error):
{
  "errors": {
    "title": ["Title is required"],
    "date": ["Invalid date format"]
  }
}
```

### 2️⃣ Get Blog by ID (Public)
```
GET /api/blogs/:id

Response 200 OK:
{
  "data": {
    "id": "dacx5ac5a1c5a",
    "title": "Posting 1",
    "description": "ini deskripsi Posting 1",
    "date": "2025-11-13",
    "picture": "https://example.com/photo.jpg",
    "create_at": "2025-11-13T10:30:00Z",
    "update_at": "2025-11-13T10:30:00Z"
  }
}

Response 404 (Not Found):
{
  "errors": "Blog not found"
}
```

### 3️⃣ Search Blogs (Public)
```
GET /api/blogs?title=search&page=1&size=10

Query Parameters:
- title: string (optional) - Search in blog titles
- page: number (default: 1) - Page number for pagination
- size: number (default: 10) - Items per page

Response 200 OK:
{
  "data": [
    {
      "id": "dacx5ac5a1c5a",
      "title": "Posting 1",
      "description": "ini deskripsi Posting 1",
      "date": "2025-11-13",
      "picture": "https://example.com/photo.jpg",
      "create_at": "2025-11-13T10:30:00Z",
      "update_at": "2025-11-13T10:30:00Z"
    }
  ],
  "paging": {
    "current_page": 1,
    "total_page": 10,
    "size": 10
  }
}
```

### 4️⃣ Update Blog (Protected)
```
PATCH /api/blogs/:id
Header: X-API-TOKEN: token
Content-Type: multipart/form-data (if uploading new picture)
OR
Content-Type: application/json (if only updating text fields)

Form Data (all optional):
- title: "Updated Title"
- description: "Updated description"
- date: "2025-11-14T00:00:00Z"
- picture: @/path/to/new-photo.jpg (optional, max 10MB)

Response 200 OK:
{
  "data": {
    "id": "dacx5ac5a1c5a",
    "title": "Updated Title",
    "description": "Updated description",
    "date": "2025-11-14",
    "picture": "https://cdn.example.com/uploads/new-photo.jpg",
    "create_at": "2025-11-13T10:30:00Z",
    "update_at": "2025-11-13T11:00:00Z"
  }
}

Response 404 (Not Found):
{
  "errors": "Blog not found"
}

Response 400 (File Error):
{
  "errors": "File upload failed: File too large"
}
```

### 5️⃣ Delete Blog (Protected)
```
DELETE /api/blogs/:id
Header: X-API-TOKEN: token

Response 200 OK:
{
  "data": {
    "message": "OK"
  }
}

Response 404 (Not Found):
{
  "errors": "Blog not found"
}
```

---

## � Comparison: Blog vs Posting

| Feature | Blog | Posting |
|---------|------|---------|
| **Images per item** | 1 | Max 3 |
| **Upload method** | File upload | File upload |
| **Max file size** | 10MB | 10MB per file |
| **Allowed types** | JPEG, PNG, GIF, WebP | JPEG, PNG, GIF, WebP |
| **Auto cloud upload** | ✅ Yes | ✅ Yes |
| **Database storage** | URL only | URL array |
| **Create endpoint** | POST /api/blogs | POST /api/posting |
| **Update endpoint** | PATCH /api/blogs/:id | PATCH /api/posting/:id |

---

**Token Header Format:**
```
X-API-TOKEN: <token-value>
```

**Example:**
```bash
curl -X GET http://localhost:3000/api/blogs/123 \
  -H "X-API-TOKEN: abc123def456"
```

---

## ✔️ Validation Rules

| Field | Type | Rules | Example |
|-------|------|-------|---------|
| **title** | string | min: 1, max: 255 | "Posting 1" |
| **description** | string | min: 1 | "ini deskripsi..." |
| **date** | ISO 8601 | Valid datetime | "2025-11-13T00:00:00Z" |
| **picture** | file | max: 10MB, images only | JPEG, PNG, GIF, WebP |

---

## 📁 Project Structure

```
src/
├── validators/
│   └── blog.validator.ts        # Zod schemas
├── services/
│   └── blog.service.ts          # Business logic
├── controllers/
│   └── blog.controller.ts       # HTTP handlers
├── routes/
│   └── blog.routes.ts           # Express routes
└── index.ts                     # Register routes

prisma/
├── schema.prisma               # DB schema with Blog model
└── migrations/
    └── 20251112174241_add_blog_model/
        └── migration.sql        # Blog table creation
```

---

## 🧪 Testing with cURL

### Create Blog (with file upload)
```bash
curl -X POST http://localhost:3000/api/blogs \
  -H "X-API-TOKEN: your-token" \
  -F "title=My First Blog" \
  -F "description=This is a blog post" \
  -F "date=2025-11-13T10:00:00Z" \
  -F "picture=@/path/to/photo.jpg"
```

### Get Blog by ID
```bash
curl -X GET http://localhost:3000/api/blogs/blog-id
```

### Search Blogs
```bash
curl -X GET "http://localhost:3000/api/blogs?title=first&page=1&size=10"
```

### Update Blog (with optional file upload)
```bash
# Update with new picture
curl -X PATCH http://localhost:3000/api/blogs/blog-id \
  -H "X-API-TOKEN: your-token" \
  -F "title=Updated Blog Title" \
  -F "picture=@/path/to/new-photo.jpg"

# Update only text (no file)
curl -X PATCH http://localhost:3000/api/blogs/blog-id \
  -H "X-API-TOKEN: your-token" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title"}'
```

### Delete Blog
```bash
curl -X DELETE http://localhost:3000/api/blogs/blog-id \
  -H "X-API-TOKEN: your-token"
```

---

## 🔄 Response Format

### Success Response
```json
{
  "data": {
    // resource data or array
  },
  "paging": {
    // optional - only for list/search endpoints
    "current_page": 1,
    "total_page": 10,
    "size": 10
  }
}
```

### Error Response
```json
{
  "errors": "Error message or validation object"
}
```

---

## 🛠️ Implementation Details

### Blog Service (`src/services/blog.service.ts`)
- **createBlog()** - Create new blog with UUID
- **getBlogById()** - Fetch single blog
- **searchBlogs()** - Search with pagination
- **updateBlog()** - Partial update support
- **deleteBlog()** - Remove blog
- **getAllBlogs()** - List all blogs (internal)
- **formatBlog()** - Response formatting helper

### Blog Controller (`src/controllers/blog.controller.ts`)
- Input validation with Zod
- Error handling
- Response formatting
- Authentication check (protected routes)

### Blog Routes (`src/routes/blog.routes.ts`)
```typescript
// Public
GET    /api/blogs        - Search blogs
GET    /api/blogs/:id    - Get blog by ID

// Protected
POST   /api/blogs        - Create blog
PATCH  /api/blogs/:id    - Update blog
DELETE /api/blogs/:id    - Delete blog
```

---

## 📝 Date Format

All dates use **ISO 8601** format:
- Input: `2025-11-13T00:00:00Z`
- Output: `2025-11-13` (date only)
- Timestamps: `2025-11-13T10:30:00Z`

---

## 🔍 Search & Pagination

**Query Parameters:**
```
GET /api/blogs?title=search&page=1&size=10
```

**Pagination Details:**
- Default page: 1
- Default size: 10
- Case-insensitive search
- Sorted by creation date (newest first)

**Example Response:**
```json
{
  "data": [...],
  "paging": {
    "current_page": 1,
    "total_page": 5,    // ceiling(total / size)
    "size": 10
  }
}
```

---

## ⚙️ TypeScript Support

All endpoints fully typed:
```typescript
// Request types
CreateBlogType
UpdateBlogType
SearchBlogType

// Response types
BlogResponse
SearchBlogsResponse
```

---

## 🚀 Status

- ✅ Database migration completed
- ✅ Prisma Client generated
- ✅ Zod validators created
- ✅ Service layer implemented
- ✅ Controllers implemented
- ✅ Routes registered
- ✅ TypeScript compilation: **0 errors**
- ✅ Ready for testing

---

## 📋 Files Created/Modified

### Created
- ✅ `src/validators/blog.validator.ts` (Zod schemas)
- ✅ `src/services/blog.service.ts` (CRUD + search)
- ✅ `src/controllers/blog.controller.ts` (HTTP handlers)
- ✅ `src/routes/blog.routes.ts` (Express routes)
- ✅ `prisma/migrations/20251112174241_add_blog_model/` (DB migration)

### Modified
- ✅ `prisma/schema.prisma` (Added Blog model)
- ✅ `src/index.ts` (Registered blog router)
- ✅ `generated/prisma/client.ts` (Regenerated with Blog)

---

## 🎓 Key Features

| Feature | Status | Notes |
|---------|--------|-------|
| Create Blog | ✅ | Protected, auto UUID & timestamps |
| Read Single | ✅ | Public, 404 if not found |
| Search & Paginate | ✅ | Public, case-insensitive title search |
| Update Partial | ✅ | Protected, optional fields |
| Delete | ✅ | Protected |
| Authentication | ✅ | X-API-TOKEN header |
| Validation | ✅ | Zod + TypeScript |
| Date Handling | ✅ | ISO 8601 support |
| Error Handling | ✅ | Descriptive error messages |
| Timestamps | ✅ | createdAt, updatedAt auto-managed |

---

## 🎯 Next Steps

1. **Test all endpoints** with sample data
2. **Verify authentication** is working correctly
3. **Check pagination** with large datasets
4. **Validate error handling** for edge cases
5. **Integrate with frontend** for blog display

---

**Ready to use!** 🚀
