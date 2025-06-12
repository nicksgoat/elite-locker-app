/**
 * Elite Locker - Security Dashboard Component
 * 
 * This component provides a real-time security monitoring dashboard.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { 
  securityMonitor, 
  getSecurityStatistics, 
  SecurityEvent, 
  SecurityAlert,
  AlertLevel,
  SecurityEventType 
} from '../utils/securityMonitoring';
import { runQuickAudit, getSecurityScore } from '../scripts/runSecurityAudit';
import { createLogger } from '../utils/secureLogger';
import { config, isDevelopment } from '../config/environment';

const logger = createLogger('SecurityDashboard');

// Security dashboard component
export const SecurityDashboard: React.FC = () => {
  const [statistics, setStatistics] = useState<any>(null);
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<SecurityAlert[]>([]);
  const [securityScore, setSecurityScore] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastAuditTime, setLastAuditTime] = useState<Date | null>(null);

  // Load security data
  const loadSecurityData = async () => {
    try {
      const stats = getSecurityStatistics();
      const events = securityMonitor.getRecentEvents(20);
      const alerts = securityMonitor.getActiveAlerts();
      const score = getSecurityScore();

      setStatistics(stats);
      setRecentEvents(events);
      setActiveAlerts(alerts);
      setSecurityScore(score);

      logger.debug('Security dashboard data loaded', {
        eventsCount: events.length,
        alertsCount: alerts.length,
        score
      });
    } catch (error) {
      logger.error('Failed to load security data', { error: error.message });
    }
  };

  // Run security audit
  const runAudit = async () => {
    try {
      setRefreshing(true);
      await runQuickAudit();
      setLastAuditTime(new Date());
      await loadSecurityData();
    } catch (error) {
      logger.error('Security audit failed', { error: error.message });
      Alert.alert('Audit Failed', 'Security audit could not be completed. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  // Refresh data
  const onRefresh = async () => {
    setRefreshing(true);
    await loadSecurityData();
    setRefreshing(false);
  };

  // Load data on component mount
  useEffect(() => {
    loadSecurityData();
    
    // Set up periodic refresh
    const interval = setInterval(loadSecurityData, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Get alert level color
  const getAlertLevelColor = (level: AlertLevel): string => {
    switch (level) {
      case AlertLevel.INFO: return '#007AFF';
      case AlertLevel.WARNING: return '#FF9500';
      case AlertLevel.CRITICAL: return '#FF3B30';
      case AlertLevel.EMERGENCY: return '#8B0000';
      default: return '#8E8E93';
    }
  };

  // Get security score color
  const getSecurityScoreColor = (score: number): string => {
    if (score >= 90) return '#34C759';
    if (score >= 70) return '#FF9500';
    if (score >= 50) return '#FF6B35';
    return '#FF3B30';
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  // Get event type display name
  const getEventTypeDisplayName = (type: SecurityEventType): string => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (!statistics) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading security dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🔒 Security Dashboard</Text>
        <Text style={styles.subtitle}>Real-time security monitoring</Text>
      </View>

      {/* Security Score */}
      <View style={styles.scoreCard}>
        <Text style={styles.cardTitle}>Security Score</Text>
        {securityScore !== null ? (
          <View style={styles.scoreContainer}>
            <Text style={[
              styles.scoreText, 
              { color: getSecurityScoreColor(securityScore) }
            ]}>
              {securityScore}/100
            </Text>
            <Text style={styles.scoreLabel}>
              {securityScore >= 90 ? 'Excellent' : 
               securityScore >= 70 ? 'Good' : 
               securityScore >= 50 ? 'Fair' : 'Poor'}
            </Text>
          </View>
        ) : (
          <Text style={styles.noDataText}>Run audit to get score</Text>
        )}
      </View>

      {/* Statistics */}
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Security Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{statistics.totalEvents}</Text>
            <Text style={styles.statLabel}>Total Events</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{statistics.recentEvents}</Text>
            <Text style={styles.statLabel}>Recent (24h)</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#FF3B30' }]}>
              {statistics.criticalAlerts}
            </Text>
            <Text style={styles.statLabel}>Critical Alerts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#FF9500' }]}>
              {statistics.unresolvedEvents}
            </Text>
            <Text style={styles.statLabel}>Unresolved</Text>
          </View>
        </View>
      </View>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <View style={styles.alertsCard}>
          <Text style={styles.cardTitle}>🚨 Active Alerts</Text>
          {activeAlerts.slice(0, 5).map((alert, index) => (
            <View key={alert.id} style={styles.alertItem}>
              <View style={[
                styles.alertIndicator, 
                { backgroundColor: getAlertLevelColor(alert.event.level) }
              ]} />
              <View style={styles.alertContent}>
                <Text style={styles.alertMessage}>{alert.message}</Text>
                <Text style={styles.alertTime}>
                  {formatTimestamp(alert.event.timestamp)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Recent Events */}
      <View style={styles.eventsCard}>
        <Text style={styles.cardTitle}>Recent Security Events</Text>
        {recentEvents.length > 0 ? (
          recentEvents.slice(0, 10).map((event, index) => (
            <View key={event.id} style={styles.eventItem}>
              <View style={[
                styles.eventIndicator, 
                { backgroundColor: getAlertLevelColor(event.level) }
              ]} />
              <View style={styles.eventContent}>
                <Text style={styles.eventType}>
                  {getEventTypeDisplayName(event.type)}
                </Text>
                <Text style={styles.eventTime}>
                  {formatTimestamp(event.timestamp)}
                </Text>
                {event.userId && (
                  <Text style={styles.eventUser}>User: {event.userId}</Text>
                )}
              </View>
              <View style={styles.eventStatus}>
                <Text style={[
                  styles.statusText,
                  { color: event.resolved ? '#34C759' : '#FF9500' }
                ]}>
                  {event.resolved ? '✓' : '⏳'}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No recent security events</Text>
        )}
      </View>

      {/* Audit Information */}
      <View style={styles.auditCard}>
        <Text style={styles.cardTitle}>Security Audit</Text>
        <View style={styles.auditInfo}>
          <Text style={styles.auditText}>
            Last Audit: {lastAuditTime ? formatTimestamp(lastAuditTime.getTime()) : 'Never'}
          </Text>
          <Text style={styles.auditText}>
            Environment: {config.environment}
          </Text>
          <Text style={styles.auditText}>
            Monitoring: {statistics.monitoringActive ? '✅ Active' : '❌ Inactive'}
          </Text>
        </View>
      </View>

      {/* Development Tools */}
      {isDevelopment() && (
        <View style={styles.devCard}>
          <Text style={styles.cardTitle}>🛠️ Development Tools</Text>
          <Text style={styles.devText}>
            Security monitoring is running in development mode.
            Some features may be limited.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#8E8E93',
  },
  scoreCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    textAlign: 'center',
  },
  alertsCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  alertIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  alertTime: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  eventsCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  eventIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventType: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  eventTime: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  eventUser: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 1,
  },
  eventStatus: {
    marginLeft: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  auditCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  auditInfo: {
    marginTop: 8,
  },
  auditText: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 4,
  },
  devCard: {
    backgroundColor: '#FFF3CD',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  devText: {
    fontSize: 14,
    color: '#856404',
  },
  noDataText: {
    textAlign: 'center',
    color: '#8E8E93',
    fontStyle: 'italic',
    marginTop: 8,
  },
});

export default SecurityDashboard;
