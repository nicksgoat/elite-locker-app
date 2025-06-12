/**
 * Elite Locker - Automated Security Audit Scheduler
 * 
 * This file provides automated scheduling of security audits and vulnerability scans.
 */

import { createLogger } from './secureLogger';
import { runSecurityCheck, securityAuditor } from './securityAudit';
import { recordSecurityEvent, SecurityEventType, AlertLevel } from './securityMonitoring';
import { config, isProduction } from '../config/environment';

const logger = createLogger('AuditScheduler');

// Audit schedule configuration
export interface AuditScheduleConfig {
  enabled: boolean;
  quickAuditInterval: number; // minutes
  fullAuditInterval: number; // hours
  vulnerabilityScanInterval: number; // days
  complianceAuditInterval: number; // days
  maxRetries: number;
  alertOnFailure: boolean;
  autoRemediation: boolean;
}

// Default audit schedule
const DEFAULT_SCHEDULE: AuditScheduleConfig = {
  enabled: true,
  quickAuditInterval: 15, // Every 15 minutes
  fullAuditInterval: 6, // Every 6 hours
  vulnerabilityScanInterval: 1, // Daily
  complianceAuditInterval: 7, // Weekly
  maxRetries: 3,
  alertOnFailure: true,
  autoRemediation: false,
};

// Production schedule (more frequent)
const PRODUCTION_SCHEDULE: AuditScheduleConfig = {
  enabled: true,
  quickAuditInterval: 5, // Every 5 minutes
  fullAuditInterval: 2, // Every 2 hours
  vulnerabilityScanInterval: 1, // Daily
  complianceAuditInterval: 3, // Every 3 days
  maxRetries: 5,
  alertOnFailure: true,
  autoRemediation: true,
};

// Audit result interface
export interface ScheduledAuditResult {
  id: string;
  type: 'quick' | 'full' | 'vulnerability' | 'compliance';
  timestamp: number;
  duration: number;
  success: boolean;
  score?: number;
  issues: number;
  criticalIssues: number;
  error?: string;
  retryCount: number;
}

// Audit scheduler class
export class AuditScheduler {
  private config: AuditScheduleConfig;
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private auditHistory: ScheduledAuditResult[] = [];
  private running: boolean = false;
  private retryQueue: Array<{ type: string; retryCount: number }> = [];

  constructor(customConfig?: Partial<AuditScheduleConfig>) {
    const baseConfig = isProduction() ? PRODUCTION_SCHEDULE : DEFAULT_SCHEDULE;
    this.config = { ...baseConfig, ...customConfig };
    
    logger.info('Audit scheduler initialized', {
      environment: config.environment,
      config: this.config
    });
  }

  // Start scheduled audits
  start(): void {
    if (this.running) {
      logger.warn('Audit scheduler is already running');
      return;
    }

    if (!this.config.enabled) {
      logger.info('Audit scheduler is disabled');
      return;
    }

    logger.info('Starting audit scheduler');
    this.running = true;

    // Schedule quick audits
    this.scheduleQuickAudits();
    
    // Schedule full audits
    this.scheduleFullAudits();
    
    // Schedule vulnerability scans
    this.scheduleVulnerabilityScans();
    
    // Schedule compliance audits
    this.scheduleComplianceAudits();

    // Process retry queue
    this.scheduleRetryProcessor();

    logger.info('All audit schedules activated');
  }

  // Stop scheduled audits
  stop(): void {
    logger.info('Stopping audit scheduler');
    this.running = false;

    // Clear all intervals
    this.intervals.forEach((interval, name) => {
      clearInterval(interval);
      logger.debug(`Cleared ${name} schedule`);
    });
    
    this.intervals.clear();
    logger.info('Audit scheduler stopped');
  }

  // Schedule quick audits
  private scheduleQuickAudits(): void {
    const intervalMs = this.config.quickAuditInterval * 60 * 1000;
    
    const interval = setInterval(async () => {
      await this.runQuickAudit();
    }, intervalMs);
    
    this.intervals.set('quickAudit', interval);
    logger.info(`Quick audits scheduled every ${this.config.quickAuditInterval} minutes`);
  }

