## 🔧 Quick Debug: Token Kosong Setelah Login

### Kemungkinan Masalah
User melakukan inject user ke MySQL dengan `is_admin = true`, tapi saat login token kosong/null.

### 5 Langkah Quick Fix

#### **1️⃣ Test Token Generator (2 menit)**
```bash
npx ts-node test-token-generator.ts
```
Jika ada error, berarti ada masalah dengan JWT library.

---

#### **2️⃣ Check .env file (1 menit)**
Pastikan ada:
```env
JWT_SECRET=sendico-secret-key-2024
JWT_EXPIRATION=7d
DATABASE_URL=mysql://...
```

---

#### **3️⃣ Restart Server (1 menit)**
```bash
# Terminal baru
npm start
```

---

#### **4️⃣ Test Login via cURL (1 menit)**
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "SecurePass123!"
  }' | jq
```

**Lihat di response:**
- ✅ Ada field `token` dengan value panjang = BERHASIL
- ❌ Tidak ada field `token` atau `token: null` = ERROR

---

#### **5️⃣ Cek Logs Server (lihat real-time)**
Saat test login, lihat terminal server running. Cari logs:

```
User logged in successfully
  ├─ username: superadmin
  ├─ is_admin: true
  ├─ tokenGenerated: true    ← harus true
  └─ tokenLength: 185        ← harus > 0
```

---

### ✅ Expected Response

```json
{
  "data": {
    "username": "superadmin",
    "name": "Super Administrator",
    "is_admin": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJpc19hZG1pbiI6dHJ1ZSwiaWF0IjoxNzM0OTc5MTIzLCJleHAiOjE3MzU1ODQxMjN9.abc123..."
  }
}
```

Token harus ada dan panjang! 🎫

---

### 📚 Dokumentasi Lengkap

Lihat file: [DEBUG_EMPTY_TOKEN.md](DEBUG_EMPTY_TOKEN.md)
