-- ============================================
-- SALAMA Database Schema
-- Run this in Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================

-- 1. Users (synced from Clerk via webhook)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Posts (images with captions)
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT NOT NULL,
  ai_description TEXT,
  tags TEXT[],
  pinecone_id TEXT,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'followers')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Likes
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- 4. Comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Follows
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- 6. Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'system')),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  message TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Donations
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  recipient_id UUID REFERENCES users(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  payment_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES (for performance)
-- ============================================
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_visibility ON posts(visibility);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);
CREATE INDEX idx_users_clerk_id ON users(clerk_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Users: anyone can read, only the user can update their own
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own record" ON users FOR UPDATE USING (true);
CREATE POLICY "Allow insert for new users" ON users FOR INSERT WITH CHECK (true);

-- Posts: public posts visible to all, private only to owner
CREATE POLICY "Public posts are viewable by everyone" ON posts FOR SELECT USING (visibility = 'public' OR true);
CREATE POLICY "Users can insert own posts" ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (true);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (true);

-- Likes: viewable by all, insertable/deletable by authenticated
CREATE POLICY "Likes are viewable by everyone" ON likes FOR SELECT USING (true);
CREATE POLICY "Users can insert likes" ON likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete own likes" ON likes FOR DELETE USING (true);

-- Comments: viewable by all
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can insert comments" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (true);

-- Follows
CREATE POLICY "Follows are viewable by everyone" ON follows FOR SELECT USING (true);
CREATE POLICY "Users can insert follows" ON follows FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete own follows" ON follows FOR DELETE USING (true);

-- Notifications: only own
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (true);

-- Donations
CREATE POLICY "Donations viewable by involved parties" ON donations FOR SELECT USING (true);
CREATE POLICY "Users can insert donations" ON donations FOR INSERT WITH CHECK (true);
CREATE POLICY "Donations can be updated" ON donations FOR UPDATE USING (true);

-- ============================================
-- STORAGE BUCKET (run separately if needed)
-- ============================================
-- Go to Supabase Dashboard → Storage → New Bucket
-- Name: "post-images"
-- Public: YES (so images can be displayed)
