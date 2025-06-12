/**
 * Elite Locker - Validation Utilities
 * 
 * This file contains utilities for validating data and preventing runtime errors.
 */

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Base validator class
export abstract class BaseValidator<T> {
  abstract validate(value: T): ValidationResult;

  protected createResult(isValid: boolean, errors: string[] = [], warnings: string[] = []): ValidationResult {
    return { isValid, errors, warnings };
  }
}

// String validators
export class StringValidator extends BaseValidator<string> {
  private minLength?: number;
  private maxLength?: number;
  private pattern?: RegExp;
  private required: boolean = false;

  setMinLength(length: number): this {
    this.minLength = length;
    return this;
  }

  setMaxLength(length: number): this {
    this.maxLength = length;
    return this;
  }

  setPattern(pattern: RegExp): this {
    this.pattern = pattern;
    return this;
  }

  setRequired(required: boolean = true): this {
    this.required = required;
    return this;
  }

  validate(value: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if value exists when required
    if (this.required && (!value || value.trim().length === 0)) {
      errors.push('This field is required');
      return this.createResult(false, errors, warnings);
    }

    // Skip other validations if value is empty and not required
    if (!value || value.trim().length === 0) {
      return this.createResult(true, errors, warnings);
    }

    // Check minimum length
    if (this.minLength !== undefined && value.length < this.minLength) {
      errors.push(`Minimum length is ${this.minLength} characters`);
    }

    // Check maximum length
    if (this.maxLength !== undefined && value.length > this.maxLength) {
      errors.push(`Maximum length is ${this.maxLength} characters`);
    }

    // Check pattern
    if (this.pattern && !this.pattern.test(value)) {
      errors.push('Invalid format');
    }

    // Add warnings for potential issues
    if (value.length > 100) {
      warnings.push('This is a very long text');
    }

    return this.createResult(errors.length === 0, errors, warnings);
  }
}

// Number validators
export class NumberValidator extends BaseValidator<number> {
  private min?: number;
  private max?: number;
  private integer: boolean = false;
  private positive: boolean = false;

  setMin(min: number): this {
    this.min = min;
    return this;
  }

  setMax(max: number): this {
    this.max = max;
    return this;
  }

  setInteger(integer: boolean = true): this {
    this.integer = integer;
    return this;
  }

  setPositive(positive: boolean = true): this {
    this.positive = positive;
    return this;
  }

  validate(value: number): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if value is a valid number
    if (typeof value !== 'number' || isNaN(value)) {
      errors.push('Must be a valid number');
      return this.createResult(false, errors, warnings);
    }

    // Check minimum value
    if (this.min !== undefined && value < this.min) {
      errors.push(`Minimum value is ${this.min}`);
    }

    // Check maximum value
    if (this.max !== undefined && value > this.max) {
      errors.push(`Maximum value is ${this.max}`);
    }

    // Check if should be integer
    if (this.integer && !Number.isInteger(value)) {
      errors.push('Must be a whole number');
    }

    // Check if should be positive
    if (this.positive && value <= 0) {
      errors.push('Must be a positive number');
    }

    // Add warnings
    if (value > 1000000) {
      warnings.push('This is a very large number');
    }

    return this.createResult(errors.length === 0, errors, warnings);
  }
}

// Email validator
export class EmailValidator extends BaseValidator<string> {
  private static readonly EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  validate(value: string): ValidationResult {
    const errors: string[] = [];

    if (!value || value.trim().length === 0) {
      errors.push('Email is required');
      return this.createResult(false, errors);
    }

    if (!EmailValidator.EMAIL_PATTERN.test(value)) {
      errors.push('Invalid email format');
    }

    return this.createResult(errors.length === 0, errors);
  }
}

// Exercise set validator
export class ExerciseSetValidator extends BaseValidator<any> {
  validate(set: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!set || typeof set !== 'object') {
      errors.push('Invalid set data');
      return this.createResult(false, errors);
    }

    // Validate ID
    if (!set.id) {
      errors.push('Set ID is required');
    }

