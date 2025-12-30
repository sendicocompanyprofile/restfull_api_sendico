-- Script untuk generate token untuk user test1
-- Ini adalah token JWT yang valid selama 7 hari
-- Generated on: 2025-12-30

-- Instruksi:
-- 1. Jalankan perintah berikut di MySQL client Anda
-- 2. Sesuaikan DATABASE_NAME dengan nama database Anda
-- 3. Update token value sesuai dengan token yang Anda generate

-- Untuk generate token baru, gunakan Node.js script:
-- node -e "const jwt = require('jsonwebtoken'); const token = jwt.sign({username: 'test1', is_admin: false}, process.env.JWT_SECRET || 'your-secret-key-change-in-production', {expiresIn: '7d'}); console.log(token);"

-- Update user test1 dengan token kosong dulu untuk testing
UPDATE `User` SET `token` = NULL WHERE `username` = 'test1';

-- Atau Anda bisa langsung set token dengan string tertentu
-- UPDATE `User` SET `token` = 'YOUR_JWT_TOKEN_HERE' WHERE `username` = 'test1';

-- Untuk verify user sudah update
SELECT `username`, `name`, `token`, `createdAt` FROM `User` WHERE `username` = 'test1';
