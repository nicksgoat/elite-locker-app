#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎮 Elite Locker Streaming Integration Setup');
console.log('==========================================\n');

// Check if we're in the right directory
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Error: package.json not found. Please run this script from the Elite Locker root directory.');
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
if (packageJson.name !== 'elite-locker') {
  console.error('❌ Error: This script must be run from the Elite Locker root directory.');
  process.exit(1);
}

console.log('✅ Found Elite Locker project\n');

// Function to run commands safely
function runCommand(command, description) {
  console.log(`🔄 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed\n`);
  } catch (error) {
    console.error(`❌ Error during ${description.toLowerCase()}: ${error.message}\n`);
    return false;
  }
  return true;
}

// Function to create directory if it doesn't exist
function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
}

// Function to create file if it doesn't exist
function createFileIfNotExists(filePath, content) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`📄 Created file: ${filePath}`);
  } else {
    console.log(`⏭️  File already exists: ${filePath}`);
  }
}

// Main setup process
async function setupStreaming() {
  console.log('📦 Installing dependencies...\n');

  // Install main dependencies
  if (!runCommand('npm install socket.io-client concurrently', 'Installing main dependencies')) {
    return false;
  }

  // Install shared-types dependencies
  console.log('🔧 Setting up shared-types package...');
  ensureDirectory('packages/shared-types');

  if (fs.existsSync('packages/shared-types/package.json')) {
    process.chdir('packages/shared-types');
    if (!runCommand('npm install', 'Installing shared-types dependencies')) {
      process.chdir('../..');
      return false;
    }
    if (!runCommand('npm run build', 'Building shared-types')) {
      process.chdir('../..');
      return false;
    }
    process.chdir('../..');
  }

  // Install streaming-api dependencies
  console.log('🔧 Setting up streaming-api package...');
  ensureDirectory('packages/streaming-api');

  if (fs.existsSync('packages/streaming-api/package.json')) {
    process.chdir('packages/streaming-api');
    if (!runCommand('npm install', 'Installing streaming-api dependencies')) {
      process.chdir('../..');
      return false;
    }
    process.chdir('../..');
  }

  // Install overlay dependencies
  console.log('🔧 Setting up overlay package...');
  ensureDirectory('packages/overlay');

  if (fs.existsSync('packages/overlay/package.json')) {
    process.chdir('packages/overlay');
    if (!runCommand('npm install', 'Installing overlay dependencies')) {
      process.chdir('../..');
      return false;
    }
    process.chdir('../..');
  }

  // Create environment files
  console.log('🔧 Creating environment files...\n');

  // Streaming API .env
  const apiEnvPath = 'packages/streaming-api/.env';
  const apiEnvContent = `# Elite Locker Streaming API Configuration
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/elite-locker-streaming
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006,exp://192.168.1.100:19000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_CONCURRENT_STREAMS=1000
STREAM_TIMEOUT_MS=300000
LOG_LEVEL=info
ENABLE_METRICS=true
`;
  createFileIfNotExists(apiEnvPath, apiEnvContent);

  // Overlay .env
  const overlayEnvPath = 'packages/overlay/.env';
  const overlayEnvContent = `# Elite Locker Overlay Configuration
VITE_SOCKET_URL=http://localhost:3001
VITE_API_URL=http://localhost:3001/api
`;
  createFileIfNotExists(overlayEnvPath, overlayEnvContent);

  // Create logs directory
  ensureDirectory('packages/streaming-api/logs');

  console.log('✅ Streaming integration setup completed!\n');

  console.log('🚀 Next Steps:');
  console.log('1. Set up Twitch Developer App at https://dev.twitch.tv/console');
  console.log('2. Add your Twitch Client ID and Secret to packages/streaming-api/.env');
  console.log('3. Start MongoDB: mongod');
  console.log('4. Start streaming services: npm run streaming:dev');
  console.log('5. Open Elite Locker app and go to Settings → Live Streaming');
  console.log('6. Connect to Twitch for full integration features');
  console.log('7. Enable streaming to get your overlay URL');
  console.log('8. Add the overlay URL to your streaming software (OBS, Streamlabs)');
  console.log('\n📖 For detailed instructions, see:');
  console.log('   - TWITCH-STREAMING-INTEGRATION.md (Basic streaming)');
  console.log('   - TWITCH-INTEGRATION-GUIDE.md (Full Twitch features)');

  return true;
}

// Run setup
setupStreaming().then(success => {
  if (success) {
    console.log('\n🎉 Setup completed successfully!');
    process.exit(0);
  } else {
    console.log('\n❌ Setup failed. Please check the errors above and try again.');
    process.exit(1);
  }
}).catch(error => {
  console.error('\n❌ Unexpected error during setup:', error.message);
  process.exit(1);
});
