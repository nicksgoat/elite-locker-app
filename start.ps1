# Elite Locker App Startup Script
# This script helps start the app with the correct dependencies and error handling

Write-Host "🚀 Starting Elite Locker App..." -ForegroundColor Cyan

# Run the dependency fix script
Write-Host "🔧 Running dependency fix script..." -ForegroundColor Yellow
node ./scripts/fix-dependencies.js

# Run the UUID fix script
Write-Host "🔄 Fixing UUID compatibility issues..." -ForegroundColor Yellow
node ./scripts/fix-uuid.js

# Verify node_modules exists
if (-not (Test-Path -Path ./node_modules)) {
    Write-Host "📦 Node modules still not found. Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Set environment variables to help with error handling
$env:EXPO_DEBUG = "true"
$env:NODE_OPTIONS = "--unhandled-rejections=strict"

# Clear metro bundler cache if specified
if ($args -contains "--clear-cache") {
    Write-Host "🧹 Clearing Metro bundler cache..." -ForegroundColor Yellow
    npx expo start -c
} else {
    # Start the Expo app normally
    Write-Host "🏋️ Elite Locker is starting..." -ForegroundColor Green
    Write-Host "💡 If you encounter errors, try running with --clear-cache" -ForegroundColor Gray
    npx expo start 
} 