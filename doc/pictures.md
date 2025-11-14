# Pictures Validation & Implementation

## Overview

Fitur `pictures` di model `Posting` memungkinkan setiap posting untuk memiliki hingga 3 gambar. Gambar disimpan dalam format JSON array di database MySQL.

## Database Schema

### Field `pictures` di Table `postings`

```sql
`pictures` JSON NOT NULL DEFAULT '[]'
```

**Tipe Data**: JSON (array of strings)  
**Default**: `[]` (empty array)  
**Constraints**:
- Minimum 1 picture required
- Maximum 3 pictures allowed
- Each picture must be a valid URL

---

## Validation dengan Zod

### Schema Definition

File: `src/validators/posting.validator.ts`

```typescript
const PicturesSchema = z
  .array(
    z
      .string()
      .url('Each picture must be a valid URL')
  )
  .min(1, 'At least 1 picture is required')
  .max(3, 'Maximum 3 pictures allowed');
```

### Validation Rules

| Rule | Description | Example |
|------|-------------|---------|
| **Type** | Array of strings | `["url1", "url2"]` |
| **URL Validation** | Each item must be valid URL | ✅ `https://example.com/img.jpg` ❌ `not-a-url` |
| **Min Length** | At least 1 picture | ✅ 1-3 pictures ❌ 0 pictures |
| **Max Length** | Maximum 3 pictures | ✅ 1-3 pictures ❌ 4+ pictures |

---

## API Request Examples

### Create Posting with Pictures

**Endpoint**: `POST /api/posting`

**Request Header**:
```
Content-Type: application/json
X-API-TOKEN: your-token-here
```

**Request Body** (Valid):
```json
{
  "title": "Beautiful Sunset",
  "description": "A collection of sunset photos",
  "date": "2025-11-13T10:30:00Z",
  "pictures": [
    "https://example.com/sunset1.jpg",
    "https://example.com/sunset2.jpg",
    "https://example.com/sunset3.jpg"
  ]
}
```

**Response** (Success - 201):
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Beautiful Sunset",
    "description": "A collection of sunset photos",
    "date": "2025-11-13",
    "pictures": [
      "https://example.com/sunset1.jpg",
      "https://example.com/sunset2.jpg",
      "https://example.com/sunset3.jpg"
    ],
    "createdAt": "2025-11-13T10:30:00Z",
    "updatedAt": "2025-11-13T10:30:00Z"
  }
}
```

### Invalid Request Examples

**Example 1: Missing pictures**
```json
{
  "title": "Test",
  "description": "Test description",
  "date": "2025-11-13T10:30:00Z",
  "pictures": []
}
```

**Response** (Error - 400):
```json
{
  "errors": {
    "pictures": [
      "At least 1 picture is required"
    ]
  }
}
```

---

**Example 2: Too many pictures**
```json
{
  "title": "Test",
  "description": "Test description",
  "date": "2025-11-13T10:30:00Z",
  "pictures": [
    "https://example.com/1.jpg",
    "https://example.com/2.jpg",
    "https://example.com/3.jpg",
    "https://example.com/4.jpg"
  ]
}
```

**Response** (Error - 400):
```json
{
  "errors": {
    "pictures": [
      "Maximum 3 pictures allowed"
    ]
  }
}
```

---

**Example 3: Invalid URL format**
```json
{
  "title": "Test",
  "description": "Test description",
  "date": "2025-11-13T10:30:00Z",
  "pictures": [
    "not-a-valid-url"
  ]
}
```

**Response** (Error - 400):
```json
{
  "errors": {
    "pictures": [
      "Each picture must be a valid URL"
    ]
  }
}
```

---

## Update Posting with Pictures

**Endpoint**: `PATCH /api/posting/:id`

**Request Header**:
```
Content-Type: application/json
X-API-TOKEN: your-token-here
```

**Request Body** (partial update):
```json
{
  "pictures": [
    "https://example.com/new-image-1.jpg",
    "https://example.com/new-image-2.jpg"
  ]
}
```

**Response** (Success - 200):
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Beautiful Sunset",
    "description": "A collection of sunset photos",
    "date": "2025-11-13",
    "pictures": [
      "https://example.com/new-image-1.jpg",
      "https://example.com/new-image-2.jpg"
    ],
    "createdAt": "2025-11-13T10:30:00Z",
    "updatedAt": "2025-11-13T10:35:00Z"
  }
}
```

