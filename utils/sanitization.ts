/**
 * Elite Locker - Input Sanitization System
 * 
 * This file provides comprehensive input sanitization to prevent security vulnerabilities.
 */

import { createLogger } from './secureLogger';

const logger = createLogger('Sanitization');

// Sanitization options
export interface SanitizationOptions {
  allowHtml?: boolean;
  maxLength?: number;
  allowedCharacters?: RegExp;
  trimWhitespace?: boolean;
  convertToLowerCase?: boolean;
  removeEmojis?: boolean;
  allowNumbers?: boolean;
  allowSpecialChars?: boolean;
}

// Default sanitization options
const DEFAULT_OPTIONS: SanitizationOptions = {
  allowHtml: false,
  maxLength: 1000,
  trimWhitespace: true,
  convertToLowerCase: false,
  removeEmojis: false,
  allowNumbers: true,
  allowSpecialChars: true,
};

// Common regex patterns
const PATTERNS = {
  // Security threats
  SQL_INJECTION: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
  XSS_SCRIPT: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  XSS_EVENTS: /\bon\w+\s*=/gi,
  HTML_TAGS: /<[^>]*>/g,
  
  // Data patterns
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]{10,}$/,
  URL: /^https?:\/\/[^\s]+$/,
  
  // Character sets
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  ALPHANUMERIC_SPACES: /^[a-zA-Z0-9\s]+$/,
  LETTERS_ONLY: /^[a-zA-Z]+$/,
  NUMBERS_ONLY: /^[0-9]+$/,
  EMOJI: /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
  
  // Workout specific
  EXERCISE_NAME: /^[a-zA-Z0-9\s\-\(\)\/]+$/,
  WEIGHT_VALUE: /^\d+(\.\d{1,2})?$/,
  REP_COUNT: /^\d{1,3}$/,
  DURATION: /^\d{1,4}$/,
};

// Sanitization result
export interface SanitizationResult {
  sanitized: string;
  isValid: boolean;
  warnings: string[];
  originalLength: number;
  sanitizedLength: number;
}

// Base sanitizer class
export abstract class BaseSanitizer {
  protected options: SanitizationOptions;
  
  constructor(options: Partial<SanitizationOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }
  
  abstract sanitize(input: string): SanitizationResult;
  
  protected createResult(
    sanitized: string,
    original: string,
    warnings: string[] = []
  ): SanitizationResult {
    return {
      sanitized,
      isValid: warnings.length === 0,
      warnings,
      originalLength: original.length,
      sanitizedLength: sanitized.length,
    };
  }
  
  protected logSanitization(input: string, result: SanitizationResult): void {
    if (result.warnings.length > 0) {
      logger.warn('Input sanitization warnings', {
        inputLength: result.originalLength,
        outputLength: result.sanitizedLength,
        warnings: result.warnings,
      });
    }
  }
}

// General text sanitizer
export class TextSanitizer extends BaseSanitizer {
  sanitize(input: string): SanitizationResult {
    if (typeof input !== 'string') {
      return this.createResult('', String(input), ['Input is not a string']);
    }
    
    let sanitized = input;
    const warnings: string[] = [];
    
    // Check for security threats
    if (PATTERNS.SQL_INJECTION.test(sanitized)) {
      warnings.push('Potential SQL injection detected');
      sanitized = sanitized.replace(PATTERNS.SQL_INJECTION, '');
    }
    
    if (PATTERNS.XSS_SCRIPT.test(sanitized)) {
      warnings.push('Script tags detected and removed');
      sanitized = sanitized.replace(PATTERNS.XSS_SCRIPT, '');
    }
    
    if (PATTERNS.XSS_EVENTS.test(sanitized)) {
      warnings.push('Event handlers detected and removed');
      sanitized = sanitized.replace(PATTERNS.XSS_EVENTS, '');
    }
    
    // Remove HTML tags if not allowed
    if (!this.options.allowHtml && PATTERNS.HTML_TAGS.test(sanitized)) {
      warnings.push('HTML tags removed');
      sanitized = sanitized.replace(PATTERNS.HTML_TAGS, '');
    }
    
    // Remove emojis if not allowed
    if (this.options.removeEmojis && PATTERNS.EMOJI.test(sanitized)) {
      warnings.push('Emojis removed');
      sanitized = sanitized.replace(PATTERNS.EMOJI, '');
    }
    
    // Trim whitespace
    if (this.options.trimWhitespace) {
      sanitized = sanitized.trim();
    }
    
    // Convert to lowercase
    if (this.options.convertToLowerCase) {
      sanitized = sanitized.toLowerCase();
    }
    
    // Check length
    if (this.options.maxLength && sanitized.length > this.options.maxLength) {
      warnings.push(`Input truncated to ${this.options.maxLength} characters`);
      sanitized = sanitized.substring(0, this.options.maxLength);
    }
    
    // Check allowed characters
    if (this.options.allowedCharacters && !this.options.allowedCharacters.test(sanitized)) {
      warnings.push('Invalid characters detected');
      sanitized = sanitized.replace(new RegExp(`[^${this.options.allowedCharacters.source}]`, 'g'), '');
    }
    
    const result = this.createResult(sanitized, input, warnings);
    this.logSanitization(input, result);
    
    return result;
  }
}

