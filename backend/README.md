# TechClub Portal Backend

## 🚀 Deployment Ready!

This backend is configured for deployment on **Render**. See the main [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) for complete instructions.

## Quick Deploy

1. Push code to GitHub
2. Connect repo to Render
3. Set root directory: `techclub-portal/backend`
4. Build: `npm install`, Start: `npm start`
5. Add environment variables (see below)

## Environment Variables

Required for production:
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/techclub
JWT_SECRET=your-32-character-secret
CORS_ORIGIN=https://your-app.vercel.app
FRONTEND_URL=https://your-app.vercel.app
```

## Local Development

1. Copy `.env.example` to `.env` and fill values.
2. Install deps:
   - `npm.cmd install --cache .npm-cache`
3. Run:
   - `npm.cmd run dev` (or `npm.cmd start`)

## API (high level)

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/user/profile` (auth)
- `GET /api/user/leaderboard`
- `GET /api/events`
- `POST /api/events` (admin)
- `DELETE /api/events/:id` (admin)
- `POST /api/events/:id/register` (auth)
- `POST /api/events/:id/attend` (admin)

## Health Check

Visit `/` to see API status.

---

**For detailed deployment instructions, see:**
- [Main Deployment Guide](../DEPLOYMENT_GUIDE.md)
- [Quick Deploy Guide](../QUICK_DEPLOY.md)
- [Deployment Checklist](../DEPLOYMENT_CHECKLIST.md)