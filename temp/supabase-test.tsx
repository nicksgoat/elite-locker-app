import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import SupabaseConnectionTest from '@/components/examples/SupabaseConnectionTest';
import { colors } from '@/components/design-system/tokens';

export default function SupabaseTestScreen() {
  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Supabase Connection Test' }} />
      <SupabaseConnectionTest />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background.primary,
  },
});
