-- Create the api schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS api;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE IF NOT EXISTS api.programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  author_id UUID REFERENCES auth.users(id),
  level TEXT,
  category TEXT,
  duration INTEGER,
  is_featured BOOLEAN DEFAULT FALSE,
  is_paid BOOLEAN DEFAULT FALSE,
  price DECIMAL(10, 2),
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api.program_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID REFERENCES api.programs(id),
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'active',
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_week INTEGER DEFAULT 1,
  current_day INTEGER DEFAULT 1,
  add_to_calendar BOOLEAN DEFAULT FALSE,
  receive_reminders BOOLEAN DEFAULT FALSE,
  adapt_to_progress BOOLEAN DEFAULT FALSE,
  auto_schedule_deloads BOOLEAN DEFAULT FALSE,
  last_completed_workout_id UUID,
  last_completed_workout_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api.training_maxes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  exercise_id UUID,
  value DECIMAL(10, 2),
  unit TEXT DEFAULT 'lb',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api.completed_workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  program_id UUID REFERENCES api.programs(id),
  workout_id UUID,
  subscription_id UUID REFERENCES api.program_subscriptions(id),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api.exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  muscle_groups TEXT[] DEFAULT '{}',
  video_url TEXT,
  thumbnail_url TEXT,
  measurement_config JSONB DEFAULT '{"allowed": ["weight_reps"], "default": "weight_reps"}',
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api.workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  is_template BOOLEAN DEFAULT FALSE,
  author_id UUID REFERENCES auth.users(id),
  date TIMESTAMP WITH TIME ZONE,
  duration INTEGER,
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
  personal_records INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS api.workout_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID REFERENCES api.workouts(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES api.exercises(id),
  superset_group_id UUID,
  order_index INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api.exercise_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_exercise_id UUID REFERENCES api.workout_exercises(id) ON DELETE CASCADE,
  weight DECIMAL(10, 2),
  reps INTEGER,
  duration INTEGER,
  distance DECIMAL(10, 2),
  completed BOOLEAN DEFAULT FALSE,
  is_personal_record BOOLEAN DEFAULT FALSE,
  notes TEXT,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api.clubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id),
  is_paid BOOLEAN DEFAULT FALSE,
  price DECIMAL(10, 2),
  banner_image_url TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  member_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS api.club_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID REFERENCES api.clubs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS api.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES auth.users(id),
  club_id UUID REFERENCES api.clubs(id),
  content TEXT,
  image_urls TEXT[] DEFAULT '{}',
  workout_id UUID REFERENCES api.workouts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS api.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES api.posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  like_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS api.post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES api.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api.user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  content_id UUID,
  content_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE api.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.program_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.training_maxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.completed_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.exercise_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.user_favorites ENABLE ROW LEVEL SECURITY;
