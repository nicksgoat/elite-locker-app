/**
 * Elite Locker - Supabase Deployment Script
 *
 * This script executes SQL files in Supabase to set up the database schema,
 * create RLS policies, and seed the database with initial data.
 *
 * Usage:
 * node scripts/deploy-supabase.js
 *
 * Requirements:
 * - Node.js
 * - @supabase/supabase-js
 * - dotenv
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://gpiwvrsdkmykbevzvnsh.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_SERVICE_KEY environment variable is required');
  console.error('Please create a .env file with your Supabase service key');
  console.error('Example: SUPABASE_SERVICE_KEY=your-service-key');
  process.exit(1);
}

// Create Supabase client with service key for admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// SQL file paths
const schemaFilePath = path.join(__dirname, '..', 'sql', 'schema.sql');
const rlsPoliciesFilePath = path.join(__dirname, '..', 'sql', 'rls_policies.sql');
const seedDataFilePath = path.join(__dirname, '..', 'sql', 'seed_data.sql');

// Function to read SQL file
function readSqlFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`❌ Error reading file ${filePath}:`, error.message);
    return null;
  }
}

// Function to execute SQL
async function executeSql(sql, description) {
  if (!sql) return false;

  console.log(`🔄 Executing ${description}...`);

  try {
    const { error } = await supabase.rpc('execute_sql', { query: sql });

    if (error) {
      console.error(`❌ Error executing ${description}:`, error.message);
      return false;
    }

    console.log(`✅ Successfully executed ${description}`);
    return true;
  } catch (error) {
    console.error(`❌ Error executing ${description}:`, error.message);
    return false;
  }
}

// Main function to deploy schema, policies, and seed data
async function deployToSupabase() {
  console.log('🚀 Starting Supabase deployment...');

  // Create the 'api' schema first
  const createApiSchemaSQL = `
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

  const apiSchemaSuccess = await executeSql(createApiSchemaSQL, 'API schema creation');
  if (!apiSchemaSuccess) {
    console.error('❌ Failed to create API schema');
    process.exit(1);
  }

  // Read SQL files
  const schemaSql = readSqlFile(schemaFilePath);
  const rlsPoliciesSql = readSqlFile(rlsPoliciesFilePath);
  const seedDataSql = readSqlFile(seedDataFilePath);

  if (!schemaSql || !rlsPoliciesSql || !seedDataSql) {
    console.error('❌ Failed to read one or more SQL files');
    process.exit(1);
  }

  // Modify schema SQL to use the 'api' schema
  const modifiedSchemaSql = schemaSql.replace(/CREATE TABLE IF NOT EXISTS (\w+)/g, 'CREATE TABLE IF NOT EXISTS api.$1');

  // Execute schema
  const schemaSuccess = await executeSql(modifiedSchemaSql, 'database schema');
  if (!schemaSuccess) {
    console.error('❌ Failed to execute schema SQL');
    process.exit(1);
  }

  // Modify RLS policies SQL to use the 'api' schema
  const modifiedRlsPoliciesSql = rlsPoliciesSql.replace(/ON (\w+)/g, 'ON api.$1');

  // Execute RLS policies
  const rlsPoliciesSuccess = await executeSql(modifiedRlsPoliciesSql, 'RLS policies');
  if (!rlsPoliciesSuccess) {
    console.error('❌ Failed to execute RLS policies SQL');
    process.exit(1);
  }

  // Modify seed data SQL to use the 'api' schema
  const modifiedSeedDataSql = seedDataSql.replace(/INTO (\w+)/g, 'INTO api.$1');

  // Execute seed data
  const seedDataSuccess = await executeSql(modifiedSeedDataSql, 'seed data');
  if (!seedDataSuccess) {
    console.error('❌ Failed to execute seed data SQL');
    process.exit(1);
  }

  console.log('✅ Supabase deployment completed successfully!');
}

// Run the deployment
deployToSupabase().catch(error => {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
});
