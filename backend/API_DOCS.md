# Semester Tracker API

Base URL: `http://localhost:5000/api` (development)

Unless noted, routes require header:

```
Authorization: Bearer <JWT>
```

Responses are JSON. Successful payloads typically use `{ "success": true, "data": ... }`. Validation errors return `400` with `{ "success": false, "errors": [...] }`.

---

## Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | No | API metadata |

---

## Auth

| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | `{ email, password, firstName?, lastName? }` | Create user, returns JWT |
| POST | `/api/auth/login` | `{ email, password }` | Login, updates `last_login_at` |
| GET | `/api/auth/me` | — | Current user profile |

---

## Users

| Method | Path | Body | Description |
|--------|------|------|-------------|
| PUT | `/api/users/profile` | `{ firstName?, lastName? }` | Update profile |
| PUT | `/api/users/password` | `{ currentPassword, newPassword }` | Change password |

---

## Semesters

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/semesters` | List user semesters |
| GET | `/api/semesters/:id` | Detail |
| POST | `/api/semesters` | Create (`name`, optional `academicYear`, `startDate`, `endDate`, `isCurrent`) |
| PUT | `/api/semesters/:id` | Update |
| DELETE | `/api/semesters/:id` | Delete |

---

## Courses

| Method | Path | Query | Description |
|--------|------|-------|-------------|
| GET | `/api/courses` | `page`, `limit`, `search`, `sort`, `order` | Paginated list |
| GET | `/api/courses/:id` | — | Detail |
| POST | `/api/courses` | JSON body | Create |
| PUT | `/api/courses/:id` | JSON body | Update |
| DELETE | `/api/courses/:id` | — | Delete (cascades child rows) |

**Body fields (camelCase):** `title`, `code`, `instructor`, `credit`, `semesterId`, `semesterLabel`, `weeklyClassFrequency`, `classDays`, `classStartTime`, `classEndTime`, `room`, `color`

---

## Assignments

| Method | Path | Query | Description |
|--------|------|-------|-------------|
| GET | `/api/assignments` | `page`, `limit`, `status`, `courseId`, `priority`, `sort`, `order` | List |
| GET | `/api/assignments/:id` | — | Detail |
| POST | `/api/assignments` | body | Create |
| PUT | `/api/assignments/:id` | body | Update |
| DELETE | `/api/assignments/:id` | — | Delete |

**Body:** `courseId`, `title`, `deadline` (ISO), `submissionStatus`, `marksObtained`, `totalMarks`, `notes`, `priority`

---

## Exams

| Method | Path | Query | Description |
|--------|------|-------|-------------|
| GET | `/api/exams` | `page`, `limit`, `courseId`, `from`, `to`, `sort`, `order` | List |
| GET | `/api/exams/:id` | — | Detail |
| POST | `/api/exams` | body | Create |
| PUT | `/api/exams/:id` | body | Update |
| DELETE | `/api/exams/:id` | — | Delete |

**Body:** `courseId`, `title`, `examType`, `examDate` (YYYY-MM-DD), `marks`, `notes` (stored marks only; no GPA fields used)

---

## Schedules

| Method | Path | Query | Description |
|--------|------|-------|-------------|
| GET | `/api/schedules` | `day`, `courseId` | Weekly blocks |
| GET | `/api/schedules/:id` | — | Detail |
| POST | `/api/schedules` | body | Create |
| PUT | `/api/schedules/:id` | body | Update |
| DELETE | `/api/schedules/:id` | — | Delete |

**Body:** `courseId`, `dayOfWeek` (`monday`…`sunday`), `startTime` (`HH:MM` or `HH:MM:SS`), `durationMinutes`, `room`, `teacher`

---

## Notes

| Method | Path | Query | Description |
|--------|------|-------|-------------|
| GET | `/api/notes/categories` | — | Distinct categories |
| GET | `/api/notes` | `page`, `limit`, `q`, `category`, `sort`, `order` | List (excerpt) |
| GET | `/api/notes/:id` | — | Full note |
| POST | `/api/notes` | `{ title, content, category? }` | Create |
| PUT | `/api/notes/:id` | partial | Update |
| DELETE | `/api/notes/:id` | — | Delete |

---

## Attendance

| Method | Path | Query | Description |
|--------|------|-------|-------------|
| GET | `/api/attendance/summary` | — | Aggregate percentages |
| GET | `/api/attendance` | `courseId`, `from`, `to` | Sessions |
| POST | `/api/attendance` | `{ courseId, sessionDate, status?, notes? }` | Upsert by `(user,course,date)` |
| PUT | `/api/attendance/:id` | partial | Update row |
| DELETE | `/api/attendance/:id` | — | Delete |

---

## Dashboard

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dashboard/stats` | Semester progress, assignment counts, upcoming exams, attendance %, credits, classes-by-course |

---

## Admin (requires `role = admin`)

| Method | Path | Query | Description |
|--------|------|-------|-------------|
| GET | `/api/admin/analytics` | — | System totals + recent users |
| GET | `/api/admin/users` | `page`, `limit`, `q`, `role` | Paginated directory |
| DELETE | `/api/admin/users/:id` | — | Delete user (cannot delete self) |

---

## Error codes

| Status | Meaning |
|--------|---------|
| 400 | Validation / bad input |
| 401 | Missing or invalid JWT |
| 403 | Authenticated but not admin on admin route |
| 404 | Resource not found |
| 409 | Conflict (e.g. duplicate email) |
| 500 | Unhandled server error |
