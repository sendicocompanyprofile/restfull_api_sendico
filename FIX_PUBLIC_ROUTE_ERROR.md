## 🔍 Diagnosis: Error "Unauthorized - Token required" pada Create User

### ❌ Masalah yang Dilaporkan

Error "Unauthorized - Token required" terjadi pada:
- ✅ GET /api/users (Get All Users) - EXPECTED (butuh auth)
- ❌ POST /api/users (Create User) - UNEXPECTED (seharusnya PUBLIC)

---

### 🎯 Root Cause Analysis

POST `/api/users` adalah endpoint **PUBLIC** dan seharusnya **TIDAK memerlukan authentication**. Namun user mendapat error auth, artinya:

1. **Kemungkinan 1**: Request dikirim dengan header Authorization/X-API-Token yang invalid
2. **Kemungkinan 2**: Ada middleware yang salah konfigurasi
3. **Kemungkinan 3**: Request body tidak valid, parsing error

---

### ✅ Solusi: Cara Test Endpoint dengan Benar

#### **A. TEST 1: Register User (PUBLIC - TIDAK butuh token)**

**❌ SALAH - Jangan kirim token:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "username": "newuser",
    "password": "SecurePass123!",
    "name": "New User"
  }'
```

**✅ BENAR - Jangan kirim authorization header:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "SecurePass123!",
    "name": "New User"
  }'
```

---

#### **B. TEST 2: Login User (PUBLIC - TIDAK butuh token)**

```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "SecurePass123!"
  }'
```

Response harus berisi token:
```json
{
  "data": {
    "username": "superadmin",
    "name": "Super Administrator",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### **C. TEST 3: Get Current User (PROTECTED - BUTUH token)**

Gunakan token dari login response:

```bash
curl -X GET http://localhost:3000/api/users/current \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### **D. TEST 4: Get All Users (PROTECTED + ADMIN - BUTUH token + is_admin=true)**

```bash
curl -X GET http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 📊 Expected Response Codes

| Endpoint | Method | Auth Required | Status Code |
|----------|--------|---------------|----|
| `/users` | POST | ❌ NO | 201 Created |
| `/users/login` | POST | ❌ NO | 200 OK |
| `/users/current` | GET | ✅ YES | 200 OK |
| `/users` | GET | ✅ YES + ADMIN | 200 OK |

---

### 🛠️ Troubleshooting Checklist

**Jika POST /api/users error 401 "Unauthorized - Token required":**

- [ ] **Jangan kirim header Authorization** - Remove header jika ada
- [ ] **Pastikan request body valid**:
  - `username`: 3-30 chars, alphanumeric + underscore
  - `password`: 8+ chars, uppercase, lowercase, number, special char
  - `name`: 1-50 chars, tidak kosong
  - `is_admin`: optional, boolean
- [ ] **Pastikan Content-Type header**: `application/json`
- [ ] **Cek database connection** - Server bisa connect ke MySQL
- [ ] **Cek .env file** - DATABASE_URL sudah benar

---

### 🧪 Gunakan Postman untuk Test

#### **Step 1: Create Request POST /api/users (PUBLIC)**

**PENTING: Jangan kirim Authorization header!**

1. **URL**: `http://localhost:3000/api/users`
2. **Method**: POST
3. **Tab Headers**:
   - ❌ **HAPUS Authorization header jika ada**
   - ❌ **HAPUS X-API-Token header jika ada**
   - ✅ Pastikan **Content-Type**: application/json
4. **Tab Body**:
   - Pilih: Raw → JSON (dropdown)
   - Copy-paste:
   ```json
   {
     "username": "newuser123",
     "password": "SecurePass123!",
     "name": "New User",
     "is_admin": false
   }
   ```
5. Click **Send** (Ctrl + Enter)

**Expected Response: 201 Created**
```json
{
  "data": {
    "username": "newuser123",
    "name": "New User"
  }
}
```

---

#### **Step 2: Create Request POST /api/users/login (PUBLIC)**

1. **URL**: `http://localhost:3000/api/users/login`
2. **Method**: POST
3. **Tab Headers**:
   - ❌ **HAPUS Authorization header**
   - ✅ **Content-Type**: application/json
4. **Tab Body**:
   - Raw → JSON
   ```json
   {
     "username": "superadmin",
     "password": "SecurePass123!"
   }
   ```
5. Click **Send**

**Expected Response: 200 OK** dengan token:
```json
{
  "data": {
    "username": "superadmin",
    "name": "Super Administrator",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJpc19hZG1pbiI6dHJ1ZSwiaWF0IjoxNzM0OTc5MTIzLCJleHAiOjE3MzU1ODQxMjN9"
  }
}
```

**COPY token ini untuk test langkah 3 & 4!**

---

#### **Step 3: Create Request GET /api/users/current (PROTECTED)**

1. **URL**: `http://localhost:3000/api/users/current`
2. **Method**: GET
3. **Tab Headers**:
   - ✅ **Authorization**: `Bearer [PASTE_TOKEN_DARI_STEP_2]`
   - ✅ **Content-Type**: application/json
4. **Tab Body**: (Kosong - GET request tidak perlu body)
5. Click **Send**

**Expected Response: 200 OK**
```json
{
  "data": {
    "username": "superadmin",
    "name": "Super Administrator",
    "is_admin": true
  }
}
```

---

#### **Step 4: Create Request GET /api/users (PROTECTED + ADMIN)**

1. **URL**: `http://localhost:3000/api/users`
2. **Method**: GET
3. **Tab Headers**:
   - ✅ **Authorization**: `Bearer [PASTE_TOKEN_DARI_STEP_2]`
   - ✅ **Content-Type**: application/json
4. **Tab Body**: (Kosong)
5. Click **Send**

**Expected Response: 200 OK** (jika user adalah admin)
```json
{
  "data": [
    {
      "username": "superadmin",
      "name": "Super Administrator"
    },
    {
      "username": "newuser123",
      "name": "New User"
    }
  ]
}
```

**Atau Error 403 Forbidden** (jika user bukan admin):
```json
{
  "errors": "Forbidden - Admin access required"
}
```

---

### 🐛 Debug Logs

Untuk melihat error detail, jalankan server dengan debug mode:

```bash
# Di terminal project
npm start
```

Lihat logs, cari pattern error seperti:
- `Validation error caught` - Request body tidak valid
- `ResponseError caught` - Business logic error
- `Unauthorized - Token required` - Ada auth middleware yang di-trigger

---

### 💡 Perbedaan Route vs Global Middleware

**BENAR (routes terdefinisi dengan benar):**
```typescript
// Public route - tidak ada authMiddleware
userRouter.post('/users', (req, res, next) => userController.register(...));

// Protected route - ada authMiddleware
userRouter.get('/users/current', authMiddleware, (req, res, next) => ...);
```

**SALAH (global auth untuk semua):**
```typescript
// Ini akan make semua route butuh auth!
app.use(authMiddleware);
app.use('/api', userRouter);
```

---

### 📝 Kesimpulan

1. **POST /api/users (Create User) HARUS PUBLIC** - Tidak kirim token
2. **POST /api/users/login (Login) HARUS PUBLIC** - Tidak kirim token
3. **GET /api/users/current (Get Current) HARUS PROTECTED** - Kirim token
4. **GET /api/users (Get All) HARUS PROTECTED + ADMIN** - Kirim token + is_admin=true

Jika masih error, gunakan Postman atau cURL tanpa Authorization header untuk POST /api/users!

