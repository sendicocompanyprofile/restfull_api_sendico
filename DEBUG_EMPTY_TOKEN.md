## 🔴 Issue: Token Kosong Setelah Login

### ❌ Masalah

Setelah melakukan register/inject ke MySQL, saat login response tidak mengandung token atau token kosong:

```json
{
  "data": {
    "username": "superadmin",
    "name": "Super Administrator",
    "token": null
  }
}
```

atau

```json
{
  "data": {
    "username": "superadmin",
    "name": "Super Administrator"
  }
}
```

---

### 🔍 Root Cause

**Token kosong berarti:**
1. ✅ Login berhasil (password match)
2. ❌ Tapi `generateToken()` tidak return token dengan benar
3. ❌ Atau token di-generate tapi di-skip di response

---

### ✅ Solusi: Test Token Generator

#### **Step 1: Test di Terminal**

Jalankan test token generator:

```bash
npx ts-node test-token-generator.ts
```

Output yang diharapkan:
```
═══════════════════════════════════════════════════════════
🧪 JWT Token Generator Test
═══════════════════════════════════════════════════════════

Test 1: Generate token for ADMIN user
───────────────────────────────────────
🔧 Generating token with:
  - username: superadmin
  - is_admin: true
  - JWT_SECRET: your-secret-key-change-i...
  - JWT_EXPIRATION: 7d
✅ Token generated successfully
✅ Token length: 185
✅ Token preview: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
🎫 Token:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJpc19hZG1pbiI6dHJ1ZSwiaWF0IjoxNzM0OTc5MTIzLCJleHAiOjE3MzU1ODQxMjN9...

✅ Tests Complete
```

**Jika output ERROR:**
- Cek apakah jsonwebtoken package ter-install: `npm list jsonwebtoken`
- Cek JWT_SECRET di .env file
- Reinstall packages: `npm install`

---

#### **Step 2: Check Login Response di API**

Call login endpoint dan lihat response:

```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "SecurePass123!"
  }' | jq
```

**Response yang BENAR:**
```json
{
  "data": {
    "username": "superadmin",
    "name": "Super Administrator",
    "is_admin": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJpc19hZG1pbiI6dHJ1ZSwiaWF0IjoxNzM0OTc5MTIzLCJleHAiOjE3MzU1ODQxMjN9..."
  }
}
```

**Response yang SALAH (token kosong):**
```json
{
  "data": {
    "username": "superadmin",
    "name": "Super Administrator",
    "token": null
  }
}
```

---

#### **Step 3: Check Server Logs**

Jalankan server dan lihat logs saat login:

```bash
npm start
```

Cari logs yang berisi "User logged in successfully":

**Logs yang BENAR:**
```
User logged in successfully
  ├─ username: superadmin
  ├─ is_admin: true
  ├─ tokenGenerated: true          ← Token berhasil di-generate
  └─ tokenLength: 185              ← Token punya panjang > 0
```

**Logs yang SALAH:**
```
User logged in successfully
  ├─ username: superadmin
  ├─ is_admin: true
  ├─ tokenGenerated: false         ← ❌ Token TIDAK di-generate
  └─ tokenLength: 0                ← ❌ Panjang token 0
```

Jika ini yang terjadi, berarti `generateToken()` return undefined/null.

---

### 🛠️ Possible Causes & Fixes

#### **Cause 1: JWT_SECRET tidak di-set**

**Check .env:**
```env
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRATION=7d
```

**Jika tidak ada, tambahkan ke .env:**
```bash
JWT_SECRET=sendico-secret-key-2024
JWT_EXPIRATION=7d
```

Restart server: `npm start`

---

#### **Cause 2: jsonwebtoken package error**

**Check apakah package ter-install:**
```bash
npm list jsonwebtoken
```

**Expected output:**
```
restfull-api-sendico
└── jsonwebtoken@9.0.3
```

**Jika tidak ada atau error, reinstall:**
```bash
npm install jsonwebtoken
npm install
```

---

#### **Cause 3: generateToken throwing error silently**

Jika ada error di generateToken tapi ter-catch silently:

**Check logs di errorHandler.ts:**
- Jika ada "Failed to login" error 500, berarti ada exception saat generate token
- Cek `.logs` folder untuk debug info lengkap

**Solusi: Rebuild project**
```bash
npm run build
npm start
```

---

### 📋 Checklist

- [ ] Test token generator: `npx ts-node test-token-generator.ts` ✅
- [ ] Check .env file punya JWT_SECRET
- [ ] Check package.json punya jsonwebtoken@9.0.3
- [ ] Restart server: `npm start`
- [ ] Test login lagi via cURL atau Postman
- [ ] Lihat server logs untuk debug info
- [ ] Response punya token (bukan null/kosong)

---

### 🧪 Test Complete Flow

1. **Start server:**
   ```bash
   npm start
   ```

2. **Login (di terminal baru):**
   ```bash
   curl -X POST http://localhost:3000/api/users/login \
     -H "Content-Type: application/json" \
     -d '{
       "username": "superadmin",
       "password": "SecurePass123!"
     }' | jq '.data.token'
   ```

3. **Check output:**
   - ✅ Jika panjang: `"eyJhbGciOi..."` = Token berhasil
   - ❌ Jika `null` = Ada masalah

---

### 💡 Jika Masih Error

1. Cek database connection sudah beres
2. Cek password hash di database (`$2b$10$...`)
3. Jalankan test: `npx ts-node test-token-generator.ts`
4. Check `.logs` folder untuk error detail
5. Ensure Node version >= 18:
   ```bash
   node --version
   ```
6. Clear node_modules dan reinstall:
   ```bash
   rm -r node_modules package-lock.json
   npm install
   npm start
   ```

