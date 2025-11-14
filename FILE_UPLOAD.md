# File Upload Feature Documentation

## 📁 Overview

RESTful API Sendico sekarang support **direct file upload** dengan fitur:
- ✅ Upload hingga 3 gambar per posting
- ✅ Max 10MB per file
- ✅ Automatic upload ke cloud storage Hostinger
- ✅ Database hanya menyimpan URL
- ✅ Validasi MIME type & extension

---

## 🎯 How It Works

```
User Upload File
     ↓
Express receive multipart/form-data
     ↓
Multer middleware validate (size, type)
     ↓
Cloud Storage Service upload ke Hostinger
     ↓
Get URL dari cloud storage
     ↓
Zod validate form data + URLs
     ↓
Save URL ke database JSON
     ↓
Return response dengan URLs
```

---

## 🔧 Setup Cloud Storage

### Option 1: Hostinger S3 (Recommended)

1. **Get credentials dari Hostinger:**
   - API Access Key
   - API Secret Key
   - Bucket Name
   - S3 Endpoint
   - CDN URL (optional)

2. **Update .env:**
   ```properties
   HOSTINGER_STORAGE_TYPE=s3
   HOSTINGER_API_KEY=your_access_key
   HOSTINGER_API_SECRET=your_secret_key
   HOSTINGER_BUCKET_NAME=your_bucket
   HOSTINGER_CDN_URL=https://cdn.yourdomain.com
   ```

3. **Install AWS SDK:**
   ```bash
   npm install aws-sdk
   ```

4. **Complete S3 implementation** di `src/services/storage.service.ts`

### Option 2: Hostinger FTP

1. **Get FTP credentials:**
   - FTP Host
   - Username
   - Password

2. **Update .env:**
   ```properties
   HOSTINGER_STORAGE_TYPE=ftp
   HOSTINGER_FTP_HOST=ftp.yourdomain.com
   HOSTINGER_FTP_USER=username
   HOSTINGER_FTP_PASSWORD=password
   ```

3. **Install FTP package:**
   ```bash
   npm install ftp
   ```

4. **Complete FTP implementation** di `src/services/storage.service.ts`

### Option 3: Local Storage (Development Only)

Jika ingin test tanpa cloud storage:

```properties
HOSTINGER_STORAGE_TYPE=local
```

Files akan disimpan di `public/uploads/`

---

## 📡 API Endpoints

### Create Posting dengan File Upload

**Endpoint:**
```
POST /api/posting
```

**Headers:**
```
X-API-TOKEN: your-token
Content-Type: multipart/form-data
```

**Body (Form Data):**
```
- title: string (required)
- description: string (required)
- date: string ISO 8601 (required)
- pictures: files (required, 1-3 files)
```

**Example dengan cURL:**
```bash
curl -X POST http://localhost:3000/api/posting \
  -H "X-API-TOKEN: your-token" \
  -F "title=Sunset Photos" \
  -F "description=Beautiful sunset collection" \
  -F "date=2025-11-13T14:00:00Z" \
  -F "pictures=@/path/to/photo1.jpg" \
  -F "pictures=@/path/to/photo2.jpg" \
  -F "pictures=@/path/to/photo3.jpg"
```

