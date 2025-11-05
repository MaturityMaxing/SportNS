# 🏀 SportNS - Community Sports Platform

A mobile-first community sports platform that connects local players through real-time availability tracking and competitive ELO-based rankings across 9 different sports.

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

2. Set up Supabase and environment variables:
```bash
# Follow the setup guide to create your Supabase project
# See: supabase/SETUP_GUIDE.md

# Then create your .env file with Supabase credentials
cat > apps/mobile/.env << EOF
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
EOF
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

This is a structured 14-day implementation project. See `PRD.md` for the complete Product Requirements Document and implementation plan.

## License

MIT
