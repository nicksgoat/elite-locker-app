/**
 * Elite Locker Dependency Fix Script
 * This script helps fix common dependency issues in the app
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Running Elite Locker dependency fix script...');

// Check if node_modules exists, if not run npm install
if (!fs.existsSync(path.join(__dirname, '..', 'node_modules'))) {
  console.log('📦 Node modules not found, installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  } catch (error) {
    console.error('❌ Error installing dependencies:', error.message);
    process.exit(1);
  }
}

// Check for date-fns which has been causing issues
try {
  console.log('🔍 Checking date-fns dependency...');
  
  // Check if date-fns is installed
  if (!fs.existsSync(path.join(__dirname, '..', 'node_modules', 'date-fns'))) {
    console.log('🔄 date-fns not found, installing...');
    try {
      execSync('npm install date-fns', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    } catch (error) {
      console.log('⚠️ Could not install date-fns, but that\'s okay, we have a custom implementation.');
    }
  } else {
    console.log('✅ date-fns is installed.');
  }
  
  // Scan for files importing date-fns
  console.log('🔍 Scanning for files importing date-fns...');
  
  // List of directories to scan
  const dirsToScan = [
    path.join(__dirname, '..', 'app'),
    path.join(__dirname, '..', 'components'),
    path.join(__dirname, '..', 'screens'),
  ];
  
  // Function to scan directories recursively
  function scanDirectory(dir) {
    if (!fs.existsSync(dir)) return [];
    
    const results = [];
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        results.push(...scanDirectory(filePath));
      } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('from \'date-fns\'') || content.includes('from "date-fns"')) {
          results.push(filePath);
        }
      }
    }
    
    return results;
  }
  
  // Scan directories
  let filesUsingDateFns = [];
  for (const dir of dirsToScan) {
    if (fs.existsSync(dir)) {
      filesUsingDateFns.push(...scanDirectory(dir));
    }
  }
  
  if (filesUsingDateFns.length > 0) {
    console.log(`⚠️ Found ${filesUsingDateFns.length} files importing date-fns. Consider using our custom date utilities instead.`);
    console.log('Files:');
    filesUsingDateFns.forEach(file => {
      console.log(`  - ${path.relative(path.join(__dirname, '..'), file)}`);
    });
  } else {
    console.log('✅ No files found importing date-fns directly.');
  }
  
} catch (error) {
  console.error('❌ Error checking date-fns dependency:', error.message);
}

// Clean up any potential metro bundler cache issues
try {
  console.log('🧹 Cleaning up metro bundler cache...');
  if (fs.existsSync(path.join(__dirname, '..', 'node_modules', '.cache'))) {
    fs.rmSync(path.join(__dirname, '..', 'node_modules', '.cache'), { recursive: true, force: true });
  }
  if (fs.existsSync(path.join(__dirname, '..', '.expo'))) {
    fs.rmSync(path.join(__dirname, '..', '.expo'), { recursive: true, force: true });
  }
  console.log('✅ Metro bundler cache cleaned up.');
} catch (error) {
  console.error('❌ Error cleaning up metro bundler cache:', error.message);
}

// Make sure our custom dateUtils.js exists
try {
  console.log('🔍 Checking for custom date utilities...');
  const dateUtilsPath = path.join(__dirname, '..', 'utils', 'dateUtils.js');
  
  if (!fs.existsSync(dateUtilsPath)) {
    console.log('⚠️ Custom date utilities not found, creating...');
    
    // Make sure utils directory exists
    if (!fs.existsSync(path.join(__dirname, '..', 'utils'))) {
      fs.mkdirSync(path.join(__dirname, '..', 'utils'), { recursive: true });
    }
    
    // Create basic implementation
    const dateUtilsContent = `/**
 * Date formatting utilities for Elite Locker
 * A lightweight alternative to date-fns
 */

/**
 * Format a date relative to now (e.g., "5 minutes ago")
 * @param {Date} date - The date to format
 * @param {boolean} addSuffix - Whether to add "ago" suffix
 * @returns {string} - Formatted relative time
 */
export function formatRelativeTime(date, addSuffix = true) {
  if (!date || !(date instanceof Date)) {
    return 'Invalid date';
  }

  try {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 0) {
      return 'in the future';
    }
    
    // Convert to appropriate time unit
    let value;
    let unit;
    
    if (diffInSeconds < 60) {
      value = diffInSeconds;
      unit = 'second';
    } else if (diffInSeconds < 3600) {
      value = Math.floor(diffInSeconds / 60);
      unit = 'minute';
    } else if (diffInSeconds < 86400) {
      value = Math.floor(diffInSeconds / 3600);
      unit = 'hour';
    } else if (diffInSeconds < 2592000) {
      value = Math.floor(diffInSeconds / 86400);
      unit = 'day';
    } else if (diffInSeconds < 31536000) {
      value = Math.floor(diffInSeconds / 2592000);
      unit = 'month';
    } else {
      value = Math.floor(diffInSeconds / 31536000);
      unit = 'year';
    }
    
    // Pluralize if needed
    if (value !== 1) {
      unit += 's';
    }
    
    // Add suffix if requested
    return addSuffix ? \`\${value} \${unit} ago\` : \`\${value} \${unit}\`;
  } catch (error) {
    return 'some time ago'; // Fallback
  }
}

/**
 * Format a date with a specific format
 * @param {Date} date - The date to format
 * @param {string} format - The format to use (simple formats only)
 * @returns {string} - Formatted date
 */
export function formatDate(date, format = 'medium') {
  if (!date || !(date instanceof Date)) {
    return 'Invalid date';
  }
  
  try {
    // Different preset formats
    switch (format) {
      case 'short':
        return date.toLocaleDateString();
      case 'medium':
        return date.toLocaleDateString(undefined, {
          year: 'numeric', 
          month: 'short', 
          day: 'numeric'
        });
      case 'long':
        return date.toLocaleDateString(undefined, {
          year: 'numeric', 
          month: 'long', 
          day: 'numeric', 
          weekday: 'long'
        });
      default:
        return date.toLocaleString();
    }
  } catch (error) {
    return 'Invalid date';
  }
}`;

    fs.writeFileSync(dateUtilsPath, dateUtilsContent, 'utf8');
    console.log('✅ Custom date utilities created successfully.');
  } else {
    console.log('✅ Custom date utilities found.');
  }
} catch (error) {
  console.error('❌ Error checking/creating custom date utilities:', error.message);
}

console.log('✅ Elite Locker dependency fix script completed.'); 