---

## Implementation Details

### Service Layer

File: `src/services/posting.service.ts`

**Penyimpanan**:
```typescript
// Convert array to JSON string for storage
pictures: JSON.stringify(request.pictures)
```

**Retrieval**:
```typescript
// Parse JSON string back to array
pictures: JSON.parse(posting.pictures)
```

### Controller Layer

File: `src/controllers/posting.controller.ts`

Validasi dilakukan sebelum service call:
```typescript
const validatedData = CreatePostingSchema.safeParse(req.body);

if (!validatedData.success) {
  sendError(res, formatZodErrors(validatedData.error), 400);
  return;
}
```

---

## Data Type Flow

```
User Input (Array)
    ↓
Zod Validation (min 1, max 3, URL format)
    ↓
Service Layer (JSON.stringify)
    ↓
Database (JSON column)
    ↓
Service Retrieval (JSON.parse)
    ↓
Response (Array of URLs)
```

---

## Best Practices

### ✅ Do's

- Use HTTPS URLs for all pictures
- Keep picture URLs reasonably short
- Validate URL format on client-side before sending
- Handle JSON parsing errors gracefully
- Update pictures completely (don't try to update individual items)

### ❌ Don'ts

- Don't use relative paths for pictures
- Don't try to store file data directly (only URLs)
- Don't update array by index (always send complete array)
- Don't forget X-API-TOKEN header for protected endpoints
- Don't expect partial array updates to work

---

## Error Handling

| Scenario | Status Code | Message |
|----------|-------------|---------|
| No pictures provided | 400 | "At least 1 picture is required" |
| More than 3 pictures | 400 | "Maximum 3 pictures allowed" |
| Invalid URL format | 400 | "Each picture must be a valid URL" |
| Non-string value in array | 400 | "Each picture must be a string URL" |
| Empty array | 400 | "At least 1 picture is required" |

---

## Testing Examples (cURL)

### Create Posting with 3 Pictures

```bash
curl -X POST http://localhost:3000/api/posting \
  -H "Content-Type: application/json" \
  -H "X-API-TOKEN: your-token" \
  -d '{
    "title": "My Beautiful Collection",
    "description": "Three amazing photos",
    "date": "2025-11-13T10:30:00Z",
    "pictures": [
      "https://example.com/photo1.jpg",
      "https://example.com/photo2.jpg",
      "https://example.com/photo3.jpg"
    ]
  }'
```

### Update Posting Pictures

```bash
curl -X PATCH http://localhost:3000/api/posting/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -H "X-API-TOKEN: your-token" \
  -d '{
    "pictures": [
      "https://example.com/new-photo1.jpg",
      "https://example.com/new-photo2.jpg"
    ]
  }'
```

---

## Database Storage Format

Dalam database MySQL, data disimpan seperti:

```sql
-- Example dari table postings
INSERT INTO postings (id, title, description, date, pictures, createdAt, updatedAt)
VALUES (
  'uuid-value',
  'My Post',
  'Description',
  '2025-11-13',
  '["https://example.com/1.jpg", "https://example.com/2.jpg", "https://example.com/3.jpg"]',
  '2025-11-13 10:30:00',
  '2025-11-13 10:30:00'
);
```

---

## FAQ

**Q: Bisakah saya upload file langsung?**  
A: Tidak. API ini hanya menerima URLs. Gunakan cloud storage (AWS S3, Firebase, etc) dan kirimkan URL-nya.

**Q: Bisakah saya update hanya satu picture?**  
A: Tidak. Anda harus mengirim semua pictures yang ingin disimpan dalam satu request.

**Q: Bagaimana jika saya ingin 5 pictures?**  
A: Maksimum dibatasi 3 pictures per posting. Ini adalah business requirement yang sudah ditetapkan.

**Q: Apakah pictures bisa dihapus?**  
A: Ya, dengan mengirim array yang lebih kecil. Contoh: mengirim 1 picture akan menghapus 2 picture lainnya.

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-13 | Initial implementation dengan Zod validation |
