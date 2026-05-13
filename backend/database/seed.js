/**
 * Seeds sample users and academic data for local development.
 * Run after applying schema.sql: `npm run seed`
 */
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'semester_tracker',
    multipleStatements: true,
  });

  const passwordHash = await bcrypt.hash('Password123!', 12);

  const [adminRows] = await conn.query(`SELECT id FROM users WHERE email = 'admin@semestertracker.dev'`);
  let adminId;
  if (adminRows.length) {
    adminId = adminRows[0].id;
    await conn.query(`UPDATE users SET password_hash = ?, role = 'admin' WHERE id = ?`, [passwordHash, adminId]);
  } else {
    const [r] = await conn.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES ('admin@semestertracker.dev', ?, 'System', 'Admin', 'admin')`,
      [passwordHash]
    );
    adminId = r.insertId;
  }

  const [userRows] = await conn.query(`SELECT id FROM users WHERE email = 'demo@semestertracker.dev'`);
  let userId;
  if (userRows.length) {
    userId = userRows[0].id;
    await conn.query(`UPDATE users SET password_hash = ? WHERE id = ?`, [passwordHash, userId]);
  } else {
    const [r] = await conn.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES ('demo@semestertracker.dev', ?, 'Alex', 'Student', 'user')`,
      [passwordHash]
    );
    userId = r.insertId;
  }

  await conn.query(`DELETE FROM semesters WHERE user_id = ?`, [userId]);
  const [sem] = await conn.query(
    `INSERT INTO semesters (user_id, name, academic_year, start_date, end_date, is_current)
     VALUES (?, 'Spring 2026', '2025-2026', '2026-01-15', '2026-05-20', TRUE)`,
    [userId]
  );
  const semesterId = sem.insertId;

  await conn.query(`DELETE FROM courses WHERE user_id = ?`, [userId]);

  const [c1] = await conn.query(
    `INSERT INTO courses (user_id, semester_id, title, code, instructor, credit, semester_label, weekly_class_frequency, class_days, class_start_time, class_end_time, room, color)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      userId,
      semesterId,
      'Data Structures',
      'CS-201',
      'Dr. Morgan',
      4,
      'Spring 2026',
      3,
      'Mon,Wed,Fri',
      '10:00:00',
      '11:15:00',
      'Hall B204',
      '#6366f1',
    ]
  );
  const [c2] = await conn.query(
    `INSERT INTO courses (user_id, semester_id, title, code, instructor, credit, semester_label, weekly_class_frequency, class_days, class_start_time, class_end_time, room, color)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      userId,
      semesterId,
      'Linear Algebra',
      'MATH-240',
      'Prof. Chen',
      3,
      'Spring 2026',
      2,
      'Tue,Thu',
      '13:00:00',
      '14:20:00',
      'North 112',
      '#ec4899',
    ]
  );
  const course1 = c1.insertId;
  const course2 = c2.insertId;

  await conn.query(`DELETE FROM assignments WHERE user_id = ?`, [userId]);
  await conn.query(
    `INSERT INTO assignments (user_id, course_id, title, deadline, submission_status, marks_obtained, total_marks, notes, priority) VALUES
     (?,?,?,?,?,?,?,?,?),
     (?,?,?,?,?,?,?,?,?)`,
    [
      userId,
      course1,
      'Binary Trees Lab',
      '2026-05-15 23:59:00',
      'pending',
      null,
      100,
      'Implement traversals',
      'high',
      userId,
      course2,
      'Problem Set 6',
      '2026-05-12 09:00:00',
      'submitted',
      null,
      50,
      '',
      'medium',
    ]
  );

  await conn.query(`DELETE FROM exams WHERE user_id = ?`, [userId]);
  await conn.query(
    `INSERT INTO exams (user_id, course_id, title, exam_type, exam_date, marks, gpa_grade, notes) VALUES
     (?,?,?,?,?,?,?,?)`,
    [userId, course1, 'Midterm Exam', 'midterm', '2026-05-18', 88, null, 'Focus on graphs']
  );

  await conn.query(`DELETE FROM schedules WHERE user_id = ?`, [userId]);
  await conn.query(
    `INSERT INTO schedules (user_id, course_id, day_of_week, start_time, duration_minutes, room, teacher) VALUES
     (?,?,?,?,?,?,?),
     (?,?,?,?,?,?,?)`,
    [
      userId,
      course1,
      'monday',
      '10:00:00',
      75,
      'Hall B204',
      'Dr. Morgan',
      userId,
      course2,
      'tuesday',
      '13:00:00',
      80,
      'North 112',
      'Prof. Chen',
    ]
  );

  await conn.query(`DELETE FROM notes WHERE user_id = ?`, [userId]);
  await conn.query(
    `INSERT INTO notes (user_id, title, content, category, link_url) VALUES (?,?,?,?,?)`,
    [
      userId,
      'Exam checklist',
      'Review sorting, hashing, and graph algorithms.',
      'urgent',
      'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort',
    ]
  );

  await conn.query(`DELETE FROM attendance WHERE user_id = ?`, [userId]);
  await conn.query(
    `INSERT INTO attendance (user_id, course_id, session_date, status) VALUES (?,?,?,?), (?,?,?,?)`,
    [userId, course1, '2026-05-01', 'present', userId, course1, '2026-05-03', 'present']
  );

  console.log('Seed complete.');
  console.log('  Admin: admin@semestertracker.dev / Password123!');
  console.log('  Demo:  demo@semestertracker.dev / Password123!');
  await conn.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
