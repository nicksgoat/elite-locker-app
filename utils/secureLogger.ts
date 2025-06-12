/**
 * Elite Locker - Secure Logging System
 * 
 * This file provides secure logging that prevents sensitive data exposure.
 */

import { config, shouldMaskSensitiveData, getLogLevel } from '../config/environment';

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// Sensitive data patterns to mask
const SENSITIVE_PATTERNS = [
  // API Keys and tokens
  /\b[A-Za-z0-9]{32,}\b/g, // Generic long alphanumeric strings
  /\bsk_[a-zA-Z0-9_]+/g, // Stripe secret keys
  /\bpk_[a-zA-Z0-9_]+/g, // Stripe publishable keys
  /\bsupabase[_-]?[a-zA-Z0-9_-]+/gi, // Supabase keys
  /\bbearer\s+[a-zA-Z0-9_-]+/gi, // Bearer tokens
  /\bauthorization:\s*[^\s]+/gi, // Authorization headers
  
  // Personal information
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email addresses
  /\b\d{3}-\d{2}-\d{4}\b/g, // SSN format
  /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // Credit card numbers
  /\b\d{3}-\d{3}-\d{4}\b/g, // Phone numbers
  
  // Passwords and secrets
  /password['":\s]*['"]\w+['"]/gi,
  /secret['":\s]*['"]\w+['"]/gi,
  /token['":\s]*['"]\w+['"]/gi,
];

// Sensitive field names to mask
const SENSITIVE_FIELDS = [
  'password',
  'secret',
  'token',
  'key',
  'authorization',
  'auth',
  'credential',
  'private',
  'confidential',
  'ssn',
  'social_security',
  'credit_card',
  'card_number',
  'cvv',
  'pin',
];

// Log entry interface
interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: number;
  component?: string;
  userId?: string;
  sessionId?: string;
  error?: Error;
}

// Mask sensitive data in strings
const maskSensitiveString = (str: string): string => {
  if (!shouldMaskSensitiveData()) {
    return str;
  }
  
  let masked = str;
  
  // Apply all sensitive patterns
  SENSITIVE_PATTERNS.forEach(pattern => {
    masked = masked.replace(pattern, (match) => {
      // Keep first and last 2 characters, mask the middle
      if (match.length <= 4) {
        return '*'.repeat(match.length);
      }
      return match.substring(0, 2) + '*'.repeat(match.length - 4) + match.substring(match.length - 2);
    });
  });
  
  return masked;
};

// Mask sensitive data in objects
const maskSensitiveObject = (obj: any): any => {
  if (!shouldMaskSensitiveData()) {
    return obj;
  }
  
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'string') {
    return maskSensitiveString(obj);
  }
  
  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => maskSensitiveObject(item));
  }
  
  if (typeof obj === 'object') {
    const masked: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      
      // Check if field name is sensitive
      const isSensitiveField = SENSITIVE_FIELDS.some(field => 
        lowerKey.includes(field)
      );
      
      if (isSensitiveField) {
        masked[key] = '***MASKED***';
      } else {
        masked[key] = maskSensitiveObject(value);
      }
    }
    
    return masked;
  }
  
  return obj;
};

// Get current log level as number
const getCurrentLogLevel = (): LogLevel => {
  const level = getLogLevel();
  switch (level) {
    case 'debug': return LogLevel.DEBUG;
    case 'info': return LogLevel.INFO;
    case 'warn': return LogLevel.WARN;
    case 'error': return LogLevel.ERROR;
    default: return LogLevel.INFO;
  }
};

// Check if log level should be output
const shouldLog = (level: LogLevel): boolean => {
  return level >= getCurrentLogLevel();
};

