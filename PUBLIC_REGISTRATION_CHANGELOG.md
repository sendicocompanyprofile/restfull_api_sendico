# 📝 Perubahan: Public User Registration

## Ringkasan Perubahan

### ✅ Fitur Public Registration Diaktifkan

**Endpoint**: `POST /api/users`

**Perubahan**:
- ❌ Sebelumnya: Admin only (memerlukan authentication + admin privileges)
- ✅ Sekarang: Public (siapa saja bisa mendaftar tanpa token)

---

## 📊 Perbandingan Akses

### Sebelumnya (Admin Only)
```
POST /api/users → Hanya admin yang bisa create user via API
                  Non-admin tidak bisa mendaftar sendiri
```

### Sekarang (Public Registration)
```
POST /api/users → Siapa saja bisa register
                  User baru otomatis mendapat is_admin = false
```

---

## 🚀 Cara Pakai

### 1. Register Account Baru (Tanpa Token)
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "SecurePass123!",
    "name": "New User"
  }'
```

**Response (201 Created)**:
```json
{
  "data": {
    "username": "newuser",
    "name": "New User"
  }
}
```

### 2. Login Dengan Akun Baru
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "SecurePass123!"
  }'
```

### 3. Gunakan Token Untuk Operasi Lain
```bash
# Create posting
curl -X POST http://localhost:3000/api/posting \
  -H "Authorization: Bearer <token>" \
  -F "title=My Post" \
  ...
```

---

## 📝 Validasi Input Tetap Sama

Password masih harus mengikuti rules yang ketat:
- Minimum 8 characters
- Uppercase: ≥1 (A-Z)
- Lowercase: ≥1 (a-z)
- Number: ≥1 (0-9)
- Special char: ≥1 (!@#$%^&*)

Username masih harus:
- 3-30 characters
- Alphanumeric + underscore only
- Unique (tidak boleh duplicate)

---

## 🔐 Keamanan

✅ Tetap aman karena:
- Password di-hash dengan bcrypt (salt rounds 10)
- Username harus unique
- Validasi input yang ketat
- Non-admin users masih tidak bisa akses admin endpoints
- Ownership checking tetap berlaku untuk posting/blog

---

## 📋 File yang Diubah

1. **src/routes/user.routes.ts**
   - Remove authMiddleware & adminCheckMiddleware dari POST /users

2. **API_DOCUMENTATION.md**
   - Update "Register User" endpoint description
   - Clarify public registration access

3. **RBAC_IMPLEMENTATION.md**
   - Update User Routes section
   - Update "Complete Access Control Rules"

---

## 🔄 Flow Diagram

```
User Registration Flow (Public)
│
├─ POST /api/users (Public)
│  ├─ Validate input (username, password, name)
│  ├─ Hash password with bcrypt
│  ├─ Create user with is_admin = false
│  └─ Return 201 Created
│
├─ POST /api/users/login (Public)
│  ├─ Validate credentials
│  ├─ Check is_admin flag
│  ├─ Generate JWT token with is_admin
│  └─ Return token
│
└─ Use token for protected resources
   ├─ POST /api/posting (with token)
   ├─ GET /api/users/current (with token)
   └─ etc...
```

---

## ⚠️ Important Notes

- **Admin User Creation**: Saat ini admin users hanya bisa dibuat via:
  - Direct database injection
  - Seed script
  - Update by existing admin
  
- **User Registration**: Semua user baru yang register via API otomatis non-admin
  
- **Admin Privileges**: Hanya admin yang bisa:
  - View all users: GET /api/users
  - Delete users: DELETE /api/users/:username
  - Manage admin status (via direct DB update)

---

## ✅ Testing Checklist

- [ ] Register new user without token ✅
- [ ] Login with new account ✅
- [ ] Create posting with user account ✅
- [ ] Create blog with user account ✅
- [ ] Verify non-admin can't access GET /api/users ✅
- [ ] Verify non-admin can't delete other users ✅
- [ ] Verify password validation still works ✅
- [ ] Verify username validation still works ✅

---

**Updated**: December 15, 2025
**Build Status**: ✅ SUCCESS
**Feature**: Public User Registration
