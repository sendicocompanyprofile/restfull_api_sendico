## 🧪 Quick Test: Verify Token Tersimpan di Database

### ✅ Step 1: Restart Server (Apply Perubahan Baru)

```bash
npm start
```

Expected logs:
```
🚀 Server is running on http://localhost:3000
✅ CORS enabled for origins: ...
✅ Rate limiting enabled
```

---

### ✅ Step 2: Test Login

Di terminal lain, jalankan:

```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "SecurePass123!"
  }' | jq
```

Expected response:
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

**COPY token ini untuk step 3!**

---

### ✅ Step 3: Verify Token di Database

Buka MySQL/Workbench, jalankan:

```sql
SELECT username, name, is_admin, token FROM users WHERE username = 'superadmin';
```

Expected result:
```
| username    | name                      | is_admin | token                                                      |
|-------------|---------------------------|----------|-------------------------------------------------------------|
| superadmin  | Super Administrator       | 1        | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2Vy...        |
```

✅ **Token ADA di database! Bukan NULL!**

---

### ✅ Step 4: Test Logout

Jalankan logout dengan token dari Step 2:

```bash
curl -X DELETE http://localhost:3000/api/users/current \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJpc19hZG1pbiI6dHJ1ZSwiaWF0IjoxNzM0OTc5MTIzLCJleHAiOjE3MzU1ODQxMjN9..."
```

Expected response:
```json
{
  "data": "OK"
}
```

---

### ✅ Step 5: Verify Token Cleared di Database

Jalankan SQL query lagi:

```sql
SELECT username, name, is_admin, token FROM users WHERE username = 'superadmin';
```

Expected result:
```
| username    | name                      | is_admin | token |
|-------------|---------------------------|----------|-------|
| superadmin  | Super Administrator       | 1        | NULL  |
```

✅ **Token CLEARED/NULL setelah logout!**

---

### 📊 Summary

| Step | Action | DB Result |
|------|--------|-----------|
| 1 | Restart server | - |
| 2 | Login | Token = NULL (belum cek DB) |
| 3 | Query DB | Token = `eyJhbGc...` ✅ |
| 4 | Logout | - |
| 5 | Query DB | Token = NULL ✅ |

---

### 🎯 Kesimpulan

**SEBELUM Update:**
- Token ada di response ✅
- Token di database ❌

**SESUDAH Update:**
- Token ada di response ✅
- Token di database ✅
- Token di-clear saat logout ✅

Sekarang token sudah ter-track di database! 🎉

