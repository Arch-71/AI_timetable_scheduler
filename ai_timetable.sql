CREATE DATABASE IF NOT EXISTS `ai_timetable` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ai_timetable`;
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'faculty', 'student') DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create faculties table
CREATE TABLE IF NOT EXISTS faculties (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  department_id INT NOT NULL,
  specialization VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id)
);
ALTER TABLE faculties 
ADD COLUMN short_name VARCHAR(10) AFTER name;
-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  department_id INT NOT NULL,
  credits INT,
  semester INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id)
);
ALTER TABLE courses
ADD COLUMN course_type VARCHAR(20) NOT NULL DEFAULT 'BSC',
ADD COLUMN lecture_credits INT DEFAULT 0,
ADD COLUMN tutorial_credits INT DEFAULT 0,
ADD COLUMN lab_credits INT DEFAULT 0,
ADD COLUMN hours_per_week INT,
MODIFY COLUMN credits INT DEFAULT 0,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  department_id INT NOT NULL,
  course_type VARCHAR(20) NOT NULL DEFAULT 'BSC',
  lecture_credits INT DEFAULT 0,
  tutorial_credits INT DEFAULT 0,
  lab_credits INT DEFAULT 0,
  credits INT DEFAULT 0,
  hours_per_week INT,
  semester INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Create classrooms table
CREATE TABLE IF NOT EXISTS classrooms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  capacity INT NOT NULL,
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create time_slots table
CREATE TABLE IF NOT EXISTS time_slots (
  id INT PRIMARY KEY AUTO_INCREMENT,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  day_of_week INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create schedules table (main timetable)
CREATE TABLE IF NOT EXISTS schedules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  course_id INT NOT NULL,
  faculty_id INT NOT NULL,
  classroom_id INT NOT NULL,
  time_slot_id INT NOT NULL,
  schedule_date DATE,
  status ENUM('draft', 'pending', 'approved', 'rejected') DEFAULT 'draft',
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (faculty_id) REFERENCES faculties(id),
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id),
  FOREIGN KEY (time_slot_id) REFERENCES time_slots(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create timetable_versions table (for tracking versions)
CREATE TABLE IF NOT EXISTS timetable_versions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('draft', 'pending_review', 'approved', 'published') DEFAULT 'draft',
  created_by INT NOT NULL,
  approved_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Create version_schedules table (linking schedules to versions)
CREATE TABLE IF NOT EXISTS version_schedules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  timetable_version_id INT NOT NULL,
  schedule_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (timetable_version_id) REFERENCES timetable_versions(id),
  FOREIGN KEY (schedule_id) REFERENCES schedules(id)
);
CREATE TABLE faculty_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  faculty_id INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP,
  FOREIGN KEY (faculty_id) REFERENCES users(id)
);
INSERT INTO users (email, password, name, role)
VALUES (
  'admin@bmsce.ac.in',
  SHA2('BmsceAdmin123', 256),
  'Site Admin',
  'admin'
);
UPDATE users u
JOIN faculties f ON u.email = f.email
SET u.role = 'faculty'
WHERE u.role <> 'faculty';

-- From scripts/03-create-students-table.sql
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usn VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_email (email),
  INDEX idx_usn (usn)
);

ALTER TABLE students ADD COLUMN password_changed BOOLEAN DEFAULT FALSE;

delete from users where role="student";
ALTER TABLE classrooms ADD COLUMN type VARCHAR(20) DEFAULT 'classroom';
-- Set type to 'lab' for labs (assuming names contain 'Lab')
UPDATE classrooms SET type = 'lab' WHERE name LIKE '%Lab%';

-- Set type to 'special' for FDC (mini auditorium)
UPDATE classrooms SET type = 'special' WHERE name = 'FDC';

-- Set type to 'classroom' for all others (names starting with 'C')
UPDATE classrooms SET type = 'classroom' WHERE name LIKE 'C%';
select * from classrooms;

-- Example update for existing faculty
UPDATE faculties 
SET short_name = 'SU' 
WHERE name = 'Dr. S Uma' 
LIMIT 1;

-- Add needs_password_reset column to users table
-- Modify the column to have DEFAULT TRUE
ALTER TABLE users 
MODIFY COLUMN needs_password_reset BOOLEAN DEFAULT TRUE;

-- Add short_name column to faculties table
ALTER TABLE faculties 
ADD COLUMN short_name VARCHAR(5) AFTER name;

select * from time_slots;


-- Monday to Friday time slots
INSERT INTO time_slots (day_of_week, start_time, end_time) VALUES
-- Monday
(1, '08:55:00', '09:50:00'),
(1, '09:50:00', '10:45:00'),
(1, '11:15:00', '12:10:00'),
(1, '12:10:00', '13:05:00'),
(1, '14:00:00', '14:55:00'),
(1, '14:55:00', '15:50:00'),
(1, '15:50:00', '16:45:00'), -- Extended slot

-- Tuesday
(2, '08:55:00', '09:50:00'),
(2, '09:50:00', '10:45:00'),
(2, '11:15:00', '12:10:00'),
(2, '12:10:00', '13:05:00'),
(2, '14:00:00', '14:55:00'),
(2, '14:55:00', '15:50:00'),
(2, '15:50:00', '16:45:00'), -- Extended slot

-- Wednesday
(3, '08:55:00', '09:50:00'),
(3, '09:50:00', '10:45:00'),
(3, '11:15:00', '12:10:00'),
(3, '12:10:00', '13:05:00'),
(3, '14:00:00', '14:55:00'),
(3, '14:55:00', '15:50:00'),
(3, '15:50:00', '16:45:00'), -- Extended slot

-- Thursday
(4, '08:55:00', '09:50:00'),
(4, '09:50:00', '10:45:00'),
(4, '11:15:00', '12:10:00'),
(4, '12:10:00', '13:05:00'),
(4, '14:00:00', '14:55:00'),
(4, '14:55:00', '15:50:00'),
(4, '15:50:00', '16:45:00'), -- Extended slot

-- Friday
(5, '08:55:00', '09:50:00'),
(5, '09:50:00', '10:45:00'),
(5, '11:15:00', '12:10:00'),
(5, '12:10:00', '13:05:00'),
(5, '14:00:00', '14:55:00'),
(5, '14:55:00', '15:50:00'),
(5, '15:50:00', '16:45:00'), -- Extended slot

-- Saturday
(6, '08:55:00', '09:50:00'),
(6, '09:50:00', '10:45:00'),
(6, '11:15:00', '12:10:00'),
(6, '12:10:00', '13:05:00');

select * from courses;
select * from faculties;
select * from time_slots;
select * from classrooms;

ALTER TABLE time_slots 
ADD COLUMN slot_type VARCHAR(20) DEFAULT 'class',
ADD COLUMN description TEXT,
ADD COLUMN is_break BOOLEAN DEFAULT FALSE;

-- Update existing time slots to set is_break flag based on time patterns
UPDATE time_slots SET is_break = TRUE WHERE 
    (start_time = '10:45:00' AND end_time = '11:15:00') OR -- Break time
    (start_time = '13:05:00' AND end_time = '14:00:00'); -- Lunch time

-- Set slot_type and description for existing time slots
UPDATE time_slots SET 
    slot_type = 'class',
    description = CONCAT(
        CASE day_of_week
            WHEN 1 THEN 'Monday'
            WHEN 2 THEN 'Tuesday'
            WHEN 3 THEN 'Wednesday'
            WHEN 4 THEN 'Thursday'
            WHEN 5 THEN 'Friday'
            WHEN 6 THEN 'Saturday'
            ELSE 'Sunday'
        END,
        ' - ',
        CASE 
            WHEN start_time = '08:55:00' THEN 'Class 1'
            WHEN start_time = '09:50:00' THEN 'Class 2'
            WHEN start_time = '11:15:00' THEN 'Break'
            WHEN start_time = '12:10:00' THEN 'Class 3'
            WHEN start_time = '13:05:00' THEN 'Lunch'
            WHEN start_time = '14:00:00' THEN 'Class 4'
            WHEN start_time = '14:55:00' THEN 'Class 5'
            WHEN start_time = '15:50:00' THEN 'Class 6'
            ELSE 'Unknown'
        END
    )
WHERE slot_type = 'class';

-- Update break and lunch slots
UPDATE time_slots SET 
    slot_type = 'break',
    description = CONCAT(
        CASE day_of_week
            WHEN 1 THEN 'Monday'
            WHEN 2 THEN 'Tuesday'
            WHEN 3 THEN 'Wednesday'
            WHEN 4 THEN 'Thursday'
            WHEN 5 THEN 'Friday'
            WHEN 6 THEN 'Saturday'
            ELSE 'Sunday'
        END,
        ' - ',
        CASE 
            WHEN start_time = '10:45:00' THEN 'Break'
            WHEN start_time = '13:05:00' THEN 'Lunch'
            ELSE 'Break'
        END
    )
WHERE is_break = TRUE;

select * from faculty_requests;
UPDATE faculty_requests 
SET created_at = CURRENT_TIMESTAMP 
WHERE created_at IS NULL;
ALTER TABLE faculty_requests 
MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;