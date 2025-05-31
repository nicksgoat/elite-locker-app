-- Elite Locker Complete Database Setup
-- Run this script in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0
);

-- Clubs table
CREATE TABLE IF NOT EXISTS clubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES profiles(id),
  is_paid BOOLEAN DEFAULT FALSE,
  price DECIMAL(10, 2),
  banner_image_url TEXT,
  profile_image_url TEXT,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Club members junction table
CREATE TABLE IF NOT EXISTS club_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_admin BOOLEAN DEFAULT FALSE,
  UNIQUE(club_id, user_id)
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES profiles(id),
  club_id UUID REFERENCES clubs(id),
  content TEXT,
  image_urls TEXT[] DEFAULT '{}',
  workout_id UUID,
  post_type TEXT DEFAULT 'general_post',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0
);

-- Exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  muscle_groups TEXT[] DEFAULT '{}',
  video_url TEXT,
  thumbnail_url TEXT,
  measurement_config JSONB DEFAULT '{"allowed": ["weight_reps"], "default": "weight_reps"}',
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workouts table (templates and logs)
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  is_template BOOLEAN DEFAULT FALSE,
  author_id UUID REFERENCES profiles(id),
  date TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- in seconds
  notes TEXT,
  is_complete BOOLEAN DEFAULT FALSE,
  is_paid BOOLEAN DEFAULT FALSE,
  price DECIMAL(10, 2),
  club_id UUID,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  level TEXT,
  category TEXT,
  total_volume DECIMAL(10, 2),
  personal_records INTEGER DEFAULT 0
);

-- Workout exercises junction table
CREATE TABLE IF NOT EXISTS workout_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id),
  superset_group_id UUID,
  order_index INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercise sets table
CREATE TABLE IF NOT EXISTS exercise_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_exercise_id UUID REFERENCES workout_exercises(id) ON DELETE CASCADE,
  weight DECIMAL(10, 2),
  reps INTEGER,
  duration INTEGER, -- in seconds
  distance DECIMAL(10, 2), -- in meters
  completed BOOLEAN DEFAULT FALSE,
  is_personal_record BOOLEAN DEFAULT FALSE,
  notes TEXT,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training maxes table
CREATE TABLE IF NOT EXISTS training_maxes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  exercise_id UUID REFERENCES exercises(id),
  value DECIMAL(10, 2),
  unit TEXT DEFAULT 'lb',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Superset groups table
CREATE TABLE IF NOT EXISTS superset_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  name TEXT,
  notes TEXT,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Programs table
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  level TEXT,
  duration INTEGER, -- in weeks
  author_id UUID REFERENCES profiles(id),
  is_paid BOOLEAN DEFAULT FALSE,
  price DECIMAL(10, 2),
  club_id UUID,
  thumbnail_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_maxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE superset_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for clubs
CREATE POLICY "Clubs are viewable by everyone" ON clubs
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create clubs" ON clubs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Club owners can update their clubs" ON clubs
  FOR UPDATE USING (auth.uid() = owner_id);

-- Create RLS policies for club_members
CREATE POLICY "Club memberships are viewable by everyone" ON club_members
  FOR SELECT USING (true);

CREATE POLICY "Users can join clubs" ON club_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave clubs" ON club_members
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for posts
CREATE POLICY "Posts are viewable by everyone" ON posts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = author_id);

CREATE POLICY "Users can update their own posts" ON posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts" ON posts
  FOR DELETE USING (auth.uid() = author_id);

-- Create RLS policies for workouts
CREATE POLICY "Public workouts are viewable by everyone" ON workouts
  FOR SELECT USING (is_paid = false OR auth.uid() = author_id);

CREATE POLICY "Authenticated users can create workouts" ON workouts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = author_id);

CREATE POLICY "Users can update their own workouts" ON workouts
  FOR UPDATE USING (auth.uid() = author_id);

-- Create RLS policies for programs
CREATE POLICY "Public programs are viewable by everyone" ON programs
  FOR SELECT USING (is_paid = false OR auth.uid() = author_id);

CREATE POLICY "Authenticated users can create programs" ON programs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = author_id);

CREATE POLICY "Users can update their own programs" ON programs
  FOR UPDATE USING (auth.uid() = author_id);

-- Create RLS policies for exercises
CREATE POLICY "Exercises are viewable by everyone" ON exercises
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create exercises" ON exercises
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own exercises" ON exercises
  FOR UPDATE USING (auth.uid() = created_by);

-- Create RLS policies for workout_exercises
CREATE POLICY "Workout exercises are viewable by workout owners" ON workout_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_id
      AND (workouts.is_paid = false OR workouts.author_id = auth.uid())
    )
  );

CREATE POLICY "Users can add exercises to their workouts" ON workout_exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_id
      AND workouts.author_id = auth.uid()
    )
  );

CREATE POLICY "Users can update exercises in their workouts" ON workout_exercises
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_id
      AND workouts.author_id = auth.uid()
    )
  );

-- Create RLS policies for exercise_sets
CREATE POLICY "Exercise sets are viewable by workout owners" ON exercise_sets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workout_exercises
      JOIN workouts ON workouts.id = workout_exercises.workout_id
      WHERE workout_exercises.id = workout_exercise_id
      AND (workouts.is_paid = false OR workouts.author_id = auth.uid())
    )
  );

CREATE POLICY "Users can add sets to their workout exercises" ON exercise_sets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_exercises
      JOIN workouts ON workouts.id = workout_exercises.workout_id
      WHERE workout_exercises.id = workout_exercise_id
      AND workouts.author_id = auth.uid()
    )
  );

CREATE POLICY "Users can update sets in their workouts" ON exercise_sets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workout_exercises
      JOIN workouts ON workouts.id = workout_exercises.workout_id
      WHERE workout_exercises.id = workout_exercise_id
      AND workouts.author_id = auth.uid()
    )
  );

-- Create RLS policies for training_maxes
CREATE POLICY "Users can view their own training maxes" ON training_maxes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own training maxes" ON training_maxes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own training maxes" ON training_maxes
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for superset_groups
CREATE POLICY "Superset groups are viewable by workout owners" ON superset_groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_id
      AND (workouts.is_paid = false OR workouts.author_id = auth.uid())
    )
  );

CREATE POLICY "Users can create superset groups in their workouts" ON superset_groups
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_id
      AND workouts.author_id = auth.uid()
    )
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