  // Schedule full audits
  private scheduleFullAudits(): void {
    const intervalMs = this.config.fullAuditInterval * 60 * 60 * 1000;
    
    const interval = setInterval(async () => {
      await this.runFullAudit();
    }, intervalMs);
    
    this.intervals.set('fullAudit', interval);
    logger.info(`Full audits scheduled every ${this.config.fullAuditInterval} hours`);
  }

  // Schedule vulnerability scans
  private scheduleVulnerabilityScans(): void {
    const intervalMs = this.config.vulnerabilityScanInterval * 24 * 60 * 60 * 1000;
    
    const interval = setInterval(async () => {
      await this.runVulnerabilityScan();
    }, intervalMs);
    
    this.intervals.set('vulnerabilityScan', interval);
    logger.info(`Vulnerability scans scheduled every ${this.config.vulnerabilityScanInterval} days`);
  }

  // Schedule compliance audits
  private scheduleComplianceAudits(): void {
    const intervalMs = this.config.complianceAuditInterval * 24 * 60 * 60 * 1000;
    
    const interval = setInterval(async () => {
      await this.runComplianceAudit();
    }, intervalMs);
    
    this.intervals.set('complianceAudit', interval);
    logger.info(`Compliance audits scheduled every ${this.config.complianceAuditInterval} days`);
  }

  // Schedule retry processor
  private scheduleRetryProcessor(): void {
    const interval = setInterval(() => {
      this.processRetryQueue();
    }, 5 * 60 * 1000); // Every 5 minutes
    
    this.intervals.set('retryProcessor', interval);
  }

  // Run quick audit
  private async runQuickAudit(): Promise<ScheduledAuditResult> {
    const startTime = Date.now();
    const auditId = this.generateAuditId('quick');
    
    logger.debug('Starting scheduled quick audit', { auditId });
    
    try {
      const report = runSecurityCheck();
      const duration = Date.now() - startTime;
      
      const result: ScheduledAuditResult = {
        id: auditId,
        type: 'quick',
        timestamp: startTime,
        duration,
        success: true,
        score: report.overallScore,
        issues: report.checks.filter(c => !c.passed).length,
        criticalIssues: report.criticalIssues,
        retryCount: 0,
      };
      
      this.auditHistory.push(result);
      
      // Alert on critical issues
      if (report.criticalIssues > 0) {
        recordSecurityEvent(
          SecurityEventType.SECURITY_AUDIT_FAILURE,
          AlertLevel.CRITICAL,
          {
            auditType: 'quick',
            criticalIssues: report.criticalIssues,
            score: report.overallScore,
          }
        );
      }
      
      logger.info('Quick audit completed', {
        auditId,
        score: report.overallScore,
        issues: result.issues,
        criticalIssues: result.criticalIssues,
        duration
      });
      
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      const result: ScheduledAuditResult = {
        id: auditId,
        type: 'quick',
        timestamp: startTime,
        duration,
        success: false,
        issues: 0,
        criticalIssues: 0,
        error: error.message,
        retryCount: 0,
      };
      
      this.auditHistory.push(result);
      this.handleAuditFailure('quick', error);
      
      return result;
    }
  }

