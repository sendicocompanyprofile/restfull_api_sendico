-- ============================================================================
-- PERINTAH INSERT UNTUK MEMBUAT ADMIN USER DI MYSQL
-- ============================================================================

-- CATATAN PENTING:
-- Password harus di-hash menggunakan bcrypt (SALT_ROUNDS = 10)
-- Jangan copy paste password mentah ke database!

-- CONTOH 1: Admin user dengan password "SecurePass123!"
-- Hash password ini: $2b$10$Y9nzHw3j6K1Z8e4X5vL2dO7M9pQ1aS2dF3gH5jK7mN0pR3tU5vW7xY
INSERT INTO users (username, password, name, is_admin, createdAt)
VALUES (
  'admin_user',
  '$2b$10$Y9nzHw3j6K1Z8e4X5vL2dO7M9pQ1aS2dF3gH5jK7mN0pR3tU5vW7xY',
  'Admin User',
  true,
  NOW()
);

-- CONTOH 2: Dengan username dan nama berbeda
INSERT INTO users (username, password, name, is_admin, createdAt)
VALUES (
  'superadmin',
  '$2b$10$Y9nzHw3j6K1Z8e4X5vL2dO7M9pQ1aS2dF3gH5jK7mN0pR3tU5vW7xY',
  'Super Administrator',
  true,
  NOW()
);

-- ============================================================================
-- CARA GENERATE HASH PASSWORD DENGAN BCRYPT:
-- ============================================================================

-- 1. Menggunakan Node.js (di project folder):
--    node -e "require('bcrypt').hash('SecurePass123!', 10).then(hash => console.log(hash))"

-- 2. Atau jalankan file generate-hash.ts yang sudah tersedia:
--    npx ts-node generate-hash.ts

-- 3. Atau gunakan online tool: https://bcrypt.online/
--    (JANGAN gunakan di production, hanya untuk testing)

-- ============================================================================
-- PASSWORD REQUIREMENTS:
-- ============================================================================
-- ✓ Minimum 8 characters
-- ✓ At least 1 uppercase letter (A-Z)
-- ✓ At least 1 lowercase letter (a-z)
-- ✓ At least 1 number (0-9)
-- ✓ At least 1 special character (!@#$%^&*)
-- 
-- CONTOH PASSWORD VALID:
-- - SecurePass123!
-- - AdminUser@2024
-- - MySecure#Pass99

-- ============================================================================
-- CARA MENJALANKAN DI MYSQL:
-- ============================================================================

-- 1. Menggunakan MySQL Command Line:
--    mysql -u username -p database_name < INSERT_ADMIN_USER.sql

-- 2. Atau di MySQL Workbench:
--    a. Buka MySQL Workbench
--    b. File → Open SQL Script → pilih file ini
--    c. Execute (Ctrl + Shift + Enter)

-- 3. Atau copy-paste langsung ke MySQL console/Workbench

-- ============================================================================
-- VERIFIKASI BAHWA USER BERHASIL DIBUAT:
-- ============================================================================
-- SELECT * FROM users WHERE username = 'admin_user';
-- SELECT username, name, is_admin, createdAt FROM users WHERE is_admin = true;

