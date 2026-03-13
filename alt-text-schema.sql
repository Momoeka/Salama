-- Add alt_text column to posts for accessibility
ALTER TABLE posts ADD COLUMN IF NOT EXISTS alt_text TEXT;
