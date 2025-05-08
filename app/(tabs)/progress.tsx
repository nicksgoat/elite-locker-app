import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import IMessagePageWrapper from '@/components/layout/iMessagePageWrapper';

export default function ProgressScreen() {
  return (
    <IMessagePageWrapper 
      title="Progress" 
      subtitle="Track your journey"
      showHeader={false}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Empty state for now */}
        <View style={styles.emptyStateContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="analytics" size={64} color="#0A84FF" />
          </View>
          <Text style={styles.title}>Track Your Progress</Text>
          <Text style={styles.subtitle}>View your fitness journey and achievements</Text>
          
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.actionButton}>
              <BlurView intensity={25} tint="dark" style={styles.buttonBlur}>
                <Ionicons name="stats-chart" size={24} color="#0A84FF" />
                <Text style={styles.actionButtonText}>Workout Stats</Text>
              </BlurView>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <BlurView intensity={25} tint="dark" style={styles.buttonBlur}>
                <Ionicons name="barbell" size={24} color="#0A84FF" />
                <Text style={styles.actionButtonText}>Personal Records</Text>
              </BlurView>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <BlurView intensity={25} tint="dark" style={styles.buttonBlur}>
                <Ionicons name="body" size={24} color="#0A84FF" />
                <Text style={styles.actionButtonText}>Body Metrics</Text>
              </BlurView>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <BlurView intensity={25} tint="dark" style={styles.buttonBlur}>
                <Ionicons name="trophy" size={24} color="#0A84FF" />
                <Text style={styles.actionButtonText}>Achievements</Text>
              </BlurView>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </IMessagePageWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    minHeight: 400,
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
    marginBottom: 32,
  },
  actionButtonsContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  actionButton: {
    width: '47%',
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
}); 