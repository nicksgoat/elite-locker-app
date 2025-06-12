/**
 * Elite Locker - Security Monitoring System
 * 
 * This file provides real-time security monitoring and alerting.
 */

import { createLogger, logSecurityEvent } from './secureLogger';
import { config, isProduction } from '../config/environment';
import { runSecurityCheck } from './securityAudit';

const logger = createLogger('SecurityMonitoring');

// Security event types
export enum SecurityEventType {
  AUTHENTICATION_FAILURE = 'auth_failure',
  AUTHENTICATION_SUCCESS = 'auth_success',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  DATA_ACCESS_VIOLATION = 'data_access_violation',
  CONFIGURATION_CHANGE = 'config_change',
  SECURITY_AUDIT_FAILURE = 'audit_failure',
  ENCRYPTION_FAILURE = 'encryption_failure',
  SESSION_ANOMALY = 'session_anomaly',
  API_ABUSE = 'api_abuse',
}

// Security alert levels
export enum AlertLevel {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency',
}

// Security event interface
export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  level: AlertLevel;
  timestamp: number;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  details: Record<string, any>;
  resolved: boolean;
  resolvedAt?: number;
  resolvedBy?: string;
}

// Security alert interface
export interface SecurityAlert {
  id: string;
  event: SecurityEvent;
  message: string;
  recommendations: string[];
  autoResolved: boolean;
  notificationSent: boolean;
}

// Security monitoring class
export class SecurityMonitor {
  private events: SecurityEvent[] = [];
  private alerts: SecurityAlert[] = [];
  private monitoringActive: boolean = false;
  private auditInterval?: NodeJS.Timeout;
  private alertHandlers: Map<AlertLevel, (alert: SecurityAlert) => void> = new Map();

  constructor() {
    this.initializeMonitoring();
  }

  // Initialize security monitoring
  private initializeMonitoring(): void {
    logger.info('Initializing security monitoring system');
    
    // Set up default alert handlers
    this.alertHandlers.set(AlertLevel.INFO, this.handleInfoAlert);
    this.alertHandlers.set(AlertLevel.WARNING, this.handleWarningAlert);
    this.alertHandlers.set(AlertLevel.CRITICAL, this.handleCriticalAlert);
    this.alertHandlers.set(AlertLevel.EMERGENCY, this.handleEmergencyAlert);
    
    this.monitoringActive = true;
    logger.info('Security monitoring system initialized');
  }

  // Start continuous monitoring
  startMonitoring(): void {
    if (this.monitoringActive) {
      logger.warn('Security monitoring is already active');
      return;
    }

    logger.info('Starting continuous security monitoring');
    this.monitoringActive = true;

    // Run periodic security audits
    this.auditInterval = setInterval(() => {
      this.runPeriodicAudit();
    }, 15 * 60 * 1000); // Every 15 minutes

    // Monitor system health
    this.startHealthMonitoring();
  }

  // Stop monitoring
  stopMonitoring(): void {
    logger.info('Stopping security monitoring');
    this.monitoringActive = false;

    if (this.auditInterval) {
      clearInterval(this.auditInterval);
      this.auditInterval = undefined;
    }
  }

  // Record security event
  recordEvent(
    type: SecurityEventType,
    level: AlertLevel,
    details: Record<string, any>,
    userId?: string,
    sessionId?: string
  ): SecurityEvent {
    const event: SecurityEvent = {
      id: this.generateEventId(),
      type,
      level,
      timestamp: Date.now(),
      userId,
      sessionId,
      details,
      resolved: false,
    };

    this.events.push(event);
    
    // Log the security event
    logSecurityEvent(`Security event: ${type}`, userId, {
      level,
      details,
      eventId: event.id,
    });

    // Create alert if necessary
    if (level === AlertLevel.WARNING || level === AlertLevel.CRITICAL || level === AlertLevel.EMERGENCY) {
      this.createAlert(event);
    }

    // Auto-resolve certain events
    this.checkAutoResolve(event);

    return event;
  }

  // Create security alert
  private createAlert(event: SecurityEvent): SecurityAlert {
    const alert: SecurityAlert = {
      id: this.generateAlertId(),
      event,
      message: this.generateAlertMessage(event),
      recommendations: this.generateRecommendations(event),
      autoResolved: false,
      notificationSent: false,
    };

    this.alerts.push(alert);
    
    // Handle the alert based on its level
    const handler = this.alertHandlers.get(event.level);
    if (handler) {
      handler(alert);
    }

    return alert;
  }

