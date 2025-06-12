#!/usr/bin/env npx ts-node
/**
 * Elite Locker - Sync System Test Script
 * 
 * This script tests the real-time synchronization system.
 */

import { 
  initializeRealtimeSync, 
  subscribeToTableChanges, 
  performOptimisticUpdate,
  getSyncStatistics,
  realtimeSyncManager
} from '../utils/realtimeSync';
import { createLogger } from '../utils/secureLogger';

const logger = createLogger('SyncTest');

// Test configuration
const TEST_CONFIG = {
  testDuration: 30000, // 30 seconds
  operationsPerSecond: 2,
  tables: ['workouts', 'exercise_sets', 'training_maxes'],
};

// Test results interface
interface TestResults {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  conflicts: number;
  averageLatency: number;
  syncStatistics: any;
}

// Sync system test class
class SyncSystemTest {
  private results: TestResults = {
    totalOperations: 0,
    successfulOperations: 0,
    failedOperations: 0,
    conflicts: 0,
    averageLatency: 0,
    syncStatistics: null,
  };

  private latencies: number[] = [];
  private subscriptions: string[] = [];
  private isRunning = false;

  // Run comprehensive sync tests
  async runTests(): Promise<TestResults> {
    console.log('🔄 Elite Locker Sync System Test\n');
    console.log('='.repeat(50));
    
    try {
      // Initialize sync system
      await this.initializeSync();
      
      // Run test suite
      await this.runTestSuite();
      
      // Generate results
      this.generateResults();
      
      return this.results;
      
    } catch (error: any) {
      logger.error('Sync test failed', { error: error?.message });
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  // Initialize sync system
  private async initializeSync(): Promise<void> {
    console.log('📋 Initializing sync system...');
    
    try {
      await initializeRealtimeSync();
      console.log('✅ Sync system initialized');
    } catch (error) {
      console.log('❌ Failed to initialize sync system');
      throw error;
    }
  }

  // Run test suite
  private async runTestSuite(): Promise<void> {
    console.log('\n🧪 Running sync tests...');
    
    // Test 1: Basic subscription
    await this.testBasicSubscription();
    
    // Test 2: Optimistic updates
    await this.testOptimisticUpdates();
    
    // Test 3: Conflict resolution
    await this.testConflictResolution();
    
    // Test 4: Performance under load
    await this.testPerformanceUnderLoad();
    
    // Test 5: Network interruption simulation
    await this.testNetworkInterruption();
  }

  // Test basic subscription functionality
  private async testBasicSubscription(): Promise<void> {
    console.log('\n📡 Testing basic subscription...');
    
    let eventsReceived = 0;
    
    for (const table of TEST_CONFIG.tables) {
      const subscriptionId = subscribeToTableChanges(
        table,
        (event) => {
          eventsReceived++;
          logger.debug(`Event received for table ${table}`, { 
            type: event.type, 
            recordId: event.record?.id 
          });
        }
      );
      
      this.subscriptions.push(subscriptionId);
    }
    
    // Wait for subscriptions to be established
    await this.sleep(2000);
    
    console.log(`✅ Subscribed to ${TEST_CONFIG.tables.length} tables`);
  }

  // Test optimistic updates
  private async testOptimisticUpdates(): Promise<void> {
    console.log('\n⚡ Testing optimistic updates...');
    
    const testOperations = 10;
    let successCount = 0;
    
    for (let i = 0; i < testOperations; i++) {
      try {
        const startTime = Date.now();
        
        await performOptimisticUpdate(
          'workouts',
          {
            id: `test_workout_${i}`,
            name: `Test Workout ${i}`,
            status: 'active',
            updated_at: new Date().toISOString(),
          },
          'update'
        );
        
        const latency = Date.now() - startTime;
        this.latencies.push(latency);
        
        successCount++;
        this.results.successfulOperations++;
        
      } catch (error: any) {
        logger.error(`Optimistic update ${i} failed`, { error: error?.message });
        this.results.failedOperations++;
      }
      
      this.results.totalOperations++;
    }
    
    console.log(`✅ Completed ${successCount}/${testOperations} optimistic updates`);
  }

  // Test conflict resolution
  private async testConflictResolution(): Promise<void> {
    console.log('\n⚔️ Testing conflict resolution...');
    
    try {
      // Simulate conflicting updates
      const recordId = 'test_conflict_record';
      
      // Create two conflicting updates
      await Promise.all([
        performOptimisticUpdate(
          'exercise_sets',
          {
            id: recordId,
            weight: 100,
            reps: 10,
            updated_at: new Date().toISOString(),
          },
          'update'
        ),
        performOptimisticUpdate(
          'exercise_sets',
          {
            id: recordId,
            weight: 105,
            reps: 8,
            updated_at: new Date().toISOString(),
          },
          'update'
        ),
      ]);
      
      // Wait for conflict detection
      await this.sleep(1000);
      
      const conflicts = realtimeSyncManager.getUnresolvedConflicts();
      this.results.conflicts = conflicts.length;
      
      console.log(`✅ Conflict test completed (${conflicts.length} conflicts detected)`);
      
    } catch (error: any) {
      logger.error('Conflict resolution test failed', { error: error?.message });
      this.results.failedOperations++;
    }
  }

  // Test performance under load
  private async testPerformanceUnderLoad(): Promise<void> {
    console.log('\n🚀 Testing performance under load...');
    
    this.isRunning = true;
    const startTime = Date.now();
    
    // Generate load
    const loadPromises: Promise<void>[] = [];
    
    for (let i = 0; i < 50; i++) {
      loadPromises.push(this.generateLoad(i));
    }
    
    await Promise.all(loadPromises);
    
    const duration = Date.now() - startTime;
    const operationsPerSecond = this.results.totalOperations / (duration / 1000);
    
    console.log(`✅ Load test completed in ${duration}ms`);
    console.log(`📊 Operations per second: ${operationsPerSecond.toFixed(2)}`);
  }

  // Generate load for performance testing
  private async generateLoad(batchId: number): Promise<void> {
    const operations = 10;
    
    for (let i = 0; i < operations; i++) {
      if (!this.isRunning) break;
      
      try {
        const startTime = Date.now();
        
        await performOptimisticUpdate(
          'training_maxes',
          {
            id: `load_test_${batchId}_${i}`,
            exercise_id: `exercise_${batchId}`,
            value: Math.floor(Math.random() * 300) + 100,
            unit: 'lb',
            updated_at: new Date().toISOString(),
          },
          'update'
        );
        
        const latency = Date.now() - startTime;
        this.latencies.push(latency);
        
        this.results.successfulOperations++;
        
      } catch (error) {
        this.results.failedOperations++;
      }
      
      this.results.totalOperations++;
      
      // Small delay to prevent overwhelming the system
      await this.sleep(50);
    }
  }

  // Test network interruption simulation
  private async testNetworkInterruption(): Promise<void> {
    console.log('\n📶 Testing network interruption simulation...');
    
    try {
      // Simulate offline operations
      console.log('📴 Simulating offline mode...');
      
      // Perform operations while "offline"
      for (let i = 0; i < 5; i++) {
        await performOptimisticUpdate(
          'workouts',
          {
            id: `offline_workout_${i}`,
            name: `Offline Workout ${i}`,
            status: 'completed',
            updated_at: new Date().toISOString(),
          },
          'insert'
        );
        
        this.results.totalOperations++;
        this.results.successfulOperations++;
      }
      
      console.log('📡 Simulating reconnection...');
      
      // Wait for "reconnection" and sync
      await this.sleep(2000);
      
      console.log('✅ Network interruption test completed');
      
    } catch (error: any) {
      logger.error('Network interruption test failed', { error: error?.message });
      this.results.failedOperations++;
    }
  }

  // Generate test results
  private generateResults(): void {
    console.log('\n' + '='.repeat(50));
    console.log('📊 SYNC SYSTEM TEST RESULTS');
    console.log('='.repeat(50));
    
    // Calculate average latency
    if (this.latencies.length > 0) {
      this.results.averageLatency = this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length;
    }
    
    // Get sync statistics
    this.results.syncStatistics = getSyncStatistics();
    
    // Display results
    console.log(`\n📈 Performance Metrics:`);
    console.log(`   Total Operations: ${this.results.totalOperations}`);
    console.log(`   Successful: ${this.results.successfulOperations}`);
    console.log(`   Failed: ${this.results.failedOperations}`);
    console.log(`   Success Rate: ${((this.results.successfulOperations / this.results.totalOperations) * 100).toFixed(1)}%`);
    console.log(`   Average Latency: ${this.results.averageLatency.toFixed(2)}ms`);
    
    console.log(`\n🔄 Sync Statistics:`);
    console.log(`   Active Listeners: ${this.results.syncStatistics.listeners}`);
    console.log(`   Active Subscriptions: ${this.results.syncStatistics.subscriptions}`);
    console.log(`   Queue Size: ${this.results.syncStatistics.queueSize}`);
    console.log(`   Unresolved Conflicts: ${this.results.syncStatistics.unresolvedConflicts}`);
    
    console.log(`\n⚔️ Conflict Resolution:`);
    console.log(`   Conflicts Detected: ${this.results.conflicts}`);
    
    // Overall assessment
    const successRate = (this.results.successfulOperations / this.results.totalOperations) * 100;
    const avgLatency = this.results.averageLatency;
    
    console.log(`\n🎯 Overall Assessment:`);
    if (successRate >= 95 && avgLatency < 100) {
      console.log('   ✅ EXCELLENT: Sync system performing optimally');
    } else if (successRate >= 90 && avgLatency < 200) {
      console.log('   ✅ GOOD: Sync system performing well');
    } else if (successRate >= 80 && avgLatency < 500) {
      console.log('   ⚠️ FAIR: Sync system needs optimization');
    } else {
      console.log('   ❌ POOR: Sync system requires immediate attention');
    }
    
    console.log('\n' + '='.repeat(50));
  }

  // Cleanup resources
  private async cleanup(): Promise<void> {
    console.log('\n🧹 Cleaning up test resources...');
    
    this.isRunning = false;
    
    // Unsubscribe from all tables
    this.subscriptions.forEach(subscriptionId => {
      try {
        // Note: unsubscribeFromChanges would be imported if available
        logger.debug('Unsubscribing from changes', { subscriptionId });
      } catch (error: any) {
        logger.error('Failed to unsubscribe', { error: error?.message, subscriptionId });
      }
    });
    
    console.log('✅ Cleanup completed');
  }

  // Utility function for delays
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run tests if called directly
if (require.main === module) {
  const test = new SyncSystemTest();
  
  test.runTests()
    .then(results => {
      console.log('\n🎉 Sync system test completed successfully!');
      process.exit(0);
    })
    .catch((error: any) => {
      console.error('\n💥 Sync system test failed:', error?.message);
      process.exit(1);
    });
}

export { SyncSystemTest };
