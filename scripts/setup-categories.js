/**
 * Elite Locker - Setup Categories Script
 *
 * This script sets up the categories table and populates it with default categories.
 * Run this script to initialize the dynamic category system.
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration - Elite Locker App project
const supabaseUrl = 'https://emucorbwylxtykughxks.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtdWNvcmJ3eWx4dHlrdWdoeGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNTc3MTksImV4cCI6MjA2MzkzMzcxOX0.LQTfyzp5TkqOu7E8zMV5eL1x0lhkQwgIzcmfed3i5Ok';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Default categories to insert
const defaultCategories = [
  {
    name: 'Featured',
    slug: 'featured',
    description: 'Highlighted content across all categories',
    color_hex: '#0A84FF',
    icon: 'star-outline',
    sort_order: 0,
  },
  {
    name: 'Strength Training',
    slug: 'strength',
    description: 'Build muscle and increase power',
    color_hex: '#FF2D55',
    icon: 'barbell-outline',
    sort_order: 1,
  },
  {
    name: 'Cardio',
    slug: 'cardio',
    description: 'Improve cardiovascular health',
    color_hex: '#30D158',
    icon: 'heart-outline',
    sort_order: 2,
  },
  {
    name: 'HIIT',
    slug: 'hiit',
    description: 'High-intensity interval training',
    color_hex: '#FF9F0A',
    icon: 'timer-outline',
    sort_order: 3,
  },
  {
    name: 'Mobility',
    slug: 'mobility',
    description: 'Flexibility and movement quality',
    color_hex: '#5856D6',
    icon: 'body-outline',
    sort_order: 4,
  },
  {
    name: 'Sports',
    slug: 'sports',
    description: 'Sport-specific training',
    color_hex: '#64D2FF',
    icon: 'basketball-outline',
    sort_order: 5,
  },
  {
    name: 'Hypertrophy',
    slug: 'hypertrophy',
    description: 'Muscle building and size',
    color_hex: '#BF5AF2',
    icon: 'fitness-outline',
    sort_order: 6,
  },
  {
    name: 'Powerlifting',
    slug: 'powerlifting',
    description: 'Squat, bench, deadlift focused',
    color_hex: '#FF3B30',
    icon: 'barbell-outline',
    sort_order: 7,
  },
  {
    name: 'Olympic Lifting',
    slug: 'olympic',
    description: 'Clean, jerk, snatch training',
    color_hex: '#FFD60A',
    icon: 'barbell-outline',
    sort_order: 8,
  },
  {
    name: 'Bodybuilding',
    slug: 'bodybuilding',
    description: 'Aesthetic muscle development',
    color_hex: '#AF52DE',
    icon: 'body-outline',
    sort_order: 9,
  },
  {
    name: 'Crossfit',
    slug: 'crossfit',
    description: 'Functional fitness training',
    color_hex: '#34C759',
    icon: 'fitness-outline',
    sort_order: 10,
  },
  {
    name: 'Yoga',
    slug: 'yoga',
    description: 'Mind-body wellness practice',
    color_hex: '#5AC8FA',
    icon: 'leaf-outline',
    sort_order: 11,
  },
  {
    name: 'Pilates',
    slug: 'pilates',
    description: 'Core strength and stability',
    color_hex: '#FFCC02',
    icon: 'body-outline',
    sort_order: 12,
  },
  {
    name: 'Martial Arts',
    slug: 'martial-arts',
    description: 'Combat sports training',
    color_hex: '#FF6B35',
    icon: 'shield-outline',
    sort_order: 13,
  },
  {
    name: 'Dance',
    slug: 'dance',
    description: 'Rhythmic movement and fitness',
    color_hex: '#FF2D92',
    icon: 'musical-notes-outline',
    sort_order: 14,
  },
  {
    name: 'Rehabilitation',
    slug: 'rehab',
    description: 'Recovery and injury prevention',
    color_hex: '#32D74B',
    icon: 'medical-outline',
    sort_order: 15,
  },
];

async function setupCategories() {
  console.log('🚀 Setting up categories table...');

  try {
    // First, create the categories table
    console.log('📋 Creating categories table...');

    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
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

        -- Enable RLS (Row Level Security) for categories
        ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

        -- Create policies for categories
        DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
        CREATE POLICY "Categories are viewable by everyone" ON categories
            FOR SELECT USING (true);

        DROP POLICY IF EXISTS "Authenticated users can create categories" ON categories;
        CREATE POLICY "Authenticated users can create categories" ON categories
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');

        DROP POLICY IF EXISTS "Category creators can update their categories" ON categories;
        CREATE POLICY "Category creators can update their categories" ON categories
            FOR UPDATE USING (auth.role() = 'authenticated');

        DROP POLICY IF EXISTS "Category creators can delete their categories" ON categories;
        CREATE POLICY "Category creators can delete their categories" ON categories
            FOR DELETE USING (auth.role() = 'authenticated');
      `
    });

    if (createTableError) {
      console.error('❌ Error creating table:', createTableError);
      return;
    }

    console.log('✅ Categories table created successfully');

    // Insert default categories
    console.log('📝 Inserting default categories...');

    const { data, error: insertError } = await supabase
      .from('categories')
      .upsert(defaultCategories, {
        onConflict: 'slug',
        ignoreDuplicates: false
      })
      .select();

    if (insertError) {
      console.error('❌ Error inserting categories:', insertError);
      return;
    }

    console.log(`✅ Successfully inserted ${data?.length || 0} categories`);

    // Display inserted categories
    console.log('\n📋 Categories created:');
    data?.forEach(category => {
      console.log(`  • ${category.name} (${category.slug}) - ${category.color_hex}`);
    });

    console.log('\n🎉 Categories setup completed successfully!');
    console.log('\n💡 You can now:');
    console.log('  1. View categories in the marketplace tab');
    console.log('  2. Create new categories in the database');
    console.log('  3. Link workouts/programs/exercises to categories');
    console.log('  4. Categories will auto-populate in the UI');

  } catch (error) {
    console.error('❌ Error setting up categories:', error);
  }
}

// Run the setup
if (require.main === module) {
  setupCategories()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupCategories, defaultCategories };
