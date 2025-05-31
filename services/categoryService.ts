/**
 * Elite Locker - Category Service
 *
 * Service for managing dynamic marketplace categories with database integration.
 */

import { supabase } from '../lib/supabase';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color_hex: string;
  icon: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
  color_hex: string;
  icon: string;
  sort_order?: number;
}

export interface UpdateCategoryData {
  name?: string;
  slug?: string;
  description?: string;
  color_hex?: string;
  icon?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface CategoryContentCounts {
  workouts: number;
  programs: number;
  exercises: number;
  clubs: number;
}

class CategoryService {
  /**
   * Get all active categories ordered by sort_order
   */
  async getCategories(): Promise<Category[]> {
    try {
      console.log('🔍 Fetching categories from database...');

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('❌ Error fetching categories from database:', error);
        console.log('📋 Using fallback categories instead');
        return this.getFallbackCategories();
      }

      if (data && data.length > 0) {
        console.log(`✅ Successfully loaded ${data.length} categories from database`);
        return data;
      } else {
        console.log('📋 No categories found in database, using fallback categories');
        return this.getFallbackCategories();
      }
    } catch (error) {
      console.error('❌ Exception in getCategories:', error);
      console.log('📋 Using fallback categories due to exception');
      return this.getFallbackCategories();
    }
  }

  /**
   * Get a single category by slug
   */
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching category by slug:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getCategoryBySlug:', error);
      return null;
    }
  }

  /**
   * Get content counts for each category
   */
  async getCategoryContentCounts(categoryId: string): Promise<CategoryContentCounts> {
    try {
      const [workoutsResult, programsResult, exercisesResult, clubsResult] = await Promise.all([
        supabase
          .from('workouts')
          .select('id', { count: 'exact', head: true })
          .eq('category_id', categoryId),
        supabase
          .from('programs')
          .select('id', { count: 'exact', head: true })
          .eq('category_id', categoryId),
        supabase
          .from('exercises')
          .select('id', { count: 'exact', head: true })
          .eq('category_id', categoryId),
        supabase
          .from('clubs')
          .select('id', { count: 'exact', head: true })
          .eq('category_id', categoryId),
      ]);

      return {
        workouts: workoutsResult.count || 0,
        programs: programsResult.count || 0,
        exercises: exercisesResult.count || 0,
        clubs: clubsResult.count || 0,
      };
    } catch (error) {
      console.error('Error getting category content counts:', error);
      return { workouts: 0, programs: 0, exercises: 0, clubs: 0 };
    }
  }

  /**
   * Create a new category
   */
  async createCategory(categoryData: CreateCategoryData): Promise<Category | null> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([categoryData])
        .select()
        .single();

      if (error) {
        console.error('Error creating category:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createCategory:', error);
      return null;
    }
  }

  /**
   * Update an existing category
   */
  async updateCategory(id: string, updateData: UpdateCategoryData): Promise<Category | null> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating category:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateCategory:', error);
      return null;
    }
  }

  /**
   * Delete a category (soft delete by setting is_active to false)
   */
  async deleteCategory(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error('Error deleting category:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteCategory:', error);
      return false;
    }
  }

  /**
   * Get workouts by category
   */
  async getWorkoutsByCategory(categoryId: string, limit: number = 20) {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          *,
          categories!inner(name, slug, color_hex)
        `)
        .eq('category_id', categoryId)
        .eq('is_template', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching workouts by category:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getWorkoutsByCategory:', error);
      return [];
    }
  }

  /**
   * Get programs by category
   */
  async getProgramsByCategory(categoryId: string, limit: number = 20) {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select(`
          *,
          categories!inner(name, slug, color_hex)
        `)
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching programs by category:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getProgramsByCategory:', error);
      return [];
    }
  }

  /**
   * Get exercises by category
   */
  async getExercisesByCategory(categoryId: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select(`
          *,
          categories!inner(name, slug, color_hex)
        `)
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching exercises by category:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getExercisesByCategory:', error);
      return [];
    }
  }

  /**
   * Fallback categories when database is unavailable
   */
  private getFallbackCategories(): Category[] {
    return [
      {
        id: 'featured',
        name: 'Featured',
        slug: 'featured',
        description: 'Highlighted content across all categories',
        color_hex: '#0A84FF',
        icon: 'star-outline',
        is_active: true,
        sort_order: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'strength',
        name: 'Strength Training',
        slug: 'strength',
        description: 'Build muscle and increase power',
        color_hex: '#FF2D55',
        icon: 'barbell-outline',
        is_active: true,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'cardio',
        name: 'Cardio',
        slug: 'cardio',
        description: 'Improve cardiovascular health',
        color_hex: '#30D158',
        icon: 'heart-outline',
        is_active: true,
        sort_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'hiit',
        name: 'HIIT',
        slug: 'hiit',
        description: 'High-intensity interval training',
        color_hex: '#FF9F0A',
        icon: 'timer-outline',
        is_active: true,
        sort_order: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }
}

export const categoryService = new CategoryService();
