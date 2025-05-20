/**
 * Elite Locker - Offline Fallback Component
 *
 * This component is displayed when the app is offline and needs to show
 * fallback content instead of attempting to fetch data from Supabase.
 */

import { useConnectivity } from '@/contexts/ConnectivityContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface OfflineFallbackProps {
  message?: string;
  icon?: string;
  children?: React.ReactNode;
}

const OfflineFallback: React.FC<OfflineFallbackProps> = ({
  message = 'You are currently offline. Some features may be limited.',
  icon = 'cloud-offline',
  children,
}) => {
  const { checkConnection } = useConnectivity();

  return (
    <View style={styles.container}>
      <Ionicons name={icon as any} size={48} color={colors.dark.text.secondary} />
      <Text style={styles.message}>{message}</Text>

      <TouchableOpacity style={styles.retryButton} onPress={checkConnection}>
        <Text style={styles.retryText}>Retry Connection</Text>
      </TouchableOpacity>

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dark.background.secondary,
    borderRadius: spacing.layout.borderRadius.md,
    margin: spacing.spacing.lg,
  },
  message: {
    ...typography.textVariants.body,
    color: colors.dark.text.secondary,
    textAlign: 'center',
    marginVertical: spacing.spacing.md,
  },
  retryButton: {
    backgroundColor: colors.dark.brand.primary,
    paddingVertical: spacing.spacing.sm,
    paddingHorizontal: spacing.spacing.lg,
    borderRadius: spacing.layout.borderRadius.sm,
    marginTop: spacing.spacing.md,
  },
  retryText: {
    ...typography.textVariants.button,
    color: colors.dark.text.inverse,
  },
});

export default OfflineFallback;