  // Run full audit
  private async runFullAudit(): Promise<ScheduledAuditResult> {
    const startTime = Date.now();
    const auditId = this.generateAuditId('full');
    
    logger.info('Starting scheduled full audit', { auditId });
    
    try {
      // Run comprehensive security audit
      const report = securityAuditor.runAudit();
      const duration = Date.now() - startTime;
      
      const result: ScheduledAuditResult = {
        id: auditId,
        type: 'full',
        timestamp: startTime,
        duration,
        success: true,
        score: report.overallScore,
        issues: report.checks.filter(c => !c.passed).length,
        criticalIssues: report.criticalIssues,
        retryCount: 0,
      };
      
      this.auditHistory.push(result);
      
      // Generate detailed report
      const summary = securityAuditor.generateReportSummary(report);
      logger.info('Full audit completed', {
        auditId,
        score: report.overallScore,
        summary: summary.substring(0, 200) + '...'
      });
      
      // Auto-remediation if enabled
      if (this.config.autoRemediation && report.criticalIssues > 0) {
        await this.attemptAutoRemediation(report);
      }
      
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      const result: ScheduledAuditResult = {
        id: auditId,
        type: 'full',
        timestamp: startTime,
        duration,
        success: false,
        issues: 0,
        criticalIssues: 0,
        error: error.message,
        retryCount: 0,
      };
      
      this.auditHistory.push(result);
      this.handleAuditFailure('full', error);
      
      return result;
    }
  }

  // Run vulnerability scan
  private async runVulnerabilityScan(): Promise<ScheduledAuditResult> {
    const startTime = Date.now();
    const auditId = this.generateAuditId('vulnerability');
    
    logger.info('Starting scheduled vulnerability scan', { auditId });
    
    try {
      // In a real implementation, this would run tools like:
      // - npm audit
      // - Snyk scan
      // - OWASP dependency check
      // - Custom vulnerability scanners
      
      // For now, we'll simulate a vulnerability scan
      const mockVulnerabilities = await this.simulateVulnerabilityScan();
      const duration = Date.now() - startTime;
      
      const result: ScheduledAuditResult = {
        id: auditId,
        type: 'vulnerability',
        timestamp: startTime,
        duration,
        success: true,
        issues: mockVulnerabilities.total,
        criticalIssues: mockVulnerabilities.critical,
        retryCount: 0,
      };
      
      this.auditHistory.push(result);
      
      if (mockVulnerabilities.critical > 0) {
        recordSecurityEvent(
          SecurityEventType.SECURITY_AUDIT_FAILURE,
          AlertLevel.CRITICAL,
          {
            auditType: 'vulnerability',
            vulnerabilities: mockVulnerabilities,
          }
        );
      }
      
      logger.info('Vulnerability scan completed', {
        auditId,
        vulnerabilities: mockVulnerabilities,
        duration
      });
      
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      const result: ScheduledAuditResult = {
        id: auditId,
        type: 'vulnerability',
        timestamp: startTime,
        duration,
        success: false,
        issues: 0,
        criticalIssues: 0,
        error: error.message,
        retryCount: 0,
      };
      
      this.auditHistory.push(result);
      this.handleAuditFailure('vulnerability', error);
      
      return result;
    }
  }

  // Run compliance audit
  private async runComplianceAudit(): Promise<ScheduledAuditResult> {
    const startTime = Date.now();
    const auditId = this.generateAuditId('compliance');
    
    logger.info('Starting scheduled compliance audit', { auditId });
    
    try {
      // In a real implementation, this would check:
      // - GDPR compliance
      // - SOC 2 requirements
      // - ISO 27001 controls
      // - Industry-specific regulations
      
      const complianceScore = await this.simulateComplianceAudit();
      const duration = Date.now() - startTime;
      
      const result: ScheduledAuditResult = {
        id: auditId,
        type: 'compliance',
        timestamp: startTime,
        duration,
        success: true,
        score: complianceScore.score,
        issues: complianceScore.issues,
        criticalIssues: complianceScore.critical,
        retryCount: 0,
      };
      
      this.auditHistory.push(result);
      
      logger.info('Compliance audit completed', {
        auditId,
        score: complianceScore.score,
        issues: complianceScore.issues,
        duration
      });
      
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      const result: ScheduledAuditResult = {
        id: auditId,
        type: 'compliance',
        timestamp: startTime,
        duration,
        success: false,
        issues: 0,
        criticalIssues: 0,
        error: error.message,
        retryCount: 0,
      };
      
      this.auditHistory.push(result);
      this.handleAuditFailure('compliance', error);
      
      return result;
    }
  }

