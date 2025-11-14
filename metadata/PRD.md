# SportNS Community Sports Platform - PRD (Version 2.0)

## Product Requirements Document - Simplified Free Play Focus

### Vision

A mobile-first community sports platform that connects local players through real-time game broadcasts and casual pickup games across 9 different sports. Focus on ease-of-use with username-only authentication and skill-based game matching.

---

## Core Features

### 1. Username Authentication

**Simplified Auth Flow:**
- **First Launch**: Text input for username → creates account automatically
- **Subsequent Launches**: Auto-authenticated via stored session
- **No OAuth Required**: Discord integration temporarily set aside (schema preserved for future)

**Profile Storage:**
- Username stored in `profiles.username` (unique)
- Discord fields (`discord_id`, `discord_username`, `discord_avatar_url`) made optional
- Session persists using Supabase auth with local storage

---

### 2. Skill Evaluation Onboarding

**First Launch Experience:**
- Welcome screen with guide section explaining the platform
- Skill evaluation required before accessing main app
- Must evaluate at least one sport to proceed

**Skill Evaluation UI:**
- 9 sports displayed with individual sliders
- 5-level skill assessment per sport:
  - **Never Played**: No experience
  - **Beginner**: Just starting out
  - **Average**: Comfortable playing
  - **Pro**: Very skilled
  - **Expert**: Top-tier player
- Default state: Undefined (no selection)
- Stored in `player_skill_levels` table

**Sports:**
Basketball, Pickleball, Volleyball, Football, Ping Pong, Badminton, Tennis, Golf, Running

---

### 3. Navigation Structure

**Top Navigation Bar:**
- **Left**: "NS Sports" app title/logo
- **Right**: Profile circle icon (tappable → opens Profile screen)

**Bottom Navigation Tabs:**
- **My Games**: Personal game list (confirmed & waiting)
- **Dashboard**: All game broadcasts (main screen)
- **Leagues**: "Coming Soon" placeholder

---

### 4. Dashboard Screen (Main Hub)

**Purpose:**
Central hub showing all posted game broadcasts

**Features:**
- Display all `game_events` in real-time
- Sport filter toggles at top (default: all sports visible)
- Each game card shows:
  - Sport type
  - Current players / Min-Max players
  - Time/schedule
  - Skill level requirements (if any)
  - Creator info
- "Click an event to join" messaging
- **Post New Game** button (opens Post Game flow)

**Real-time Updates:**
- New games appear instantly
- Player count updates live
- Games transition to "Confirmed" when min players reached

---

### 5. Post Game Flow (Multi-Step Form)

**Access:**
- Button on Dashboard screen
- Floating action button or prominent CTA

**Step 1: Select Sport**
- Grid of sport boxes with icons
- Single selection
- Advances to Step 2 automatically

**Step 2: Player Count**
- Slider with min and max player count
- Min value: 2 (or sport-specific minimum)
- Max value: varies by sport (e.g., 10 for basketball, 4 for tennis)
- Both min/max adjustable independently
- Visual: Double-sided range slider

**Step 3: Skill Level Restriction (Optional)**
- Toggle: "Restrict by skill level?" (default: OFF)
- When ON: Show double-sided skill level slider
  - Select min and max skill level from 5 levels
  - Example: "Average to Pro only"
- When OFF: All skill levels welcome

**Step 4: Time Selection**
- Three modes with radio/tab selector:

  **A. Now**
  - Instant selection, scheduled_time = NOW()
  - One-tap option

  **B. Times of Day**
  - Slider with 5 preset options:
    - Before Lunch (~11:00 AM)
    - After Lunch (~2:00 PM)
    - Before Dinner (~5:00 PM)
    - After Dinner (~8:00 PM)
    - Tomorrow Morning (~9:00 AM)
  - Stored as `time_type = 'time_of_day'`
  - `time_label` stores the readable label

  **C. Precise Time**
  - Relative time slider from NOW → 11:00 PM UTC+8
  - Visual: Horizontal slider with time increments (30 min intervals)
  - Displays absolute time (e.g., "3:30 PM")
  - Stored as `time_type = 'precise'`

**History Section:**
- "Previous Posts" expandable section
- Shows last 5 game posts by user
- Tap to pre-fill all fields from that post
- Quick repeat posting

**Post Button:**
- Large, prominent "Post Game" button at bottom
- Validates all required fields
- Creates `game_events` entry
- Auto-joins creator as first participant (`game_participants`)

---

### 6. My Games Screen

**Purpose:**
View all games the user has joined

**Two Sections:**

