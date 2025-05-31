/**
 * Elite Locker - Authentication Screen
 *
 * Simple authentication screen for sign up and sign in
 */

import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';

export const AuthScreen: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');

  const { signIn, signUp, isLoading } = useAuth();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      let success = false;

      if (isSignUp) {
        if (!username) {
          Alert.alert('Error', 'Username is required for sign up');
          return;
        }
        success = await signUp(email, password, username);
        if (success) {
          Alert.alert('Success', 'Account created successfully! Please check your email to verify your account.');
        }
      } else {
        success = await signIn(email, password);
        if (success) {
          Alert.alert('Success', 'Signed in successfully!');
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed');
    }
  };

  const handleQuickSignUp = async () => {
    // Quick sign up with test data
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'password123';
    const testUsername = `user${Date.now()}`;

    try {
      const success = await signUp(testEmail, testPassword, testUsername);
      if (success) {
        Alert.alert('Success', `Test account created!\nEmail: ${testEmail}\nPassword: ${testPassword}`);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create test account');
    }
  };

  const handleAutoLogin = async () => {
    // Auto login with the test user credentials
    const testEmail = 'test@test.com';
    const testPassword = '123456';

    try {
      console.log('Auto-logging in with test@test.com...');
      const success = await signIn(testEmail, testPassword);
      if (success) {
        console.log('Auto-login successful!');
      } else {
        Alert.alert('Error', 'Auto-login failed. Please check if the test account exists.');
      }
    } catch (error: any) {
      console.error('Auto-login error:', error);
      Alert.alert('Error', error.message || 'Auto-login failed');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Elite Locker</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </Text>
        </View>

        <View style={styles.form}>
          {isSignUp && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#666"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#666"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </>
          )}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleAuth}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => setIsSignUp(!isSignUp)}
            disabled={isLoading}
          >
            <Text style={styles.secondaryButtonText}>
              {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.testButton]}
            onPress={handleQuickSignUp}
            disabled={isLoading}
          >
            <Text style={styles.testButtonText}>
              Create Test Account
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.autoLoginButton]}
            onPress={handleAutoLogin}
            disabled={isLoading}
          >
            <Text style={styles.autoLoginButtonText}>
              🚀 Auto Login (test@test.com)
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#CCC',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    color: '#FFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  testButton: {
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 0, 0.5)',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#CCC',
    fontSize: 16,
    fontWeight: '600',
  },
  testButtonText: {
    color: '#0F0',
    fontSize: 14,
    fontWeight: '600',
  },
  autoLoginButton: {
    backgroundColor: '#FF9F0A',
    borderWidth: 1,
    borderColor: '#FF9F0A',
    marginTop: 8,
  },
  autoLoginButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
});
