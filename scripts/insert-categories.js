/**
 * Elite Locker - Insert Categories Script
 *
 * This script inserts default categories into an existing categories table.
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
];

async function insertCategories() {
  console.log('🚀 Inserting categories...');

  try {
    // First, check if categories table exists by trying to select from it
    console.log('🔍 Checking if categories table exists...');
    
    const { data: testData, error: testError } = await supabase
      .from('categories')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ Categories table does not exist or is not accessible:', testError.message);
      console.log('');
      console.log('💡 To create the categories table, you need to:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to the SQL Editor');
      console.log('3. Run the following SQL:');
      console.log('');
      console.log(`CREATE TABLE categories (
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

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Categories are viewable by everyone" ON categories
    FOR SELECT USING (true);`);
      return;
    }

    console.log('✅ Categories table exists');

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
    console.log('  2. Categories will auto-populate in the UI');
    console.log('  3. Add more categories directly in Supabase');

  } catch (error) {
    console.error('❌ Error setting up categories:', error);
  }
}

// Run the setup
if (require.main === module) {
  insertCategories()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { insertCategories, defaultCategories };
