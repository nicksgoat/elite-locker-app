# Quick Reference: Spotify Bleeding Effect

## 🚀 Quick Setup

### 1. Required Imports
```typescript
import { LinearGradient } from 'expo-linear-gradient';
import { ImageBackground } from 'react-native';
```

### 2. Component Structure
```typescript
<View style={styles.container}>
  {/* 1. Extended Background (Bleeding Effect) */}
  <View style={styles.extendedBackground}>
    <ImageBackground source={categoryImage} style={styles.extendedBackgroundImage} />
    <LinearGradient colors={extendedGradientColors} style={styles.extendedGradient} />
  </View>

  {/* 2. Header with Image */}
  <View style={styles.headerContainer}>
    <ImageBackground source={categoryImage} style={styles.headerBackground}>
      <LinearGradient colors={headerGradientColors} style={styles.headerGradient}>
        {/* Header content */}
      </LinearGradient>
    </ImageBackground>
  </View>

  {/* 3. Content (Transparent Background) */}
  <ScrollView style={styles.content}>
    {/* Main content */}
  </ScrollView>
</View>
```

## 🎨 Essential Styles

### Core Layout
```typescript
container: { flex: 1, backgroundColor: '#000000' },
extendedBackground: { position: 'absolute', top: 0, left: 0, right: 0, height: 800 },
headerContainer: { position: 'relative', zIndex: 2 },
content: { flex: 1, backgroundColor: 'transparent', zIndex: 2 },
```

### Background Image
```typescript
extendedBackgroundImage: {
  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.7
},
headerBackground: { height: 200, width: '100%' },
headerBackgroundImage: { resizeMode: 'cover' },
```

### Gradients
```typescript
extendedGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
headerGradient: { flex: 1, justifyContent: 'flex-end' },
```

## 🌈 Gradient Configurations

### Extended Background Gradient
```typescript
colors: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.9)', 'rgba(0,0,0,1)']
locations: [0, 0.2, 0.4, 0.7, 1]
```

### Header Gradient
```typescript
colors: ['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.9)']
```

## 📁 File Structure

### Images Location
```
assets/images/marketplace/
├── workouts.jpg
├── programs.jpg
├── clubs.jpg
├── profiles.jpg
├── in-person.jpg
├── online.jpg
└── elitefit.jpg
```

### Implementation Files
```
app/marketplace/
├── workouts.tsx    ✅ Implemented
├── programs.tsx    ✅ Implemented
├── clubs.tsx       ✅ Implemented
├── profiles.tsx    ✅ Implemented
├── sessions.tsx    ✅ Implemented
└── elitefit.tsx    ✅ Implemented
```

## ⚡ Copy-Paste Template

### Loading State
```typescript
if (isLoading) {
  return (
    <View style={styles.container}>
      <View style={styles.extendedBackground}>
        <ImageBackground source={categoryImage} style={styles.extendedBackgroundImage} />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.9)', 'rgba(0,0,0,1)']}
          locations={[0, 0.2, 0.4, 0.7, 1]}
          style={styles.extendedGradient}
        />
      </View>
      <View style={styles.headerContainer}>
        <ImageBackground source={categoryImage} style={styles.headerBackground}>
          <LinearGradient colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.9)']} style={styles.headerGradient}>
            {/* Header content */}
          </LinearGradient>
        </ImageBackground>
      </View>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0A84FF" />
      </View>
    </View>
  );
}
```

### Main Content
```typescript
return (
  <View style={styles.container}>
    <View style={styles.extendedBackground}>
      <ImageBackground source={categoryImage} style={styles.extendedBackgroundImage} />
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.9)', 'rgba(0,0,0,1)']}
        locations={[0, 0.2, 0.4, 0.7, 1]}
        style={styles.extendedGradient}
      />
    </View>
    <View style={styles.headerContainer}>
      <ImageBackground source={categoryImage} style={styles.headerBackground}>
        <LinearGradient colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.9)']} style={styles.headerGradient}>
          {/* Header content */}
        </LinearGradient>
      </ImageBackground>
    </View>
    <ScrollView style={styles.content}>
      {/* Main content */}
    </ScrollView>
  </View>
);
```

## 🔧 Troubleshooting

### Common Issues
| Issue | Solution |
|-------|----------|
| Import errors | Add `LinearGradient` and `ImageBackground` imports |
| No bleeding effect | Ensure content background is `transparent` |
| Poor performance | Optimize image sizes, reduce gradient complexity |
| Text not readable | Adjust gradient opacity and colors |

### Quick Fixes
```typescript
// Fix: Missing imports
import { LinearGradient } from 'expo-linear-gradient';
import { ImageBackground } from 'react-native';

// Fix: Content background
content: { backgroundColor: 'transparent' } // NOT black!

// Fix: Z-index layering
headerContainer: { zIndex: 2 }
content: { zIndex: 2 }
```

## 📋 Implementation Checklist

- [ ] Install `expo-linear-gradient`
- [ ] Add required imports
- [ ] Add category image to assets
- [ ] Implement extended background layer
- [ ] Add header with image background
- [ ] Configure gradient overlays
- [ ] Set content background to transparent
- [ ] Test loading and main states
- [ ] Verify text readability
- [ ] Test on multiple devices

## 🎯 Key Success Factors

1. **Image Quality** - Use high-res, relevant images
2. **Gradient Smoothness** - Multiple color stops for natural transitions
3. **Transparency** - Content background MUST be transparent
4. **Z-Index Management** - Proper layering for visual hierarchy
5. **Performance** - Optimize images and gradients for mobile

---

*Quick reference for implementing the Spotify-style bleeding effect across marketplace category screens.*
