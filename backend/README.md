# TechClub Portal Backend

## Setup

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

