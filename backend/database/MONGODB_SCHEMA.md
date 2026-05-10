# Semester Tracker — MongoDB data model (copy / paste reference)

In MongoDB there are **no SQL tables**. The equivalent is **8 collections** (one per logical entity below).  
Use BSON types: **ObjectId**, **String**, **Number** (use `Double` for decimals), **Boolean**, **Date**, **Null**.

**Conventions**

- Every document has **`_id`** (ObjectId), auto-generated unless you set it.
- Foreign keys are stored as **ObjectId** fields (e.g. `userId`, `courseId`).
- Timestamps: **`createdAt`**, **`updatedAt`** as **Date** (set in application code or via Mongoose timestamps).
- **`__v`** may appear if you use Mongoose — optional.

---

## Summary: how many?

| # | Collection name   | Purpose                          |
|---|-------------------|----------------------------------|
| 1 | `users`           | Accounts, auth, roles            |
| 2 | `semesters`       | Per-user academic terms          |
| 3 | `courses`         | Per-user courses                 |
| 4 | `assignments`     | Per-user assignments             |
| 5 | `exams`           | Per-user exams                   |
| 6 | `schedules`       | Weekly class blocks              |
| 7 | `notes`           | Per-user notes                   |
| 8 | `attendance`      | Per-session attendance rows      |

**Total: 8 collections.**

---

## 1) Collection: `users`

| Attribute        | Type      | Required | Default        | Details |
|------------------|-----------|----------|----------------|---------|
| `_id`            | ObjectId  | auto     | —              | Primary key |
| `email`          | String    | yes      | —              | Unique, lowercase normalized in app |
| `passwordHash`   | String    | yes      | —              | bcrypt hash |
| `firstName`      | String    | yes*     | `""`           | *At least empty string if omitted |
| `lastName`       | String    | yes*     | `""`           | *At least empty string if omitted |
| `role`           | String    | yes      | `"user"`       | Allowed: `"user"` \| `"admin"` |
| `isActive`       | Boolean   | yes      | `true`         | Soft-disable account |
| `lastLoginAt`    | Date \| null | no    | `null`         | Last successful login |
| `createdAt`      | Date      | yes      | now            | Document creation |
| `updatedAt`      | Date      | yes      | now            | Last update |

**Recommended indexes**

- Unique: `{ email: 1 }`
- Optional: `{ role: 1 }`, `{ isActive: 1 }`, `{ lastLoginAt: -1 }`

---

## 2) Collection: `semesters`

| Attribute       | Type           | Required | Default   | Details |
|-----------------|----------------|----------|-----------|---------|
| `_id`           | ObjectId       | auto     | —         | Primary key |
| `userId`        | ObjectId       | yes      | —         | FK → `users._id` |
| `name`          | String         | yes      | —         | Max length ~120 |
| `academicYear`  | String \| null | no       | `null`    | e.g. `"2025-2026"` |
| `startDate`     | Date \| null   | no       | `null`    | Start of term (date only in app) |
| `endDate`       | Date \| null   | no       | `null`    | End of term |
| `isCurrent`     | Boolean        | yes      | `false`   | Only one should be “current” per user (enforce in app) |
| `createdAt`     | Date           | yes      | now       | |
| `updatedAt`     | Date           | yes      | now       | |

**Recommended indexes**

- `{ userId: 1 }`
- `{ userId: 1, isCurrent: 1 }`

---

## 3) Collection: `courses`

| Attribute                 | Type           | Required | Default     | Details |
|---------------------------|----------------|----------|-------------|---------|
| `_id`                     | ObjectId       | auto     | —           | Primary key |
| `userId`                  | ObjectId       | yes      | —           | FK → `users._id` |
| `semesterId`              | ObjectId \| null | no     | `null`      | FK → `semesters._id` |
| `title`                   | String         | yes      | —           | Max ~255 |
| `code`                    | String         | yes      | —           | Max ~64, course code |
| `instructor`              | String \| null | no       | `null`      | |
| `credit`                  | Number         | yes      | `3`         | e.g. `3` or `3.5` |
| `semesterLabel`           | String \| null | no       | `null`      | Free text label |
| `weeklyClassFrequency`    | Number (int)   | yes      | `1`         | 1–14 |
| `classDays`               | String \| null | no       | `null`      | e.g. `"Mon,Wed,Fri"` |
| `classStartTime`          | String \| null | no       | `null`      | Store as `"HH:mm"` or `"HH:mm:ss"` |
| `classEndTime`            | String \| null | no       | `null`      | Same as start |
| `room`                    | String \| null | no       | `null`      | |
| `color`                   | String         | yes      | `"#6366f1"` | Hex tag color |
| `createdAt`               | Date           | yes      | now         | |
| `updatedAt`               | Date           | yes      | now         | |

**Recommended indexes**

- `{ userId: 1 }`
- `{ userId: 1, semesterId: 1 }`
- Text or regex: optional text index on `title` + `code` for search

---

## 4) Collection: `assignments`

