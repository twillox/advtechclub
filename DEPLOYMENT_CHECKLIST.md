# 🚀 DEPLOYMENT CHECKLIST

Follow these steps in order. Check off each item as you complete it.

---

## 📋 Pre-Deployment (Do This First)

### 1. MongoDB Atlas Setup
- [ ] Create account at https://www.mongodb.com/cloud/atlas
- [ ] Create a free cluster (M0)
- [ ] Create database user with username and password
- [ ] Get connection string (looks like: `mongodb+srv://user:pass@cluster.xxx.mongodb.net/`)
- [ ] Add database name to connection string: `/techclub`
- [ ] Network Access: Add `0.0.0.0/0` (allow from anywhere)
- [ ] **Copy your full connection string** - you'll need it!

### 2. Generate JWT Secret
- [ ] Generate a random 32+ character secret
  - Use: https://generate-secret.vercel.app/32
  - Or run: `openssl rand -base64 32`
- [ ] **Copy the secret** - you'll need it!

### 3. Push to GitHub
- [ ] Create new repository on GitHub (or use existing)
- [ ] Push your code:
```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```
- [ ] Verify code is on GitHub

---

## 🔧 Backend Deployment (Render)

### 4. Create Render Account
- [ ] Sign up at https://render.com
- [ ] Connect your GitHub account

### 5. Create Web Service
- [ ] Click "New +" → "Web Service"
- [ ] Connect your repository
- [ ] Configure:
  - [ ] Name: `techclub-portal-backend`
  - [ ] Region: Choose closest to you
  - [ ] Branch: `main`
  - [ ] Root Directory: `techclub-portal/backend`
  - [ ] Runtime: `Node`
  - [ ] Build Command: `npm install`
  - [ ] Start Command: `npm start`
  - [ ] Instance Type: `Free`

### 6. Add Environment Variables (in Render Dashboard)
Click "Environment" tab, add these ONE BY ONE:
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `5000`
- [ ] `MONGO_URI` = `mongodb+srv://user:pass@cluster.mongodb.net/techclub` (YOUR string)
- [ ] `JWT_SECRET` = `your-32-char-secret` (YOUR secret)
- [ ] `CORS_ORIGIN` = `*` (temporary, will update later)
- [ ] `FRONTEND_URL` = `http://localhost:5173` (temporary)

### 7. Deploy Backend
- [ ] Click "Create Web Service"
- [ ] Wait for deployment (2-5 minutes)
- [ ] **Copy your backend URL** (e.g., `https://techclub-portal-backend.onrender.com`)
- [ ] Test it: Visit `https://your-backend.onrender.com` in browser
- [ ] Should see: `{"msg":"TechClub Portal API is running","status":"healthy"}`

---

## 🎨 Frontend Deployment (Vercel)

### 8. Create Vercel Account
- [ ] Sign up at https://vercel.com
- [ ] Connect your GitHub account

### 9. Import Project
- [ ] Click "Add New Project"
- [ ] Import your Git repository
- [ ] Configure:
  - [ ] Framework Preset: `Vite` (should auto-detect)
  - [ ] Root Directory: `techclub-portal/frontend`
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `dist`

### 10. Add Environment Variable (in Vercel)
Go to Project Settings → Environment Variables:
- [ ] Add variable: `VITE_API_URL` = `https://your-backend.onrender.com` (YOUR Render URL)
- [ ] Save

### 11. Deploy Frontend
- [ ] Click "Deploy"
- [ ] Wait for build (1-3 minutes)
- [ ] **Copy your frontend URL** (e.g., `https://techclub-portal.vercel.app`)
- [ ] Visit it in browser

---

## 🔗 Connect Everything

### 12. Update Backend CORS
- [ ] Go back to Render dashboard
- [ ] Select your backend service
- [ ] Go to "Environment" tab
- [ ] Update `CORS_ORIGIN` = `https://your-app.vercel.app` (YOUR Vercel URL)
- [ ] Update `FRONTEND_URL` = `https://your-app.vercel.app` (SAME URL)
- [ ] Save changes (will redeploy automatically)
- [ ] Wait for redeployment (~1 minute)

### 13. Test the Full Application
- [ ] Visit your Vercel URL
- [ ] Should redirect to `/login`
- [ ] Click "Sign Up"
- [ ] Create a test account:
  - [ ] Name: Test User
  - [ ] Email: test@example.com
  - [ ] Password: test123
- [ ] Should redirect to dashboard
- [ ] Try logging out and back in
- [ ] Test other features (events, projects, etc.)

---

## ✅ Final Checks

### 14. Security & Optimization
- [ ] Change `CORS_ORIGIN` to exact Vercel URL (not `*`)
- [ ] Verify MongoDB has strong password
- [ ] Confirm JWT_SECRET is 32+ characters
- [ ] Never commit `.env` files to GitHub
- [ ] Check both Render and Vercel have no errors in logs

### 15. Performance Check
- [ ] Test page load speed
- [ ] First load might be slow (Render free tier sleeps)
- [ ] Check browser console for errors
- [ ] Test on mobile device

---

## 🎉 You're Done!

Your application is now live on:
- **Frontend**: https://your-app.vercel.app
- **Backend API**: https://your-backend.onrender.com/api
- **Database**: MongoDB Atlas (cloud)

---

## 📝 Quick Reference

### Your URLs:
- Frontend: ______________________.vercel.app
- Backend: ______________________.onrender.com
- MongoDB: cloud.mongodb.com

### Support Links:
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- MongoDB Docs: https://www.mongodb.com/docs

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't sign up | Check Render logs, verify MongoDB URI |
| CORS error | Update CORS_ORIGIN with exact Vercel URL |
| Blank page | Check Vercel build logs, verify VITE_API_URL |
| Slow first load | Normal on Render free tier (cold start) |
| Database error | Check MongoDB network access & credentials |

---

**Need more help? Read `DEPLOYMENT_GUIDE.md` for detailed instructions!**
