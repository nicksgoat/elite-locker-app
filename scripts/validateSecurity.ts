#!/usr/bin/env node
/**
 * Elite Locker - Security Configuration Validator
 *
 * This script validates the security configuration and runs comprehensive checks.
 */

import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Simple configuration check
const config = {
  environment: process.env.NODE_ENV || process.env.ENVIRONMENT || 'development',
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
  },
  stripe: {
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  },
  security: {
    enableEncryption: process.env.ENABLE_ENCRYPTION === 'true',
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '3600000'),
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    sensitiveDataMask: process.env.MASK_SENSITIVE_DATA === 'true',
  }
};

const isProduction = () => config.environment === 'production';
const isDevelopment = () => config.environment === 'development';

// Simple security validation function
async function validateSecurity(): Promise<void> {
  console.log('🔒 Elite Locker Security Configuration Validator\n');
  console.log('='.repeat(60));

  let totalChecks = 0;
  let passedChecks = 0;
  let criticalIssues = 0;
  let errorIssues = 0;
  let warningIssues = 0;

  const runCheck = (name: string, condition: boolean, message: string, severity: 'info' | 'warning' | 'error' | 'critical', recommendation?: string) => {
    totalChecks++;
    const icon = condition ? '✅' :
                 severity === 'critical' ? '🚨' :
                 severity === 'error' ? '❌' :
                 severity === 'warning' ? '⚠️' : 'ℹ️';

    console.log(`  ${icon} ${name}: ${message}`);

    if (condition) {
      passedChecks++;
    } else {
      switch (severity) {
        case 'critical': criticalIssues++; break;
        case 'error': errorIssues++; break;
        case 'warning': warningIssues++; break;
      }

      if (recommendation) {
        console.log(`     💡 ${recommendation}`);
      }
    }
  };

  // Environment Configuration
  console.log('\n📋 Environment Configuration...');

  const hasSupabaseUrl = !!(config.supabase.url && !config.supabase.url.includes('YOUR_'));
  runCheck(
    'Supabase URL',
    hasSupabaseUrl,
    hasSupabaseUrl ? 'Configured' : 'Missing or invalid',
    hasSupabaseUrl ? 'info' : 'critical',
    'Set SUPABASE_URL in environment variables'
  );

  const hasSupabaseKey = !!(config.supabase.anonKey && !config.supabase.anonKey.includes('YOUR_'));
  runCheck(
    'Supabase Key',
    hasSupabaseKey,
    hasSupabaseKey ? 'Configured' : 'Missing or invalid',
    hasSupabaseKey ? 'info' : 'critical',
    'Set SUPABASE_ANON_KEY in environment variables'
  );

  const hasHttps = config.supabase.url.startsWith('https://');
  runCheck(
    'HTTPS Usage',
    hasHttps,
    hasHttps ? 'Using HTTPS' : 'Not using HTTPS',
    hasHttps ? 'info' : 'error',
    'Ensure all API endpoints use HTTPS'
  );

  const validEnv = ['development', 'staging', 'production'].includes(config.environment);
  runCheck(
    'Environment Type',
    validEnv,
    `Environment: ${config.environment}`,
    validEnv ? 'info' : 'warning',
    'Set valid environment type (development, staging, production)'
  );

  // Security Settings
  console.log('\n🛡️ Security Settings...');

  runCheck(
    'Data Encryption',
    config.security.enableEncryption,
    config.security.enableEncryption ? 'Enabled' : 'Disabled',
    config.security.enableEncryption ? 'info' : 'error',
    'Enable data encryption for security'
  );

  const validSessionTimeout = config.security.sessionTimeout > 0 && config.security.sessionTimeout <= 24 * 60 * 60 * 1000;
  runCheck(
    'Session Timeout',
    validSessionTimeout,
    `${config.security.sessionTimeout / 60000} minutes`,
    validSessionTimeout ? 'info' : 'warning',
    'Set session timeout between 15 minutes and 24 hours'
  );

  const validLoginAttempts = config.security.maxLoginAttempts >= 3 && config.security.maxLoginAttempts <= 10;
  runCheck(
    'Login Attempt Limits',
    validLoginAttempts,
    `Max attempts: ${config.security.maxLoginAttempts}`,
    validLoginAttempts ? 'info' : 'warning',
    'Set login attempts between 3-10'
  );

  runCheck(
    'Sensitive Data Masking',
    config.logging.sensitiveDataMask,
    config.logging.sensitiveDataMask ? 'Enabled' : 'Disabled',
    config.logging.sensitiveDataMask ? 'info' : 'error',
    'Enable sensitive data masking in logs'
  );

  // Production Readiness
  if (isProduction()) {
    console.log('\n🚀 Production Readiness...');

    const prodStripeKeys = !config.stripe.publishableKey.includes('pk_test_');
    runCheck(
      'Production API Keys',
      prodStripeKeys,
      prodStripeKeys ? 'Using production keys' : 'Test keys detected',
      prodStripeKeys ? 'info' : 'critical',
      'Replace test API keys with production keys'
    );

    const prodLogging = config.logging.level !== 'debug';
    runCheck(
      'Production Logging',
      prodLogging,
      `Log level: ${config.logging.level}`,
      prodLogging ? 'info' : 'error',
      'Disable debug logging in production'
    );
  }

  // Generate Report
  console.log('\n' + '='.repeat(60));
  console.log('📋 SECURITY VALIDATION REPORT');
  console.log('='.repeat(60));

  const successRate = Math.round((passedChecks / totalChecks) * 100);

  console.log(`\n📊 Summary:`);
  console.log(`   Total Checks: ${totalChecks}`);
  console.log(`   Passed: ${passedChecks} (${successRate}%)`);
  console.log(`   Failed: ${totalChecks - passedChecks}`);

  if (criticalIssues > 0) {
    console.log(`   🚨 Critical Issues: ${criticalIssues}`);
  }
  if (errorIssues > 0) {
    console.log(`   ❌ Error Issues: ${errorIssues}`);
  }
  if (warningIssues > 0) {
    console.log(`   ⚠️ Warning Issues: ${warningIssues}`);
  }

  console.log(`\n🎯 Overall Status:`);
  if (criticalIssues > 0) {
    console.log('   🚨 CRITICAL: Application has critical security issues!');
    console.log('   ❌ NOT READY for production deployment');
  } else if (errorIssues > 0) {
    console.log('   ❌ ERRORS: Application has security errors');
    console.log('   ⚠️ NOT RECOMMENDED for production deployment');
  } else if (warningIssues > 0) {
    console.log('   ⚠️ WARNINGS: Application has minor security issues');
    console.log('   ✅ READY for production with caution');
  } else {
    console.log('   ✅ EXCELLENT: All security checks passed!');
    console.log('   🚀 READY for production deployment');
  }

  console.log('\n' + '='.repeat(60));

  // Exit with appropriate code
  if (criticalIssues > 0 || errorIssues > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// Run validation if called directly
if (require.main === module) {
  validateSecurity().catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
}
