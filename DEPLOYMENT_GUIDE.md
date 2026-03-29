# 🚀 TechClub Portal - Deployment Guide

This guide will walk you through deploying your full-stack application using **Render** for the backend and **Vercel** for the frontend.

---

## 📋 Prerequisites

1. **MongoDB Atlas Account** (for cloud database)
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Get your connection string

2. **Render Account**
   - Sign up at [Render](https://render.com)

3. **Vercel Account**
   - Sign up at [Vercel](https://vercel.com)

---

## 🔧 Step 1: Backend Deployment (Render)

### 1.1 Prepare Your Backend

1. **Update Environment Variables**
   - Navigate to `techclub-portal/backend/`
   - Copy `.env.example` to `.env` (for local testing)
   ```bash
   cp .env.example .env
   ```

2. **Update the `.env` file with:**
   ```env
   PORT=5000
   NODE_ENV=production
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/techclub
   JWT_SECRET=generate-a-strong-secret-key-here
   CORS_ORIGIN=https://your-app.vercel.app
   FRONTEND_URL=https://your-app.vercel.app
   ```

### 1.2 Deploy to Render

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Create a New Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub repository
   - Select the `techclub-portal/backend` folder as root

3. **Configure the Service**
   - **Name**: `techclub-portal-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

4. **Add Environment Variables in Render Dashboard**
   - Click on **"Environment"** tab
   - Add these variables:
     ```
     NODE_ENV=production
     PORT=5000
     MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/techclub
     JWT_SECRET=your-super-secret-jwt-key-min-32-chars
     CORS_ORIGIN=https://your-app.vercel.app
     FRONTEND_URL=https://your-app.vercel.app
     ```

5. **Deploy**
   - Click **"Create Web Service"**
   - Wait for deployment to complete (~2-5 minutes)
   - Copy your backend URL (e.g., `https://techclub-portal-backend.onrender.com`)

---

## 🎨 Step 2: Frontend Deployment (Vercel)

### 2.1 Prepare Your Frontend

1. **Update Environment Variables**
   - Navigate to `techclub-portal/frontend/`
   - Copy `.env.example` to `.env.local` (for local testing)
   ```bash
   cp .env.example .env.local
   ```

2. **Update `.env.local` with your Render backend URL:**
   ```env
   VITE_API_URL=https://your-backend.onrender.com
   VITE_API_BASE_URL=http://localhost:5000
   ```

### 2.2 Deploy to Vercel

1. **Install Vercel CLI** (optional, or use web interface)
   ```bash
   npm install -g vercel
   ```

2. **Deploy via Web Interface** (Recommended)
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click **"Add New Project"**
   - Import your GitHub repository
   - Configure the project:
     - **Framework Preset**: Vite
     - **Root Directory**: `techclub-portal/frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

3. **Add Environment Variables in Vercel**
   - Go to project settings → **"Environment Variables"**
   - Add:
     ```
     VITE_API_URL=https://your-backend.onrender.com
     ```

4. **Deploy**
   - Click **"Deploy"**
   - Wait for build to complete (~1-3 minutes)
   - Copy your frontend URL (e.g., `https://techclub-portal.vercel.app`)

---

## 🔗 Step 3: Connect Frontend & Backend

### 3.1 Update Backend CORS

1. Go back to **Render Dashboard**
2. Select your backend service
3. Go to **"Environment"** tab
4. Update `CORS_ORIGIN` and `FRONTEND_URL` with your Vercel URL:
   ```
   CORS_ORIGIN=https://techclub-portal.vercel.app
   FRONTEND_URL=https://techclub-portal.vercel.app
   ```
5. Click **"Save Changes"** (this will trigger a redeployment)

### 3.2 Test the Connection

1. Visit your Vercel frontend URL
2. Try logging in or signing up
3. Check browser console for any errors

---

## 🧪 Testing Your Deployment

### Backend Health Check
Visit: `https://your-backend.onrender.com/`
You should see:
```json
{
  "msg": "TechClub Portal API is running",
  "status": "healthy"
}
```

### Frontend
Visit: `https://your-app.vercel.app`
- You should be redirected to `/login` if not authenticated
- Try signing up a new user
- Try logging in

---

## 🔐 Security Best Practices

1. **JWT Secret**
   - Generate a strong random secret (min 32 characters)
   - Use: `openssl rand -base64 32`

2. **MongoDB Atlas**
   - Whitelist only Render's IP addresses (or use 0.0.0.0/0 for free tier)
   - Use environment variables for credentials
   - Never commit `.env` files

3. **CORS**
   - In production, specify exact frontend URL (not `*`)
   - Update both Render environment variables

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Server won't start
- Check Render logs in the dashboard
- Verify MongoDB connection string
- Ensure all environment variables are set

**Problem**: CORS errors
- Verify `CORS_ORIGIN` matches your Vercel URL exactly
- Check for trailing slashes
- Redeploy after changing environment variables

**Problem**: Database connection fails
- Check MongoDB Atlas network access settings
- Verify username/password in connection string
- Ensure database name is included

### Frontend Issues

**Problem**: API calls fail
- Check browser console for CORS errors
- Verify `VITE_API_URL` is correct in Vercel environment variables
- Rebuild and redeploy after changing env vars

**Problem**: Page shows blank
- Check Vercel build logs
- Verify all routes are properly configured
- Check browser console for JavaScript errors

---

## 📊 Monitoring

### Render
- View logs in real-time from Render dashboard
- Monitor uptime and performance
- Set up alerts for downtime

### Vercel
- View analytics in Vercel dashboard
- Check function logs (if using serverless functions)
- Monitor Core Web Vitals

---

## 🔄 Updating Your Application

### Backend Updates
```bash
git push origin main
```
Render will automatically redeploy when you push to GitHub.

### Frontend Updates
```bash
git push origin main
```
Vercel will automatically redeploy when you push to GitHub.

---

## 💰 Cost Estimation

**Free Tier Includes:**
- **Render**: 750 hours/month (enough for 1 service always-on)
- **Vercel**: Unlimited deployments for personal projects
- **MongoDB Atlas**: 512MB storage (free shared RAM)

**Note**: Render free tier services sleep after 15 minutes of inactivity. First request after sleep may take 30-50 seconds to respond.

---

## 📝 Additional Notes

- **MongoDB Atlas Setup**: 
  1. Create cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
  2. Create database user with read/write permissions
  3. Get connection string (use MongoDB for Drivers)
  4. Replace `<password>` with your actual password
  5. Whitelist IP: `0.0.0.0/0` (for Render)

- **Custom Domain** (Optional):
  - Render: Go to Settings → Custom Domain
  - Vercel: Go to Project Settings → Domains

---

## ✅ Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Backend deployed to Render
- [ ] All backend environment variables set
- [ ] Frontend deployed to Vercel
- [ ] All frontend environment variables set
- [ ] CORS configured correctly
- [ ] Tested user signup/login
- [ ] Tested all major features
- [ ] No console errors
- [ ] Performance acceptable

---

## 🆘 Need Help?

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Docs**: https://www.mongodb.com/docs
- **Vite Docs**: https://vitejs.dev/guide/

---

**Good luck with your deployment! 🎉**
