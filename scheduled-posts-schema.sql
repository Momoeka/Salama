-- Add scheduled_at column to posts (null = published immediately)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ DEFAULT NULL;
-- Add status column (published, scheduled, draft)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';
