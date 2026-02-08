-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'faculty', 'admin') DEFAULT 'admin',
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

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  department_id INT NOT NULL,
  credits INT,
  semester INT,
  lecture_credits INT DEFAULT 0,
  tutorial_credits INT DEFAULT 0,
  lab_credits INT DEFAULT 0,
  practical_credits INT DEFAULT 0,
  course_type ENUM('theory', 'lab', 'practical', 'tutorial') DEFAULT 'theory',
  is_lab BOOLEAN DEFAULT FALSE,
  hours_per_week INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Create classrooms table
CREATE TABLE IF NOT EXISTS classrooms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  capacity INT NOT NULL,
  location VARCHAR(255),
  room_type ENUM('classroom', 'lab', 'special') DEFAULT 'classroom',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create time_slots table
CREATE TABLE IF NOT EXISTS time_slots (
  id INT PRIMARY KEY AUTO_INCREMENT,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  day_of_week INT,
  slot_type VARCHAR(20) DEFAULT 'class',
  description TEXT,
  is_break BOOLEAN DEFAULT FALSE,
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

-- Create faculty_requests table (for faculty to submit requests to admin)
CREATE TABLE IF NOT EXISTS faculty_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  faculty_id INT NOT NULL,
  type VARCHAR(50) NOT NULL COMMENT 'schedule-change, room-change, course-issue, other',
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (faculty_id) REFERENCES users(id)
);

UPDATE users u
JOIN faculties f ON u.email = f.email
SET u.role = 'faculty'
WHERE u.role <> 'faculty';

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