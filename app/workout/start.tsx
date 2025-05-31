import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WorkoutTypeSelector from '@/components/ui/WorkoutTypeSelector';

export default function StartWorkoutScreen() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Start Workout',
          headerShown: false,
        }}
      />
      
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <WorkoutTypeSelector />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
