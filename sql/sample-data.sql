-- Elite Locker Sample Data
-- Run this script AFTER creating a test user account

-- Insert sample clubs (you'll need to replace the owner_id with actual user IDs)
INSERT INTO clubs (id, name, description, owner_id, is_paid, price, banner_image_url, profile_image_url, member_count) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Elite Athletes', 'A community for elite athletes to share training tips and compete', null, false, 0, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200', 150),
('550e8400-e29b-41d4-a716-446655440002', 'Strength Training', 'Focus on building strength and muscle mass', null, false, 0, 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200', 89),
('550e8400-e29b-41d4-a716-446655440003', 'Running Club', 'For runners of all levels', null, false, 0, 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=800', 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=200', 234),
('550e8400-e29b-41d4-a716-446655440004', 'CrossFit Warriors', 'High-intensity functional fitness', null, true, 29.99, 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=800', 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=200', 67),
('550e8400-e29b-41d4-a716-446655440005', 'Yoga & Mindfulness', 'Find balance and inner peace', null, false, 0, 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=200', 112);

-- Insert sample workouts
INSERT INTO workouts (id, title, description, is_template, author_id, duration, is_complete, level, category, total_volume, personal_records, thumbnail_url) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Upper Body Strength', 'Complete upper body workout focusing on compound movements', true, null, 3600, false, 'Intermediate', 'Strength', 2500.00, 0, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'),
('660e8400-e29b-41d4-a716-446655440002', 'HIIT Cardio Blast', 'High-intensity interval training for fat burning', true, null, 1800, false, 'Advanced', 'Cardio', 0, 0, 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400'),
('660e8400-e29b-41d4-a716-446655440003', 'Lower Body Power', 'Build explosive lower body strength', true, null, 2700, false, 'Intermediate', 'Strength', 3200.00, 0, 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400'),
('660e8400-e29b-41d4-a716-446655440004', 'Full Body Circuit', 'Complete body workout in circuit format', true, null, 2400, false, 'Beginner', 'Circuit', 1800.00, 0, 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400'),
('660e8400-e29b-41d4-a716-446655440005', 'Core & Stability', 'Strengthen your core and improve stability', true, null, 1500, false, 'Beginner', 'Core', 0, 0, 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400');

-- Insert sample programs
INSERT INTO programs (id, title, description, level, duration, author_id, is_paid, price, is_featured, category, thumbnail_url) VALUES
('770e8400-e29b-41d4-a716-446655440001', '12-Week Strength Builder', 'Progressive strength training program for intermediate lifters', 'Intermediate', 12, null, true, 99.99, true, 'Strength', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'),
('770e8400-e29b-41d4-a716-446655440002', 'Beginner Fitness Journey', 'Perfect starting point for fitness beginners', 'Beginner', 8, null, false, 0, true, 'General', 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400'),
('770e8400-e29b-41d4-a716-446655440003', 'Elite Athletic Performance', 'Advanced training for competitive athletes', 'Advanced', 16, null, true, 199.99, true, 'Athletic', 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400'),
('770e8400-e29b-41d4-a716-446655440004', 'Fat Loss Transformation', 'Comprehensive fat loss and body recomposition', 'Intermediate', 10, null, true, 79.99, false, 'Fat Loss', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400'),
('770e8400-e29b-41d4-a716-446655440005', 'Functional Movement', 'Improve daily movement patterns and mobility', 'Beginner', 6, null, false, 0, false, 'Mobility', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400');

-- Insert sample posts (these will be linked to clubs and users after authentication)
INSERT INTO posts (id, author_id, club_id, content, post_type, like_count, comment_count) VALUES
('880e8400-e29b-41d4-a716-446655440001', null, '550e8400-e29b-41d4-a716-446655440001', 'Just crushed a new PR on deadlifts! 405lbs for 3 reps 💪', 'progress_post', 24, 8),
('880e8400-e29b-41d4-a716-446655440002', null, '550e8400-e29b-41d4-a716-446655440002', 'New workout template available: Upper Body Strength. Check it out!', 'workout_post', 15, 3),
('880e8400-e29b-41d4-a716-446655440003', null, '550e8400-e29b-41d4-a716-446655440003', 'Beautiful morning run through the park. 5 miles at 7:30 pace 🏃‍♂️', 'general_post', 31, 12),
('880e8400-e29b-41d4-a716-446655440004', null, '550e8400-e29b-41d4-a716-446655440004', 'Who''s ready for tomorrow''s WOD? It''s going to be intense! 🔥', 'general_post', 18, 6),
('880e8400-e29b-41d4-a716-446655440005', null, '550e8400-e29b-41d4-a716-446655440005', 'Remember: consistency beats perfection. Small steps every day 🧘‍♀️', 'general_post', 42, 15);

-- Function to update club member counts
CREATE OR REPLACE FUNCTION update_club_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE clubs SET member_count = member_count + 1 WHERE id = NEW.club_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE clubs SET member_count = member_count - 1 WHERE id = OLD.club_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update club member counts
DROP TRIGGER IF EXISTS update_club_member_count_trigger ON club_members;
CREATE TRIGGER update_club_member_count_trigger
  AFTER INSERT OR DELETE ON club_members
  FOR EACH ROW EXECUTE FUNCTION update_club_member_count();

-- Function to update post like counts
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create post_likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS on post_likes
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for post_likes
CREATE POLICY "Post likes are viewable by everyone" ON post_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like posts" ON post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts" ON post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger to automatically update post like counts
DROP TRIGGER IF EXISTS update_post_like_count_trigger ON post_likes;
CREATE TRIGGER update_post_like_count_trigger
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_like_count();
