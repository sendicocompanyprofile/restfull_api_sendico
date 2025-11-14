# Deploy ke Vercel - Step by Step Guide

## ⚠️ PENTING: Catatan Sebelum Deploy

**Vercel lebih cocok untuk frontend (Next.js, React, Static). Untuk backend/API, rekomendasi:**
- **Better Options**: Railway, Render, Heroku, DigitalOcean, atau Hostinger (sudah Anda gunakan)
- **Vercel**: Bisa tapi dengan limitasi (Serverless Functions, cold start)

Namun kita tetap bisa deploy ke Vercel dengan beberapa setup. Ikuti panduan ini:

---

## 📋 Prerequisites

1. **Vercel Account** (gratis)
   - Sign up di https://vercel.com/signup

2. **GitHub Account** (recommended untuk auto-deploy)
   - Atau push code ke GitHub

3. **Git installed** di local

4. **Node.js 20.x** (Vercel support)

---

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Project untuk Vercel

Saya sudah membuat 3 file konfigurasi:

1. **`vercel.json`** - Konfigurasi Vercel deployment
2. **`api/index.ts`** - Serverless function entry point
3. **`.vercelignore`** - File yang diabaikan saat deploy

### Step 2: Setup Database di Cloud

**PENTING: Database local tidak bisa diakses dari Vercel!**

Pilih salah satu:

#### Option A: MySQL Cloud (PlanetScale - Recommended)
```
1. Sign up di https://planetscale.com (gratis tier ada)
2. Buat database baru
3. Copy connection string: mysql://[user]:[pass]@[host]/[db]
4. Save untuk step berikutnya
```

#### Option B: Menggunakan Database Existing di Hostinger
```
Jika sudah punya database di Hostinger:
1. Update DATABASE_URL di Hostinger
2. Pastikan accessible dari internet (bukan localhost)
3. Copy connection string
```

#### Option C: MongoDB Atlas (Alternative)
```
1. Sign up di https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
```

### Step 3: Push Code ke GitHub

```bash
# Di folder project
git init
git add .
git commit -m "Initial commit - ready for Vercel deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/restfull-api-sendico.git
git push -u origin main
```

### Step 4: Connect GitHub ke Vercel

**Cara 1: Via Vercel Dashboard (Easiest)**

1. Buka https://vercel.com/dashboard
2. Klik **Add New...** → **Project**
3. Klik **Continue with GitHub**
4. Authorize Vercel untuk akses GitHub
5. Pilih repository `restfull-api-sendico`
6. Klik **Import**

**Cara 2: Via Vercel CLI**

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Step 5: Configure Environment Variables di Vercel

Setelah import project, setup environment variables:

1. Di Vercel Dashboard, buka project
2. Klik **Settings** → **Environment Variables**
3. Tambahkan variables:

```
DATABASE_URL = mysql://user:password@host/database
NODE_ENV = production
```

4. Klik **Save**

**Untuk PlanetScale:**
```
DATABASE_URL = mysql://username:password@aws.connect.psdb.cloud/database_name?sslaccept=strict
```

### Step 6: Generate Prisma Client

Vercel perlu generate Prisma client saat build:

**Vercel sudah dikonfigurasi untuk menjalankan:**
```json
"buildCommand": "npm run build && prisma generate"
```

Jadi saat deploy, Vercel akan:
1. Compile TypeScript (`npm run build`)
2. Generate Prisma client (`prisma generate`)
3. Deploy ke serverless functions

### Step 7: Trigger Deploy

Vercel akan otomatis deploy saat:

1. **Push ke GitHub main branch**
   ```bash
   git push origin main
   ```

2. **Atau manual dari dashboard**
   - Klik **Deployments** → **Redeploy** pada commit terbaru

---

## 🔗 Testing Deployed API

### Get Your Vercel URL

```
https://restfull-api-sendico-[random].vercel.app
```

(Vercel akan generate URL atau assign custom domain)

### Test Endpoints

Update Postman atau test script dengan:

```
Base URL: https://restfull-api-sendico-[random].vercel.app/api
```