**A. Confirmed Games**
- Games where current player count >= min_players
- Status: `status = 'confirmed'` or player count check
- Shows: Sport, time, players, location (future)
- Action: Tap card to navigate to Game Detail Page

**B. Waiting for Players**
- Games where current player count < min_players
- Status: `status = 'waiting'`
- Shows: Sport, time, "X/Y players joined"
- Action: Tap card to navigate to Game Detail Page

**Navigation:**
- Each game card is tappable
- Tapping navigates to individual Game Detail Page
- All game management actions moved to detail page
- Real-time updates via Supabase subscriptions

---

### 6.5. Game Detail Page

**Purpose:**
Detailed view of a specific game accessed from My Games screen

**Access:**
- Tap any game card in My Games → Navigate to detail page

**Features:**

**A. Game Information Section**
- Sport type with icon
- Scheduled time (formatted display)
- Current players / Min-Max players
- Skill level requirements (if any)
- Creator username
- Game status (confirmed/waiting)

**B. Player List**
- Display all participants with usernames
- Real-time updates when players join/leave
- Show current count vs max capacity

**C. Share Game**
- "Share Game" button
- Generates shareable text/deep link containing:
  - Sport, time, location (future), player count
  - App download link for users without the app
  - Join link that opens game detail if app installed
- Uses native share sheet (iOS/Android)

**D. Leave Game**
- "Leave Game" button (moved from My Games list)
- Removes user from `game_participants`
- If last player → deletes entire game event
- Returns to My Games screen after leaving

**E. End Game**
- "End Game" button available to ALL participants
- Shows 5-second countdown confirmation dialogue
- Confirmation shows: "Are you sure? This will end the game for everyone."
- If confirmed: Sets game status to 'completed'
- Completed games removed from My Games
- Prevents accidental game endings

**F. Chat Section**
- Real-time plain text chat
- Visible to all game participants only
- Uses Supabase Realtime
- Messages stored in new `game_chat_messages` table
- Display: Username + message + timestamp
- Auto-scrolls to latest message
- Text input at bottom

**Real-time Updates:**
- Player joins/leaves update list instantly
- New chat messages appear instantly
- Game status changes update UI

---

### 7. Profile Screen

**Features:**

**Change Username:**
- Text input to update `profiles.username`
- Validates uniqueness
- Save button

**Re-evaluate Skills:**
- Same UI as onboarding skill evaluation
- Allows updating skill levels for any sport
- Updates `player_skill_levels` table

**Future:**
- Stats display (games played, etc.)
- Notification settings
- Theme toggle

---

### 8. Leagues Tab

**Current State:**
- "Coming Soon" placeholder screen
- Teaser content about future competitive features

**Future Features (Preserved in Schema):**
- ELO rankings per sport
- Challenge system
- Score verification
- Leaderboards

---

## Technical Architecture

### Tech Stack

- **Frontend**: React Native + Expo (iOS/Android)
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Deployment**: Expo EAS Build
- **Repository**: Monorepo with pnpm workspaces

---

## Database Schema

### Updated Tables

#### `profiles` (Modified)

**Changes:**
- `discord_id`: Made optional (DROP NOT NULL)
- `discord_username`: Made optional (DROP NOT NULL)
- `username`: New field (TEXT UNIQUE)
- `onboarding_completed`: New field (BOOLEAN DEFAULT FALSE)

**Structure:**
```sql
profiles:
  - id (uuid, FK to auth.users)
  - discord_id (text, nullable)
  - discord_username (text, nullable)
  - discord_avatar_url (text, nullable)
  - username (text, unique)
  - onboarding_completed (boolean, default false)
  - expo_push_token (text, nullable)
  - created_at (timestamp)
  - updated_at (timestamp)
```

---

### New Tables

#### `player_skill_levels`

Stores user's self-evaluated skill level for each sport

```sql
player_skill_levels:
  - id (uuid, primary key)
  - player_id (uuid, FK to profiles.id, ON DELETE CASCADE)
  - sport_id (int, FK to sports.id, ON DELETE CASCADE)
  - skill_level (text, CHECK constraint)
    - Values: 'never_played', 'beginner', 'average', 'pro', 'expert'
  - updated_at (timestamp)
  - UNIQUE(player_id, sport_id)
```

**Purpose:**
- Track player skill self-assessment
- Used for game filtering
- Required for onboarding completion

---

#### `game_events`

Represents posted games/broadcasts

