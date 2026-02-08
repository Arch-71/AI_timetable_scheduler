-- Add course credits and lab detection fields based on existing schema
-- Run this script to update existing courses table

-- Add new columns to courses table if they don't exist
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS course_type VARCHAR(20) NOT NULL DEFAULT 'BSC',
ADD COLUMN IF NOT EXISTS lecture_credits INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS tutorial_credits INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS lab_credits INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS hours_per_week INT,
ADD COLUMN IF NOT EXISTS practical_credits INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_lab BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Update existing courses based on their names and codes
UPDATE courses 
SET 
  is_lab = (name LIKE '%Lab%' OR code LIKE '%LAB%'),
  course_type = CASE 
    WHEN name LIKE '%Lab%' OR code LIKE '%LAB%' THEN 'PCL'
    WHEN name LIKE '%Practical%' OR code LIKE '%PRA%' THEN 'PCL'
    WHEN name LIKE '%Tutorial%' OR code LIKE '%TUT%' THEN 'PCC'
    ELSE course_type
  END,
  practical_credits = CASE 
    WHEN name LIKE '%Practical%' OR code LIKE '%PRA%' THEN 1
    WHEN name LIKE '%Lab%' OR code LIKE '%LAB%' THEN 1
    ELSE 0
  END,
  lab_credits = CASE 
    WHEN name LIKE '%Lab%' OR code LIKE '%LAB%' THEN 1
    ELSE 0
  END,
  tutorial_credits = CASE 
    WHEN name LIKE '%Tutorial%' OR code LIKE '%TUT%' THEN 1
    ELSE 0
  END
WHERE course_type IS NOT NULL;

-- Sample data updates for common MCA courses
UPDATE courses SET 
  lecture_credits = 3,
  practical_credits = 1,
  course_type = 'theory',
  is_lab = FALSE
WHERE code LIKE 'MMC1%' AND name NOT LIKE '%Lab%';

UPDATE courses SET 
  lab_credits = 2,
  course_type = 'lab', 
  is_lab = TRUE
WHERE (name LIKE '%Lab%' OR code LIKE '%LAB%') AND code LIKE 'MMC1%';

UPDATE courses SET 
  lecture_credits = 3,
  practical_credits = 1,
  course_type = 'theory',
  is_lab = FALSE
WHERE code LIKE 'MMC3%' AND name NOT LIKE '%Lab%';

UPDATE courses SET 
  lab_credits = 2,
  course_type = 'lab',
  is_lab = TRUE  
WHERE (name LIKE '%Lab%' OR code LIKE '%LAB%') AND code LIKE 'MMC3%';
