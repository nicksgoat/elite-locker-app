#!/bin/bash

# Elite Locker - Database Setup Script
# This script sets up the categories table and populates it with default data

echo "🚀 Elite Locker - Setting up dynamic categories..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install required dependencies if not already installed
echo "📦 Installing required dependencies..."
npm install @supabase/supabase-js

# Run the categories setup script
echo "🏗️  Setting up categories table..."
node scripts/setup-categories.js

echo ""
echo "✅ Setup completed!"
echo ""
echo "🎯 Next steps:"
echo "  1. Open the Elite Locker app"
echo "  2. Navigate to the Marketplace tab"
echo "  3. Categories will now be loaded from the database"
echo "  4. You can add new categories directly in Supabase"
echo ""
echo "📚 To add content to categories:"
echo "  1. Update workouts/programs/exercises in Supabase"
echo "  2. Set the category_id field to link content to categories"
echo "  3. Content will automatically appear in the marketplace"