Test endpoints:

```bash
# Health check
curl https://restfull-api-sendico-[random].vercel.app/health

# Register user
curl -X POST https://restfull-api-sendico-[random].vercel.app/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","password":"pass123","name":"Test"}'

# Login
curl -X POST https://restfull-api-sendico-[random].vercel.app/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","password":"pass123"}'
```

---

## ⚡ Optimize untuk Vercel Serverless

### Issue: Cold Start

Serverless functions di Vercel bisa lambat pada request pertama.

**Solution - Modify `src/index.ts` untuk Vercel:**

```typescript
// Add graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});
```

### Issue: Prisma Connection Pooling

**Gunakan PlanetScale atau Supabase untuk connection pooling**, bukan direct MySQL.

---

## 🛠️ Troubleshooting

### ❌ Build Error: "DATABASE_URL not found"

**Solution:**
1. Vercel Dashboard → Settings → Environment Variables
2. Pastikan `DATABASE_URL` sudah di-set
3. Re-deploy dengan klik **Redeploy**

### ❌ Error: "ECONNREFUSED - Cannot reach database"

**Penyebab:** Database connection string salah atau database tidak accessible

**Solution:**
1. Test connection string locally:
   ```bash
   DATABASE_URL="mysql://..." npx prisma db push
   ```
2. Update di Vercel env vars
3. Re-deploy

### ❌ Error: "Cannot find module 'express'"

**Penyebab:** Dependencies tidak di-install saat build

**Solution:**
```bash
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push origin main
```

### ❌ 502 Bad Gateway

**Penyebab:** Function error atau timeout

**Solution:**
1. Check Vercel logs:
   - Dashboard → Deployments → Recent deployment → Logs
2. Check error detail
3. Fix dan re-deploy

---

## 📊 Monitoring & Logs

### View Logs di Vercel

1. Buka project di Vercel Dashboard
2. Klik **Deployments** → Pilih deployment
3. Klik **Logs** → **Function Logs**
4. Lihat real-time logs

### Local Debugging Sebelum Deploy

```bash
npm run build
npm start
# Test di http://localhost:3000
```

---

## 🔐 Security Best Practices

### 1. Environment Variables
✅ Semua secrets di env vars (done)

### 2. Database Security
✅ Jangan commit `.env` (pastikan `.gitignore` ada)

### 3. CORS (Jika perlu frontend access)

Add ke `src/index.ts`:

```typescript
import cors from 'cors';

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://yourdomain.com',
    'https://yourdomain.vercel.app'
  ],
  credentials: true
}));
```

Install:
```bash
npm install cors
npm install --save-dev @types/cors
```

---

## 📝 Useful Vercel Commands

### Install Vercel CLI

```bash
npm install -g vercel
```

### Deploy

```bash
vercel --prod
```

### View Deployments

```bash
vercel list
```

### View Logs

```bash
vercel logs [deployment-url]
```

### Environment Variables

```bash
vercel env list
vercel env add DATABASE_URL
vercel env pull
```

---

## 🎯 Alternative: Deploy ke Railway (Recommended untuk Backend)

Jika Vercel terlalu complex, coba Railway:

### Railway Setup (5 menit)

1. Sign up di https://railway.app
2. Connect GitHub
3. Select project
4. Add MySQL database (built-in)
5. Auto-populate `DATABASE_URL`
6. Deploy (automatic on git push)

**Railway lebih cocok untuk Node.js backend!**

---

## ✅ Deployment Checklist

- [ ] Database setup (PlanetScale atau cloud MySQL)
- [ ] Code pushed ke GitHub
- [ ] Vercel project created & connected
- [ ] Environment variables set (DATABASE_URL)
- [ ] First deploy successful
- [ ] Health endpoint responding (/health)
- [ ] API endpoints tested
- [ ] Logs checked for errors
- [ ] Custom domain setup (optional)

---

## 📞 Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Prisma + Vercel**: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel
- **Railway Alternative**: https://railway.app/docs

---

**Happy Deploying! 🚀**
