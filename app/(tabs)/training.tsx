/**
 * Elite Locker - Training Tab (Streamlined)
 * 
 * This is the main training tab that uses the streamlined workout interface
 * to provide a simple, intuitive workout experience.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import StreamlinedWorkoutScreen from '../workout/streamlined';

export default function TrainingScreen() {
  return (
    <View style={styles.container}>
      <StreamlinedWorkoutScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
