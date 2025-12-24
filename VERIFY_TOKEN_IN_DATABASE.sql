-- ============================================================================
-- QUERY UNTUK VERIFY TOKEN TERSIMPAN DI DATABASE
-- ============================================================================

-- 1. LIHAT SEMUA USER DENGAN TOKEN MEREKA
SELECT 
  username,
  name,
  is_admin,
  CASE 
    WHEN token IS NULL THEN '❌ KOSONG'
    ELSE CONCAT('✅ ', SUBSTRING(token, 1, 30), '...')
  END as token_status,
  createdAt
FROM users
ORDER BY createdAt DESC;

-- ============================================================================

-- 2. LIHAT USER YANG SEDANG ACTIVE (PUNYA TOKEN)
SELECT 
  username,
  name,
  is_admin,
  token,
  createdAt
FROM users
WHERE token IS NOT NULL
ORDER BY createdAt DESC;

-- ============================================================================

-- 3. LIHAT USER YANG LOGGED OUT (TIDAK PUNYA TOKEN)
SELECT 
  username,
  name,
  is_admin,
  createdAt
FROM users
WHERE token IS NULL
ORDER BY createdAt DESC;

-- ============================================================================

-- 4. LIHAT TOKEN SPESIFIK USER
SELECT 
  username,
  name,
  is_admin,
  token,
  LENGTH(token) as token_length,
  createdAt
FROM users
WHERE username = 'superadmin';

-- ============================================================================

-- 5. CHECK TOKEN UNTUK SEMUA ADMIN USER
SELECT 
  username,
  name,
  is_admin,
  CASE 
    WHEN token IS NULL THEN 'LOGGED OUT'
    ELSE 'LOGGED IN'
  END as status,
  token
FROM users
WHERE is_admin = true
ORDER BY username;

-- ============================================================================

-- 6. CLEAR TOKEN MANUAL (FORCE LOGOUT SEMUA USER)
-- ⚠️ WARNING: Ini akan logout semua user!
UPDATE users SET token = NULL WHERE token IS NOT NULL;

-- Verify:
SELECT COUNT(*) as users_with_token FROM users WHERE token IS NOT NULL;
-- Should return: 0

-- ============================================================================

-- 7. CLEAR TOKEN UNTUK SPESIFIK USER (FORCE LOGOUT USER)
UPDATE users SET token = NULL WHERE username = 'superadmin';

-- Verify:
SELECT username, token FROM users WHERE username = 'superadmin';

-- ============================================================================

-- 8. LIHAT PERBANDINGAN SEBELUM & SESUDAH UPDATE KODE

-- SEBELUM (Token tidak di-database):
-- SELECT token FROM users WHERE username = 'superadmin';
-- Result: NULL (walau user sedang login)

-- SESUDAH (Token di-database):
-- SELECT token FROM users WHERE username = 'superadmin';
-- Result: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1... (token tersimpan)

-- ============================================================================