| Attribute           | Type           | Required | Default      | Details |
|---------------------|----------------|----------|--------------|---------|
| `_id`               | ObjectId       | auto     | —            | Primary key |
| `userId`            | ObjectId       | yes      | —            | FK → `users._id` |
| `courseId`          | ObjectId       | yes      | —            | FK → `courses._id` |
| `title`             | String         | yes      | —            | Max ~255 |
| `deadline`          | Date           | yes      | —            | Full datetime |
| `submissionStatus`  | String         | yes      | `"pending"`  | `"pending"` \| `"submitted"` \| `"graded"` \| `"late"` |
| `marksObtained`     | Number \| null | no       | `null`       | |
| `totalMarks`        | Number \| null | no       | `null`       | |
| `notes`             | String \| null | no       | `null`       | Long text ok |
| `priority`          | String         | yes      | `"medium"`   | `"low"` \| `"medium"` \| `"high"` |
| `createdAt`         | Date           | yes      | now          | |
| `updatedAt`         | Date           | yes      | now          | |

**Recommended indexes**

- `{ userId: 1 }`
- `{ courseId: 1 }`
- `{ userId: 1, deadline: 1 }`
- `{ userId: 1, submissionStatus: 1 }`

---

## 5) Collection: `exams`

| Attribute   | Type           | Required | Default     | Details |
|-------------|----------------|----------|-------------|---------|
| `_id`       | ObjectId       | auto     | —           | Primary key |
| `userId`    | ObjectId       | yes      | —           | FK → `users._id` |
| `courseId`  | ObjectId       | yes      | —           | FK → `courses._id` |
| `title`     | String         | yes      | —           | Max ~255 |
| `examType`  | String         | yes      | `"midterm"` | e.g. midterm, final, quiz |
| `examDate`  | Date           | yes      | —           | Date-only semantics in app |
| `marks`     | Number \| null | no       | `null`      | |
| `gpaGrade`  | String \| null | no       | `null`      | e.g. `"A-"`, `"3.7"` |
| `notes`     | String \| null | no       | `null`      | |
| `createdAt` | Date           | yes      | now         | |
| `updatedAt` | Date           | yes      | now         | |

**Recommended indexes**

- `{ userId: 1 }`
- `{ courseId: 1 }`
- `{ userId: 1, examDate: 1 }`

---

## 6) Collection: `schedules`

| Attribute          | Type           | Required | Default | Details |
|--------------------|----------------|----------|---------|---------|
| `_id`              | ObjectId       | auto     | —       | Primary key |
| `userId`           | ObjectId       | yes      | —       | FK → `users._id` |
| `courseId`         | ObjectId       | yes      | —       | FK → `courses._id` |
| `dayOfWeek`        | String         | yes      | —       | `"monday"` … `"sunday"` (lowercase) |
| `startTime`        | String         | yes      | —       | `"HH:mm"` or `"HH:mm:ss"` |
| `durationMinutes`  | Number (int)   | yes      | `60`    | 15–600 |
| `room`             | String \| null | no       | `null`  | |
| `teacher`          | String \| null | no       | `null`  | |
| `createdAt`        | Date           | yes      | now     | |
| `updatedAt`        | Date           | yes      | now     | |

**Recommended indexes**

- `{ userId: 1 }`
- `{ userId: 1, dayOfWeek: 1 }`

---

## 7) Collection: `notes`

| Attribute   | Type           | Required | Default | Details |
|-------------|----------------|----------|---------|---------|
| `_id`       | ObjectId       | auto     | —       | Primary key |
| `userId`    | ObjectId       | yes      | —       | FK → `users._id` |
| `title`     | String         | yes      | —       | Max ~255 |
| `content`   | String         | yes      | —       | Long text |
| `category`  | String \| null | no       | `null`  | Max ~120 |
| `createdAt` | Date           | yes      | now     | |
| `updatedAt` | Date           | yes      | now     | |

**Recommended indexes**

- `{ userId: 1 }`
- `{ userId: 1, category: 1 }`
- Text index: `{ title: "text", content: "text" }` (optional, for search)

---

## 8) Collection: `attendance`

| Attribute     | Type           | Required | Default     | Details |
|---------------|----------------|----------|-------------|---------|
| `_id`         | ObjectId       | auto     | —           | Primary key |
| `userId`      | ObjectId       | yes      | —           | FK → `users._id` |
| `courseId`    | ObjectId       | yes      | —           | FK → `courses._id` |
| `sessionDate` | Date           | yes      | —           | One row per user+course+day |
| `status`      | String         | yes      | `"present"` | `"present"` \| `"absent"` \| `"excused"` \| `"late"` |
| `notes`       | String \| null | no       | `null`      | Max ~500 |
| `createdAt`   | Date           | yes      | now         | |
| `updatedAt`   | Date           | yes      | now         | |

**Recommended indexes**

- **Unique compound**: `{ userId: 1, courseId: 1, sessionDate: 1 }` (same as SQL unique session)
- `{ userId: 1 }`

---

## Relationships (mental model)

- **User** 1 ── * **Semesters**, **Courses**, **Assignments**, **Exams**, **Schedules**, **Notes**, **Attendance**
- **Semester** * ── 1 **User**; **Course** optionally * ── 1 **Semester**
- **Course** 1 ── * **Assignments**, **Exams**, **Schedules**, **Attendance**

Deleting a **user**: delete (or cascade in app code) all child docs where `userId` matches.

Deleting a **course**: delete all **assignments**, **exams**, **schedules**, **attendance** with that `courseId`.

---

## Note about this repository

The current **backend uses MySQL** (`mysql2` + `schema.sql`). MongoDB layout above mirrors the **same logical model**. To run the app on MongoDB you would replace the DB layer with **Mongoose** or the **MongoDB Node driver** and map these collections to your models.
