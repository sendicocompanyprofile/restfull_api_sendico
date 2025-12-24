## 🔧 Troubleshooting: Login Error "Unauthorized - Token required"

### ❌ Masalah
Ketika login dengan admin user (is_admin = true), muncul error:
```json
{
  "errors": "Error: Unauthorized - Token required"
}
```

---

### ✅ Solusi & Debugging

#### **1. Verifikasi User Sudah Tersimpan di Database**

Pertama, pastikan user admin sudah ada di database:

```sql
SELECT username, password, name, is_admin FROM users WHERE is_admin = true;
```

Jika tidak ada user, ikuti [CREATE_ADMIN_USER_GUIDE.md](CREATE_ADMIN_USER_GUIDE.md) untuk membuat admin user.

---

#### **2. Verifikasi Password Hash Benar**

Password harus di-hash dengan bcrypt saat di-insert. Cek apakah password sudah benar-benar di-hash:

```sql
SELECT username, password FROM users WHERE username = 'superadmin';
```

Password hash harus dimulai dengan `$2b$10$` (bcrypt format).

**Contoh hash valid:**
```
$2b$10$Y9nzHw3j6K1Z8e4X5vL2dO7M9pQ1aS2dF3gH5jK7mN0pR3tU5vW7xY
```

**Contoh PASSWORD TIDAK VALID (plain text):**
```
SecurePass123!
```

---

#### **3. Test Login dengan cURL**

Jalankan test manual dengan cURL untuk melihat error detail:

```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "SecurePass123!"
  }' | jq
```

---

#### **4. Kemungkinan Penyebab & Solusi**

| Penyebab | Gejala | Solusi |
|---------|--------|--------|
| **Password tidak di-hash** | Login gagal dengan 401 "incorrect" | Re-create user dengan password yang di-hash bcrypt |
| **Hash password salah** | Login gagal dengan 401 "incorrect" | Verify hash menggunakan bcrypt online tool |
| **Username tidak ditemukan** | Login gagal dengan 401 "incorrect" | Pastikan username benar, cek di database |
| **User tidak memiliki is_admin field** | Error di database query | Update database schema, jalankan migration |

---

#### **5. Generate & Recreate User Admin Dengan Password Benar**

**Step 1: Generate hash password**

```bash
npx ts-node generate-hash.ts
```

Contoh output:
```
INSERT INTO "User" (username, password, name, is_admin, createdAt) VALUES (
  'agung',
  '$2b$10$Y9nzHw3j6K1Z8e4X5vL2dO7M9pQ1aS2dF3gH5jK7mN0pR3tU5vW7xY',
  'Agung Admin',
  true,
  '2025-12-24 12:30:45'
);
```

**Step 2: Delete user lama (optional)**

```sql
DELETE FROM users WHERE username = 'superadmin';
```

**Step 3: Insert user baru dengan password yang benar di-hash**

```sql
INSERT INTO users (username, password, name, is_admin, createdAt)
VALUES (
  'superadmin',
  '$2b$10$Y9nzHw3j6K1Z8e4X5vL2dO7M9pQ1aS2dF3gH5jK7mN0pR3tU5vW7xY',
  'Super Administrator',
  true,
  NOW()
);
```

**Step 4: Verify user berhasil dibuat**

```sql
SELECT * FROM users WHERE username = 'superadmin';
```

**Step 5: Test login lagi**

```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "SecurePass123!"
  }'
```

Sekarang harus mendapat response dengan token:
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

#### **6. Check API Documentation**

Pastikan Anda menggunakan endpoint yang benar:
- ✅ Login: `POST /api/users/login`
- ✅ Register: `POST /api/users`

**BUKAN:**
- ❌ `/api/users/login` dengan header Authorization (login tidak butuh auth)
- ❌ Endpoint yang salah path

---

#### **7. Cek Database Connection**

Verifikasi bahwa server bisa connect ke database:

```bash
npm start
```

Di logs harus melihat:
```
✅ Database connected successfully
🚀 Server is running on http://localhost:3000
```

Jika ada error database connection, fix `.env` file:

```env
DATABASE_URL="mysql://username:password@localhost:3306/database_name"
```

---

#### **8. Browser DevTools Network Tab**

Jika menggunakan frontend/Postman:

1. Buka browser DevTools → Network tab
2. Buat request login
3. Lihat response detail
4. Pastikan request body mengandung:
   - ✅ `username`
   - ✅ `password`
   - ❌ JANGAN ada Authorization header

---

### 📝 Checklist Debugging

- [ ] User admin sudah ada di database
- [ ] Password sudah di-hash dengan bcrypt (bukan plain text)
- [ ] Hash password format: `$2b$10$...` (minimal 60 karakter)
- [ ] Username & password di request cocok dengan database
- [ ] Endpoint benar: `POST /api/users/login`
- [ ] Request tidak ada Authorization header
- [ ] Server bisa connect ke database
- [ ] Node packages ter-install dengan benar

---

### 💡 Tips

- Gunakan **Postman** untuk test API dengan UI yang lebih mudah
- Enable debug logging di `.env`: `LOG_LEVEL=debug`
- Selalu check database langsung dengan MySQL client
- Jangan pernah share database credentials di chat

---

### 📞 Masih Error?

Jika masih error setelah mengikuti semua langkah di atas:

1. Jalankan: `npm start` dan lihat logs lengkapnya
2. Cek `.env` file sudah benar
3. Pastikan database migration sudah berjalan
4. Clear database dan recreate schema dari Prisma