  // Generate alert message
  private generateAlertMessage(event: SecurityEvent): string {
    switch (event.type) {
      case SecurityEventType.AUTHENTICATION_FAILURE:
        return `Multiple authentication failures detected for user ${event.userId || 'unknown'}`;
      case SecurityEventType.RATE_LIMIT_EXCEEDED:
        return 'Rate limit exceeded - possible brute force attack';
      case SecurityEventType.SUSPICIOUS_ACTIVITY:
        return 'Suspicious user activity detected';
      case SecurityEventType.DATA_ACCESS_VIOLATION:
        return 'Unauthorized data access attempt detected';
      case SecurityEventType.CONFIGURATION_CHANGE:
        return 'Security configuration has been modified';
      case SecurityEventType.SECURITY_AUDIT_FAILURE:
        return 'Security audit has failed - immediate attention required';
      case SecurityEventType.ENCRYPTION_FAILURE:
        return 'Data encryption failure detected';
      case SecurityEventType.SESSION_ANOMALY:
        return 'Unusual session activity detected';
      case SecurityEventType.API_ABUSE:
        return 'API abuse pattern detected';
      default:
        return `Security event detected: ${event.type}`;
    }
  }

  // Generate recommendations
  private generateRecommendations(event: SecurityEvent): string[] {
    const recommendations: string[] = [];

    switch (event.type) {
      case SecurityEventType.AUTHENTICATION_FAILURE:
        recommendations.push('Review user account for compromise');
        recommendations.push('Consider temporary account lockout');
        recommendations.push('Verify user identity before unlocking');
        break;
      case SecurityEventType.RATE_LIMIT_EXCEEDED:
        recommendations.push('Implement IP-based blocking');
        recommendations.push('Review rate limiting configuration');
        recommendations.push('Monitor for distributed attacks');
        break;
      case SecurityEventType.SUSPICIOUS_ACTIVITY:
        recommendations.push('Review user session logs');
        recommendations.push('Verify user identity');
        recommendations.push('Consider additional authentication');
        break;
      case SecurityEventType.DATA_ACCESS_VIOLATION:
        recommendations.push('Review access control policies');
        recommendations.push('Audit user permissions');
        recommendations.push('Investigate potential data breach');
        break;
      case SecurityEventType.CONFIGURATION_CHANGE:
        recommendations.push('Verify authorized configuration change');
        recommendations.push('Review change management process');
        recommendations.push('Audit configuration integrity');
        break;
      case SecurityEventType.SECURITY_AUDIT_FAILURE:
        recommendations.push('Run immediate security audit');
        recommendations.push('Review security configuration');
        recommendations.push('Address critical vulnerabilities');
        break;
      case SecurityEventType.ENCRYPTION_FAILURE:
        recommendations.push('Verify encryption configuration');
        recommendations.push('Check encryption key integrity');
        recommendations.push('Review data protection measures');
        break;
      case SecurityEventType.SESSION_ANOMALY:
        recommendations.push('Verify session integrity');
        recommendations.push('Check for session hijacking');
        recommendations.push('Review session management');
        break;
      case SecurityEventType.API_ABUSE:
        recommendations.push('Implement API rate limiting');
        recommendations.push('Review API access patterns');
        recommendations.push('Consider API key rotation');
        break;
    }

    return recommendations;
  }

  // Alert handlers
  private handleInfoAlert = (alert: SecurityAlert): void => {
    logger.info(`Security alert: ${alert.message}`, { alertId: alert.id });
  };

  private handleWarningAlert = (alert: SecurityAlert): void => {
    logger.warn(`Security warning: ${alert.message}`, { 
      alertId: alert.id,
      recommendations: alert.recommendations 
    });
    
    if (isProduction()) {
      this.sendNotification(alert);
    }
  };

  private handleCriticalAlert = (alert: SecurityAlert): void => {
    logger.error(`CRITICAL security alert: ${alert.message}`, { 
      alertId: alert.id,
      recommendations: alert.recommendations 
    });
    
    this.sendNotification(alert);
    
    // In production, might trigger additional actions
    if (isProduction()) {
      this.triggerEmergencyResponse(alert);
    }
  };

  private handleEmergencyAlert = (alert: SecurityAlert): void => {
    logger.error(`EMERGENCY security alert: ${alert.message}`, { 
      alertId: alert.id,
      recommendations: alert.recommendations 
    });
    
    this.sendNotification(alert);
    this.triggerEmergencyResponse(alert);
    
    // In production, might trigger system lockdown
    if (isProduction()) {
      this.considerSystemLockdown(alert);
    }
  };

  // Send notification
  private sendNotification(alert: SecurityAlert): void {
    // In a real implementation, this would send notifications via:
    // - Email
    // - SMS
    // - Slack/Teams
    // - Push notifications
    // - Security monitoring service
    
    logger.info('Security notification would be sent', {
      alertId: alert.id,
      level: alert.event.level,
      message: alert.message,
    });
    
    alert.notificationSent = true;
  }

  // Trigger emergency response
  private triggerEmergencyResponse(alert: SecurityAlert): void {
    logger.error('Triggering emergency security response', { alertId: alert.id });
    
    // Emergency response actions:
    // - Alert security team
    // - Initiate incident response
    // - Preserve evidence
    // - Document incident
  }

