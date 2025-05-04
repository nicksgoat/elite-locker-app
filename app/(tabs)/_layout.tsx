import { Tabs } from 'expo-router';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import FloatingWorkoutTracker from '../../components/ui/FloatingWorkoutTracker';

export default function TabLayout() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' }, // Hide the default tab bar since we use a persistent one
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
          }}
        />
        <Tabs.Screen
          name="workouts"
          options={{
            title: 'Workouts',
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            title: 'Progress',
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
          }}
        />
      </Tabs>

      {/* Add floating workout tracker button */}
      <FloatingWorkoutTracker />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
