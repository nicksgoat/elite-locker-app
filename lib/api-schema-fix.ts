/**
 * Elite Locker - API Schema Fix
 *
 * This file contains a function to fix the schema issue with Supabase tables.
 * It adds the schema prefix to the table name if needed.
 */

import { supabase } from './supabase-client';

/**
 * Get the correct schema for a table
 * @param table The table name
 * @returns The schema name (public or api)
 */
export const getTableSchema = async (table: string): Promise<string> => {
  try {
    // Check if the table exists in the public schema
    const { data, error } = await supabase
      .from(table)
      .select('count(*)')
      .limit(1);
    
    if (!error) {
      return 'public';
    }
    
    // If there's an error, check if it's because the table is in the api schema
    if (error.message && error.message.includes('api')) {
      return 'api';
    }
    
    // Default to public
    return 'public';
  } catch (error) {
    console.error(`Error determining schema for table ${table}:`, error);
    return 'public';
  }
};

/**
 * Fix the schema issue by adding the schema prefix to the table name if needed
 * @param table The table name
 * @returns The table name with the correct schema prefix
 */
export const fixTableSchema = async (table: string): Promise<string> => {
  const schema = await getTableSchema(table);
  
  if (schema === 'api') {
    return `api.${table}`;
  }
  
  return table;
};

/**
 * Create a Supabase query with the correct schema
 * @param table The table name
 * @returns A Supabase query builder with the correct schema
 */
export const createSchemaQuery = async (table: string) => {
  const fixedTable = await fixTableSchema(table);
  
  if (fixedTable.startsWith('api.')) {
    return supabase.from(fixedTable.substring(4)).schema('api');
  }
  
  return supabase.from(table);
};
