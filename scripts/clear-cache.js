#!/usr/bin/env node

/**
 * Elite Locker - Cache Clearing Script
 * 
 * This script helps clear various caches that might contain stale data
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Elite Locker Cache Clearing Script');
console.log('=====================================');

// Clear Metro bundler cache
console.log('🔄 Clearing Metro bundler cache...');
try {
  const metroCache = path.join(__dirname, '..', 'node_modules', '.cache');
  if (fs.existsSync(metroCache)) {
    fs.rmSync(metroCache, { recursive: true, force: true });
    console.log('✅ Metro cache cleared');
  } else {
    console.log('ℹ️  Metro cache not found');
  }
} catch (error) {
  console.error('❌ Error clearing Metro cache:', error.message);
}

// Clear Expo cache
console.log('🔄 Clearing Expo cache...');
try {
  const expoCache = path.join(__dirname, '..', '.expo');
  if (fs.existsSync(expoCache)) {
    fs.rmSync(expoCache, { recursive: true, force: true });
    console.log('✅ Expo cache cleared');
  } else {
    console.log('ℹ️  Expo cache not found');
  }
} catch (error) {
  console.error('❌ Error clearing Expo cache:', error.message);
}

// Clear temp files
console.log('🔄 Clearing temp files...');
try {
  const tempDir = path.join(__dirname, '..', 'temp');
  if (fs.existsSync(tempDir)) {
    const files = fs.readdirSync(tempDir);
    files.forEach(file => {
      if (file !== '.gitkeep') {
        const filePath = path.join(tempDir, file);
        fs.rmSync(filePath, { recursive: true, force: true });
      }
    });
    console.log('✅ Temp files cleared');
  } else {
    console.log('ℹ️  Temp directory not found');
  }
} catch (error) {
  console.error('❌ Error clearing temp files:', error.message);
}

// Clear any log files
console.log('🔄 Clearing log files...');
try {
  const logFiles = [
    path.join(__dirname, '..', 'debug.log'),
    path.join(__dirname, '..', 'error.log'),
    path.join(__dirname, '..', 'npm-debug.log'),
    path.join(__dirname, '..', 'yarn-error.log')
  ];
  
  logFiles.forEach(logFile => {
    if (fs.existsSync(logFile)) {
      fs.unlinkSync(logFile);
      console.log(`✅ Cleared ${path.basename(logFile)}`);
    }
  });
} catch (error) {
  console.error('❌ Error clearing log files:', error.message);
}

console.log('');
console.log('🎉 Cache clearing complete!');
console.log('💡 You may also want to:');
console.log('   - Clear your device/simulator cache');
console.log('   - Restart the Metro bundler');
console.log('   - Clear browser cache if using web');
console.log('');
