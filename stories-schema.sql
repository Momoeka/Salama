CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '24 hours')
);
CREATE INDEX idx_stories_user ON stories(user_id);
CREATE INDEX idx_stories_expires ON stories(expires_at);
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Stories viewable by all" ON stories FOR SELECT USING (true);
CREATE POLICY "Users can insert stories" ON stories FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete stories" ON stories FOR DELETE USING (true);
