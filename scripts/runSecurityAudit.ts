/**
 * Elite Locker - Security Audit Runner
 * 
 * This script runs comprehensive security audits and generates reports.
 */

import { securityAuditor, runSecurityCheck, isSecureForProduction } from '../utils/securityAudit';
import { createLogger } from '../utils/secureLogger';
import { config } from '../config/environment';

const logger = createLogger('SecurityAuditRunner');

// Security audit runner class
export class SecurityAuditRunner {
  private auditHistory: any[] = [];

  // Run immediate security audit
  async runImmediateAudit(): Promise<void> {
    try {
      logger.info('Starting immediate security audit');
      
      const report = runSecurityCheck();
      const summary = securityAuditor.generateReportSummary(report);
      
      // Store in audit history
      this.auditHistory.push({
        timestamp: report.timestamp,
        report,
        summary
      });
      
      // Log results
      console.log('\n' + '='.repeat(60));
      console.log('🔒 SECURITY AUDIT REPORT');
      console.log('='.repeat(60));
      console.log(summary);
      console.log('='.repeat(60) + '\n');
      
      // Check production readiness
      if (config.environment === 'production') {
        const isSecure = isSecureForProduction();
        if (!isSecure) {
          logger.error('❌ Application is NOT secure for production deployment');
          console.error('🚨 CRITICAL: Application has security issues that must be resolved before production deployment!');
        } else {
          logger.info('✅ Application is secure for production deployment');
          console.log('✅ Application passes all security checks for production deployment');
        }
      }
      
      // Generate recommendations
      if (report.recommendations.length > 0) {
        console.log('📋 IMMEDIATE ACTIONS REQUIRED:');
        report.recommendations.forEach((rec, index) => {
          console.log(`${index + 1}. ${rec}`);
        });
        console.log('');
      }
      
      // Save audit report to file (in a real implementation)
      await this.saveAuditReport(report);
      
      logger.info('Security audit completed', {
        score: report.overallScore,
        critical: report.criticalIssues,
        high: report.highIssues,
        medium: report.mediumIssues,
        low: report.lowIssues
      });
      
    } catch (error) {
      logger.error('Security audit failed', { error: error.message });
      throw error;
    }
  }

  // Save audit report to storage
  private async saveAuditReport(report: any): Promise<void> {
    try {
      // In a real implementation, this would save to a secure location
      // For now, we'll just log that it would be saved
      logger.info('Audit report would be saved to secure storage', {
        timestamp: report.timestamp,
        score: report.overallScore
      });
      
      // Could save to:
      // - Encrypted local file
      // - Secure cloud storage
      // - Security monitoring service
      // - Compliance audit trail
      
    } catch (error) {
      logger.error('Failed to save audit report', { error: error.message });
    }
  }

  // Get audit history
  getAuditHistory(): any[] {
    return this.auditHistory;
  }

  // Get latest audit score
  getLatestScore(): number | null {
    if (this.auditHistory.length === 0) return null;
    return this.auditHistory[this.auditHistory.length - 1].report.overallScore;
  }

  // Check if security has improved
  hasSecurityImproved(): boolean {
    if (this.auditHistory.length < 2) return false;
    
    const latest = this.auditHistory[this.auditHistory.length - 1];
    const previous = this.auditHistory[this.auditHistory.length - 2];
    
    return latest.report.overallScore > previous.report.overallScore;
  }

  // Generate security trend report
  generateTrendReport(): string {
    if (this.auditHistory.length < 2) {
      return 'Insufficient audit history for trend analysis';
    }
    
    const latest = this.auditHistory[this.auditHistory.length - 1];
    const previous = this.auditHistory[this.auditHistory.length - 2];
    
    const scoreDiff = latest.report.overallScore - previous.report.overallScore;
    const criticalDiff = latest.report.criticalIssues - previous.report.criticalIssues;
    const highDiff = latest.report.highIssues - previous.report.highIssues;
    
    let trend = '📈 SECURITY TREND ANALYSIS\n';
    trend += `Score Change: ${scoreDiff > 0 ? '+' : ''}${scoreDiff} points\n`;
    trend += `Critical Issues: ${criticalDiff > 0 ? '+' : ''}${criticalDiff}\n`;
    trend += `High Issues: ${highDiff > 0 ? '+' : ''}${highDiff}\n`;
    
    if (scoreDiff > 0) {
      trend += '✅ Security posture has improved\n';
    } else if (scoreDiff < 0) {
      trend += '⚠️ Security posture has declined\n';
    } else {
      trend += 'ℹ️ Security posture unchanged\n';
    }
    
    return trend;
  }
}

// Create default audit runner instance
export const auditRunner = new SecurityAuditRunner();

// Utility functions for easy access
export const runQuickAudit = async (): Promise<void> => {
  await auditRunner.runImmediateAudit();
};

export const getSecurityScore = (): number | null => {
  return auditRunner.getLatestScore();
};

export const getSecurityTrend = (): string => {
  return auditRunner.generateTrendReport();
};

// CLI interface for running audits
if (require.main === module) {
  console.log('🔒 Starting Elite Locker Security Audit...\n');
  
  runQuickAudit()
    .then(() => {
      console.log('✅ Security audit completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Security audit failed:', error.message);
      process.exit(1);
    });
}

// Export for use in other modules
export default SecurityAuditRunner;