// Exercise name sanitizer
export class ExerciseNameSanitizer extends BaseSanitizer {
  constructor() {
    super({
      maxLength: 100,
      allowedCharacters: PATTERNS.EXERCISE_NAME,
      trimWhitespace: true,
    });
  }
  
  sanitize(input: string): SanitizationResult {
    const textSanitizer = new TextSanitizer(this.options);
    const result = textSanitizer.sanitize(input);
    
    // Additional exercise-specific validation
    if (result.sanitized.length < 2) {
      result.warnings.push('Exercise name too short');
      result.isValid = false;
    }
    
    return result;
  }
}

// Numeric value sanitizer
export class NumericSanitizer extends BaseSanitizer {
  private min?: number;
  private max?: number;
  private decimals?: number;
  
  constructor(min?: number, max?: number, decimals?: number) {
    super();
    this.min = min;
    this.max = max;
    this.decimals = decimals;
  }
  
  sanitize(input: string): SanitizationResult {
    const warnings: string[] = [];
    let sanitized = String(input).trim();
    
    // Remove non-numeric characters except decimal point
    sanitized = sanitized.replace(/[^0-9.]/g, '');
    
    // Handle multiple decimal points
    const decimalParts = sanitized.split('.');
    if (decimalParts.length > 2) {
      warnings.push('Multiple decimal points removed');
      sanitized = decimalParts[0] + '.' + decimalParts.slice(1).join('');
    }
    
    // Limit decimal places
    if (this.decimals !== undefined && decimalParts.length === 2) {
      if (decimalParts[1].length > this.decimals) {
        warnings.push(`Decimal places limited to ${this.decimals}`);
        sanitized = decimalParts[0] + '.' + decimalParts[1].substring(0, this.decimals);
      }
    }
    
    // Validate range
    const numValue = parseFloat(sanitized);
    if (!isNaN(numValue)) {
      if (this.min !== undefined && numValue < this.min) {
        warnings.push(`Value below minimum (${this.min})`);
        sanitized = String(this.min);
      }
      
      if (this.max !== undefined && numValue > this.max) {
        warnings.push(`Value above maximum (${this.max})`);
        sanitized = String(this.max);
      }
    } else if (sanitized !== '') {
      warnings.push('Invalid numeric value');
      sanitized = '';
    }
    
    const result = this.createResult(sanitized, input, warnings);
    this.logSanitization(input, result);
    
    return result;
  }
}

// Email sanitizer
export class EmailSanitizer extends BaseSanitizer {
  sanitize(input: string): SanitizationResult {
    const warnings: string[] = [];
    let sanitized = String(input).trim().toLowerCase();
    
    // Basic email validation
    if (!PATTERNS.EMAIL.test(sanitized)) {
      warnings.push('Invalid email format');
      return this.createResult(sanitized, input, warnings);
    }
    
    // Additional email security checks
    if (sanitized.includes('..')) {
      warnings.push('Consecutive dots in email');
    }
    
    if (sanitized.length > 254) {
      warnings.push('Email too long');
      sanitized = sanitized.substring(0, 254);
    }
    
    const result = this.createResult(sanitized, input, warnings);
    this.logSanitization(input, result);
    
    return result;
  }
}

// Pre-configured sanitizers for common use cases
export const Sanitizers = {
  text: new TextSanitizer(),
  exerciseName: new ExerciseNameSanitizer(),
  weight: new NumericSanitizer(0, 2000, 2),
  reps: new NumericSanitizer(0, 999, 0),
  duration: new NumericSanitizer(0, 86400, 0), // Max 24 hours in seconds
  email: new EmailSanitizer(),
  
  // Workout-specific sanitizers
  workoutTitle: new TextSanitizer({ maxLength: 100, trimWhitespace: true }),
  workoutNotes: new TextSanitizer({ maxLength: 1000, allowHtml: false }),
  username: new TextSanitizer({ 
    maxLength: 30, 
    allowedCharacters: /^[a-zA-Z0-9_-]+$/,
    convertToLowerCase: true 
  }),
};

// Utility functions
export const sanitizeInput = (input: string, sanitizer: BaseSanitizer): string => {
  const result = sanitizer.sanitize(input);
  return result.sanitized;
};

export const validateAndSanitize = (input: string, sanitizer: BaseSanitizer): SanitizationResult => {
  return sanitizer.sanitize(input);
};

// Batch sanitization for objects
export const sanitizeObject = (
  obj: Record<string, any>,
  sanitizers: Record<string, BaseSanitizer>
): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (sanitizers[key] && typeof value === 'string') {
      sanitized[key] = sanitizeInput(value, sanitizers[key]);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};
