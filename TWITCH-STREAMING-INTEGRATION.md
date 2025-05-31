# 🎮 Elite Locker Twitch Streaming Integration

A comprehensive real-time workout streaming system that allows Elite Locker users to share their live workout data with viewers through customizable web overlays.

## 🚀 Features

### Core Functionality
- **Real-time Workout Streaming**: Live workout data broadcasting via Socket.io
- **Web Overlay System**: Customizable overlays for streaming software (OBS, Streamlabs)
- **Mobile Integration**: Seamless streaming controls within the Elite Locker app
- **Multi-theme Support**: Default, Neon, Minimal, and Gaming themes
- **Privacy Controls**: Granular data sharing settings

### Technical Highlights
- **Monorepo Architecture**: Organized packages for API, overlay, and shared types
- **TypeScript Throughout**: Full type safety across all components
- **Real-time Communication**: Socket.io with automatic reconnection
- **Performance Optimized**: GPU-accelerated animations and efficient rendering
- **Responsive Design**: Works across different screen sizes and streaming setups

## 📁 Project Structure

```
elite-locker/
├── packages/
│   ├── streaming-api/          # Backend streaming server
│   │   ├── src/
│   │   │   ├── services/       # Socket.io and business logic
│   │   │   ├── routes/         # API endpoints
│   │   │   ├── utils/          # Validation, logging, rate limiting
│   │   │   └── middleware/     # Authentication and error handling
│   │   └── package.json
│   ├── overlay/                # Web overlay client
│   │   ├── src/
│   │   │   ├── components/     # React overlay components
│   │   │   ├── services/       # Overlay manager and socket client
│   │   │   └── styles/         # Theme-based CSS
│   │   └── package.json
│   └── shared-types/           # Shared TypeScript interfaces
│       ├── src/
│       │   └── index.ts        # All shared type definitions
│       └── package.json
├── services/
│   └── StreamingService.ts     # Mobile app streaming service
├── app/streaming/              # Mobile streaming screens
│   ├── settings.tsx            # Main streaming settings
│   ├── privacy.tsx             # Privacy controls
│   └── themes.tsx              # Theme customization
└── package.json                # Root package with workspace scripts
```

## 🛠 Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB (for streaming API)
- React Native development environment

### 1. Install Dependencies
```bash
# Install all workspace dependencies
npm run workspace:install

# Or install individually
npm install
cd packages/streaming-api && npm install
cd ../overlay && npm install
cd ../shared-types && npm install
```

### 2. Environment Configuration

#### Streaming API (.env)
```bash
# packages/streaming-api/.env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/elite-locker-streaming
JWT_SECRET=your-super-secret-jwt-key-here
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006
```

#### Overlay Client (.env)
```bash
# packages/overlay/.env
VITE_SOCKET_URL=http://localhost:3001
VITE_API_URL=http://localhost:3001/api
```

### 3. Start Development Servers
```bash
# Start all streaming services
npm run streaming:dev

# Or start individually
npm run streaming:api    # Backend API on port 3001
npm run streaming:overlay # Overlay client on port 3000
```

### 4. Mobile App Integration
The streaming service is already integrated into the Elite Locker mobile app:
- Navigate to Settings → Streaming
- Enable streaming to generate overlay URL
- Configure privacy and theme settings

## 🎯 Usage Guide

### For Streamers

1. **Enable Streaming**
   - Open Elite Locker mobile app
   - Go to Settings → Streaming
   - Toggle "Enable Live Streaming"
   - Copy your unique overlay URL

2. **Add to Streaming Software**
   - Open OBS, Streamlabs, or your preferred streaming software
   - Add a new "Browser Source"
   - Paste your overlay URL
   - Set dimensions (recommended: 400x300)
   - Enable "Shutdown source when not visible" for performance

3. **Start Workout**
   - Begin any workout in the Elite Locker app
   - Your live data will automatically appear on the overlay
   - Viewers can see real-time exercise progress, stats, and achievements

### For Viewers

1. **Web Overlay Access**
   - Visit the overlay URL shared by the streamer
   - View live workout data in real-time
   - See exercise progress, personal records, and session stats

2. **Mobile Viewing** (Future Feature)
   - Follow along with workouts through the mobile app
   - Get notifications for achievements and milestones

## 🎨 Themes & Customization

### Available Themes

