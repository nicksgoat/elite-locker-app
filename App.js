import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProviderWrapper } from './components/layout/SafeAreaWrapper';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { ExpoRoot } from 'expo-router';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProviderWrapper>
        <View style={styles.container}>
          <StatusBar style="light" />
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Main"
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen 
                name="Main" 
                component={ExpoRoot} 
                initialParams={{
                  screen: '/(tabs)/'
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </View>
      </SafeAreaProviderWrapper>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
}); 