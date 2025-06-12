import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import FloatingWorkoutTracker from '../../components/ui/FloatingWorkoutTracker';

export default function TabLayout() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: 'rgba(28, 28, 30, 0.9)',
            borderTopColor: 'rgba(84, 84, 88, 0.6)',
            borderTopWidth: 0.5,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 90,
            paddingBottom: 20,
            paddingTop: 10,
          },
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '500',
          },
          tabBarIconStyle: {
            marginBottom: 2,
          },
          animation: 'shift',
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            href: '/',
            tabBarIcon: ({ color, focused }) => (
              <Text style={{ color, fontSize: 24, fontWeight: focused ? 'bold' : 'normal' }}>🏠</Text>
            ),
          }}
        />
        <Tabs.Screen
          name="training"
          options={{
            title: 'Training',
            href: '/training',
            tabBarIcon: ({ color, focused }) => (
              <Text style={{ color, fontSize: 24, fontWeight: focused ? 'bold' : 'normal' }}>💪</Text>
            ),
          }}
        />
        <Tabs.Screen
          name="social"
          options={{
            title: 'Social',
            href: '/social',
            tabBarIcon: ({ color, focused }) => (
              <Text style={{ color, fontSize: 24, fontWeight: focused ? 'bold' : 'normal' }}>👥</Text>
            ),
          }}
        />
        <Tabs.Screen
          name="marketplace"
          options={{
            title: 'Market',
            href: '/marketplace',
            tabBarIcon: ({ color, focused }) => (
              <Text style={{ color, fontSize: 24, fontWeight: focused ? 'bold' : 'normal' }}>🏪</Text>
            ),
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: 'Library',
            href: '/library',
            tabBarIcon: ({ color, focused }) => (
              <Text style={{ color, fontSize: 24, fontWeight: focused ? 'bold' : 'normal' }}>📚</Text>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            href: '/profile',
            tabBarIcon: ({ color, focused }) => (
              <Text style={{ color, fontSize: 24, fontWeight: focused ? 'bold' : 'normal' }}>👤</Text>
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            href: null, // Hidden from main navigation
          }}
        />
        <Tabs.Screen
          name="feed"
          options={{
            title: 'Feed',
            href: null, // Hidden from main navigation
          }}
        />
        <Tabs.Screen
          name="clubs"
          options={{
            title: 'Clubs',
            href: null, // Hidden from main navigation
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            title: 'Progress',
            href: null, // Hidden from main navigation
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            href: null, // Hidden from main navigation
          }}
        />
        {/* Hide screens not in main navigation */}

        <Tabs.Screen
          name="training-spotify"
          options={{
            title: 'Training Spotify',
            href: null, // Don't show in navigation
          }}
        />
        <Tabs.Screen
          name="social_new"
          options={{
            title: 'Social New',
            href: null, // Don't show in navigation
          }}
        />
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home Alt',
            href: null, // Don't show in navigation
          }}
        />
        <Tabs.Screen
          name="unified-demo"
          options={{
            title: 'Unified Demo',
            href: null, // Don't show in navigation
          }}
        />
      </Tabs>

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
