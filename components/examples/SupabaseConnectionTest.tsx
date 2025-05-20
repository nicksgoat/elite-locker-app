/**
 * Elite Locker - Supabase Connection Test Component
 *
 * This component tests the connection to Supabase and displays the result.
 */

import { colors, spacing, typography } from '@/components/design-system/tokens';
import { checkSupabaseConnection, supabase } from '@/lib/supabase-new';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SupabaseConnectionTest: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [healthCheckData, setHealthCheckData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check connection
      const connected = await checkSupabaseConnection();
      setIsConnected(connected);

      if (connected) {
        // Try to get user session to verify auth is working
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          setError(`Auth error: ${sessionError.message}`);
        } else {
          // Try a simple query to verify database access
          try {
            const { data: testData, error: testError } = await supabase
              .from('profiles')
              .select('count')
              .limit(1);

            if (testError) {
              setError(`Database error: ${testError.message}`);
            } else {
              setHealthCheckData([{
                id: 1,
                status: 'healthy',
                last_checked: new Date().toISOString(),
                auth_status: sessionData ? 'authenticated' : 'not authenticated',
                db_status: testData ? 'accessible' : 'not accessible'
              }]);
            }
          } catch (dbError: any) {
            setError(`Database error: ${dbError.message || 'Unknown database error'}`);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Supabase Connection Test</Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.dark.brand.primary} />
            <Text style={styles.loadingText}>Testing connection...</Text>
          </View>
        ) : (
          <>
            <View style={styles.statusContainer}>
              <Ionicons
                name={isConnected ? 'checkmark-circle' : 'close-circle'}
                size={48}
                color={isConnected
                  ? colors.dark.status.success
                  : colors.dark.status.error
                }
              />
              <Text style={styles.statusText}>
                {isConnected ? 'Connected to Supabase' : 'Not connected to Supabase'}
              </Text>
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>Error:</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {healthCheckData && (
              <View style={styles.dataContainer}>
                <Text style={styles.dataTitle}>Health Check Data:</Text>
                {healthCheckData.map((item: any) => (
                  <View key={item.id} style={styles.dataItem}>
                    <Text style={styles.dataLabel}>Status:</Text>
                    <Text style={styles.dataValue}>{item.status}</Text>

                    <Text style={styles.dataLabel}>Last Checked:</Text>
                    <Text style={styles.dataValue}>
                      {new Date(item.last_checked).toLocaleString()}
                    </Text>

                    {item.auth_status && (
                      <>
                        <Text style={styles.dataLabel}>Auth Status:</Text>
                        <Text style={styles.dataValue}>{item.auth_status}</Text>
                      </>
                    )}

                    {item.db_status && (
                      <>
                        <Text style={styles.dataLabel}>Database Status:</Text>
                        <Text style={styles.dataValue}>{item.db_status}</Text>
                      </>
                    )}
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={testConnection}
            >
              <Text style={styles.buttonText}>Test Again</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.spacing.md,
  },
  card: {
    backgroundColor: colors.dark.background.secondary,
    borderRadius: spacing.layout.borderRadius.md,
    padding: spacing.spacing.lg,
  },
  title: {
    ...typography.textVariants.title2,
    color: colors.dark.text.primary,
    marginBottom: spacing.spacing.lg,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.spacing.xl,
  },
  loadingText: {
    ...typography.textVariants.body,
    color: colors.dark.text.secondary,
    marginTop: spacing.spacing.md,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: spacing.spacing.lg,
  },
  statusText: {
    ...typography.textVariants.title3,
    color: colors.dark.text.primary,
    marginTop: spacing.spacing.sm,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)', // Fallback error background color
    borderRadius: spacing.layout.borderRadius.sm,
    padding: spacing.spacing.md,
    marginBottom: spacing.spacing.lg,
  },
  errorTitle: {
    ...typography.textVariants.body,
    fontWeight: 'bold',
    color: colors.dark.status.error,
    marginBottom: spacing.spacing.xs,
  },
  errorText: {
    ...typography.textVariants.body,
    color: colors.dark.status.error,
  },
  dataContainer: {
    marginBottom: spacing.spacing.lg,
  },
  dataTitle: {
    ...typography.textVariants.title3,
    color: colors.dark.text.primary,
    marginBottom: spacing.spacing.md,
  },
  dataItem: {
    backgroundColor: colors.dark.background.tertiary,
    borderRadius: spacing.layout.borderRadius.sm,
    padding: spacing.spacing.md,
    marginBottom: spacing.spacing.sm,
  },
  dataLabel: {
    ...typography.textVariants.caption1,
    color: colors.dark.text.secondary,
  },
  dataValue: {
    ...typography.textVariants.body,
    color: colors.dark.text.primary,
    marginBottom: spacing.spacing.sm,
  },
  button: {
    backgroundColor: colors.dark.brand.primary,
    borderRadius: spacing.layout.borderRadius.sm,
    padding: spacing.spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    ...typography.textVariants.button,
    color: colors.dark.text.inverse,
  },
});

export default SupabaseConnectionTest;
