interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export class RateLimiter {
  private limits: Map<string, Map<string, RateLimitEntry>> = new Map();
  private defaultConfigs: Map<string, RateLimitConfig> = new Map();

  constructor() {
    // Set default rate limit configurations
    this.defaultConfigs.set('joinStream', { maxRequests: 10, windowMs: 60000 }); // 10 per minute
    this.defaultConfigs.set('leaveStream', { maxRequests: 10, windowMs: 60000 }); // 10 per minute
    this.defaultConfigs.set('publishWorkoutUpdate', { maxRequests: 30, windowMs: 60000 }); // 30 per minute
    this.defaultConfigs.set('publishSessionStats', { maxRequests: 5, windowMs: 60000 }); // 5 per minute
    this.defaultConfigs.set('requestCurrentData', { maxRequests: 5, windowMs: 60000 }); // 5 per minute
    
    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanupExpiredEntries(), 5 * 60 * 1000);
  }

  /**
   * Check if a request is within rate limits
   * @param identifier - Unique identifier (usually socket ID or user ID)
   * @param action - The action being rate limited
   * @param maxRequests - Optional override for max requests
   * @param windowMs - Optional override for time window
   * @returns true if request is allowed, false if rate limited
   */
  public checkLimit(
    identifier: string, 
    action: string, 
    maxRequests?: number, 
    windowMs?: number
  ): boolean {
    const now = Date.now();
    
    // Get configuration
    const config = this.getConfig(action, maxRequests, windowMs);
    
    // Initialize identifier map if it doesn't exist
    if (!this.limits.has(identifier)) {
      this.limits.set(identifier, new Map());
    }
    
    const userLimits = this.limits.get(identifier)!;
    const entry = userLimits.get(action);
    
    // If no entry exists or window has expired, create new entry
    if (!entry || now >= entry.resetTime) {
      userLimits.set(action, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return true;
    }
    
    // Check if within limits
    if (entry.count < config.maxRequests) {
      entry.count++;
      return true;
    }
    
    // Rate limit exceeded
    return false;
  }

  /**
   * Get remaining requests for an identifier and action
   */
  public getRemainingRequests(identifier: string, action: string): number {
    const config = this.getConfig(action);
    const userLimits = this.limits.get(identifier);
    
    if (!userLimits) {
      return config.maxRequests;
    }
    
    const entry = userLimits.get(action);
    if (!entry || Date.now() >= entry.resetTime) {
      return config.maxRequests;
    }
    
    return Math.max(0, config.maxRequests - entry.count);
  }

  /**
   * Get time until rate limit resets
   */
  public getResetTime(identifier: string, action: string): number {
    const userLimits = this.limits.get(identifier);
    
    if (!userLimits) {
      return 0;
    }
    
    const entry = userLimits.get(action);
    if (!entry || Date.now() >= entry.resetTime) {
      return 0;
    }
    
    return entry.resetTime - Date.now();
  }

  /**
   * Reset rate limits for a specific identifier and action
   */
  public reset(identifier: string, action?: string): void {
    const userLimits = this.limits.get(identifier);
    
    if (!userLimits) {
      return;
    }
    
    if (action) {
      userLimits.delete(action);
    } else {
      userLimits.clear();
    }
  }

  /**
   * Clean up all rate limit data for an identifier
   */
  public cleanup(identifier: string): void {
    this.limits.delete(identifier);
  }

  /**
   * Get rate limit status for an identifier
   */
  public getStatus(identifier: string): Record<string, {
    remaining: number;
    resetTime: number;
    isLimited: boolean;
  }> {
    const status: Record<string, any> = {};
    
    for (const [action] of this.defaultConfigs) {
      const remaining = this.getRemainingRequests(identifier, action);
      const resetTime = this.getResetTime(identifier, action);
      
      status[action] = {
        remaining,
        resetTime,
        isLimited: remaining === 0
      };
    }
    
    return status;
  }

  /**
   * Add or update a rate limit configuration
   */
  public setConfig(action: string, maxRequests: number, windowMs: number): void {
    this.defaultConfigs.set(action, { maxRequests, windowMs });
  }

  private getConfig(action: string, maxRequests?: number, windowMs?: number): RateLimitConfig {
    const defaultConfig = this.defaultConfigs.get(action) || { maxRequests: 100, windowMs: 60000 };
    
    return {
      maxRequests: maxRequests ?? defaultConfig.maxRequests,
      windowMs: windowMs ?? defaultConfig.windowMs
    };
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    
    for (const [identifier, userLimits] of this.limits) {
      for (const [action, entry] of userLimits) {
        if (now >= entry.resetTime) {
          userLimits.delete(action);
        }
      }
      
      // Remove empty user limit maps
      if (userLimits.size === 0) {
        this.limits.delete(identifier);
      }
    }
  }

  /**
   * Get statistics about current rate limiting
   */
  public getStats(): {
    totalIdentifiers: number;
    totalActions: number;
    activeRateLimits: number;
  } {
    let totalActions = 0;
    let activeRateLimits = 0;
    const now = Date.now();
    
    for (const userLimits of this.limits.values()) {
      for (const entry of userLimits.values()) {
        totalActions++;
        if (now < entry.resetTime) {
          activeRateLimits++;
        }
      }
    }
    
    return {
      totalIdentifiers: this.limits.size,
      totalActions,
      activeRateLimits
    };
  }
}
