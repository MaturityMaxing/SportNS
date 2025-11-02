# SportNS Community Sports Platform - PRD & 14-Day Implementation Plan

## Product Requirements Document

### Vision

A mobile-first community sports platform that connects local players through real-time availability tracking and competitive ELO-based rankings across 9 different sports.

### Core Features

#### 1. Discord Authentication

- OAuth sign-in with Discord
- Profile displays Discord username and avatar
- Push notifications for game challenges and score disputes

#### 2. Free Play Mode

- View all 9 sports: Basketball, Pickleball, Volleyball, Football, Ping Pong, Badminton, Tennis, Golf, Running
- Toggle availability status per sport (available now/unavailable)
- Real-time dashboard showing all currently available players per sport
- Live updates when players toggle their availability

#### 3. Leaderboards & ELO System

- Individual ELO rating per sport (starting at 1200)
- Top players ranked and displayed per sport
- Challenge system: any player can challenge another player
- Challenge states: pending, accepted, rejected, completed
- Game result submission with sophisticated verification logic

#### 4. Score Verification Logic

- After a challenge is accepted and game completed, both players can submit scores
- **24-hour window**: If 1 player submits score within 24h, it becomes official (ELO updated)
- **Both submit same scores**: Automatically accepted, ELO updated immediately
- **Both submit different scores**: Both players get notification showing the discrepancy
        - First player to confirm opponent's score → that score becomes truth
        - Both deny or no response after 48h → game deleted, no ELO change
- **No submissions after 24h**: Game deleted, no ELO change

### Technical Architecture

#### Tech Stack

- **Frontend**: React Native + Expo (iOS/Android)
- **Backend**: Supabase (PostgreSQL, Auth, Realtime subscriptions, Edge Functions)
- **Deployment**: Expo EAS Build
- **Repository**: Monorepo with pnpm workspaces

#### Database Schema (Supabase PostgreSQL)

**profiles**

- id (uuid, FK to auth.users)
- discord_id (text)
- discord_username (text)
- discord_avatar_url (text)
- expo_push_token (text, nullable)
- created_at (timestamp)

**sports** (hardcoded seed data)

- id (serial)
- name (text): Basketball, Pickleball, etc.
- slug (text)

**player_availability**

- id (uuid)
- player_id (uuid, FK to profiles)
- sport_id (int, FK to sports)
- is_available (boolean)
- updated_at (timestamp)
- Unique constraint: (player_id, sport_id)

**player_elo_ratings**

- id (uuid)
- player_id (uuid, FK to profiles)
- sport_id (int, FK to sports)
- elo_rating (int, default 1200)
- games_played (int, default 0)
- wins (int, default 0)
- losses (int, default 0)
- Unique constraint: (player_id, sport_id)

**challenges**

- id (uuid)
- sport_id (int, FK to sports)
- challenger_id (uuid, FK to profiles)
- challenged_id (uuid, FK to profiles)
- status (enum: pending, accepted, rejected, completed, disputed, cancelled)
- created_at (timestamp)
- accepted_at (timestamp, nullable)
- completed_at (timestamp, nullable)

**game_scores**

- id (uuid)
- challenge_id (uuid, FK to challenges)
- submitted_by (uuid, FK to profiles)
- challenger_score (int)
- challenged_score (int)
- submitted_at (timestamp)
- confirmed (boolean, default false)

#### Supabase Features Used

- **Auth**: Discord OAuth provider
- **Realtime**: Subscribe to availability changes, challenge updates
- **Edge Functions**: Score verification cron job, ELO calculation
- **Row Level Security (RLS)**: Secure access patterns

#### Mobile App Structure

```
/apps/mobile/
  /src/
    /screens/
      - HomeScreen.tsx (3 tabs navigation)
      - FreePlayScreen.tsx
      - LeaderboardsScreen.tsx
      - SportDetailScreen.tsx
      - ProfileScreen.tsx
    /components/
      - AvailabilityToggle.tsx
      - PlayerCard.tsx
      - LeaderboardList.tsx
      - ChallengeButton.tsx
      - ScoreSubmissionModal.tsx
    /services/
      - supabase.ts
      - auth.ts
      - notifications.ts
    /hooks/
      - useAvailability.ts
      - useLeaderboard.ts
      - useChallenges.ts
```

