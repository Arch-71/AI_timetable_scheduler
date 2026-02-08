-- Clear existing time slots (if any)
TRUNCATE TABLE time_slots;

-- Function to create time slots for a given day
DELIMITER //
CREATE PROCEDURE GenerateTimeSlots(IN dayName VARCHAR(10), IN isSaturday BOOLEAN)
BEGIN
    DECLARE dayNum INT;
    
    -- Convert day name to number (1=Monday, 7=Sunday)
    SET dayNum = CASE dayName
        WHEN 'Monday' THEN 1
        WHEN 'Tuesday' THEN 2
        WHEN 'Wednesday' THEN 3
        WHEN 'Thursday' THEN 4
        WHEN 'Friday' THEN 5
        WHEN 'Saturday' THEN 6
        WHEN 'Sunday' THEN 7
        ELSE 1
    END;
    
    -- Regular class slots (same for all weekdays and Saturday)
    INSERT INTO time_slots (day_of_week, start_time, end_time, slot_type, description, is_break)
    VALUES 
    (dayNum, '08:55:00', '09:50:00', 'class', CONCAT(dayName, ' - Class 1'), FALSE),
    (dayNum, '09:50:00', '10:45:00', 'class', CONCAT(dayName, ' - Class 2'), FALSE),
    (dayNum, '10:45:00', '11:15:00', 'break', CONCAT(dayName, ' - Break'), TRUE),
    (dayNum, '11:15:00', '12:10:00', 'class', CONCAT(dayName, ' - Class 3'), FALSE),
    (dayNum, '12:10:00', '13:05:00', 'class', CONCAT(dayName, ' - Class 4'), FALSE);
    
    -- Additional slots for weekdays (not Saturday)
    IF NOT isSaturday THEN
        INSERT INTO time_slots (day_of_week, start_time, end_time, slot_type, description, is_break)
        VALUES 
        (dayNum, '13:05:00', '14:00:00', 'lunch', CONCAT(dayName, ' - Lunch'), TRUE),
        (dayNum, '14:00:00', '14:55:00', 'class', CONCAT(dayName, ' - Class 5'), FALSE),
        (dayNum, '14:55:00', '15:50:00', 'class', CONCAT(dayName, ' - Class 6'), FALSE);
    END IF;
END //

-- Generate time slots for each day
CALL GenerateTimeSlots('Monday', FALSE);
CALL GenerateTimeSlots('Tuesday', FALSE);
CALL GenerateTimeSlots('Wednesday', FALSE);
CALL GenerateTimeSlots('Thursday', FALSE);
CALL GenerateTimeSlots('Friday', FALSE);
CALL GenerateTimeSlots('Saturday', TRUE);

-- Clean up
DROP PROCEDURE IF EXISTS GenerateTimeSlots;
DELIMITER ;
