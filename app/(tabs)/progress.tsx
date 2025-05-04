import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MainLayout from '@/components/layout/MainLayout';
import { Ionicons } from '@expo/vector-icons';

export default function ProgressScreen() {
  return (
    <MainLayout title="Progress" hasTabBar={true}>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Ionicons name="analytics" size={64} color="#0A84FF" />
        </View>
        <Text style={styles.title}>Progress</Text>
        <Text style={styles.subtitle}>Track your fitness journey and achievements</Text>
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  iconContainer: {
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
}); 