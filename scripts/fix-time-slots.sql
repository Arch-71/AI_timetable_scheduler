-- Add missing columns to time_slots table
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
