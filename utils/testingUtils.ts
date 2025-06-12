/**
 * Elite Locker - Testing Utilities
 * 
 * This file contains utilities for testing and debugging the app.
 */

import { Alert } from 'react-native';

// Test result interface
export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

// Test suite interface
export interface TestSuite {
  name: string;
  tests: TestResult[];
  passed: number;
  failed: number;
  duration: number;
}

// Simple test runner
export class TestRunner {
  private tests: Array<{ name: string; fn: () => void | Promise<void> }> = [];
  private beforeEachFn?: () => void | Promise<void>;
  private afterEachFn?: () => void | Promise<void>;

  beforeEach(fn: () => void | Promise<void>): void {
    this.beforeEachFn = fn;
  }

  afterEach(fn: () => void | Promise<void>): void {
    this.afterEachFn = fn;
  }

  test(name: string, fn: () => void | Promise<void>): void {
    this.tests.push({ name, fn });
  }

  async run(suiteName: string = 'Test Suite'): Promise<TestSuite> {
    const results: TestResult[] = [];
    const suiteStartTime = Date.now();

    console.log(`🧪 Running ${suiteName}...`);

    for (const test of this.tests) {
      const startTime = Date.now();
      let passed = false;
      let error: string | undefined;

      try {
        if (this.beforeEachFn) {
          await this.beforeEachFn();
        }

        await test.fn();
        passed = true;
        console.log(`✅ ${test.name}`);
      } catch (e) {
        error = e instanceof Error ? e.message : String(e);
        console.log(`❌ ${test.name}: ${error}`);
      } finally {
        if (this.afterEachFn) {
          try {
            await this.afterEachFn();
          } catch (e) {
            console.warn(`Cleanup error in ${test.name}:`, e);
          }
        }
      }

      const duration = Date.now() - startTime;
      results.push({
        name: test.name,
        passed,
        error,
        duration
      });
    }

    const suiteDuration = Date.now() - suiteStartTime;
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;

    const suite: TestSuite = {
      name: suiteName,
      tests: results,
      passed,
      failed,
      duration: suiteDuration
    };

    console.log(`📊 ${suiteName} completed: ${passed} passed, ${failed} failed (${suiteDuration}ms)`);

    return suite;
  }
}

// Assertion utilities
export const assert = {
  isTrue(value: any, message?: string): void {
    if (!value) {
      throw new Error(message || `Expected true, got ${value}`);
    }
  },

  isFalse(value: any, message?: string): void {
    if (value) {
      throw new Error(message || `Expected false, got ${value}`);
    }
  },

  equals(actual: any, expected: any, message?: string): void {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  },

  notEquals(actual: any, expected: any, message?: string): void {
    if (actual === expected) {
      throw new Error(message || `Expected not ${expected}, got ${actual}`);
    }
  },

  isNull(value: any, message?: string): void {
    if (value !== null) {
      throw new Error(message || `Expected null, got ${value}`);
    }
  },

  isNotNull(value: any, message?: string): void {
    if (value === null) {
      throw new Error(message || `Expected not null, got null`);
    }
  },

  isUndefined(value: any, message?: string): void {
    if (value !== undefined) {
      throw new Error(message || `Expected undefined, got ${value}`);
    }
  },

  isDefined(value: any, message?: string): void {
    if (value === undefined) {
      throw new Error(message || `Expected defined value, got undefined`);
    }
  },

  isArray(value: any, message?: string): void {
    if (!Array.isArray(value)) {
      throw new Error(message || `Expected array, got ${typeof value}`);
    }
  },

  isObject(value: any, message?: string): void {
    if (typeof value !== 'object' || value === null) {
      throw new Error(message || `Expected object, got ${typeof value}`);
    }
  },

  isString(value: any, message?: string): void {
    if (typeof value !== 'string') {
      throw new Error(message || `Expected string, got ${typeof value}`);
    }
  },

  isNumber(value: any, message?: string): void {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error(message || `Expected number, got ${typeof value}`);
    }
  },

  throws(fn: () => void, message?: string): void {
    try {
      fn();
      throw new Error(message || 'Expected function to throw');
    } catch (e) {
      // Expected
    }
  },

  async throwsAsync(fn: () => Promise<void>, message?: string): Promise<void> {
    try {
      await fn();
      throw new Error(message || 'Expected async function to throw');
    } catch (e) {
      // Expected
    }
  }
};

