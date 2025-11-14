# Quick Deploy ke Vercel - TL;DR

## ⚡ Quick Steps (5-10 menit)

### 1️⃣ Setup Database (Pilih salah satu)

**Option A: PlanetScale (Recommended)**
```
1. Buka https://planetscale.com → Sign up gratis
2. Create new database
3. Copy connection string: mysql://[user]:[pass]@[host]/[db]?sslaccept=strict
4. Save untuk nanti
```

**Option B: Database Hostinger Existing**
```
Jika sudah ada database di Hostinger:
1. Pastikan accessible dari internet (bukan localhost)
2. Copy DATABASE_URL
3. Gunakan untuk Vercel env var
```

---

### 2️⃣ Push Code ke GitHub

```powershell
cd "d:\Materi Kuliah\Smt 7\PT Sendico\Code\Restfull API Sendico"

git init
git add .
git commit -m "Deploy to Vercel"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/restfull-api-sendico.git
git push -u origin main
```

**Catatan:** Buat GitHub repo dulu di https://github.com/new

---

### 3️⃣ Connect ke Vercel

```
1. Buka https://vercel.com/dashboard
2. Klik "Add New" → "Project"
3. Klik "Continue with GitHub"
4. Pilih repository "restfull-api-sendico"
5. Klik "Import"
```

---

### 4️⃣ Setup Environment Variables

Di Vercel Dashboard:
```
Settings → Environment Variables → Add
```

Tambahkan:
```
DATABASE_URL = mysql://[connection-string]
NODE_ENV = production
```

Klik Save.

---

### 5️⃣ Deploy!

```
Vercel akan auto-deploy saat muncul "Import".
Wait for build process (~2-3 menit).
```

Atau manual di Vercel Dashboard:
```
Deployments → Recent Deployment → Redeploy
```

---

## 🔗 Test API Setelah Deploy

```
Base URL: https://restfull-api-sendico-[random].vercel.app/api
```

Update `base_url` di Postman Collection.

Test:
```powershell
# Health check
$response = Invoke-WebRequest -Uri "https://restfull-api-sendico-[random].vercel.app/health"
$response.Content

# Register user
$body = @{
    username = "testuser"
    password = "password123"
    name = "Test"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://restfull-api-sendico-[random].vercel.app/api/users" `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $body
```

---

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| Build error: "DATABASE_URL not found" | Set env var di Vercel Settings |
| 502 Bad Gateway | Check Vercel logs: Deployments → Logs |
| Connection refused | Database tidak accessible, gunakan cloud DB |
| Cold start lambat | Normal untuk serverless, di-optimize Vercel |

---

## 📁 Files Created for Vercel

✅ `vercel.json` - Configuration
✅ `api/index.ts` - Serverless entry point  
✅ `.vercelignore` - Ignore files

---

## 🎯 Next: Better Alternatives

Untuk production backend, lebih baik:
- **Railway** (auto MySQL, 5 min setup)
- **Render** (free tier, good for backend)
- **Hostinger** (already using, deploy there)

Tapi Vercel juga bisa bekerja untuk dev/staging!

---

**Selesai! Happy deploying 🚀**
