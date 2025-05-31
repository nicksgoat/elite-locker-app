-- Categories table for dynamic marketplace categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color_hex TEXT NOT NULL DEFAULT '#0A84FF',
  icon TEXT NOT NULL DEFAULT 'star-outline',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, slug, description, color_hex, icon, sort_order) VALUES
  ('Featured', 'featured', 'Highlighted content across all categories', '#0A84FF', 'star-outline', 0),
  ('Strength Training', 'strength', 'Build muscle and increase power', '#FF2D55', 'barbell-outline', 1),
  ('Cardio', 'cardio', 'Improve cardiovascular health', '#30D158', 'heart-outline', 2),
  ('HIIT', 'hiit', 'High-intensity interval training', '#FF9F0A', 'timer-outline', 3),
  ('Mobility', 'mobility', 'Flexibility and movement quality', '#5856D6', 'body-outline', 4),
  ('Sports', 'sports', 'Sport-specific training', '#64D2FF', 'basketball-outline', 5),
  ('Hypertrophy', 'hypertrophy', 'Muscle building and size', '#BF5AF2', 'fitness-outline', 6),
  ('Powerlifting', 'powerlifting', 'Squat, bench, deadlift focused', '#FF3B30', 'barbell-outline', 7),
  ('Olympic Lifting', 'olympic', 'Clean, jerk, snatch training', '#FFD60A', 'barbell-outline', 8),
  ('Bodybuilding', 'bodybuilding', 'Aesthetic muscle development', '#AF52DE', 'body-outline', 9),
  ('Crossfit', 'crossfit', 'Functional fitness training', '#34C759', 'fitness-outline', 10),
  ('Yoga', 'yoga', 'Mind-body wellness practice', '#5AC8FA', 'leaf-outline', 11),
  ('Pilates', 'pilates', 'Core strength and stability', '#FFCC02', 'body-outline', 12),
  ('Martial Arts', 'martial-arts', 'Combat sports training', '#FF6B35', 'shield-outline', 13),
  ('Dance', 'dance', 'Rhythmic movement and fitness', '#FF2D92', 'musical-notes-outline', 14),
  ('Rehabilitation', 'rehab', 'Recovery and injury prevention', '#32D74B', 'medical-outline', 15)
ON CONFLICT (slug) DO NOTHING;

-- Update existing tables to use category_id instead of category text
-- Add category_id foreign key to workouts table
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);

-- Add category_id foreign key to programs table  
ALTER TABLE programs ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);

-- Add category_id foreign key to exercises table
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);

-- Add category_id foreign key to clubs table (for club categorization)
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workouts_category_id ON workouts(category_id);
CREATE INDEX IF NOT EXISTS idx_programs_category_id ON programs(category_id);
CREATE INDEX IF NOT EXISTS idx_exercises_category_id ON exercises(category_id);
CREATE INDEX IF NOT EXISTS idx_clubs_category_id ON clubs(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for categories table
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security) for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
-- Allow everyone to read categories
CREATE POLICY "Categories are viewable by everyone" ON categories
    FOR SELECT USING (true);

-- Allow authenticated users to create categories (can be restricted to admins later)
CREATE POLICY "Authenticated users can create categories" ON categories
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow category creators or admins to update categories
CREATE POLICY "Category creators can update their categories" ON categories
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow category creators or admins to delete categories
CREATE POLICY "Category creators can delete their categories" ON categories
    FOR DELETE USING (auth.role() = 'authenticated');
