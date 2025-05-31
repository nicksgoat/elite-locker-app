/**
 * Elite Locker - Test Categories Script
 *
 * This script tests the categoryService to help debug any issues.
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://emucorbwylxtykughxks.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtdWNvcmJ3eWx4dHlrdWdoeGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNTc3MTksImV4cCI6MjA2MzkzMzcxOX0.LQTfyzp5TkqOu7E8zMV5eL1x0lhkQwgIzcmfed3i5Ok';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCategories() {
  console.log('🧪 Testing category system...');
  console.log('');

  try {
    // Test 1: Check if categories table exists
    console.log('1️⃣ Testing if categories table exists...');
    const { data: tables, error: tablesError } = await supabase
      .from('categories')
      .select('*')
      .limit(1);

    if (tablesError) {
      console.log('❌ Categories table does not exist or is not accessible');
      console.log('Error:', tablesError.message);
      console.log('');
      console.log('💡 To fix this, run the setup script:');
      console.log('   node scripts/setup-categories.js');
      return;
    }

    console.log('✅ Categories table exists and is accessible');
    console.log('');

    // Test 2: Check if there are any categories
    console.log('2️⃣ Testing if categories exist...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (categoriesError) {
      console.log('❌ Error fetching categories:', categoriesError.message);
      return;
    }

    if (!categories || categories.length === 0) {
      console.log('❌ No categories found in database');
      console.log('');
      console.log('💡 To fix this, run the setup script:');
      console.log('   node scripts/setup-categories.js');
      return;
    }

    console.log(`✅ Found ${categories.length} categories:`);
    categories.forEach(cat => {
      console.log(`   • ${cat.name} (${cat.slug}) - ${cat.color_hex}`);
    });
    console.log('');

    // Test 3: Check if content tables have category_id columns
    console.log('3️⃣ Testing if content tables have category_id columns...');
    
    const tables_to_check = ['workouts', 'programs', 'exercises', 'clubs'];
    
    for (const table of tables_to_check) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('id, category_id')
          .limit(1);
        
        if (error) {
          console.log(`❌ Error accessing ${table} table:`, error.message);
        } else {
          console.log(`✅ ${table} table has category_id column`);
        }
      } catch (err) {
        console.log(`❌ Exception testing ${table} table:`, err.message);
      }
    }
    console.log('');

    // Test 4: Test category content queries
    console.log('4️⃣ Testing category content queries...');
    
    const firstCategory = categories[0];
    console.log(`Testing with category: ${firstCategory.name} (${firstCategory.id})`);
    
    try {
      const { data: workouts, error: workoutsError } = await supabase
        .from('workouts')
        .select('id, title, category_id')
        .eq('category_id', firstCategory.id)
        .limit(5);
      
      if (workoutsError) {
        console.log('❌ Error querying workouts by category:', workoutsError.message);
      } else {
        console.log(`✅ Found ${workouts?.length || 0} workouts in category`);
      }
    } catch (err) {
      console.log('❌ Exception querying workouts:', err.message);
    }

    console.log('');
    console.log('🎉 Category system test completed!');
    console.log('');
    console.log('📱 The marketplace should now work with dynamic categories.');
    console.log('If you\'re still seeing errors, check the React Native logs for more details.');

  } catch (error) {
    console.error('❌ Test failed with exception:', error);
  }
}

// Run the test
if (require.main === module) {
  testCategories()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testCategories };