```sql
game_events:
  - id (uuid, primary key)
  - sport_id (int, FK to sports.id, ON DELETE CASCADE)
  - creator_id (uuid, FK to profiles.id, ON DELETE CASCADE)
  - min_players (int, CHECK > 0)
  - max_players (int, CHECK >= min_players)
  - skill_level_min (text, nullable)
  - skill_level_max (text, nullable)
  - scheduled_time (timestamp, NOT NULL)
  - time_type (text, CHECK constraint)
    - Values: 'now', 'time_of_day', 'precise'
  - time_label (text, nullable)
    - Stores readable label for time_of_day mode
  - status (text, default 'waiting')
    - Values: 'waiting', 'confirmed', 'completed', 'cancelled'
  - created_at (timestamp)
```

**Purpose:**
- Central game broadcast entity
- Supports skill-based filtering
- Tracks game status lifecycle

---

#### `game_participants`

Tracks which players have joined which games

```sql
game_participants:
  - id (uuid, primary key)
  - game_id (uuid, FK to game_events.id, ON DELETE CASCADE)
  - player_id (uuid, FK to profiles.id, ON DELETE CASCADE)
  - joined_at (timestamp)
  - UNIQUE(game_id, player_id)
```

**Purpose:**
- Many-to-many relationship between players and games
- Enables "My Games" queries
- Creator is automatically added as first participant

---

#### `game_chat_messages`

Stores chat messages for each game

```sql
game_chat_messages:
  - id (uuid, primary key)
  - game_id (uuid, FK to game_events.id, ON DELETE CASCADE)
  - sender_id (uuid, FK to profiles.id, ON DELETE CASCADE)
  - message (text, NOT NULL)
  - created_at (timestamp)
```

**Purpose:**
- Real-time chat between game participants
- Visible only to joined players
- Automatically deleted when game is deleted

**RLS Policies:**
- SELECT: Only participants of the game can view
- INSERT: Only participants can send messages
- UPDATE/DELETE: Not allowed (immutable messages)

---

### Preserved Tables (Inactive)

These tables remain in the schema for future competitive features:

- `player_availability`: For "available now" feature (future)
- `player_elo_ratings`: ELO system (future)
- `challenges`: Challenge/compete system (future)
- `game_scores`: Score verification (future)

---

## Row Level Security (RLS) Policies

### `player_skill_levels`

**SELECT:**
- All authenticated users can view (for filtering)

**INSERT/UPDATE/DELETE:**
- Users can only modify their own skill levels (`auth.uid() = player_id`)

---

### `game_events`

**SELECT:**
- All authenticated users can view

**INSERT:**
- Any authenticated user can create (`auth.uid() = creator_id`)

**UPDATE:**
- Creator can update their own game events
- System can update status fields

**DELETE:**
- Creator can delete their own games
- Cascade deletes participants automatically

---

### `game_participants`

**SELECT:**
- All authenticated users can view (to see player counts)

**INSERT:**
- Users can join games (validates skill level if restricted)

**DELETE:**
- Users can leave games they've joined
- Cascade deletion when game is deleted

---

## App Flow Diagrams

### First Launch Flow

```
1. App Launch
   ↓
2. Check Session
   ↓ (No session)
3. Username Screen
   - Enter username
   - Create profile
   ↓
4. Onboarding Screen
   - Evaluate skills (min 1 sport)
   - Save to player_skill_levels
   - Set onboarding_completed = true
   ↓
5. Dashboard (Main App)
```

### Returning User Flow

```
1. App Launch
   ↓
2. Check Session
   ↓ (Session exists)
3. Check onboarding_completed
   ↓ (true)
4. Dashboard (Main App)
```

### Post Game Flow

```
1. Tap "Post Game" on Dashboard
   ↓
2. Step 1: Select Sport
   ↓
3. Step 2: Set Min/Max Players
   ↓
4. Step 3: Toggle Skill Restriction (optional)
   - If ON: Set skill range
   ↓
5. Step 4: Select Time
   - Now / Time of Day / Precise
   ↓
6. Review + Post
   ↓
7. Insert game_events row
   ↓
8. Auto-join creator (game_participants)
   ↓
9. Return to Dashboard (see new game)
```

### Join Game Flow

```
1. View Game Card on Dashboard
   ↓
2. Tap Card → Game Detail Modal
   ↓
3. Tap "Join Game" button
   ↓
4. Validate:
   - Not already joined
   - Meets skill requirements
   - Max players not reached
   ↓
5. Insert into game_participants
   ↓
6. Real-time update: Player count increments
   ↓
7. If count >= min_players: Status → 'confirmed'
   ↓
8. Game appears in "My Games" screen
```

---

## Implementation Plan Overview

### Phase 3: Implementation (Days 4-14)

#### Day 4: Username Selection & Skill Evaluation
- Username auth screen
- Onboarding skill evaluation screen
- Auth service updates
- TypeScript types

