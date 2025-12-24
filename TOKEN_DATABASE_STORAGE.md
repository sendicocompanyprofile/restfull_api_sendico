## 🎫 Token Management - Stateless JWT vs Database Storage

### 📌 Perbedaan Dua Konsep

#### **Sebelum Update (Stateless)**
- ✅ Token di-generate di memory
- ✅ Token di-return ke client
- ❌ Token TIDAK disimpan di database
- ⚠️ Tidak ada record login di database

#### **Sesudah Update (Database Storage)**
- ✅ Token di-generate di memory
- ✅ Token di-return ke client
- ✅ Token DISIMPAN ke database
- ✅ Mudah track last active token per user

---

### 🎯 Behavior Setelah Update

#### **1️⃣ Saat Login**

```typescript
POST /api/users/login
```

**Before:**
```sql
SELECT token FROM users WHERE username = 'superadmin';
-- Result: NULL (token tidak disimpan)
```

**After:**
```sql
SELECT token FROM users WHERE username = 'superadmin';
-- Result: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1... (token ada!)
```

---

#### **2️⃣ Saat Logout**

```typescript
DELETE /api/users/current
```

**Before:**
```sql
SELECT token FROM users WHERE username = 'superadmin';
-- Result: NULL (sudah null)
```

**After:**
```sql
SELECT token FROM users WHERE username = 'superadmin';
-- Result: NULL (token di-clear saat logout)
```

---

### ✅ Use Cases

#### **✅ Bagus untuk:**
- Audit trail - Track siapa login kapan
- Multi-device login management - Track token per device
- Token revocation - Clear token saat logout/security breach
- Active session tracking - Tahu user mana yang sedang active
- Security monitoring - Detect unusual token patterns

#### **⚠️ Tidak diperlukan untuk:**
- JWT biasa yang stateless - Token cukup di client saja
- Short-lived tokens - Token auto-expire
- Scalable architecture - Database query pada setiap request bisa bottleneck

---

### 🔄 Flow Lengkap

```
1. USER REGISTER
   └─ token = NULL (belum login)

2. USER LOGIN
   ├─ Generate token di memory
   ├─ UPDATE users SET token = '...' WHERE username = 'xxx'
   └─ Return token ke client

3. USER MAKE REQUESTS
   ├─ Client send token di header Authorization
   ├─ Server verify token (tidak perlu query database)
   └─ Request processing...

4. USER LOGOUT
   ├─ UPDATE users SET token = NULL WHERE username = 'xxx'
   └─ Return success response

5. USER LOGIN AGAIN
   ├─ Generate NEW token
   ├─ UPDATE users SET token = '[NEW_TOKEN]' WHERE username = 'xxx'
   └─ Return new token ke client
```

---

### 🧪 Test Flow

#### **Test 1: Check Token Sebelum Login**
```sql
SELECT username, name, token FROM users WHERE username = 'superadmin';
-- Result: token = NULL
```

#### **Test 2: Login**
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"SecurePass123!"}'
```

Response:
```json
{
  "data": {
    "username": "superadmin",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### **Test 3: Check Token Di Database**
```sql
SELECT username, name, token FROM users WHERE username = 'superadmin';
-- Result: token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'  ✅ ADA!
```

#### **Test 4: Logout**
```bash
curl -X DELETE http://localhost:3000/api/users/current \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### **Test 5: Check Token Di Database Setelah Logout**
```sql
SELECT username, name, token FROM users WHERE username = 'superadmin';
-- Result: token = NULL  ✅ CLEARED!
```

---

### 📊 Database Schema

```sql
CREATE TABLE users (
  username VARCHAR(100) PRIMARY KEY,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(50) NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  token VARCHAR(100),           -- ← NEW! Token storage
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 🔐 Security Notes

1. **Token Format:** `eyJhbGciOi...` (JWT format, tidak bisa dibuat manual)
2. **Token Lifetime:** 7 hari (dari JWT_EXPIRATION)
3. **Token Storage:** Hanya simpan di database, JANGAN di-log atau expose
4. **Token Clear:** Automatic di-clear saat logout
5. **Token Validation:** Server selalu verify signature, tidak trust database token

---

### 📝 Logging

Saat login, server akan log:
```
User logged in successfully
  ├─ username: superadmin
  ├─ is_admin: true
  ├─ tokenGenerated: true
  ├─ tokenLength: 185
  └─ tokenSavedToDb: true    ← NEW! Konfirmasi saved
```

Saat logout:
```
User logged out successfully
  ├─ username: superadmin
  └─ tokenClearedFromDb: true    ← NEW! Token cleared
```

---

### 🎯 Summary

| Aspek | Before | After |
|------|--------|-------|
| Token di response | ✅ Ada | ✅ Ada |
| Token di database | ❌ Tidak | ✅ Ada |
| Logout clear token | ❌ Tidak | ✅ Ya |
| Track last active | ❌ Tidak | ✅ Query DB |
| Security audit | ❌ Minimal | ✅ Lebih baik |

