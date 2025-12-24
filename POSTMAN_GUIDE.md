# 📮 Cara Create User di Postman

## 📋 Step-by-Step Guide

### Step 1: Buka Postman
- Launch aplikasi Postman
- Atau buka di browser: https://www.postman.com/

### Step 2: Create New Request
1. Klik **"+"** atau **"Create"** button
2. Pilih **"HTTP Request"**
3. Atau klik **"New"** → **"Request"**

### Step 3: Atur Request Method & URL

**Method**: Pilih **POST** (dropdown di kiri)

**URL**: Copy-paste di field URL:
```
http://localhost:3000/api/users
```

### Step 4: Atur Headers

Klik tab **"Headers"**, pastikan ada:

| Key | Value |
|-----|-------|
| Content-Type | application/json |

Biasanya sudah auto-set, tapi pastikan ada.

### Step 5: Atur Request Body

Klik tab **"Body"**

Pilih **"raw"** → **"JSON"** (dropdown di kanan)

Copy-paste salah satu contoh di bawah:

#### ✅ Contoh 1: User Biasa
```json
{
  "username": "john_doe",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

#### ✅ Contoh 2: User Lain
```json
{
  "username": "sarah_smith",
  "password": "MyPassword456!",
  "name": "Sarah Smith"
}
```

#### ✅ Contoh 3: User Lain
```json
{
  "username": "budi_santoso",
  "password": "BudiSecure789!",
  "name": "Budi Santoso"
}
```

### Step 6: Send Request

Klik tombol **"Send"** (biru di kanan)

---

## ✅ Response Success (201 Created)

Jika berhasil, akan melihat:

```json
{
  "data": {
    "username": "john_doe",
    "name": "John Doe"
  }
}
```

Status code: **201 Created**

---

## ❌ Response Error (400 Bad Request)

Jika ada error validasi:

```json
{
  "errors": "Password must contain uppercase, lowercase, number, and special character"
}
```

**Common errors**:
- `"Username must be alphanumeric with underscore only"` → Username format salah
- `"Username already exists"` → Username sudah terdaftar
- `"Name is required"` → Name field kosong
- `"Password is required"` → Password field kosong
- `"Password must be at least 8 characters"` → Password terlalu pendek
- `"Password must contain uppercase, lowercase, number, and special character"` → Password tidak memenuhi kompleksitas

---

## 🔐 Password Requirements Reminder

Password HARUS memiliki:
- ✅ Minimal 8 character
- ✅ Minimal 1 uppercase (A-Z)
- ✅ Minimal 1 lowercase (a-z)
- ✅ Minimal 1 number (0-9)
- ✅ Minimal 1 special character (!@#$%^&*)

**Contoh password yang valid**:
- `SecurePass123!` ✅
- `MyPassword456!` ✅
- `BudiSecure789!` ✅
- `Test@Password2024` ✅
- `HelloWorld#123` ✅

**Contoh password yang TIDAK valid**:
- `password123` ❌ (no uppercase, no special char)
- `Password123` ❌ (no special char)
- `pass@123` ❌ (too short, no uppercase)
- `PASSWORD@123` ❌ (no lowercase)

---

## 📝 Username Requirements Reminder

Username HARUS:
- ✅ 3-30 characters
- ✅ Alphanumeric + underscore only (a-z, A-Z, 0-9, _)
- ✅ Unique (tidak boleh duplicate)

**Contoh username yang valid**:
- `john_doe` ✅
- `user123` ✅
- `budi_santoso_2024` ✅
- `sarah_smith` ✅
- `admin_user` ✅

**Contoh username yang TIDAK valid**:
- `john-doe` ❌ (dash tidak allowed)
- `john@doe` ❌ (@ tidak allowed)
- `john doe` ❌ (space tidak allowed)
- `jo` ❌ (terlalu pendek)

---

## 🔄 Workflow Lengkap

### 1️⃣ Register User Baru
```
POST /api/users
Body: {username, password, name}
Response: 201 Created
```

### 2️⃣ Login Dengan Akun Baru
```
POST /api/users/login
Body: {username, password}
Response: {username, name, is_admin, token}
```

### 3️⃣ Copy Token dari Response
Simpan `token` value untuk request berikutnya

### 4️⃣ Gunakan Token untuk Protected Endpoints
```
GET /api/users/current
Header: Authorization: Bearer <token>
Response: User profile
```

---

## 💾 Save Request ke Collection

Agar mudah digunakan kembali:

1. Setelah setup request, klik **"Save"**
2. Beri nama: **"Create User"**
3. Pilih Collection atau Create New Collection: **"SendCo API"**
4. Klik **"Save"**

Sekarang bisa lihat di sidebar kiri dalam collection.

---

## 🧪 Quick Test Commands

**Copy-paste salah satu untuk quick test**:

### Test 1: Register User Baru
```
Method: POST
URL: http://localhost:3000/api/users
Body (JSON):
{
  "username": "newuser123",
  "password": "NewUser@123",
  "name": "New User"
}
```

### Test 2: Register Another User
```
Method: POST
URL: http://localhost:3000/api/users
Body (JSON):
{
  "username": "anotheruser",
  "password": "AnotherPass@456",
  "name": "Another User"
}
```

### Test 3: Login User
```
Method: POST
URL: http://localhost:3000/api/users/login
Body (JSON):
{
  "username": "newuser123",
  "password": "NewUser@123"
}
```

---

## 📸 Visual Guide

```
┌─────────────────────────────────────────────────────────────┐
│ POSTMAN INTERFACE                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [POST] http://localhost:3000/api/users         [Send]    │
│                                                             │
│  ┌─── Tabs ────────────────────────────────────────┐       │
│  │ Params | Auth | Headers ✅ | Body ✅ | Pre-req |       │
│  ├──────────────────────────────────────────────────┤       │
│  │ Headers:                                         │       │
│  │ ┌────────────────────────────────────────┐      │       │
│  │ │ Content-Type    application/json      │      │       │
│  │ └────────────────────────────────────────┘      │       │
│  │                                                 │       │
│  │ Body (raw - JSON):                             │       │
│  │ ┌────────────────────────────────────────┐      │       │
│  │ │ {                                      │      │       │
│  │ │   "username": "john_doe",             │      │       │
│  │ │   "password": "SecurePass123!",       │      │       │
│  │ │   "name": "John Doe"                  │      │       │
│  │ │ }                                      │      │       │
│  │ └────────────────────────────────────────┘      │       │
│  └──────────────────────────────────────────────────┘       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist

- [ ] Buka Postman
- [ ] Create new request
- [ ] Set method ke POST
- [ ] Set URL ke `http://localhost:3000/api/users`
- [ ] Add header `Content-Type: application/json`
- [ ] Set body (JSON) dengan username, password, name
- [ ] Verifikasi password memenuhi requirements
- [ ] Verifikasi username memenuhi requirements
- [ ] Klik Send
- [ ] Cek response (201 Created = berhasil)

---

**Last Updated**: December 15, 2025
**API Version**: 1.1.0
**Feature**: Public User Registration
