# 🏀 SportNS - Community Sports Platform

A mobile-first community sports platform that connects local players through real-time availability tracking and competitive ELO-based rankings across 9 different sports.

## Project Status: Day 1/14 Complete ✅

### Features

- 🎮 Discord Authentication with OAuth
- 🏃 Real-time player availability tracking
- 🏆 ELO-based competitive rankings
- ⚡ Live challenge system
- 📊 Leaderboards across 9 sports
- 🔔 Push notifications for game challenges and disputes

### Sports Supported

Basketball, Pickleball, Volleyball, Football, Ping Pong, Badminton, Tennis, Golf, Running

## Tech Stack

- **Frontend**: React Native + Expo (iOS/Android)
- **Backend**: Supabase (PostgreSQL, Auth, Realtime subscriptions, Edge Functions)
- **Deployment**: Expo EAS Build
- **Package Manager**: pnpm workspaces (monorepo)

## Project Structure

```
SportNS/
├── apps/
│   └── mobile/              # React Native Expo app
│       ├── src/
│       │   ├── screens/     # App screens
│       │   ├── components/  # Reusable UI components
│       │   ├── services/    # API and service layer
│       │   ├── hooks/       # Custom React hooks
│       │   ├── types/       # TypeScript type definitions
│       │   └── utils/       # Utility functions
│       ├── assets/          # Images and static assets
│       └── app.json         # Expo configuration
├── packages/                # Shared packages (future)
├── pnpm-workspace.yaml      # pnpm workspace config
└── package.json             # Root package.json
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Expo CLI
- iOS Simulator (macOS) or Android Emulator

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
cp apps/mobile/.env.example apps/mobile/.env
# Edit .env with your Supabase credentials (Day 1 task pending)
```

3. Start the development server:
```bash
# Run from root
pnpm mobile

# Or navigate to mobile app
cd apps/mobile
pnpm start
```

4. Run on device/simulator:
```bash
# iOS
pnpm mobile:ios

# Android
pnpm mobile:android
```

## Development

### Available Scripts

From the root directory:

- `pnpm mobile` - Start Expo dev server
- `pnpm mobile:ios` - Run on iOS simulator
- `pnpm mobile:android` - Run on Android emulator
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm lint` - Run ESLint

### Monorepo Commands

```bash
# Install packages
pnpm install

# Add dependency to mobile app
pnpm --filter mobile add <package-name>

# Run command in specific workspace
pnpm --filter mobile <command>
```

## Implementation Progress

### ✅ Day 1: Foundation (Complete)
- [x] Initialize monorepo with pnpm workspaces
- [x] Set up Expo React Native project
- [x] Configure TypeScript
- [x] Create project structure
- [x] Install core dependencies
- [ ] Create Supabase project (pending)
- [ ] Design database schema (pending)

### 📋 Upcoming

**Day 2**: Discord OAuth authentication flow  
**Day 3**: React Navigation setup with bottom tabs  
**Days 4-6**: Free Play mode with real-time availability  
**Days 7-10**: Leaderboards and challenge system  
**Days 11-13**: Score verification and ELO calculation  
**Day 14**: Polish and final testing  

## Key Dependencies

- **expo** - React Native framework
- **@supabase/supabase-js** - Supabase client
- **@react-navigation/native** - Navigation library
- **expo-secure-store** - Secure token storage
- **expo-notifications** - Push notifications
- **react-native-url-polyfill** - URL polyfill for Supabase

## Environment Variables

Create a `.env` file in `apps/mobile/`:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Contributing

This is a structured 14-day implementation project. See `prd.md` for the complete Product Requirements Document and implementation plan.

## License

MIT
