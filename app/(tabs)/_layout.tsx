import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';
// Temporarily commenting out FloatingWorkoutTracker import
// import FloatingWorkoutTracker from '../../components/ui/FloatingWorkoutTracker';

export default function TabLayout() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
          tabBarShowLabel: false,
          animation: 'none',
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
          }}
        />
        <Tabs.Screen
          name="training"
          options={{
            title: 'Training',
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
        <Tabs.Screen
          name="social"
          options={{
            title: 'Social',
          }}
        />
        <Tabs.Screen
          name="clubs"
          options={{
            title: 'Clubs',
          }}
        />
        <Tabs.Screen
          name="feed"
          options={{
            title: 'Feed',
          }}
        />
        <Tabs.Screen
          name="feed-new"
          options={{
            title: 'New Feed',
          }}
        />
        <Tabs.Screen
          name="marketplace"
          options={{
            title: 'Marketplace',
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
          }}
        />
      </Tabs>

      {/* Temporarily removing FloatingWorkoutTracker */}
      {/* <FloatingWorkoutTracker /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
