-- Demo attendance for dashboard / classes UI (relative to CURDATE()).
-- Edit @demo_email if needed. Requires that user to exist with at least one course.

SET @demo_email = 'demo@semestertracker.dev';

SET @uid := (SELECT id FROM users WHERE email = @demo_email LIMIT 1);
SET @c1 := (SELECT id FROM courses WHERE user_id = @uid ORDER BY id ASC LIMIT 1);
SET @c2 := (SELECT id FROM courses WHERE user_id = @uid ORDER BY id ASC LIMIT 1 OFFSET 1);
SET @c2 := IFNULL(@c2, @c1);

INSERT INTO attendance (user_id, course_id, session_date, status, notes) VALUES
  (@uid, @c1, DATE_SUB(CURDATE(), INTERVAL  0 DAY), 'present',  'Demo'),
  (@uid, @c2, DATE_SUB(CURDATE(), INTERVAL  0 DAY), 'late',     'Demo'),
  (@uid, @c1, DATE_SUB(CURDATE(), INTERVAL  1 DAY), 'present',  'Demo'),
  (@uid, @c2, DATE_SUB(CURDATE(), INTERVAL  1 DAY), 'present',  'Demo'),
  (@uid, @c1, DATE_SUB(CURDATE(), INTERVAL  2 DAY), 'present',  'Demo'),
  (@uid, @c2, DATE_SUB(CURDATE(), INTERVAL  3 DAY), 'absent',   'Demo'),
  (@uid, @c1, DATE_SUB(CURDATE(), INTERVAL  4 DAY), 'late',     'Demo'),
  (@uid, @c2, DATE_SUB(CURDATE(), INTERVAL  5 DAY), 'present',  'Demo'),
  (@uid, @c1, DATE_SUB(CURDATE(), INTERVAL  6 DAY), 'present',  'Demo'),
  (@uid, @c2, DATE_SUB(CURDATE(), INTERVAL  7 DAY), 'present',  'Demo'),
  (@uid, @c1, DATE_SUB(CURDATE(), INTERVAL  8 DAY), 'excused',  'Demo'),
  (@uid, @c2, DATE_SUB(CURDATE(), INTERVAL  9 DAY), 'present',  'Demo'),
  (@uid, @c1, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'present',  'Demo'),
  (@uid, @c2, DATE_SUB(CURDATE(), INTERVAL 11 DAY), 'late',     'Demo'),
  (@uid, @c1, DATE_SUB(CURDATE(), INTERVAL 12 DAY), 'present',  'Demo'),
  (@uid, @c2, DATE_SUB(CURDATE(), INTERVAL 13 DAY), 'present',  'Demo'),
  (@uid, @c1, DATE_SUB(CURDATE(), INTERVAL 14 DAY), 'present',  'Demo'),
  (@uid, @c2, DATE_SUB(CURDATE(), INTERVAL 15 DAY), 'absent',   'Demo'),
  (@uid, @c1, DATE_SUB(CURDATE(), INTERVAL 16 DAY), 'present',  'Demo'),
  (@uid, @c2, DATE_SUB(CURDATE(), INTERVAL 17 DAY), 'present',  'Demo'),
  (@uid, @c1, DATE_SUB(CURDATE(), INTERVAL 18 DAY), 'late',     'Demo'),
  (@uid, @c2, DATE_SUB(CURDATE(), INTERVAL 19 DAY), 'present',  'Demo'),
  (@uid, @c1, DATE_SUB(CURDATE(), INTERVAL 20 DAY), 'present',  'Demo'),
  (@uid, @c2, DATE_SUB(CURDATE(), INTERVAL 21 DAY), 'present',  'Demo'),
  (@uid, @c1, DATE_SUB(CURDATE(), INTERVAL 22 DAY), 'present',  'Demo'),
  (@uid, @c2, DATE_SUB(CURDATE(), INTERVAL 23 DAY), 'excused',  'Demo'),
  (@uid, @c1, DATE_SUB(CURDATE(), INTERVAL 24 DAY), 'present',  'Demo'),
  (@uid, @c2, DATE_SUB(CURDATE(), INTERVAL 25 DAY), 'present',  'Demo'),
  (@uid, @c1, DATE_SUB(CURDATE(), INTERVAL 26 DAY), 'late',     'Demo'),
  (@uid, @c2, DATE_SUB(CURDATE(), INTERVAL 27 DAY), 'present',  'Demo')
ON DUPLICATE KEY UPDATE
  status = VALUES(status),
  notes = VALUES(notes);

SELECT @uid AS user_id, @c1 AS course_1_id, @c2 AS course_2_id;
SELECT session_date, course_id, status FROM attendance WHERE user_id = @uid ORDER BY session_date DESC LIMIT 15;
