# Threaded comments (MERN)

Full-stack nested comment threads with JWT auth, React Context, REST API, Tailwind UI, and Socket.io for live updates.

## Structure

- `server/` — Express, Mongoose, JWT, bcrypt, Socket.io
- `client/` — Vite + React, React Router, Axios, Tailwind, Context API

## Prerequisites

- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

## Quick start (recommended)

From the project root:

```bash
npm install
cd server && cp .env.example .env && cd ..
# Edit server/.env and set JWT_SECRET at minimum.
npm run dev
```

This starts the API on port **5000** and the Vite app on **5173**. If `MONGO_URI` is missing or points at MongoDB that is not running, the API uses an **in-memory MongoDB** in development so the site still works.

## Run server and client separately

```bash
# Terminal A
cd server && npm install && cp .env.example .env
npm run dev
```

```bash
# Terminal B
cd client && npm install
npm run dev
```

### Production API URL

Create `client/.env` with:

```env
VITE_API_URL=https://your-api.example.com
```

Leave unset for local development so requests use the Vite proxy.

## API

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/auth/register` | No |
| POST | `/api/auth/login` | No |
| GET | `/api/comments?page=1&limit=10` | Optional (Bearer for vote state) |
| POST | `/api/comments` | Yes |
| POST | `/api/comments/:id/reply` | Yes |
| PUT | `/api/comments/:id` | Yes (owner) |
| DELETE | `/api/comments/:id` | Yes (owner) |
| POST | `/api/comments/:id/like` | Yes |
| POST | `/api/comments/:id/dislike` | Yes |

## Deployment notes

- **Backend (Render / Railway):** set `PORT`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (your frontend origin for CORS and Socket.io).
- **Frontend (Vercel / Netlify):** set `VITE_API_URL` to the public API URL; ensure the API allows that origin in CORS.
- **MongoDB Atlas:** whitelist your host IP or `0.0.0.0/0` for managed hosting; use the SRV connection string in `MONGO_URI`.

## Features

- Nested replies with indentation and collapse-friendly layout
- Like / dislike (toggle per user)
- Edit / delete for the author (delete removes the whole subtree)
- Pagination for root threads plus “load more”; optional infinite scroll via intersection observer
- Relative timestamps (`date-fns`)
- JWT in `localStorage`
- Real-time refresh via Socket.io when comments change
