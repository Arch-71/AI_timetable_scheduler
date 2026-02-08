-- Add short_name column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN short_name VARCHAR(50) AFTER name;

-- Optional: Add needs_password_reset if not already present
ALTER TABLE users ADD COLUMN needs_password_reset BOOLEAN DEFAULT TRUE AFTER role;
