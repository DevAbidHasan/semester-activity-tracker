# Semester Tracker

Portfolio-ready, full-stack **academic semester management** application. Registered students organize courses, assignments, exams, weekly schedules, notes, and attendance. Admins get a separate analytics dashboard.

## Stack

| Layer    | Technologies |
|----------|----------------|
| Frontend | React 19 (Vite), Tailwind CSS v4, React Router, Axios, Context API, React Icons, Recharts, React Hot Toast |
| Backend  | Node.js, Express, MySQL (mysql2 pool), JWT, bcryptjs, express-validator, Helmet, CORS, Morgan |
| Database | MySQL 8+ with relational schema and cascades |

## Repository layout

```
Semester-Tracker/
├── frontend/     # Vite + React SPA
├── backend/      # REST API (MVC-style folders)
└── README.md
```

## Prerequisites

- **Node.js** 20+ recommended  
- **MySQL** 8.x (local or remote)

## 1. Database setup

Create the schema (creates database `semester_tracker` and all tables):

```bash
mysql -u root -p < backend/database/schema.sql
```

Copy environment files and edit credentials:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `backend/.env` with your MySQL user, password, and database name. The repo expects database **`semester_tracker`** (see `DB_NAME`). If `backend/.env` is missing, copy from `.env.example` and fill in `DB_PASSWORD` (your MySQL user’s password—not a separate “database password” unless you configured one that way). Also set a long `JWT_SECRET` for anything beyond local dev.

## 2. Backend

```bash
cd backend
npm install
npm run seed    # demo + admin accounts and sample academic rows
npm run dev     # http://localhost:5000
```

**Seed accounts**

| Role  | Email                     | Password     |
|-------|---------------------------|--------------|
| Admin | admin@semestertracker.dev | Password123! |
| User  | demo@semestertracker.dev  | Password123! |

The seed script clears prior demo rows for the demo user and repopulates courses, assignments, exams, schedules, notes, and attendance.

## 3. Frontend

```bash
cd frontend
npm install
npm run dev     # http://localhost:5173
```

The Vite dev server proxies `/api` to `http://localhost:5000` (override with `VITE_API_PROXY` in `vite.config.js` if needed). For production, set `VITE_API_URL` to your API origin.

**App routes (SPA):** students use **`/student`** and nested paths (e.g. `/student/courses`). Admins use **`/admin`** only. Old **`/dashboard…`** URLs redirect to the matching **`/student…`** path. After login, admins are sent to `/admin`, students to `/student`.

## Features (high level)

- JWT auth with **localStorage** persistence, Axios **interceptors**, protected routes, **user/admin** roles  
- **Dashboard**: stats cards, charts (Recharts), upcoming exams, glassmorphism UI, dark/light/system theme  
- **CRUD**: courses, assignments, exams, schedules, notes, semesters, attendance  
- **Semester tracker** page: progress, calculators, quick attendance logging  
- **Admin**: user list with search/pagination, delete users, system-wide analytics  
- **UX**: toasts, loading states, empty states, responsive tables, mobile drawer navigation  

## API documentation

See [`backend/API_DOCS.md`](backend/API_DOCS.md) for route-level reference.

## Production notes

- Rotate `JWT_SECRET` and use HTTPS in production.  
- Tune CORS `FRONTEND_URL` to your deployed SPA origin.  
- Run `npm run build` in `frontend` and serve `frontend/dist` via a static host or the same reverse proxy as the API.

## License

MIT — suitable for portfolios and classroom demos.
