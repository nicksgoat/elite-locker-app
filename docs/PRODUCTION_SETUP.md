# 🚀 Production Stream Chat Setup Guide

## Current Status: Demo vs Production

### ❌ **CURRENT DEMO MODE**
- **API Key**: Using demo key `'mmhfdzb5evj2'`
- **Tokens**: Fake development tokens (not secure)
- **Users**: Auto-connects as `'demo-user-1'`
- **Data**: Demo channels and placeholder profiles
- **Security**: ⚠️ Not production-ready

### ✅ **PRODUCTION MODE** (Follow this guide)
- **API Key**: Your real Stream API key
- **Tokens**: Secure JWT tokens from your backend
- **Users**: Real user authentication integration
- **Data**: Real user profiles and channels
- **Security**: 🔒 Enterprise-grade security

---

## 🔧 Step 1: Get Stream Chat Account

### 1.1 Sign Up for Stream
1. Go to [https://getstream.io/](https://getstream.io/)
2. Click **"Start Free Trial"**
3. Create your account
4. Verify your email

### 1.2 Create Stream App
1. Go to [Stream Dashboard](https://getstream.io/dashboard/)
2. Click **"Create App"**
3. Choose **"Chat"** as the product
4. Name your app: `"Elite Locker Production"`
5. Select your region (closest to your users)

### 1.3 Get API Credentials
```bash
# From your Stream Dashboard, copy:
STREAM_API_KEY=your_actual_api_key_here
STREAM_SECRET=your_actual_secret_here
```

---

## 🔐 Step 2: Setup Backend Token Server

### 2.1 Deploy Token Server
Choose one deployment option:

#### Option A: Vercel (Recommended)
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Create vercel.json
{
  "functions": {
    "backend-examples/stream-token-server.js": {
      "runtime": "nodejs18.x"
    }
  },
  "env": {
    "STREAM_SECRET": "@stream-secret",
    "JWT_SECRET": "@jwt-secret"
  }
}

# 3. Deploy
vercel --prod

# 4. Set environment variables
vercel env add STREAM_SECRET
vercel env add JWT_SECRET
```

#### Option B: Netlify Functions
```bash
# 1. Create netlify/functions/stream-token.js
# 2. Deploy to Netlify
# 3. Set environment variables in Netlify dashboard
```

#### Option C: AWS Lambda
```bash
# 1. Package function for Lambda
# 2. Deploy via AWS CLI or Console
# 3. Set environment variables
```

### 2.2 Test Token Server
```bash
# Test health endpoint
curl https://your-backend.vercel.app/health

# Test token generation (with valid auth)
curl -X POST https://your-backend.vercel.app/auth/stream-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_APP_JWT_TOKEN" \
  -d '{"userId": "user123"}'
```

---

## 📱 Step 3: Update Mobile App Configuration

### 3.1 Update Environment Variables
```bash
# .env
STREAM_API_KEY=your_actual_api_key_here
STREAM_SECRET=your_actual_secret_here
API_BASE_URL=https://your-backend.vercel.app
NODE_ENV=production
```

### 3.2 Switch to Production Config
```typescript
// lib/streamConfig.ts - Update imports
import { 
  initializeProductionStreamChat,
  shareWorkoutToProductionFeed,
  createProductionDirectMessage 
} from './streamConfigProduction';

// Update STREAM_CONFIG
export const STREAM_CONFIG = {
  apiKey: process.env.STREAM_API_KEY, // Remove fallback demo key
  // ... rest of production config
};
```

### 3.3 Integrate with Your Auth System

#### Option A: Supabase Auth Integration
```typescript
// contexts/StreamChatContext.tsx
import { supabase } from '../lib/supabase';

const connectUserWithAuth = async () => {
  // Get current user from Supabase
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    await initializeProductionStreamChat(user.id, {
      name: user.user_metadata.full_name || user.email,
      email: user.email,
      image: user.user_metadata.avatar_url,
      role: user.user_metadata.role || 'user',
    });
  }
};
```

#### Option B: Custom Auth Integration
```typescript
// contexts/StreamChatContext.tsx
import { getAuthenticatedUser } from '../services/auth';

const connectUserWithAuth = async () => {
  const user = await getAuthenticatedUser();
  
  if (user) {
    await initializeProductionStreamChat(user.id, {
      name: user.name,
      email: user.email,
      image: user.profileImage,
      role: user.role,
      metadata: {
        fitnessLevel: user.fitnessLevel,
        goals: user.goals,
      },
    });
  }
};
```

### 3.4 Remove Demo Auto-Connect
```typescript
// contexts/StreamChatContext.tsx
// Remove or comment out the auto-connect useEffect
/*
useEffect(() => {
  const autoConnect = async () => {
    if (!isConnected && !isLoading) {
      try {
        // Auto-connect with demo user
        await connectUser('demo-user-1');
      } catch (error) {
        logger.error('Auto-connect failed', { error: error.message });
      }
    }
  };

  autoConnect();
}, [isConnected, isLoading, connectUser]);
*/
```

---

## 🔒 Step 4: Security Configuration

### 4.1 JWT Token Security
```javascript
// backend-examples/stream-token-server.js
const streamToken = jwt.sign(
  {
    user_id: userId,
    iss: 'elite-locker',
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days (shorter for security)
  },
  STREAM_SECRET,
  { algorithm: 'HS256' }
);
```

### 4.2 Rate Limiting
```javascript
// Add to your backend
const rateLimit = require('express-rate-limit');

const tokenRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many token requests, please try again later.',
});
```

### 4.3 User Validation
```typescript
// Validate users before connecting
const validateUser = async (userId: string) => {
  // Check if user exists in your database
  const user = await getUserFromDatabase(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Check if user is active/not banned
  if (user.status !== 'active') {
    throw new Error('User account is not active');
  }
  
  return user;
};
```

---

## 📊 Step 5: Production Channels Setup

### 5.1 Create Production Channels
```typescript
// lib/streamConfigProduction.ts
const PRODUCTION_CHANNELS = [
  {
    type: 'social',
    id: 'global-fitness-feed',
    name: 'Global Fitness Community',
    description: 'Share workouts with the global community',
    public: true,
  },
  {
    type: 'community',
    id: 'beginners-corner',
    name: 'Beginners Corner',
    description: 'Support for fitness beginners',
    public: true,
  },
  {
    type: 'community',
    id: 'advanced-training',
    name: 'Advanced Training',
    description: 'Advanced workout discussions',
    public: true,
  },
  // Add more channels as needed
];
```

### 5.2 Channel Permissions
```typescript
// Set up proper channel permissions
const createSecureChannel = async (channelConfig) => {
  const channel = client.channel(channelConfig.type, channelConfig.id, {
    name: channelConfig.name,
    description: channelConfig.description,
    // Permissions
    permissions: [
      {
        action: 'SendMessage',
        roles: ['user', 'moderator', 'admin'],
      },
      {
        action: 'DeleteMessage',
        roles: ['moderator', 'admin'],
      },
    ],
  });
  
  await channel.watch();
  return channel;
};
```

---

## 🚀 Step 6: Deploy to Production

### 6.1 Build Production App
```bash
# Build for production
npm run build

# Test production build locally
npm run preview
```

### 6.2 Deploy Mobile App
```bash
# iOS
eas build --platform ios --profile production
eas submit --platform ios

# Android
eas build --platform android --profile production
eas submit --platform android
```

### 6.3 Monitor Production
```typescript
// Add production monitoring
import { Sentry } from '@sentry/react-native';

// Monitor Stream Chat errors
client.on('connection.error', (error) => {
  Sentry.captureException(error);
  logger.error('Stream connection error', { error });
});
```

---

## ✅ Step 7: Verification Checklist

### 7.1 Pre-Launch Checklist
- [ ] Real Stream API key configured
- [ ] Backend token server deployed and tested
- [ ] Demo auto-connect removed
- [ ] Real user authentication integrated
- [ ] Production channels created
- [ ] Security measures implemented
- [ ] Rate limiting configured
- [ ] Error monitoring setup
- [ ] Performance testing completed

### 7.2 Test Production Setup
```bash
# Test real user flow
1. User signs up/logs in to your app
2. User gets connected to Stream Chat
3. User can send messages
4. User can share workouts
5. Real-time updates work
6. Token refresh works
7. Error handling works
```

---

## 📈 Step 8: Scaling Considerations

### 8.1 Performance Optimization
- Implement message pagination
- Use connection pooling
- Cache frequently accessed data
- Optimize image uploads

### 8.2 Monitoring & Analytics
- Track message volume
- Monitor connection health
- Analyze user engagement
- Set up alerts for issues

---

## 🆘 Troubleshooting

### Common Issues
1. **Token Generation Fails**: Check backend environment variables
2. **Connection Errors**: Verify API key and network
3. **Permission Denied**: Check user roles and channel permissions
4. **Messages Not Syncing**: Verify real-time listeners

### Support Resources
- [Stream Documentation](https://getstream.io/chat/docs/)
- [Stream Community](https://github.com/GetStream/stream-chat-react-native)
- [Elite Locker Support](mailto:support@elitelocker.com)

---

**🎉 Once completed, your Elite Locker app will have production-ready Stream Chat with real users, secure tokens, and enterprise-grade messaging!**
