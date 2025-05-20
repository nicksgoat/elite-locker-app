/**
 * Elite Locker - Create API Schema Script
 * 
 * This script creates the 'api' schema in Supabase.
 * 
 * Usage:
 * node scripts/create-api-schema.js
 * 
 * Requirements:
 * - Node.js
 * - @supabase/supabase-js
 * - dotenv
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

// Create Supabase client with service key for admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// SQL to create the 'api' schema
const createSchemaSQL = `
-- Create the 'api' schema
CREATE SCHEMA IF NOT EXISTS api;

-- Grant usage on the 'api' schema to the 'anon' and 'authenticated' roles
GRANT USAGE ON SCHEMA api TO anon, authenticated;

-- Grant all privileges on all tables in the 'api' schema to the 'anon' and 'authenticated' roles
GRANT ALL ON ALL TABLES IN SCHEMA api TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA api TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA api TO anon, authenticated;

-- Set the search_path to include 'api'
ALTER DATABASE postgres SET search_path TO public, api;
`;

// Function to execute SQL
async function executeSql(sql) {
  try {
    const { data, error } = await supabase.rpc('execute_sql', { query: sql });
    
    if (error) {
      console.error('❌ Error executing SQL:', error);
      return false;
    }
    
    console.log('✅ SQL executed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error executing SQL:', error.message);
    return false;
  }
}

// Main function to create the 'api' schema
async function createApiSchema() {
  console.log('🚀 Creating API schema...');
  
  const success = await executeSql(createSchemaSQL);
  
  if (success) {
    console.log('✅ API schema created successfully!');
  } else {
    console.error('❌ Failed to create API schema');
    process.exit(1);
  }
}

// Run the script
createApiSchema().catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});
