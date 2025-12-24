## 📋 Cara Membuat Admin User di MySQL

Ada 2 cara untuk membuat admin user dengan `is_admin = true`:

### **Cara 1: Langsung via SQL Query (REKOMENDASI)**

#### Step 1: Generate Hash Password

Jalankan perintah di terminal untuk generate hash bcrypt dari password Anda:

```bash
# Gunakan script yang sudah ada
npx ts-node generate-hash.ts
```

Atau generate dengan Node.js langsung:

```bash
node -e "require('bcrypt').hash('SecurePass123!', 10).then(hash => console.log(hash))"
```

#### Step 2: Copy SQL Query dan Jalankan

Setelah mendapat hash password, jalankan query di MySQL:

```sql
INSERT INTO users (username, password, name, is_admin, createdAt)
VALUES (
  'admin_user',                    -- Username (3-30 chars, alphanumeric + underscore)
  '$2b$10$...',                    -- Password hash (dari Step 1)
  'Admin User',                    -- Full name
  true,                            -- is_admin = true
  NOW()                            -- Timestamp
);
```

**Contoh Lengkap:**

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

---

### **Cara 2: Menggunakan Script SQL File**

File `INSERT_ADMIN_USER.sql` sudah tersedia dengan contoh-contoh siap pakai.

**Di MySQL Workbench:**
1. File → Open SQL Script → pilih `INSERT_ADMIN_USER.sql`
2. Edit username, password hash, dan name sesuai kebutuhan
3. Execute (Ctrl + Shift + Enter)

**Di MySQL Command Line:**
```bash
mysql -u username -p database_name < INSERT_ADMIN_USER.sql
```

---

### **Verifikasi User Berhasil Dibuat**

Jalankan query untuk memastikan user admin sudah tersimpan:

```sql
-- Lihat semua user yang adalah admin
SELECT username, name, is_admin, createdAt FROM users WHERE is_admin = true;

-- Atau cek user spesifik
SELECT * FROM users WHERE username = 'superadmin';
```

---

### **Password Requirements**

Password harus memenuhi kriteria ini sebelum di-hash:

✅ Minimum 8 characters  
✅ At least 1 uppercase letter (A-Z)  
✅ At least 1 lowercase letter (a-z)  
✅ At least 1 number (0-9)  
✅ At least 1 special character (!@#$%^&*)  

**Contoh Password Valid:**
- `SecurePass123!`
- `AdminUser@2024`
- `MySecure#Pass99`

---

### **PENTING: Security Tips**

⚠️ **JANGAN**:
- Copy paste password mentah (tanpa di-hash) ke database
- Gunakan password yang sama untuk multiple users
- Share password di chat atau email
- Gunakan online bcrypt tool untuk production (hanya untuk testing saja)

✅ **LAKUKAN**:
- Always hash password dengan bcrypt sebelum menyimpan ke database
- Gunakan strong password (8+ chars dengan kombinasi uppercase, lowercase, number, special char)
- Keep JWT_SECRET dan DATABASE credentials aman di environment variables
- Audit dan monitoring admin account activity

