/**
 * Elite Locker - Data Encryption Utilities
 * 
 * This file provides secure data encryption for sensitive information.
 */

import CryptoJS from 'crypto-js';
import { config, isEncryptionEnabled } from '../config/environment';
import { createLogger } from './secureLogger';

const logger = createLogger('Encryption');

// Encryption configuration
const ENCRYPTION_CONFIG = {
  algorithm: 'AES',
  keySize: 256,
  ivSize: 128,
  iterations: 10000,
  saltSize: 128,
};

// Generate a secure key from password
const generateKey = (password: string, salt: string): string => {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: ENCRYPTION_CONFIG.keySize / 32,
    iterations: ENCRYPTION_CONFIG.iterations,
  }).toString();
};

// Generate random salt
const generateSalt = (): string => {
  return CryptoJS.lib.WordArray.random(ENCRYPTION_CONFIG.saltSize / 8).toString();
};

// Generate random IV
const generateIV = (): string => {
  return CryptoJS.lib.WordArray.random(ENCRYPTION_CONFIG.ivSize / 8).toString();
};

// Encryption result interface
export interface EncryptionResult {
  encrypted: string;
  salt: string;
  iv: string;
  success: boolean;
  error?: string;
}

// Decryption result interface
export interface DecryptionResult {
  decrypted: string;
  success: boolean;
  error?: string;
}

// Encrypt data
export const encryptData = (data: string, password: string): EncryptionResult => {
  try {
    if (!isEncryptionEnabled()) {
      logger.warn('Encryption is disabled, returning plain text');
      return {
        encrypted: data,
        salt: '',
        iv: '',
        success: true,
      };
    }

    if (!data || !password) {
      return {
        encrypted: '',
        salt: '',
        iv: '',
        success: false,
        error: 'Data and password are required',
      };
    }

    const salt = generateSalt();
    const iv = generateIV();
    const key = generateKey(password, salt);

    const encrypted = CryptoJS.AES.encrypt(data, key, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }).toString();

    logger.debug('Data encrypted successfully');

    return {
      encrypted,
      salt,
      iv,
      success: true,
    };
  } catch (error) {
    logger.error('Encryption failed', { error: error.message });
    return {
      encrypted: '',
      salt: '',
      iv: '',
      success: false,
      error: error.message,
    };
  }
};

// Decrypt data
export const decryptData = (
  encrypted: string,
  password: string,
  salt: string,
  iv: string
): DecryptionResult => {
  try {
    if (!isEncryptionEnabled()) {
      logger.warn('Encryption is disabled, returning encrypted data as plain text');
      return {
        decrypted: encrypted,
        success: true,
      };
    }

    if (!encrypted || !password || !salt || !iv) {
      return {
        decrypted: '',
        success: false,
        error: 'All parameters are required for decryption',
      };
    }

    const key = generateKey(password, salt);

    const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }).toString(CryptoJS.enc.Utf8);

    if (!decrypted) {
      return {
        decrypted: '',
        success: false,
        error: 'Decryption failed - invalid password or corrupted data',
      };
    }

    logger.debug('Data decrypted successfully');

    return {
      decrypted,
      success: true,
    };
  } catch (error) {
    logger.error('Decryption failed', { error: error.message });
    return {
      decrypted: '',
      success: false,
      error: error.message,
    };
  }
};

// Encrypt object
export const encryptObject = (obj: any, password: string): EncryptionResult => {
  try {
    const jsonString = JSON.stringify(obj);
    return encryptData(jsonString, password);
  } catch (error) {
    logger.error('Object encryption failed', { error: error.message });
    return {
      encrypted: '',
      salt: '',
      iv: '',
      success: false,
      error: error.message,
    };
  }
};

// Decrypt object
export const decryptObject = (
  encrypted: string,
  password: string,
  salt: string,
  iv: string
): { data: any; success: boolean; error?: string } => {
  try {
    const result = decryptData(encrypted, password, salt, iv);
    
    if (!result.success) {
      return {
        data: null,
        success: false,
        error: result.error,
      };
    }

    const data = JSON.parse(result.decrypted);
    return {
      data,
      success: true,
    };
  } catch (error) {
    logger.error('Object decryption failed', { error: error.message });
    return {
      data: null,
      success: false,
      error: error.message,
    };
  }
};

// Hash password securely
export const hashPassword = (password: string): string => {
  try {
    const salt = generateSalt();
    const hash = CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 10000,
    }).toString();
    
    return `${salt}:${hash}`;
  } catch (error) {
    logger.error('Password hashing failed', { error: error.message });
    throw new Error('Password hashing failed');
  }
};

// Verify password against hash
export const verifyPassword = (password: string, hash: string): boolean => {
  try {
    const [salt, originalHash] = hash.split(':');
    
    if (!salt || !originalHash) {
      return false;
    }

    const testHash = CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 10000,
    }).toString();

    return testHash === originalHash;
  } catch (error) {
    logger.error('Password verification failed', { error: error.message });
    return false;
  }
};

// Generate secure random token
export const generateSecureToken = (length: number = 32): string => {
  try {
    return CryptoJS.lib.WordArray.random(length).toString();
  } catch (error) {
    logger.error('Token generation failed', { error: error.message });
    throw new Error('Token generation failed');
  }
};

// Secure data storage wrapper
export class SecureStorage {
  private password: string;

  constructor(password: string) {
    this.password = password;
  }

  async store(key: string, data: any): Promise<boolean> {
    try {
      const result = encryptObject(data, this.password);
      
      if (!result.success) {
        logger.error('Failed to encrypt data for storage', { key });
        return false;
      }

      const storageData = {
        encrypted: result.encrypted,
        salt: result.salt,
        iv: result.iv,
        timestamp: Date.now(),
      };

      // In a real implementation, this would use AsyncStorage or another storage mechanism
      // For now, we'll just log that it would be stored
      logger.debug('Data would be stored securely', { key });
      
      return true;
    } catch (error) {
      logger.error('Secure storage failed', { key, error: error.message });
      return false;
    }
  }

  async retrieve(key: string): Promise<any> {
    try {
      // In a real implementation, this would retrieve from AsyncStorage
      // For now, we'll return null as if no data was found
      logger.debug('Data would be retrieved securely', { key });
      
      return null;
    } catch (error) {
      logger.error('Secure retrieval failed', { key, error: error.message });
      return null;
    }
  }

  async remove(key: string): Promise<boolean> {
    try {
      // In a real implementation, this would remove from AsyncStorage
      logger.debug('Data would be removed securely', { key });
      
      return true;
    } catch (error) {
      logger.error('Secure removal failed', { key, error: error.message });
      return false;
    }
  }
}

// Utility functions for common encryption scenarios
export const EncryptionUtils = {
  // Encrypt sensitive user data
  encryptUserData: (userData: any, userPassword: string) => {
    return encryptObject(userData, userPassword);
  },

  // Encrypt workout data
  encryptWorkoutData: (workoutData: any, userPassword: string) => {
    return encryptObject(workoutData, userPassword);
  },

  // Generate session token
  generateSessionToken: () => {
    return generateSecureToken(64);
  },

  // Create secure backup
  createSecureBackup: (data: any, password: string) => {
    const timestamp = new Date().toISOString();
    const backupData = {
      data,
      timestamp,
      version: '1.0',
    };
    
    return encryptObject(backupData, password);
  },
};