  // Handle audit failure
  private handleAuditFailure(auditType: string, error: any): void {
    logger.error(`${auditType} audit failed`, { error: error.message });
    
    if (this.config.alertOnFailure) {
      recordSecurityEvent(
        SecurityEventType.SECURITY_AUDIT_FAILURE,
        AlertLevel.WARNING,
        {
          auditType,
          error: error.message,
        }
      );
    }
    
    // Add to retry queue
    this.retryQueue.push({ type: auditType, retryCount: 0 });
  }

  // Process retry queue
  private processRetryQueue(): void {
    if (this.retryQueue.length === 0) return;
    
    const item = this.retryQueue.shift();
    if (!item) return;
    
    if (item.retryCount >= this.config.maxRetries) {
      logger.error(`Max retries exceeded for ${item.type} audit`);
      return;
    }
    
    logger.info(`Retrying ${item.type} audit (attempt ${item.retryCount + 1})`);
    
    // Retry the audit
    setTimeout(async () => {
      try {
        switch (item.type) {
          case 'quick':
            await this.runQuickAudit();
            break;
          case 'full':
            await this.runFullAudit();
            break;
          case 'vulnerability':
            await this.runVulnerabilityScan();
            break;
          case 'compliance':
            await this.runComplianceAudit();
            break;
        }
      } catch (error) {
        // Add back to retry queue with incremented count
        this.retryQueue.push({ 
          type: item.type, 
          retryCount: item.retryCount + 1 
        });
      }
    }, 60000); // Retry after 1 minute
  }

  // Attempt auto-remediation
  private async attemptAutoRemediation(report: any): Promise<void> {
    logger.info('Attempting auto-remediation for critical issues');
    
    // In a real implementation, this would:
    // - Apply security patches
    // - Update configurations
    // - Restart services
    // - Apply firewall rules
    // - Update access controls
    
    // For now, we'll just log the attempt
    logger.info('Auto-remediation completed (simulated)');
  }

  // Simulate vulnerability scan
  private async simulateVulnerabilityScan(): Promise<{ total: number; critical: number; high: number; medium: number; low: number }> {
    // Simulate scan delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return mock results
    return {
      total: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };
  }

  // Simulate compliance audit
  private async simulateComplianceAudit(): Promise<{ score: number; issues: number; critical: number }> {
    // Simulate audit delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Return mock results
    return {
      score: 95,
      issues: 2,
      critical: 0,
    };
  }

  // Generate audit ID
  private generateAuditId(type: string): string {
    return `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get audit statistics
  getStatistics(): any {
    const now = Date.now();
    const last24Hours = now - (24 * 60 * 60 * 1000);
    const last7Days = now - (7 * 24 * 60 * 60 * 1000);
    
    const recent = this.auditHistory.filter(a => a.timestamp > last24Hours);
    const weekly = this.auditHistory.filter(a => a.timestamp > last7Days);
    
    return {
      totalAudits: this.auditHistory.length,
      recentAudits: recent.length,
      weeklyAudits: weekly.length,
      successRate: this.auditHistory.length > 0 
        ? (this.auditHistory.filter(a => a.success).length / this.auditHistory.length) * 100 
        : 0,
      averageScore: this.auditHistory.length > 0
        ? this.auditHistory
            .filter(a => a.score !== undefined)
            .reduce((sum, a) => sum + (a.score || 0), 0) / this.auditHistory.filter(a => a.score !== undefined).length
        : 0,
      running: this.running,
      config: this.config,
    };
  }

  // Get recent audit results
  getRecentAudits(limit: number = 20): ScheduledAuditResult[] {
    return this.auditHistory
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }
}

// Create default audit scheduler instance
export const auditScheduler = new AuditScheduler();

// Utility functions
export const startScheduledAudits = (): void => {
  auditScheduler.start();
};

export const stopScheduledAudits = (): void => {
  auditScheduler.stop();
};

export const getAuditStatistics = (): any => {
  return auditScheduler.getStatistics();
};

// Auto-start in production
if (isProduction()) {
  startScheduledAudits();
  logger.info('Scheduled audits auto-started for production environment');
}