**Response (201 Created):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Sunset Photos",
    "description": "Beautiful sunset collection",
    "date": "2025-11-13",
    "pictures": [
      "https://storage.example.com/uploads/1699873200000-abc123-photo1.jpg",
      "https://storage.example.com/uploads/1699873201000-def456-photo2.jpg",
      "https://storage.example.com/uploads/1699873202000-ghi789-photo3.jpg"
    ],
    "createdAt": "2025-11-13T14:00:00Z",
    "updatedAt": "2025-11-13T14:00:00Z"
  }
}
```

---

### Update Posting dengan File Upload

**Endpoint:**
```
PATCH /api/posting/:id
```

**Headers:**
```
X-API-TOKEN: your-token
Content-Type: multipart/form-data
```

**Body (Form Data):**
```
- title: string (optional)
- description: string (optional)
- date: string ISO 8601 (optional)
- pictures: files (optional, 1-3 files)
```

**Note:** Jika upload pictures baru, akan replace pictures yang lama.

---

## ✔️ Validation Rules

### File Size
- **Max per file**: 10MB (10,485,760 bytes)
- **Min per file**: No minimum
- **Error**: "File too large. Maximum size is 10MB"

### File Type (MIME)
✅ **Allowed:**
- `image/jpeg`
- `image/png`
- `image/gif`
- `image/webp`

❌ **Not Allowed:**
- PDF
- Documents
- Videos
- Archives
- Executables

**Error**: "Invalid file type. Allowed types: .jpg, .jpeg, .png, .gif, .webp"

### Number of Files
- **Minimum**: 1 file
- **Maximum**: 3 files
- **Error**: "At least 1 picture is required" atau "Maximum 3 pictures allowed"

### File Extension
- `.jpg` ✅
- `.jpeg` ✅
- `.png` ✅
- `.gif` ✅
- `.webp` ✅
- Semua extension lain ❌

---

## 🚫 Error Scenarios

### Error 1: File Too Large (413)
```json
{
  "errors": "File too large. Maximum size is 10MB"
}
```

### Error 2: Invalid File Type (400)
```json
{
  "errors": "Invalid file type. Allowed types: .jpg, .jpeg, .png, .gif, .webp"
}
```

### Error 3: Too Many Files (400)
```json
{
  "errors": "Too many files. Maximum 3 files allowed"
}
```

### Error 4: No Files (400)
```json
{
  "errors": "At least 1 picture is required"
}
```

### Error 5: Upload Failed (500)
```json
{
  "errors": "File upload failed: Connection timeout"
}
```

### Error 6: Invalid Form Data (400)
```json
{
  "errors": {
    "title": ["Title is required"],
    "date": ["Date must be in valid ISO 8601 format"]
  }
}
```

---

## 📊 File Size Reference

| File Type | Typical Size | Allowed? |
|-----------|------------|----------|
| JPEG (1920x1440) | 2-4 MB | ✅ Yes |
| PNG (1920x1440) | 5-8 MB | ✅ Yes |
| PNG (2560x1440) | 8-10 MB | ✅ Yes |
| PNG (4K) | 15-20 MB | ❌ No |
| RAW image | 20-50 MB | ❌ No |
| BMP | 8-15 MB | ❌ No |

---

## 💡 Best Practices

### Client Side
1. **Compress images** sebelum upload
2. **Validate file size** di browser sebelum upload
3. **Show progress** selama upload
4. **Handle errors** dengan user-friendly messages

### Server Side
1. ✅ Validasi file size (10MB limit)
2. ✅ Validasi MIME type
3. ✅ Validasi extension
4. ✅ Generate unique filename
5. ✅ Store in cloud (not local)
6. ✅ Save only URL di database

---

## 🔐 Security Considerations

### ✅ Implemented
- File size validation (10MB max)
- MIME type validation
- File extension validation
- Unique filename generation
- Cloud storage isolation

### ⚠️ Recommended to Add
- CSRF token validation
- Rate limiting per user
- Virus scanning
- Image metadata stripping
- CDN access control

---

## 📝 Example: Complete Upload Flow

### 1. User Input (Frontend)
```html
<form id="postingForm">
  <input type="text" name="title" required>
  <textarea name="description" required></textarea>
  <input type="datetime-local" name="date" required>
  <input type="file" name="pictures" multiple accept="image/*" required>
  <button type="submit">Create Post</button>
</form>

<script>
document.getElementById('postingForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(this);
  const token = localStorage.getItem('token');
  
  // Validate file sizes
  for (let file of formData.getAll('pictures')) {
    if (file.size > 10 * 1024 * 1024) {
      alert('File too large: ' + file.name);
      return;
    }
  }
  
  try {
    const response = await fetch('/api/posting', {
      method: 'POST',
      headers: {
        'X-API-TOKEN': token
      },
      body: formData
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('Posting created:', result.data);
      alert('Post created successfully!');
    } else {
      console.error('Error:', result.errors);
      alert('Error: ' + JSON.stringify(result.errors));
    }
  } catch (error) {
    console.error('Network error:', error);
    alert('Network error: ' + error.message);
  }
});
</script>
```

### 2. Server Processing
1. Receive multipart form-data
2. Multer extracts files & fields
3. Validate each file (size, type)
4. Upload to cloud storage
5. Get URLs
6. Validate form data with Zod
7. Save posting with URLs
8. Return response

### 3. Response
```json
{
  "data": {
    "id": "...",
    "title": "...",
    "pictures": [
      "https://cdn.example.com/uploads/file1.jpg",
      "https://cdn.example.com/uploads/file2.jpg"
    ],
    ...
  }
}
```

---

## 🛠️ Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| Multer middleware | ✅ Done | File size/type validation |
| File upload routes | ✅ Done | POST & PATCH support |
| Local storage | ✅ Done | For development |
| S3 template | 📝 Template | Needs AWS SDK |
| FTP template | 📝 Template | Needs FTP package |
| Database | ✅ Done | Stores URLs in JSON |
| Validation | ✅ Done | Zod schemas |
| Error handling | ✅ Done | Comprehensive |

---

## 📚 Related Files

- `src/middleware/upload.ts` - Multer configuration
- `src/services/storage.service.ts` - Cloud storage service
- `src/controllers/posting.controller.ts` - Upload handler
- `src/routes/posting.routes.ts` - Routes with upload
- `.env` - Cloud storage credentials
- `HOSTINGER_CONFIG.md` - Setup guide

---

## ❓ FAQ

**Q: Berapa ukuran maksimal file?**  
A: 10MB per file, max 3 files per posting

**Q: Format apa saja yang didukung?**  
A: JPEG, PNG, GIF, WebP

**Q: Apakah file disimpan di server?**  
A: Tidak, di-upload ke cloud storage Hostinger. Database hanya simpan URL.

**Q: Bagaimana jika upload gagal?**  
A: Server akan return error 500 dengan pesan detail

**Q: Apakah bisa delete file yang sudah diupload?**  
A: Belum ada endpoint khusus, tapi bisa delete posting (file akan orphaned)

**Q: Apakah bisa update hanya sebagian pictures?**  
A: Tidak, harus upload semua pictures yang ingin disimpan

---

**Last Updated**: 13 November 2025  
**Status**: Ready for Hostinger Integration