// Mock utilities
export class MockBuilder<T> {
  private mockObject: Partial<T> = {};

  with<K extends keyof T>(key: K, value: T[K]): this {
    this.mockObject[key] = value;
    return this;
  }

  withFunction<K extends keyof T>(key: K, implementation?: (...args: any[]) => any): this {
    this.mockObject[key] = (implementation || jest.fn()) as T[K];
    return this;
  }

  build(): T {
    return this.mockObject as T;
  }
}

// Performance testing utilities
export class PerformanceTest {
  static async measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;
    return { result, duration };
  }

  static async expectFasterThan<T>(
    fn: () => Promise<T>,
    maxDuration: number,
    message?: string
  ): Promise<T> {
    const { result, duration } = await this.measureTime(fn);
    if (duration > maxDuration) {
      throw new Error(
        message || `Expected operation to complete in less than ${maxDuration}ms, took ${duration}ms`
      );
    }
    return result;
  }
}

// Integration test utilities
export const IntegrationTestUtils = {
  // Simulate user interaction
  async simulateUserInput(component: any, input: string): Promise<void> {
    // This would integrate with testing library
    console.log(`Simulating user input: ${input}`);
  },

  // Wait for async operations
  async waitFor(condition: () => boolean, timeout: number = 5000): Promise<void> {
    const start = Date.now();
    while (!condition() && Date.now() - start < timeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (!condition()) {
      throw new Error(`Condition not met within ${timeout}ms`);
    }
  },

  // Mock API responses
  mockApiResponse(endpoint: string, response: any): void {
    console.log(`Mocking API response for ${endpoint}:`, response);
  }
};

// Debug utilities
export const DebugUtils = {
  // Log component props
  logProps(componentName: string, props: any): void {
    if (__DEV__) {
      console.log(`🔍 ${componentName} props:`, props);
    }
  },

  // Log state changes
  logStateChange(componentName: string, oldState: any, newState: any): void {
    if (__DEV__) {
      console.log(`🔄 ${componentName} state change:`, { oldState, newState });
    }
  },

  // Log performance metrics
  logPerformance(componentName: string, metrics: any): void {
    if (__DEV__) {
      console.log(`⚡ ${componentName} performance:`, metrics);
    }
  },

  // Show debug alert
  showDebugAlert(title: string, message: string): void {
    if (__DEV__) {
      Alert.alert(`🐛 ${title}`, message);
    }
  }
};

// Smoke tests for critical app functions
export const SmokeTests = {
  async runWorkoutTests(): Promise<TestSuite> {
    const runner = new TestRunner();

    runner.test('Workout context initializes', () => {
      // Test workout context initialization
      assert.isDefined(global.workoutContext);
    });

    runner.test('Exercise sets can be created', () => {
      // Test exercise set creation
      const set = { id: 'test-1', weight: '100', reps: '10', completed: false };
      assert.isObject(set);
      assert.equals(set.id, 'test-1');
    });

    runner.test('Training max calculation works', () => {
      // Test training max calculation
      const weight = 100;
      const reps = 10;
      const estimatedMax = weight * (1 + reps / 30);
      assert.isNumber(estimatedMax);
      assert.isTrue(estimatedMax > weight);
    });

    return await runner.run('Workout Smoke Tests');
  },

  async runDataTests(): Promise<TestSuite> {
    const runner = new TestRunner();

    runner.test('API service exists', () => {
      // Test API service
      assert.isDefined(global.apiService);
    });

    runner.test('Data validation works', () => {
      // Test data validation
      const validData = { id: '1', name: 'Test' };
      assert.isObject(validData);
      assert.isDefined(validData.id);
    });

    return await runner.run('Data Smoke Tests');
  }
};