  // Consider system lockdown
  private considerSystemLockdown(alert: SecurityAlert): void {
    logger.error('Considering system lockdown due to security threat', { alertId: alert.id });
    
    // System lockdown considerations:
    // - Disable user logins
    // - Restrict API access
    // - Enable maintenance mode
    // - Preserve system state
  }

  // Run periodic audit
  private runPeriodicAudit(): void {
    try {
      logger.debug('Running periodic security audit');
      
      const report = runSecurityCheck();
      
      if (report.criticalIssues > 0) {
        this.recordEvent(
          SecurityEventType.SECURITY_AUDIT_FAILURE,
          AlertLevel.CRITICAL,
          { 
            criticalIssues: report.criticalIssues,
            score: report.overallScore,
            issues: report.checks.filter(c => !c.passed && c.severity === 'critical')
          }
        );
      } else if (report.highIssues > 0) {
        this.recordEvent(
          SecurityEventType.SECURITY_AUDIT_FAILURE,
          AlertLevel.WARNING,
          { 
            highIssues: report.highIssues,
            score: report.overallScore,
            issues: report.checks.filter(c => !c.passed && c.severity === 'high')
          }
        );
      }
      
    } catch (error) {
      logger.error('Periodic security audit failed', { error: error.message });
    }
  }

  // Start health monitoring
  private startHealthMonitoring(): void {
    // Monitor system health indicators
    setInterval(() => {
      this.checkSystemHealth();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  // Check system health
  private checkSystemHealth(): void {
    try {
      // Check memory usage
      if (typeof process !== 'undefined' && process.memoryUsage) {
        const memory = process.memoryUsage();
        const memoryUsageMB = memory.heapUsed / 1024 / 1024;
        
        if (memoryUsageMB > 500) { // 500MB threshold
          this.recordEvent(
            SecurityEventType.SUSPICIOUS_ACTIVITY,
            AlertLevel.WARNING,
            { memoryUsage: memoryUsageMB, threshold: 500 }
          );
        }
      }
      
      // Check for configuration drift
      // Check for unauthorized changes
      // Monitor performance metrics
      
    } catch (error) {
      logger.error('System health check failed', { error: error.message });
    }
  }

  // Auto-resolve certain events
  private checkAutoResolve(event: SecurityEvent): void {
    // Auto-resolve info level events after 1 hour
    if (event.level === AlertLevel.INFO) {
      setTimeout(() => {
        this.resolveEvent(event.id, 'system', true);
      }, 60 * 60 * 1000);
    }
  }

  // Resolve security event
  resolveEvent(eventId: string, resolvedBy: string, autoResolved: boolean = false): boolean {
    const event = this.events.find(e => e.id === eventId);
    if (!event) {
      return false;
    }

    event.resolved = true;
    event.resolvedAt = Date.now();
    event.resolvedBy = resolvedBy;

    // Mark associated alert as resolved
    const alert = this.alerts.find(a => a.event.id === eventId);
    if (alert) {
      alert.autoResolved = autoResolved;
    }

    logger.info('Security event resolved', { 
      eventId, 
      resolvedBy, 
      autoResolved,
      type: event.type 
    });

    return true;
  }

  // Utility methods
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAlertId(): string {
    return `alt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get monitoring statistics
  getStatistics(): any {
    const now = Date.now();
    const last24Hours = now - (24 * 60 * 60 * 1000);
    
    const recentEvents = this.events.filter(e => e.timestamp > last24Hours);
    const recentAlerts = this.alerts.filter(a => a.event.timestamp > last24Hours);
    
    return {
      totalEvents: this.events.length,
      recentEvents: recentEvents.length,
      totalAlerts: this.alerts.length,
      recentAlerts: recentAlerts.length,
      unresolvedEvents: this.events.filter(e => !e.resolved).length,
      criticalAlerts: this.alerts.filter(a => a.event.level === AlertLevel.CRITICAL).length,
      emergencyAlerts: this.alerts.filter(a => a.event.level === AlertLevel.EMERGENCY).length,
      monitoringActive: this.monitoringActive,
    };
  }

  // Get recent events
  getRecentEvents(limit: number = 50): SecurityEvent[] {
    return this.events
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  // Get active alerts
  getActiveAlerts(): SecurityAlert[] {
    return this.alerts.filter(a => !a.event.resolved);
  }
}

// Create default security monitor instance
export const securityMonitor = new SecurityMonitor();

// Utility functions
export const recordSecurityEvent = (
  type: SecurityEventType,
  level: AlertLevel,
  details: Record<string, any>,
  userId?: string,
  sessionId?: string
): SecurityEvent => {
  return securityMonitor.recordEvent(type, level, details, userId, sessionId);
};

export const startSecurityMonitoring = (): void => {
  securityMonitor.startMonitoring();
};

export const stopSecurityMonitoring = (): void => {
  securityMonitor.stopMonitoring();
};

export const getSecurityStatistics = (): any => {
  return securityMonitor.getStatistics();
};

// Auto-start monitoring in production
if (isProduction()) {
  startSecurityMonitoring();
  logger.info('Security monitoring auto-started for production environment');
}
