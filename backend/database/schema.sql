-- Semester Tracker — MySQL schema
-- Run: mysql -u root -p < database/schema.sql

CREATE DATABASE IF NOT EXISTS semester_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE semester_tracker;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL DEFAULT '',
  last_name VARCHAR(100) NOT NULL DEFAULT '',
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_active (is_active),
  INDEX idx_users_last_login (last_login_at)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- semesters (per user)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS semesters (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  academic_year VARCHAR(32) NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_semesters_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_semesters_user (user_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- courses
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS courses (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  semester_id INT UNSIGNED NULL,
  title VARCHAR(255) NOT NULL,
  code VARCHAR(64) NOT NULL,
  instructor VARCHAR(255) NULL,
  credit DECIMAL(5,2) NOT NULL DEFAULT 3.00,
  semester_label VARCHAR(120) NULL,
  weekly_class_frequency TINYINT UNSIGNED NOT NULL DEFAULT 1,
  class_days VARCHAR(255) NULL,
  class_start_time TIME NULL,
  class_end_time TIME NULL,
  room VARCHAR(120) NULL,
  color VARCHAR(32) NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_courses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_courses_semester FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE SET NULL,
  INDEX idx_courses_user (user_id),
  INDEX idx_courses_semester (semester_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- assignments
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assignments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  course_id INT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  deadline DATETIME NOT NULL,
  submission_status ENUM('pending','submitted','graded','late') NOT NULL DEFAULT 'pending',
  marks_obtained DECIMAL(7,2) NULL,
  total_marks DECIMAL(7,2) NULL,
  notes TEXT NULL,
  priority ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_assignments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_assignments_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  INDEX idx_assignments_user (user_id),
  INDEX idx_assignments_course (course_id),
  INDEX idx_assignments_deadline (deadline)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- exams
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS exams (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  course_id INT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  exam_type VARCHAR(80) NOT NULL DEFAULT 'midterm',
  exam_date DATE NOT NULL,
  marks DECIMAL(7,2) NULL,
  gpa_grade VARCHAR(16) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_exams_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_exams_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  INDEX idx_exams_user (user_id),
  INDEX idx_exams_course (course_id),
  INDEX idx_exams_date (exam_date)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- schedules (weekly timetable rows)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schedules (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  course_id INT UNSIGNED NOT NULL,
  day_of_week ENUM('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL,
  start_time TIME NOT NULL,
  duration_minutes SMALLINT UNSIGNED NOT NULL DEFAULT 60,
  room VARCHAR(120) NULL,
  teacher VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_schedules_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_schedules_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  INDEX idx_schedules_user (user_id),
  INDEX idx_schedules_day (day_of_week)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- notes
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  content MEDIUMTEXT NOT NULL,
  category VARCHAR(120) NULL,
  link_url VARCHAR(2000) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_notes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notes_user (user_id),
  FULLTEXT idx_notes_search (title, content)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- attendance (per course session)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  course_id INT UNSIGNED NOT NULL,
  session_date DATE NOT NULL,
  status ENUM('present','absent','excused','late') NOT NULL DEFAULT 'present',
  notes VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_attendance_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_attendance_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE KEY uq_attendance_session (user_id, course_id, session_date),
  INDEX idx_attendance_user (user_id)
) ENGINE=InnoDB;
