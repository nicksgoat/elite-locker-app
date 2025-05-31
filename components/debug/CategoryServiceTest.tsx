/**
 * Elite Locker - Category Service Test Component
 *
 * This component tests the categoryService import and functionality.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// Test different import methods
let categoryService: any = null;
let importError: string | null = null;

try {
  // Method 1: Direct import
  const imported = require('../../services/categoryService');
  categoryService = imported.categoryService;
  console.log('✅ Method 1: Direct require successful');
} catch (error) {
  console.error('❌ Method 1: Direct require failed:', error);
  importError = `Method 1 failed: ${error.message}`;
}

if (!categoryService) {
  try {
    // Method 2: Import from index
    const imported = require('../../services/index');
    categoryService = imported.categoryService;
    console.log('✅ Method 2: Index import successful');
  } catch (error) {
    console.error('❌ Method 2: Index import failed:', error);
    importError = `Method 2 failed: ${error.message}`;
  }
}

export default function CategoryServiceTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, result]);
  };

  const runTests = async () => {
    setIsLoading(true);
    setTestResults([]);

    // Test 1: Check if categoryService is available
    if (!categoryService) {
      addResult(`❌ categoryService not available: ${importError}`);
      setIsLoading(false);
      return;
    }

    addResult('✅ categoryService imported successfully');
    addResult(`Type: ${typeof categoryService}`);

    // Test 2: Check methods
    try {
      const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(categoryService));
      addResult(`Methods: ${methods.join(', ')}`);
    } catch (error) {
      addResult(`❌ Error getting methods: ${error.message}`);
    }

    // Test 3: Test getCategories method
    try {
      addResult('🔍 Testing getCategories...');
      const categories = await categoryService.getCategories();
      addResult(`✅ getCategories returned ${categories.length} categories`);
      
      if (categories.length > 0) {
        addResult(`First category: ${categories[0].name} (${categories[0].slug})`);
      }
    } catch (error) {
      addResult(`❌ getCategories failed: ${error.message}`);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    // Auto-run tests on mount
    runTests();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Category Service Test</Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={runTests}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Running Tests...' : 'Run Tests'}
        </Text>
      </TouchableOpacity>

      <View style={styles.results}>
        {testResults.map((result, index) => (
          <Text key={index} style={styles.resultText}>
            {result}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#0A84FF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  results: {
    flex: 1,
  },
  resultText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'monospace',
  },
});