    // Validate weight
    if (set.weight !== undefined && set.weight !== '') {
      const weight = parseFloat(set.weight);
      if (isNaN(weight)) {
        errors.push('Weight must be a valid number');
      } else if (weight < 0) {
        errors.push('Weight cannot be negative');
      } else if (weight > 1000) {
        warnings.push('This is a very heavy weight');
      }
    }

    // Validate reps
    if (set.reps !== undefined && set.reps !== '') {
      const reps = parseInt(set.reps);
      if (isNaN(reps)) {
        errors.push('Reps must be a valid number');
      } else if (reps < 0) {
        errors.push('Reps cannot be negative');
      } else if (reps > 100) {
        warnings.push('This is a very high rep count');
      }
    }

    // Validate completed status
    if (typeof set.completed !== 'boolean') {
      errors.push('Completed status must be true or false');
    }

    return this.createResult(errors.length === 0, errors, warnings);
  }
}

// Workout validator
export class WorkoutValidator extends BaseValidator<any> {
  validate(workout: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!workout || typeof workout !== 'object') {
      errors.push('Invalid workout data');
      return this.createResult(false, errors);
    }

    // Validate title
    if (!workout.title || workout.title.trim().length === 0) {
      errors.push('Workout title is required');
    } else if (workout.title.length > 100) {
      warnings.push('Workout title is very long');
    }

    // Validate exercises
    if (!Array.isArray(workout.exercises)) {
      errors.push('Workout must have exercises array');
    } else if (workout.exercises.length === 0) {
      warnings.push('Workout has no exercises');
    }

    // Validate date
    if (workout.date && !(workout.date instanceof Date) && isNaN(Date.parse(workout.date))) {
      errors.push('Invalid workout date');
    }

    return this.createResult(errors.length === 0, errors, warnings);
  }
}

// Utility functions for common validations
export const ValidationUtils = {
  // Validate required fields
  validateRequired(value: any, fieldName: string): string | null {
    if (value === null || value === undefined || value === '') {
      return `${fieldName} is required`;
    }
    return null;
  },

  // Validate array
  validateArray(value: any, fieldName: string, minLength?: number): string | null {
    if (!Array.isArray(value)) {
      return `${fieldName} must be an array`;
    }
    if (minLength !== undefined && value.length < minLength) {
      return `${fieldName} must have at least ${minLength} items`;
    }
    return null;
  },

  // Validate object
  validateObject(value: any, fieldName: string, requiredKeys?: string[]): string | null {
    if (!value || typeof value !== 'object') {
      return `${fieldName} must be an object`;
    }
    if (requiredKeys) {
      for (const key of requiredKeys) {
        if (!(key in value)) {
          return `${fieldName} must have ${key} property`;
        }
      }
    }
    return null;
  },

  // Validate ID format
  validateId(value: any, fieldName: string = 'ID'): string | null {
    if (!value) {
      return `${fieldName} is required`;
    }
    if (typeof value !== 'string' && typeof value !== 'number') {
      return `${fieldName} must be a string or number`;
    }
    if (typeof value === 'string' && value.trim().length === 0) {
      return `${fieldName} cannot be empty`;
    }
    return null;
  },

  // Validate URL
  validateUrl(value: string, fieldName: string = 'URL'): string | null {
    if (!value) return null; // Optional field
    
    try {
      new URL(value);
      return null;
    } catch {
      return `${fieldName} must be a valid URL`;
    }
  },

  // Batch validation
  validateBatch(validations: Array<() => string | null>): string[] {
    const errors: string[] = [];
    for (const validation of validations) {
      const error = validation();
      if (error) {
        errors.push(error);
      }
    }
    return errors;
  }
};

// Pre-configured validators for common use cases
export const Validators = {
  workoutTitle: new StringValidator().setRequired().setMinLength(1).setMaxLength(100),
  exerciseName: new StringValidator().setRequired().setMinLength(1).setMaxLength(50),
  weight: new NumberValidator().setMin(0).setMax(1000),
  reps: new NumberValidator().setInteger().setMin(0).setMax(100),
  email: new EmailValidator(),
  exerciseSet: new ExerciseSetValidator(),
  workout: new WorkoutValidator()
};