#### Day 5: Profile & Dashboard
- Profile screen (username change + skill re-eval)
- Dashboard screen with game list
- Top nav component
- Bottom nav update

#### Day 6: Post Game Flow - Part 1
- Sport selection (Step 1)
- Player count slider (Step 2)

#### Day 7: Post Game Flow - Part 2
- Skill level restriction (Step 3)
- Time selection (Step 4)

#### Day 8: Post Game Backend
- Game posting mutations
- History functionality
- Backend integration

#### Day 9: My Games Screen
- Confirmed games section
- Waiting games section
- Leave game functionality

#### Day 10: Dashboard Join Flow
- Join game from dashboard
- Real-time subscriptions
- Skill filtering

#### Day 11: My Games Detail Page & Features
- Individual game detail page accessible from My Games
- Game info display (sport, time, players, skill level)
- Player list with usernames
- Share game functionality (deep link/text for non-app users)
- Leave game button (moved from My Games list to detail page)
- End game button with 5-second confirmation dialogue (any participant)
- Real-time plain text chat using Supabase (visible to all game participants)

#### Days 12-14: Testing & Refinement
- End-to-end testing
- Bug fixes
- Performance optimization

---

## Success Criteria

### MVP Launch Checklist

- [ ] Username-based auth works smoothly
- [ ] Onboarding prevents app access until ≥1 skill evaluated
- [ ] Dashboard shows all games with real-time updates
- [ ] Sport filters work correctly
- [ ] Post game flow completes successfully (all 4 steps)
- [ ] Games appear in "My Games" correctly (confirmed vs waiting)
- [ ] Leave game logic works (including deletions)
- [ ] Join game from dashboard works
- [ ] Real-time updates show player joins/leaves
- [ ] Profile allows username and skill changes
- [ ] Game detail page accessible from My Games
- [ ] Player list updates in real-time
- [ ] Share game functionality works on iOS/Android
- [ ] End game confirmation dialogue prevents accidental endings
- [ ] Chat messages send and receive in real-time
- [ ] Chat only visible to game participants
- [ ] No critical bugs or crashes

---

## Future Enhancements (Post-MVP)

### Competitive Features (V3.0)

Preserved from original PRD (see `.tmp/PRD_V1.md`):
- Discord OAuth re-integration
- ELO rankings per sport
- Challenge system (1v1 competitive matches)
- Score verification logic with dispute resolution
- Leaderboards with W/L records
- Push notifications for challenges

### Additional Features

- Location-based game filtering (GPS)
- In-app messaging between players
- Game reviews/ratings
- Recurring game schedules
- Team formation tools
- Payment integration for court bookings

---

## Key Files Reference

### Database
- `supabase/migrations/005_simplified_auth_and_games.sql` - New migration

### Screens (New/Updated)
- `src/screens/UsernameScreen.tsx` - Username input
- `src/screens/OnboardingScreen.tsx` - Skill evaluation
- `src/screens/DashboardScreen.tsx` - Main hub
- `src/screens/PostGameScreen.tsx` - Multi-step form
- `src/screens/MyGamesScreen.tsx` - User's games
- `src/screens/GameDetailScreen.tsx` - Individual game detail page
- `src/screens/ProfileScreen.tsx` - Updated profile

### Components (New)
- `src/components/TopNav.tsx` - Top navigation bar
- `src/components/GameCard.tsx` - Game display card
- `src/components/SportSelector.tsx` - Sport grid
- `src/components/PlayerCountSlider.tsx` - Min/max slider
- `src/components/SkillLevelRangeSlider.tsx` - Skill range
- `src/components/TimeSelector.tsx` - Time selection modes
- `src/components/GameChat.tsx` - Real-time chat component
- `src/components/PlayerList.tsx` - Game participants list
- `src/components/ShareGame.tsx` - Share functionality

### Services
- `src/services/auth.ts` - Username auth functions
- `src/services/games.ts` - Game CRUD operations

### Hooks
- `src/hooks/useGameEvents.ts` - Game data + subscriptions
- `src/hooks/useMyGames.ts` - User's games
- `src/hooks/useGameChat.ts` - Chat messages + subscriptions
- `src/hooks/useGameParticipants.ts` - Participant list + subscriptions

---

## Archived Documentation

**Previous PRD (Competitive Focus):**
- Location: `.tmp/PRD_V1.md`
- Contains: Discord OAuth flow, ELO system, challenges, score verification
- Status: Preserved for future implementation (Phase 4+)

---

*This PRD reflects SportNS Version 2.0 - Simplified Free Play Focus*  
*Last Updated: November 7, 2025*
