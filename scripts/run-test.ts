import { runOfflineWorkoutTests } from './test-offline-workout';

async function main() {
  console.log('🚀 Starting Elite Locker Offline Workout System Tests...\n');
  
  try {
    const results = await runOfflineWorkoutTests();
    
    console.log('\n📊 DETAILED TEST RESULTS:');
    console.log('='.repeat(50));
    
    results.forEach((result, index) => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${result.testName}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      if (result.result) {
        console.log(`   Result: ${JSON.stringify(result.result, null, 2)}`);
      }
      console.log('');
    });
    
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    const percentage = ((passed / total) * 100).toFixed(1);
    
    console.log(`\n🎯 FINAL SUMMARY:`);
    console.log(`   Tests Passed: ${passed}/${total} (${percentage}%)`);
    
    if (passed === total) {
      console.log('   Status: 🚀 ALL SYSTEMS GO! Offline workout logging is fully optimized.');
    } else {
      console.log('   Status: ⚠️  Some issues detected. Review failed tests above.');
    }
    
  } catch (error) {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export default main; 