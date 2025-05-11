import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Temporarily commenting out FloatingWorkoutTracker import
// import FloatingWorkoutTracker from '../../components/ui/FloatingWorkoutTracker';

export default function TabLayout() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: 'rgba(28, 28, 30, 0.95)',
            borderTopWidth: 0.5,
            borderTopColor: 'rgba(255, 255, 255, 0.1)',
            height: 80,
            paddingBottom: 20,
          },
          tabBarActiveTintColor: '#0A84FF',
          tabBarInactiveTintColor: '#9BA1A6',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          animation: 'none',
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="workouts"
          options={{
            title: 'Workouts',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'barbell' : 'barbell-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="programs"
          options={{
            title: 'Programs',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="social"
          options={{
            title: 'Social',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'people' : 'people-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
            ),
          }}
        />
        
        {/* Hidden tabs not shown in the tab bar */}
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarButton: () => null,
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            title: 'Progress',
            tabBarButton: () => null,
          }}
        />
        <Tabs.Screen
          name="clubs"
          options={{
            title: 'Clubs',
            tabBarButton: () => null,
          }}
        />
        <Tabs.Screen
          name="feed"
          options={{
            title: 'Feed',
            tabBarButton: () => null,
          }}
        />
        <Tabs.Screen
          name="feed-new"
          options={{
            title: 'New Feed',
            tabBarButton: () => null,
          }}
        />
        <Tabs.Screen
          name="marketplace"
          options={{
            title: 'Marketplace',
            tabBarButton: () => null,
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
