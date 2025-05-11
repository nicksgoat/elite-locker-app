/**
 * Script to find and patch UUID usage in the codebase
 * This helps fix issues with crypto.getRandomValues() in React Native
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Scanning for files using uuid library...');

// Directories to scan
const dirsToScan = [
  path.join(__dirname, '..', 'app'),
  path.join(__dirname, '..', 'components'),
  path.join(__dirname, '..', 'contexts'),
  path.join(__dirname, '..', 'utils'),
  path.join(__dirname, '..', 'hooks'),
];

// Scan for files using uuid
function findFilesUsingUUID(dir) {
  if (!fs.existsSync(dir)) return [];
  
  const results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      results.push(...findFilesUsingUUID(filePath));
    } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (
        content.includes("from 'uuid'") || 
        content.includes('from "uuid"') ||
        content.includes("import { v4 as uuidv4 }") ||
        content.includes("import { v4 ") ||
        content.includes("import {v4") ||
        content.includes("uuid.")
      ) {
        results.push(filePath);
      }
    }
  }
  
  return results;
}

// Patch a file to use our custom UUID implementation
function patchFile(filePath) {
  console.log(`🔧 Patching ${path.relative(path.join(__dirname, '..'), filePath)}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Replace imports
  if (
    content.includes("from 'uuid'") || 
    content.includes('from "uuid"') ||
    content.includes("import { v4 as uuidv4 }") ||
    content.includes("import { v4 ") ||
    content.includes("import {v4")
  ) {
    // Replace various import patterns
    content = content
      .replace(/import\s+{\s*v4(\s+as\s+uuidv4)?\s*}\s+from\s+['"]uuid['"];?/g, 
               "import { generateUUID as uuidv4 } from '@/utils/uuidUtils';")
      .replace(/import\s+{\s*v4\s*}\s+from\s+['"]uuid['"];?/g, 
               "import { generateUUID as v4 } from '@/utils/uuidUtils';")
      .replace(/import\s+\*\s+as\s+uuid\s+from\s+['"]uuid['"];?/g, 
               "import * as uuidUtils from '@/utils/uuidUtils';")
      .replace(/import\s+uuid\s+from\s+['"]uuid['"];?/g, 
               "import * as uuidUtils from '@/utils/uuidUtils';");
    
    modified = true;
  }
  
  // Replace usage
  if (content.includes("uuid.v4()")) {
    content = content.replace(/uuid\.v4\(\)/g, "uuidUtils.generateUUID()");
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Patched ${path.relative(path.join(__dirname, '..'), filePath)}`);
  } else {
    console.log(`⚠️ Could not automatically patch ${path.relative(path.join(__dirname, '..'), filePath)}. Manual inspection needed.`);
  }
}

// Find files
let filesUsingUUID = [];
for (const dir of dirsToScan) {
  if (fs.existsSync(dir)) {
    filesUsingUUID.push(...findFilesUsingUUID(dir));
  }
}

if (filesUsingUUID.length === 0) {
  console.log('✅ No files found using uuid library.');
} else {
  console.log(`🔍 Found ${filesUsingUUID.length} files using uuid library:`);
  filesUsingUUID.forEach(file => {
    console.log(`  - ${path.relative(path.join(__dirname, '..'), file)}`);
  });
  
  // Ask for confirmation
  console.log('\n⚠️ This script will attempt to automatically patch these files to use our custom UUID implementation.');
  console.log('⚠️ It\'s recommended to have a backup or use version control before proceeding.');
  
  // Auto-patch all files (in a real scenario, we would ask for confirmation here)
  console.log('\n🔧 Automatically patching all files...');
  filesUsingUUID.forEach(file => {
    patchFile(file);
  });
  
  console.log('\n✅ Done! Make sure to test the app to ensure everything works correctly.');
  console.log('ℹ️ If there are any issues, you can run the app with:');
  console.log('   npx expo start --clear');
} 