#### Default Theme
- Clean dark design with green accents
- Perfect for fitness-focused streams
- Glassmorphism effects with subtle animations

#### Neon Theme
- Cyberpunk-inspired with pink/purple colors
- Glowing effects and neon borders
- High-energy aesthetic for gaming streams

#### Minimal Theme
- Clean white background with subtle colors
- Professional look for educational content
- Reduced visual noise for focus on data

#### Gaming Theme
- RGB-style colors with animated borders
- Green/orange/gold color scheme
- Perfect for gaming fitness streams

### Custom Colors
Users can customize:
- Primary color (main accents)
- Secondary color (backgrounds)
- Accent color (highlights)
- Background opacity
- Text colors

## 🔒 Privacy & Security

### Data Sharing Controls
- **Current Exercise**: Show/hide current exercise name and details
- **Personal Stats**: Control sharing of weight, reps, and personal records
- **Goals**: Share or hide workout goals and targets
- **Progress Photos**: Control image sharing (future feature)
- **Workout Notes**: Share or hide personal workout notes

### Security Features
- **JWT Authentication**: Secure API access
- **Rate Limiting**: Prevents abuse and spam
- **Input Validation**: All data validated before processing
- **CORS Protection**: Controlled cross-origin access
- **Unique Overlay URLs**: Cryptographically secure identifiers

## 📊 API Reference

### Streaming Endpoints

#### Enable Streaming
```http
POST /api/streaming/enable
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user123"
}
```

#### Update Settings
```http
PUT /api/streaming/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user123",
  "theme": "neon",
  "dataSharing": {
    "shareCurrentExercise": true,
    "sharePersonalStats": false
  }
}
```

### Socket.io Events

#### Client to Server
- `joinStream`: Join a stream room
- `leaveStream`: Leave a stream room
- `publishWorkoutUpdate`: Send workout data (streamer only)
- `publishSessionStats`: Send session statistics (streamer only)

#### Server to Client
- `workoutUpdate`: Receive live workout data
- `sessionStats`: Receive session statistics
- `userConnected`: User joined stream
- `userDisconnected`: User left stream
- `error`: Error messages

## 🚀 Deployment

### Production Build
```bash
# Build all packages
npm run build

# Build individually
cd packages/streaming-api && npm run build
cd packages/overlay && npm run build
cd packages/shared-types && npm run build
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build individual containers
docker build -t elite-locker-streaming-api packages/streaming-api
docker build -t elite-locker-overlay packages/overlay
```

### Environment Variables (Production)
```bash
# Streaming API
NODE_ENV=production
MONGODB_URI=mongodb://your-mongo-cluster/elite-locker-streaming
JWT_SECRET=your-production-secret
ALLOWED_ORIGINS=https://overlay.elitelocker.app,https://app.elitelocker.com

# Overlay Client
VITE_SOCKET_URL=https://api.elitelocker.app
VITE_API_URL=https://api.elitelocker.app/api
```

## 🔧 Development

### Adding New Themes
1. Add theme to `OverlayTheme` type in shared-types
2. Create CSS variables in overlay `index.css`
3. Add theme selection in mobile settings
4. Update theme validation in API

### Custom Overlay Components
1. Create component in `packages/overlay/src/components/`
2. Add to `WorkoutOverlay.tsx`
3. Define props interface in shared-types
4. Add theme-specific styling

### Testing
```bash
# Run tests
npm test

# Test streaming connection
npm run test:streaming

# Test overlay rendering
npm run test:overlay
```

## 📈 Performance Optimization

### Backend
- MongoDB indexing for fast queries
- Redis caching for session data
- Connection pooling for Socket.io
- Rate limiting to prevent abuse

### Frontend
- GPU-accelerated animations
- Efficient DOM updates with React
- WebGL for complex visualizations
- Service workers for offline support

### Mobile
- Background processing for workout data
- Efficient battery usage
- Network state handling
- Local data caching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Development Guidelines
- Follow TypeScript strict mode
- Use ESLint and Prettier for code formatting
- Write comprehensive tests
- Document new features
- Follow semantic versioning

## 📄 License

This project is part of the Elite Locker fitness app and follows the same licensing terms.

## 🆘 Support

For issues and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting guide
- Contact the development team

---

**Elite Locker Streaming Integration** - Bringing fitness streaming to the next level! 🏋️‍♂️📺