## 14-Day Implementation Plan

### Phase 1: Foundation (Days 1-3)

**Day 1: Project Setup & Database**

- Initialize monorepo with pnpm workspaces
- Set up Expo React Native project
- Create Supabase project and configure Discord OAuth
- Design and implement database schema (tables, RLS policies)
- Seed sports data

**Day 2: Authentication Flow**

- Implement Discord OAuth in Expo app
- Create auth service with Supabase
- Build login screen with Discord button
- Set up secure token storage (expo-secure-store)
- Create profile screen displaying Discord info

**Day 3: Navigation & UI Foundation**

- Set up React Navigation (bottom tabs)
- Create 3 main screens: Free Play, Leaderboards, Profile
- Implement basic UI components and theme
- Set up shared component library

### Phase 2: Free Play Mode (Days 4-6)

**Day 4: Free Play - Availability Toggle**

- Create sport selection grid UI (9 sports with icons)
- Implement availability toggle component
- Build mutations to update player_availability table
- Add RLS policies for availability data

**Day 5: Free Play - Real-time Dashboard**

- Create "Available Now" dashboard per sport
- Implement Supabase Realtime subscriptions
- Display list of available players with Discord avatars
- Add pull-to-refresh functionality

**Day 6: Free Play - Polish & Testing**

- Add loading states and error handling
- Implement optimistic UI updates
- Test real-time sync with multiple devices
- UI polish and animations

### Phase 3: Leaderboards & Challenges (Days 7-10)

**Day 7: Leaderboard Display**

- Create leaderboard screen with sport selector
- Fetch and display ELO rankings per sport
- Show player stats (W/L, games played)
- Implement ELO initialization for new players

**Day 8: Challenge System - Frontend**

- Build challenge button on player profiles
- Create challenge modal with sport selection
- Display pending/active challenges list
- Add accept/reject challenge functionality

**Day 9: Challenge System - Backend**

- Create challenge management mutations
- Implement challenge state machine logic
- Add RLS policies for challenges
- Set up push notifications for challenge events

**Day 10: Score Submission UI**

- Build score submission modal for completed games
- Display submitted scores to both players
- Show score discrepancy alerts
- Create confirmation/denial UI for disputed scores

### Phase 4: Score Verification & ELO (Days 11-13)

**Day 11: Score Verification Logic**

- Implement Edge Function for score verification cron (runs every hour)
- Handle 24h single-submission rule
- Handle matching scores auto-acceptance
- Handle disputed scores with 48h timeout

**Day 12: ELO Calculation System**

- Implement ELO rating algorithm (K-factor = 32)
- Create Edge Function to calculate and update ratings
- Update player_elo_ratings on score confirmation
- Add win/loss/games_played increments

**Day 13: Notifications System**

- Set up Expo push notifications
- Store push tokens in profiles table
- Send notifications for: challenges, score submissions, disputes
- Test notification delivery on iOS/Android

### Phase 5: Polish & Launch (Day 14)

**Day 14: Final Polish & Testing**

- End-to-end testing of all flows
- Fix critical bugs
- Performance optimization
- Add onboarding tutorial
- Prepare for Expo EAS build
- Create app icons and splash screens

## Key Implementation Files

**Database Setup**: `supabase/migrations/001_initial_schema.sql`

**Auth Service**: `apps/mobile/src/services/auth.ts`

**Realtime Hooks**: `apps/mobile/src/hooks/useAvailability.ts`

**Score Verification**: `supabase/functions/verify-scores/index.ts`

**ELO Calculator**: `supabase/functions/calculate-elo/index.ts`

**Push Notifications**: `apps/mobile/src/services/notifications.ts`

## Success Metrics

- Users can toggle availability and see real-time updates < 1 second
- ELO calculations are accurate and fair
- Score disputes resolved within 48 hours
- App loads < 2 seconds on 4G connection
- Push notifications delivered within 5 seconds
