# Dynamic Categories System

The Elite Locker app now features a dynamic category system that automatically populates marketplace categories from the database. This allows for easy management and expansion of content categories without code changes.

## 🎯 Features

- **Database-Driven**: Categories are stored in Supabase and auto-populate in the UI
- **Hex Color Themes**: Each category has a customizable hex color for theming
- **Icon Support**: Categories support Ionicons for visual representation
- **Auto-Linking**: Workouts, programs, exercises, and clubs can be linked to categories
- **Fallback Support**: Graceful fallback to static categories if database is unavailable
- **Real-Time Updates**: New categories appear immediately in the marketplace

## 🏗️ Database Schema

### Categories Table

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color_hex TEXT NOT NULL DEFAULT '#0A84FF',
  icon TEXT NOT NULL DEFAULT 'star-outline',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Content Linking

Each content table now has a `category_id` field:

- `workouts.category_id` → `categories.id`
- `programs.category_id` → `categories.id`
- `exercises.category_id` → `categories.id`
- `clubs.category_id` → `categories.id`

## 🚀 Setup Instructions

### 1. Run the Setup Script

```bash
# Make the script executable
chmod +x scripts/run-setup.sh

# Run the setup
./scripts/run-setup.sh
```

Or manually:

```bash
# Install dependencies
npm install @supabase/supabase-js

# Run the setup script
node scripts/setup-categories.js
```

### 2. Verify Setup

1. Open Supabase dashboard
2. Navigate to the `categories` table
3. Verify that default categories are created
4. Check that content tables have `category_id` columns

## 📝 Managing Categories

### Creating New Categories

Add new categories directly in Supabase:

```sql
INSERT INTO categories (name, slug, description, color_hex, icon, sort_order) 
VALUES (
  'Calisthenics',
  'calisthenics',
  'Bodyweight training and movement',
  '#FF6B35',
  'body-outline',
  16
);
```

### Updating Categories

```sql
UPDATE categories 
SET color_hex = '#FF0000', description = 'Updated description'
WHERE slug = 'strength';
```

### Deactivating Categories

```sql
UPDATE categories 
SET is_active = false
WHERE slug = 'old-category';
```

## 🔗 Linking Content to Categories

### Link Workouts to Categories

```sql
-- Get category ID
SELECT id FROM categories WHERE slug = 'strength';

-- Update workout
UPDATE workouts 
SET category_id = 'category-uuid-here'
WHERE id = 'workout-uuid-here';
```

### Link Programs to Categories

```sql
UPDATE programs 
SET category_id = (SELECT id FROM categories WHERE slug = 'hypertrophy')
WHERE title LIKE '%Muscle Building%';
```

### Link Exercises to Categories

```sql
UPDATE exercises 
SET category_id = (SELECT id FROM categories WHERE slug = 'strength')
WHERE name IN ('Squat', 'Deadlift', 'Bench Press');
```

## 🎨 Color Themes

Categories support hex colors for theming. Popular fitness colors:

- **Strength**: `#FF2D55` (Red)
- **Cardio**: `#30D158` (Green)
- **HIIT**: `#FF9F0A` (Orange)
- **Mobility**: `#5856D6` (Purple)
- **Sports**: `#64D2FF` (Blue)
- **Yoga**: `#5AC8FA` (Light Blue)
- **Powerlifting**: `#FF3B30` (Dark Red)

## 🔧 API Usage

### CategoryService Methods

```typescript
// Get all active categories
const categories = await categoryService.getCategories();

// Get category by slug
const category = await categoryService.getCategoryBySlug('strength');

// Get content by category
const workouts = await categoryService.getWorkoutsByCategory(categoryId);
const programs = await categoryService.getProgramsByCategory(categoryId);
const exercises = await categoryService.getExercisesByCategory(categoryId);

// Create new category
const newCategory = await categoryService.createCategory({
  name: 'New Category',
  slug: 'new-category',
  description: 'Description here',
  color_hex: '#FF0000',
  icon: 'star-outline'
});
```

## 📱 UI Integration

### Marketplace Tab

The marketplace automatically:
- Loads categories from database
- Creates category tabs
- Generates category cards
- Filters content by category
- Uses category colors for theming

### Category Detail Pages

Category detail pages:
- Load category info from database
- Use category color for header
- Display category-specific content
- Support sorting and filtering

## 🔄 Migration from Static Categories

The system includes fallback support for existing static categories:

1. **Graceful Fallback**: If database categories fail to load, static categories are used
2. **Backward Compatibility**: Existing category slugs continue to work
3. **Smooth Transition**: No breaking changes to existing functionality

## 🐛 Troubleshooting

### Categories Not Loading

1. Check Supabase connection
2. Verify RLS policies are set correctly
3. Check console for error messages
4. Ensure categories table exists

### Content Not Appearing in Categories

1. Verify `category_id` is set on content
2. Check that category is active (`is_active = true`)
3. Ensure content meets marketplace criteria (isPaid, isPublic, etc.)

### Colors Not Applying

1. Verify `color_hex` format (e.g., `#FF0000`)
2. Check that category data is loading correctly
3. Ensure fallback colors are defined

## 🚀 Future Enhancements

- **Admin Panel**: UI for managing categories
- **Category Analytics**: Track category performance
- **Nested Categories**: Support for subcategories
- **Category Images**: Support for category banner images
- **User Preferences**: Allow users to favorite categories
