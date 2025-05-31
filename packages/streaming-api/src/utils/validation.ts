import Joi from 'joi';
import { WorkoutUpdate, SessionStats } from '@elite-locker/shared-types';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Workout Update Validation Schema
const workoutUpdateSchema = Joi.object({
  sessionId: Joi.string().required(),
  userId: Joi.string().required(),
  currentExercise: Joi.object({
    name: Joi.string().required(),
    category: Joi.string().required(),
    muscleGroups: Joi.array().items(Joi.string()).required()
  }).required(),
  currentSet: Joi.object({
    setNumber: Joi.number().integer().min(1).required(),
    reps: Joi.number().integer().min(0).required(),
    weight: Joi.number().min(0).required(),
    restTime: Joi.number().integer().min(0).optional(),
    completed: Joi.boolean().required()
  }).required(),
  sessionProgress: Joi.object({
    exercisesCompleted: Joi.number().integer().min(0).required(),
    totalExercises: Joi.number().integer().min(1).required(),
    timeElapsed: Joi.number().integer().min(0).required(),
    estimatedTimeRemaining: Joi.number().integer().min(0).optional()
  }).required(),
  timestamp: Joi.date().required()
});

// Session Stats Validation Schema
const sessionStatsSchema = Joi.object({
  sessionId: Joi.string().required(),
  userId: Joi.string().required(),
  totalTime: Joi.number().integer().min(0).required(),
  exercisesCompleted: Joi.number().integer().min(0).required(),
  totalSets: Joi.number().integer().min(0).required(),
  totalReps: Joi.number().integer().min(0).required(),
  totalVolume: Joi.number().min(0).required(),
  caloriesBurned: Joi.number().min(0).optional(),
  averageRestTime: Joi.number().min(0).optional(),
  personalRecords: Joi.array().items(
    Joi.object({
      exerciseName: Joi.string().required(),
      type: Joi.string().valid('weight', 'reps', 'volume', 'time').required(),
      value: Joi.number().min(0).required(),
      previousValue: Joi.number().min(0).optional(),
      improvement: Joi.number().required()
    })
  ).required(),
  timestamp: Joi.date().required()
});

// Streaming Settings Validation Schema
const streamingSettingsSchema = Joi.object({
  userId: Joi.string().required(),
  theme: Joi.string().valid('default', 'neon', 'minimal', 'gaming').required(),
  dataSharing: Joi.object({
    shareCurrentExercise: Joi.boolean().required(),
    sharePersonalStats: Joi.boolean().required(),
    shareGoals: Joi.boolean().required(),
    shareProgressPhotos: Joi.boolean().required(),
    shareWorkoutNotes: Joi.boolean().required(),
    allowViewerInteraction: Joi.boolean().required()
  }).required(),
  overlayPosition: Joi.object({
    x: Joi.number().min(0).max(100).required(),
    y: Joi.number().min(0).max(100).required(),
    width: Joi.number().min(10).max(100).required(),
    height: Joi.number().min(10).max(100).required()
  }).required(),
  customColors: Joi.object({
    primary: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
    secondary: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
    accent: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
    background: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
    text: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional()
  }).optional(),
  showPersonalStats: Joi.boolean().required(),
  showGoals: Joi.boolean().required(),
  showCurrentExercise: Joi.boolean().required(),
  showSessionStats: Joi.boolean().required()
});

// User Registration Schema
const userRegistrationSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required(),
  displayName: Joi.string().min(1).max(50).required()
});

// User Login Schema
const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Overlay URL Schema
const overlayUrlSchema = Joi.object({
  overlayUrl: Joi.string().alphanum().min(8).max(32).required()
});

export function validateWorkoutUpdate(data: any): ValidationResult {
  const { error } = workoutUpdateSchema.validate(data, { abortEarly: false });
  
  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => detail.message)
    };
  }
  
  return { isValid: true, errors: [] };
}

export function validateSessionStats(data: any): ValidationResult {
  const { error } = sessionStatsSchema.validate(data, { abortEarly: false });
  
  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => detail.message)
    };
  }
  
  return { isValid: true, errors: [] };
}

export function validateStreamingSettings(data: any): ValidationResult {
  const { error } = streamingSettingsSchema.validate(data, { abortEarly: false });
  
  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => detail.message)
    };
  }
  
  return { isValid: true, errors: [] };
}

export function validateUserRegistration(data: any): ValidationResult {
  const { error } = userRegistrationSchema.validate(data, { abortEarly: false });
  
  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => detail.message)
    };
  }
  
  return { isValid: true, errors: [] };
}

export function validateUserLogin(data: any): ValidationResult {
  const { error } = userLoginSchema.validate(data, { abortEarly: false });
  
  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => detail.message)
    };
  }
  
  return { isValid: true, errors: [] };
}

export function validateOverlayUrl(data: any): ValidationResult {
  const { error } = overlayUrlSchema.validate(data, { abortEarly: false });
  
  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => detail.message)
    };
  }
  
  return { isValid: true, errors: [] };
}

// Generic validation function
export function validateSchema(schema: Joi.ObjectSchema, data: any): ValidationResult {
  const { error } = schema.validate(data, { abortEarly: false });
  
  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => detail.message)
    };
  }
  
  return { isValid: true, errors: [] };
}
