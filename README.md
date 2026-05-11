# Semester Tracker

Full-stack web application for planning and tracking an academic semester: courses, assignments, exams, weekly schedules, notes, and attendance. Students use a dedicated workspace; administrators use a separate console for analytics and user management.

---

## Overview

Semester Tracker is a portfolio-grade **React** single-page app backed by a **Node.js** REST API and **MySQL**. Authentication uses JWTs; the UI supports light and dark themes, responsive layouts, and accessible patterns for forms and navigation.

---

## Tech stack

| Area | Technologies |
|------|----------------|
| **Frontend** | React 19, Vite, Tailwind CSS v4, React Router, Axios, Context API, Recharts, React Hot Toast |
| **Backend** | Node.js, Express, MySQL (`mysql2`), JWT, bcryptjs, express-validator, Helmet, CORS, Morgan |
| **Database** | MySQL 8+ (relational schema, foreign keys, cascades) |

---

## Repository structure

```
Semester-Tracker/
├── frontend/          # Vite + React SPA
├── backend/           # Express REST API (controllers, routes, middleware)
├── backend/database/  # SQL schema, optional seed script
└── README.md
```

---

## Prerequisites

- **Node.js** 20 LTS or newer (recommended)
- **MySQL** 8.x (local instance or remote host you control)
- **npm** (ships with Node)

---

## Setup guide

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd Semester-Tracker
```

### 2. Create the database

Apply the schema (creates the application database and tables). Adjust the MySQL user, host, and path as needed for your environment.

```bash
mysql -u <user> -p < backend/database/schema.sql
```

### 3. Configure environment variables

**Backend** — copy the example file and edit values (never commit real secrets):

```bash
cp backend/.env.example backend/.env
```

Set at minimum:

| Variable | Purpose |
|----------|---------|
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL connection |
| `JWT_SECRET` | Signing key for access tokens (use a long random string; rotate in production) |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `7d`) |
| `FRONTEND_URL` | Allowed browser origin for CORS (e.g. your Vite dev URL or production SPA URL) |
| `PORT` | API listen port (default `5000`) |

**Frontend** — optional for local development:

```bash
cp frontend/.env.example frontend/.env
```

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Absolute API base URL for production builds. Leave empty in dev to use the Vite dev proxy (`/api` → backend). |

### 4. Install and run the API

```bash
cd backend
npm install
npm run dev
```

The API listens on the port defined in `backend/.env` (default **http://localhost:5000**).

### 5. Install and run the SPA

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The dev server runs at **http://localhost:5173** by default and proxies `/api` to the backend (`VITE_API_PROXY` can override the proxy target in `frontend/vite.config.js`).

### 6. (Optional) Local sample data

For UI and integration testing only, you may run the provided seed script after the schema exists and `.env` is configured:

```bash
cd backend
npm run seed
```

Review `backend/database/seed.js` to understand what it inserts or resets. **Do not use default seed identities or passwords in production**; create real users through your registration flow or secure provisioning.

---

## Application routes (high level)

- **Students** — authenticated area under `/student` (dashboard, courses, assignments, exams, schedule, notes, semester tools).
- **Administrators** — authenticated area under `/admin` (analytics, user directory, account actions).
- **Public** — marketing and legal pages at `/`, `/login`, `/register`, `/about`, `/privacy`, `/terms`, etc.

Post-login redirects are role-based (student vs admin).

---

## NPM scripts

| Location | Command | Description |
|----------|---------|-------------|
| `backend/` | `npm run dev` | Start API with file watcher (nodemon) |
| `backend/` | `npm start` | Start API (Node) |
| `backend/` | `npm run seed` | Optional: populate sample rows (development only) |
| `frontend/` | `npm run dev` | Vite dev server with HMR |
| `frontend/` | `npm run build` | Production build to `frontend/dist` |
| `frontend/` | `npm run preview` | Preview production build locally |

---

## API reference

Route-level documentation lives in [`backend/API_DOCS.md`](backend/API_DOCS.md).

---

## Production checklist

- Use strong, unique `JWT_SECRET` values and keep them out of version control.
- Serve the API over **HTTPS** and restrict **CORS** to known SPA origins (`FRONTEND_URL`).
- Build the frontend (`npm run build` in `frontend/`) and deploy `dist/` behind your CDN or reverse proxy alongside or in front of the API.
- Run database migrations or schema updates through your own controlled process; avoid running development seed scripts against production databases.

---

## License

MIT — see repository license terms for use in portfolios, coursework, and demos.