// Format log entry for output
const formatLogEntry = (entry: LogEntry): string => {
  const timestamp = new Date(entry.timestamp).toISOString();
  const levelName = LogLevel[entry.level];
  const component = entry.component ? `[${entry.component}]` : '';
  
  let formatted = `${timestamp} ${levelName} ${component} ${entry.message}`;
  
  if (entry.data) {
    const maskedData = maskSensitiveObject(entry.data);
    formatted += `\nData: ${JSON.stringify(maskedData, null, 2)}`;
  }
  
  if (entry.error) {
    formatted += `\nError: ${entry.error.message}`;
    if (entry.error.stack && getCurrentLogLevel() <= LogLevel.DEBUG) {
      formatted += `\nStack: ${entry.error.stack}`;
    }
  }
  
  return formatted;
};

// Secure logger class
export class SecureLogger {
  private component?: string;
  private userId?: string;
  private sessionId?: string;
  
  constructor(component?: string) {
    this.component = component;
  }
  
  setContext(userId?: string, sessionId?: string): void {
    this.userId = userId;
    this.sessionId = sessionId;
  }
  
  private log(level: LogLevel, message: string, data?: any, error?: Error): void {
    if (!shouldLog(level)) {
      return;
    }
    
    const entry: LogEntry = {
      level,
      message: maskSensitiveString(message),
      data: data ? maskSensitiveObject(data) : undefined,
      timestamp: Date.now(),
      component: this.component,
      userId: this.userId,
      sessionId: this.sessionId,
      error,
    };
    
    const formatted = formatLogEntry(entry);
    
    // Output to console based on level
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
        console.error(formatted);
        break;
    }
    
    // Send to remote logging service if enabled
    if (config.logging.enableRemoteLogging && level >= LogLevel.WARN) {
      this.sendToRemoteLogger(entry);
    }
  }
  
  private async sendToRemoteLogger(entry: LogEntry): Promise<void> {
    try {
      // Implementation would send to remote logging service
      // This is a placeholder for actual remote logging integration
      console.log('📡 Sending to remote logger:', entry.message);
    } catch (error) {
      // Don't log errors from the logger itself to avoid infinite loops
      console.error('Failed to send log to remote service:', error);
    }
  }
  
  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }
  
  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }
  
  warn(message: string, data?: any, error?: Error): void {
    this.log(LogLevel.WARN, message, data, error);
  }
  
  error(message: string, data?: any, error?: Error): void {
    this.log(LogLevel.ERROR, message, data, error);
  }
  
  // Convenience methods for common scenarios
  apiCall(method: string, url: string, data?: any): void {
    this.debug(`API ${method} ${url}`, data);
  }
  
  apiResponse(method: string, url: string, status: number, data?: any): void {
    if (status >= 400) {
      this.error(`API ${method} ${url} failed with status ${status}`, data);
    } else {
      this.debug(`API ${method} ${url} succeeded with status ${status}`, data);
    }
  }
  
  userAction(action: string, data?: any): void {
    this.info(`User action: ${action}`, data);
  }
  
  securityEvent(event: string, data?: any): void {
    this.warn(`Security event: ${event}`, data);
  }
  
  performanceMetric(metric: string, value: number, unit: string = 'ms'): void {
    this.info(`Performance: ${metric} = ${value}${unit}`);
  }
}

// Create default logger instance
export const logger = new SecureLogger('App');

// Create component-specific loggers
export const createLogger = (component: string): SecureLogger => {
  return new SecureLogger(component);
};

// Utility functions for common logging patterns
export const logApiError = (error: any, context: string): void => {
  logger.error(`API Error in ${context}`, {
    message: error.message,
    status: error.status,
    code: error.code,
  }, error);
};

export const logUserAction = (action: string, userId?: string, data?: any): void => {
  const actionLogger = new SecureLogger('UserAction');
  actionLogger.setContext(userId);
  actionLogger.userAction(action, data);
};

export const logSecurityEvent = (event: string, userId?: string, data?: any): void => {
  const securityLogger = new SecureLogger('Security');
  securityLogger.setContext(userId);
  securityLogger.securityEvent(event, data);
};

export const logPerformance = (metric: string, value: number, component?: string): void => {
  const perfLogger = new SecureLogger(component || 'Performance');
  perfLogger.performanceMetric(metric, value);
};
