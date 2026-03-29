# 🚀 Quick Deployment Checklist

## Backend (Render)

### Environment Variables to Set in Render Dashboard:
```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/techclub
JWT_SECRET=your-32-character-secret-key-here
CORS_ORIGIN=https://your-app.vercel.app
FRONTEND_URL=https://your-app.vercel.app
```

### Build Settings:
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Root Directory**: `techclub-portal/backend`

---

## Frontend (Vercel)

### Environment Variables to Set in Vercel Dashboard:
```
VITE_API_URL=https://your-backend.onrender.com
```

### Build Settings:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Root Directory**: `techclub-portal/frontend`

---

## Quick Steps

1. ✅ Create MongoDB Atlas cluster → Get connection string
2. ✅ Push code to GitHub
3. ✅ Deploy backend to Render → Copy URL
4. ✅ Update CORS_ORIGIN in Render with future Vercel URL
5. ✅ Deploy frontend to Vercel → Copy URL  
6. ✅ Update CORS_ORIGIN in Render with actual Vercel URL
7. ✅ Test everything!

---

## Important URLs After Deployment

- **Backend API**: https://your-backend.onrender.com
- **Frontend**: https://your-app.vercel.app
- **MongoDB Atlas**: https://cloud.mongodb.com

---

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| CORS Error | Update CORS_ORIGIN in Render with exact Vercel URL |
| Can't connect to DB | Check MongoDB Atlas network access & credentials |
| Blank page | Check Vercel build logs, verify env vars |
| Slow first load | Render free tier sleeps - wait 30-50s for cold start |

---

## Testing Commands

**Test Backend:**
```bash
curl https://your-backend.onrender.com
```

Expected response:
```json
{"msg":"TechClub Portal API is running","status":"healthy"}
```

**Test Locally:**
```bash
# Backend
cd techclub-portal/backend
npm install
npm start

# Frontend (new terminal)
cd techclub-portal/frontend
npm install
npm run dev
```
