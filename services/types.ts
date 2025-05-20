/**
 * Elite Locker Services - Types
 * 
 * This file contains common types used across services.
 */

// API Error class for handling service errors
export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Training Max type for program context
export interface TrainingMax {
  id: string;
  exerciseId: string;
  exerciseName: string;
  value: number;
  unit: 'kg' | 'lb';
  lastUpdated: Date;
}

// Program Subscription type
export interface ProgramSubscription {
  id: string;
  programId: string;
  userId: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  startDate: Date;
  currentWeek: number;
  currentDay: number;
  lastCompletedWorkout?: {
    id: string;
    date: Date;
  };
}
