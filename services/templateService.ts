import { workoutService } from './workoutService';

// Unified template interface
export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  exercises: TemplateExercise[];
  duration: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  color: string;
  icon: string;
  category?: string;
  createdAt: Date;
  authorId?: string;
  isPublic?: boolean;
  usageCount?: number;
  avgVolume?: number;
  lastUsed?: Date;
}

export interface TemplateExercise {
  id: string;
  name: string;
  sets: number;
  targetReps: string;
  restTime: number;
  percentage?: number; // For percentage-based exercises
  notes?: string;
  category?: string;
  equipment?: string;
}

// Workout exercise format for starting workouts
export interface WorkoutExercise {
  id: string;
  name: string;
  sets: number;
  targetReps: string;
  restTime: number;
  completed: boolean;
  percentage?: number;
  category?: string;
  equipment?: string;
}

class TemplateService {
  private templates: WorkoutTemplate[] = [
    {
      id: 'template_1',
      name: 'Upper Body Power',
      description: 'Chest, shoulders, and arms focused strength training',
      exercises: [
        { 
          id: 'ex1', 
          name: 'Bench Press', 
          sets: 4, 
          targetReps: '6-8', 
          restTime: 90,
          percentage: 85 
        },
        { 
          id: 'ex2', 
          name: 'Overhead Press', 
          sets: 3, 
          targetReps: '8-10', 
          restTime: 90,
          percentage: 80 
        },
        { 
          id: 'ex3', 
          name: 'Pull-ups', 
          sets: 3, 
          targetReps: '8-12', 
          restTime: 90 
        },
        { 
          id: 'ex4', 
          name: 'Dips', 
          sets: 3, 
          targetReps: '10-12', 
          restTime: 60 
        }
      ],
      duration: 45,
      difficulty: 'Intermediate',
      color: '#0A84FF',
      icon: 'barbell-outline',
      category: 'strength',
      createdAt: new Date(),
      usageCount: 12,
      avgVolume: 8500,
      lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'template_2',
      name: 'Lower Body Blast',
      description: 'Legs and glutes strength and power development',
      exercises: [
        { 
          id: 'ex1', 
          name: 'Squats', 
          sets: 4, 
          targetReps: '8-10', 
          restTime: 120,
          percentage: 80 
        },
        { 
          id: 'ex2', 
          name: 'Romanian Deadlift', 
          sets: 3, 
          targetReps: '10-12', 
          restTime: 90,
          percentage: 75 
        },
        { 
          id: 'ex3', 
          name: 'Bulgarian Split Squats', 
          sets: 3, 
          targetReps: '8-10', 
          restTime: 90 
        },
        { 
          id: 'ex4', 
          name: 'Glute Bridges', 
          sets: 3, 
          targetReps: '12-15', 
          restTime: 60 
        }
      ],
      duration: 50,
      difficulty: 'Intermediate',
      color: '#FF2D55',
      icon: 'fitness-outline',
      category: 'strength',
      createdAt: new Date(),
      usageCount: 8,
      avgVolume: 9200,
      lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    {
      id: 'template_3',
      name: 'Quick Core',
      description: 'Fast and effective core strengthening routine',
      exercises: [
        { 
          id: 'ex1', 
          name: 'Plank', 
          sets: 3, 
          targetReps: '30-60s', 
          restTime: 45 
        },
        { 
          id: 'ex2', 
          name: 'Russian Twists', 
          sets: 3, 
          targetReps: '20', 
          restTime: 45 
        },
        { 
          id: 'ex3', 
          name: 'Dead Bug', 
          sets: 3, 
          targetReps: '10 each', 
          restTime: 45 
        },
        { 
          id: 'ex4', 
          name: 'Mountain Climbers', 
          sets: 3, 
          targetReps: '20', 
          restTime: 45 
        }
      ],
      duration: 20,
      difficulty: 'Beginner',
      color: '#30D158',
      icon: 'body-outline',
      category: 'core',
      createdAt: new Date(),
      usageCount: 15,
      avgVolume: 3200
    },
    {
      id: 'template_4',
      name: 'Full Body HIIT',
      description: 'High intensity circuit for total body conditioning',
      exercises: [
        { 
          id: 'ex1', 
          name: 'Burpees', 
          sets: 4, 
          targetReps: '10', 
          restTime: 60 
        },
        { 
          id: 'ex2', 
          name: 'Jump Squats', 
          sets: 4, 
          targetReps: '15', 
          restTime: 60 
        },
        { 
          id: 'ex3', 
          name: 'Push-up to T', 
          sets: 4, 
          targetReps: '8', 
          restTime: 60 
        },
        { 
          id: 'ex4', 
          name: 'High Knees', 
          sets: 4, 
          targetReps: '30s', 
          restTime: 60 
        }
      ],
      duration: 25,
      difficulty: 'Advanced',
      color: '#FF9F0A',
      icon: 'flash-outline',
      category: 'hiit',
      createdAt: new Date(),
      usageCount: 6,
      avgVolume: 4800
    }
  ];

  // Get all templates
  async getTemplates(): Promise<WorkoutTemplate[]> {
    try {
      // In a real app, this would fetch from Supabase
      // For now, return mock data
      return this.templates;
    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.templates; // Fallback to mock data
    }
  }

  // Get template by ID
  async getTemplateById(id: string): Promise<WorkoutTemplate | null> {
    try {
      const template = this.templates.find(t => t.id === id);
      return template || null;
    } catch (error) {
      console.error('Error fetching template:', error);
      return null;
    }
  }

  // Convert template to workout exercises
  convertTemplateToWorkout(template: WorkoutTemplate): WorkoutExercise[] {
    return template.exercises.map((exercise, index) => ({
      id: exercise.id || `ex${index + 1}`,
      name: exercise.name,
      sets: exercise.sets,
      targetReps: exercise.targetReps,
      restTime: exercise.restTime,
      completed: false,
      percentage: exercise.percentage,
      category: exercise.category,
      equipment: exercise.equipment
    }));
  }

  // Save template
  async saveTemplate(template: Omit<WorkoutTemplate, 'id' | 'createdAt'>): Promise<WorkoutTemplate> {
    try {
      const newTemplate: WorkoutTemplate = {
        ...template,
        id: `template_${Date.now()}`,
        createdAt: new Date(),
        usageCount: 0
      };
      
      this.templates.push(newTemplate);
      return newTemplate;
    } catch (error) {
      console.error('Error saving template:', error);
      throw error;
    }
  }

  // Update template usage
  async updateTemplateUsage(templateId: string): Promise<void> {
    try {
      const template = this.templates.find(t => t.id === templateId);
      if (template) {
        template.usageCount = (template.usageCount || 0) + 1;
        template.lastUsed = new Date();
      }
    } catch (error) {
      console.error('Error updating template usage:', error);
    }
  }

  // Get templates by category
  async getTemplatesByCategory(category: string): Promise<WorkoutTemplate[]> {
    try {
      return this.templates.filter(t => t.category === category);
    } catch (error) {
      console.error('Error fetching templates by category:', error);
      return [];
    }
  }

  // Get recent templates
  async getRecentTemplates(limit: number = 5): Promise<WorkoutTemplate[]> {
    try {
      return this.templates
        .filter(t => t.lastUsed)
        .sort((a, b) => (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0))
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent templates:', error);
      return [];
    }
  }

  // Get popular templates
  async getPopularTemplates(limit: number = 5): Promise<WorkoutTemplate[]> {
    try {
      return this.templates
        .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching popular templates:', error);
      return [];
    }
  }
}

export const templateService = new TemplateService();
