# SportNS – Visual Redesign & UI/UX Proposal

## 1. Moodboard Description (Verbal)

**Visual Language:**
Imagine a serene morning at a local park — soft sunlight filtering through trees, pastel skies at dawn, the quiet anticipation before a friendly game begins. The interface should feel like a gentle invitation, not a loud demand.

**Atmosphere:**
- **Airy & Spacious**: Generous whitespace, breathing room between elements
- **Soft & Approachable**: No harsh edges or aggressive colors
- **Expressive & Playful**: Subtle micro-interactions that delight without overwhelming
- **Trustworthy & Clean**: Clear hierarchy, intuitive navigation, predictable patterns

**Material 3 "Expressive" Influence:**
- **Dynamic color system**: Pastel tones that adapt to content
- **Elevated surfaces**: Gentle shadows that suggest depth without heaviness
- **Fluid motion**: Spring-based animations, gentle fades, subtle scale transforms
- **Rounded everything**: Cards, buttons, inputs, modals — all softened
- **Typographic balance**: Clear hierarchy with comfortable reading sizes

**Color Mood:**
Think of a watercolor painting — soft lavender, mint green, powder blue, peachy pink, warm cream. Colors blend harmoniously, never shouting. Even the primary action color is muted and sophisticated.

**Interaction Mood:**
Every tap feels responsive but calm. Buttons gently scale down on press. Cards float up slightly on touch. Transitions are smooth, never jarring. Loading states are elegant, not frantic.

---

## 2. Complete Style Guide

### 2.1 Color Palette (Pastel & Soft Contrast)

#### Primary Colors
```typescript
primary: '#A8B5F5',        // Soft lavender-blue (main actions)
primaryDark: '#8A9AE8',    // Slightly deeper lavender (pressed states)
primaryLight: '#D4DBFC',   // Very light lavender (backgrounds)
primarySurface: '#F5F7FF', // Almost white with lavender tint
```

#### Secondary Colors
```typescript
secondary: '#B8E6D5',      // Soft mint green (success, availability)
secondaryDark: '#95D9BF',  // Deeper mint (pressed states)
secondaryLight: '#E0F5ED', // Light mint (backgrounds)
```

#### Accent Colors
```typescript
accent: '#FFD4B8',         // Soft peach (highlights, badges)
accentDark: '#FFBF94',     // Deeper peach
accentLight: '#FFEEE0',    // Light peach background
```

#### Status Colors (Muted)
```typescript
success: '#B8E6D5',        // Mint green
warning: '#FFE4C4',        // Soft bisque
error: '#FFB8B8',          // Soft coral-pink
info: '#BCD9F5',           // Soft sky blue
```

#### Neutral Colors (Warm Grays with Slight Tint)
```typescript
background: '#FEFEFE',        // Almost white, slightly warm
backgroundSecondary: '#F8F8F9', // Very light gray-lavender
backgroundTertiary: '#F0F1F5',  // Light gray-lavender

surface: '#FFFFFF',           // Pure white
surfaceElevated: '#FFFFFF',   // White with shadow for elevation

text: '#2E2F3A',              // Soft charcoal (not pure black)
textSecondary: '#6B6C7E',     // Medium gray-purple
textTertiary: '#A4A5B5',      // Light gray-purple
textInverse: '#FFFFFF',       // White for dark backgrounds

border: '#E8E9F0',            // Very light lavender-gray
borderLight: '#F3F4F8',       // Almost invisible border
borderDark: '#D4D5E0',        // Slightly visible border
```

#### Sport-Specific Accent Colors (Optional, for variety)
```typescript
basketball: '#FFDAB9',  // Peach puff
volleyball: '#E6E6FA',  // Lavender
football: '#B0E0E6',    // Powder blue
tennis: '#F0E68C',      // Khaki yellow
```

---

### 2.2 Typography

#### Font Family
```typescript
// Use system fonts for best performance and native feel
fontFamily: {
  ios: 'SF Pro Display',        // iOS default
  android: 'Roboto',            // Android default
  default: 'System',            // Fallback
}

// For headings, consider using "SF Pro Rounded" on iOS or "Google Sans" on Android
// for a softer, more friendly appearance
```

#### Font Sizes (Scale: 1.25 ratio, comfortable reading)
```typescript
fontSize: {
  xxxs: 10,    // Tiny labels, badges
  xxs: 11,     // Very small labels
  xs: 12,      // Small labels, captions
  sm: 14,      // Body text (small)
  md: 16,      // Body text (default) ← Base size
  lg: 18,      // Subheadings
  xl: 22,      // Section titles
  xxl: 28,     // Page titles
  xxxl: 36,    // Hero text
  huge: 48,    // Special callouts
}
```

#### Font Weights (Subtle hierarchy)
```typescript
fontWeight: {
  regular: '400',    // Body text
  medium: '500',     // Emphasized text
  semibold: '600',   // Buttons, labels
  bold: '700',       // Strong emphasis, rarely used
}
```

#### Line Heights (Comfortable reading)
```typescript
lineHeight: {
  tight: 1.2,       // Headings, compact text
  normal: 1.5,      // Body text (default)
  relaxed: 1.75,    // Longer paragraphs
}
```

#### Type Scale Usage
```
- Page Title: xxxl, bold
- Section Heading: xxl, semibold
- Card Title: lg, semibold
- Body Text: md, regular
- Secondary Text: sm, regular
- Caption/Label: xs, medium
```

---

### 2.3 Spacing System (8pt Grid)

```typescript
spacing: {
  xxxs: 2,     // Tight spacing (between icon and text)
  xxs: 4,      // Very tight
  xs: 6,       // Compact
  sm: 8,       // Small gap
  md: 12,      // Default gap ← Base unit
  lg: 16,      // Comfortable gap
  xl: 24,      // Section gap
  xxl: 32,     // Large section gap
  xxxl: 48,    // Screen padding (top/bottom)
  huge: 64,    // Hero spacing
}
```

#### Layout Spacing Rules
- **Screen horizontal padding**: 16px (lg)
- **Screen vertical padding (top)**: 48px (xxxl) from safe area
- **Card spacing**: 12px (md) between cards
- **Card internal padding**: 16px (lg)
- **Button padding horizontal**: 24px (xl)
- **Button padding vertical**: 12px (md)
- **Section spacing**: 32px (xxl)

---

### 2.4 Border Radius (Rounded Everything)

```typescript
borderRadius: {
  xs: 6,       // Small chips, tags
  sm: 8,       // Inputs, small buttons
  md: 12,      // Default buttons
  lg: 16,      // Cards, large buttons
  xl: 20,      // Modals, large cards
  xxl: 24,     // Hero cards
  full: 9999,  // Circular (avatars, badges)
}
```

#### Usage Guide
- **Cards**: `lg` (16px)
- **Buttons**: `md` (12px)
- **Inputs**: `sm` (8px)
- **Modals**: `xl` (20px)
- **Profile avatars**: `full`
- **Sport filter chips**: `md` (12px)
- **Status badges**: `full` or `xs` (6px)

---

### 2.5 Elevation & Shadows (Gentle, Not Harsh)

#### Shadow System (Soft, colored shadows)
```typescript
shadows: {
  none: {},
  
  xs: {
    shadowColor: '#A8B5F5',  // Lavender tint
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  
  sm: {
    shadowColor: '#A8B5F5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  
  md: {
    shadowColor: '#A8B5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
  
  lg: {
    shadowColor: '#A8B5F5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  
  xl: {
    shadowColor: '#A8B5F5',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
    elevation: 12,
  },
}
```

#### Elevation Usage
- **Floating buttons**: `md` → `lg` on press
- **Cards (default)**: `sm`
- **Cards (hovered/focused)**: `md`
- **Modals/Bottom Sheets**: `xl`
- **Top nav bar**: `xs`
- **Tab bar**: `xs`
- **Input fields (focused)**: `sm`

---

### 2.6 Component Shapes & Anatomy

#### Button Anatomy
- **Height**: 48px (comfortable tap target)
- **Min Width**: 80px
- **Padding**: 24px horizontal, 12px vertical
- **Border Radius**: 12px
- **Typography**: 16px, semibold
- **Icon**: 20px, centered, 8px gap from text

#### Card Anatomy
- **Padding**: 16px
- **Border Radius**: 16px
- **Shadow**: sm (default), md (elevated/focused)
- **Min Height**: 80px
- **Spacing between elements**: 12px

#### Input Field Anatomy
- **Height**: 48px
- **Padding**: 12px horizontal
- **Border Radius**: 8px
- **Border**: 1px solid `border` (default), 2px solid `primary` (focused)
- **Typography**: 16px, regular
- **Placeholder**: textTertiary

#### Chip/Tag Anatomy
- **Height**: 32px
- **Padding**: 12px horizontal, 6px vertical
- **Border Radius**: 12px
- **Typography**: 14px, medium
- **Icon**: 16px, 4px gap from text

---

### 2.7 Animation & Motion Guidelines

#### Timing Functions (Spring-based, natural motion)
```typescript
timing: {
  // Durations (milliseconds)
  instant: 100,     // Immediate feedback (button press)
  fast: 200,        // Quick transitions (fade, scale)
  normal: 300,      // Default (most animations)
  slow: 400,        // Deliberate (modal open/close)
  slower: 500,      // Emphasized (page transitions)
  
  // Easing curves
  easeOut: 'cubic-bezier(0.25, 0.1, 0.25, 1)',    // Deceleration (default)
  easeIn: 'cubic-bezier(0.42, 0, 1, 1)',          // Acceleration
  easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',    // Both
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',    // Bouncy (playful)
  softSpring: 'cubic-bezier(0.25, 0.8, 0.25, 1)', // Subtle bounce
}
```

#### Animation Patterns
| Interaction | Animation | Duration | Easing |
|-------------|-----------|----------|--------|
| **Button Press** | Scale down to 0.96 | 100ms | easeOut |
| **Button Release** | Scale back to 1.0 | 200ms | spring |
| **Card Tap** | Scale to 0.98, opacity 0.9 | 150ms | easeOut |
| **Card Appear** | Fade in (0 → 1), translateY (-8px → 0) | 300ms | easeOut |
| **Screen Enter** | Fade in, slide from right (30px → 0) | 400ms | easeOut |
| **Screen Exit** | Fade out, slide to left (0 → -30px) | 300ms | easeIn |
| **Modal Open** | Scale (0.9 → 1), opacity (0 → 1) | 400ms | softSpring |
| **Modal Close** | Scale (1 → 0.95), opacity (1 → 0) | 300ms | easeOut |
| **Loading Spinner** | Rotate 360° continuous | 1000ms | linear |
| **Pull-to-Refresh** | Scale indicator, rotate | 300ms | easeOut |

#### Motion Principles
1. **Responsive**: Animations start immediately on interaction (no delay)
2. **Natural**: Use spring physics for organic movement
3. **Subtle**: Prefer small transforms (scale 0.96-1.0, translateY ±8px)
4. **Consistent**: Same elements animate the same way everywhere
5. **Performant**: Use `transform` and `opacity` (hardware accelerated)

---

## 3. Screen-by-Screen Redesign

### 3.1 Login/Username Screen
**Current Issues:**
- Likely basic input field, minimal design

**Redesign:**
- **Layout**:
  - Centered vertically with gentle top bias (60% from top)
  - Large, friendly icon/illustration at top (pastel sports icons)
  - Large, welcoming title: "Welcome to NS Sports" (xxxl, bold)
  - Subtitle: "Let's get started with your username" (md, textSecondary)
  - Single input field with rounded corners (sm, 8px)
  - Primary button below with generous padding
  
- **Colors**:
  - Background: gradient from `primarySurface` to `background`
  - Input field: `surface` with `border` outline, focus → `primary` border
  - Button: `primary` background

- **Micro-interactions**:
  - Input field: Scale up slightly on focus (1.0 → 1.02), shadow sm → md
  - Button: Scale down on press (1.0 → 0.96), spring back
  - Keyboard appears with smooth animation, screen content scrolls up

---

### 3.2 Onboarding (Skill Evaluation) Screen
**Current Issues:**
- Possibly cluttered with all 9 sports at once

**Redesign:**
- **Layout**:
  - Top: Progress indicator (dots, 1/1 since it's single step)
  - Title: "Choose Your Sports & Skill Levels" (xxl, semibold)
  - Subtitle: "Select at least one sport to get started" (sm, textSecondary)
  - Sport cards in vertical scrollable list:
    - Each sport = expandable card
    - Collapsed: Sport icon + name + "Not set" or skill level badge
    - Expanded: Shows 5-level slider with labels
  - Bottom: Fixed "Continue" button (disabled until ≥1 sport selected)

- **Sport Card Anatomy**:
  - **Collapsed** (60px height):
    - Icon (left, 40px)
    - Sport name (lg, semibold)
    - Status badge (right, chip) → "Not set" (textTertiary) or skill level
  - **Expanded** (180px height):
    - Icon + name (same as collapsed)
    - Horizontal slider with 5 stops
    - Labels below each stop: Never, Beginner, Average, Pro, Expert
    - Active stop: larger dot, `primary` color
    - Inactive: smaller dot, `borderDark` color

- **Colors**:
  - Card background: `surface` with shadow sm
  - Expanded card: shadow md
  - Slider track: `border` (inactive), `primary` (active)
  - Selected skill level: `accent` badge with label

- **Interactions**:
  - Tap card → expand with smooth height animation (300ms, easeOut)
  - Tap slider → haptic feedback, dot scales up briefly
  - Continue button: disabled (opacity 0.4) → enabled (opacity 1.0, shadow md)

---

### 3.3 Dashboard Screen (Main Hub)
**Current Issues:**
- Sport filters are chips, might feel cramped
- "Post Game" button is large but could be more inviting
- Game cards are functional but lack visual hierarchy

**Redesign:**

#### Top Navigation Bar
- **Height**: 60px (excluding safe area)
- **Background**: `surface` with shadow xs
- **Layout**:
  - Left: App logo/title "NS SPORTS" (xl, bold, `primary` color)
  - Right: Profile avatar (40px circle, `primaryLight` background, initial letter)
- **Interaction**: Avatar tap → scale down, navigate to Profile

#### Sport Filter Section
- **Background**: `backgroundSecondary`
- **Padding**: 16px horizontal, 12px vertical
- **Layout**:
  - Label: "Filter by Sport" (xs, semibold, textSecondary)
  - Horizontal scrollable chips (with momentum)
  - Chips: Icon + label, 32px height, 12px radius
  - Active chip: `primary` background, white text
  - Inactive chip: `surface` background, border, text color

- **Interaction**:
  - Tap chip → scale 1.0 → 0.95 → 1.0, toggle active state
  - Smooth scroll with snap points

#### Post Game Button (Hero CTA)
- **Placement**: Below filter section, 16px margin
- **Style**:
  - Large card with gradient background (`primary` → `primaryDark`)
  - Height: 100px
  - Border radius: 16px
  - Shadow: md
  - Layout: Icon (left, 48px) + Text (center) + Arrow (right)
  - Text: "Post a New Game" (lg, bold, white) + subtitle (xs, white 0.8 opacity)
  
- **Interaction**:
  - Press → scale 0.98, shadow lg
  - Release → spring back, navigate with slide transition

#### Game Cards List
- **Layout**:
  - Vertical scroll with 12px spacing between cards
  - Each card: `surface` background, 16px padding, 16px radius, shadow sm
  
- **Card Anatomy** (Redesigned):
  - **Top Section** (Horizontal):
    - Sport icon (left, 56px, pastel circular background)
    - Game info (center, flex):
      - Sport name (lg, semibold)
      - Time (sm, textSecondary, icon prefix)
      - Player count (sm, textSecondary, icon prefix)
    - Status badge (right, top):
      - Confirmed: green chip "✓ Confirmed"
      - Waiting: amber chip "Waiting"
      - Joined: lavender chip "You're In"
  
  - **Bottom Section** (if applicable):
    - Skill level range (if set): Small chip with icon + text
    - Join button (full width) or "View Details" if joined
  
- **Colors**:
  - Default card: `surface`, shadow sm
  - Skill match card: `primarySurface` background, `primary` border (1px), shadow md
  - Joined card: subtle `secondaryLight` background tint

- **Interactions**:
  - Card tap (if joined): Navigate to detail screen
  - Card tap (if not joined, eligible): Show join confirmation
  - Card tap (if ineligible): No interaction (visual indicator)
  - Button press: scale down, haptic feedback

#### Empty State
- **Layout**: Centered vertically
- **Icon**: Large pastel sport ball illustration (96px)
- **Title**: "No Games Yet" (xxl, semibold)
- **Description**: "Be the first to post a game!" (md, textSecondary)
- **Button**: "Post Game" (primary, full width)

---

### 3.4 Post Game Screen (Multi-Step Flow)
**Current Issues:**
- Possibly all steps on one scrolling screen, can feel overwhelming

**Redesign: Wizard-Style Stepper**

#### Navigation Structure
- Fixed top bar: Progress indicator (Step X/4) + Back button
- Fixed bottom bar: "Next" button (or "Post Game" on last step)
- Center content: Scrollable step content

#### Step Indicator
- **Style**: 4 dots, horizontal, centered
- Current step: Larger dot, `primary` color
- Completed step: Check icon, `secondary` color
- Future step: Small dot, `borderDark` color

#### Step 1: Select Sport
- **Layout**:
  - Title: "Which sport?" (xxxl, semibold)
  - Subtitle: "Tap to select" (sm, textSecondary)
  - Grid of sport cards (2 columns, 12px gap)
  
- **Sport Card** (Each):
  - Square card (150px × 150px)
  - Pastel gradient background (sport-specific color)
  - Large icon (64px, centered)
  - Sport name (md, semibold, centered below)
  - Border radius: 16px
  - Shadow: sm (default), md (selected)
  - Selected: `primary` border (2px), scale 1.05

- **Interaction**:
  - Tap → select (single selection), scale animation
  - Auto-advance to Step 2 after 300ms

#### Step 2: Player Count
- **Layout**:
  - Title: "How many players?" (xxxl, semibold)
  - Subtitle: "Set minimum and maximum" (sm, textSecondary)
  - Large visual: Two number displays (min / max)
  - Double-sided range slider below
  - Min/Max labels with large numbers

- **Slider Design**:
  - Track: `border` color, 4px height
  - Active range (between handles): `primary` color, 6px height
  - Handles: Circular, 40px diameter, `primary` color, shadow md
  - Handle labels: Numbers inside handles (white, bold)

- **Interaction**:
  - Drag handle → smooth, constrained (min < max)
  - Release → haptic feedback, snap to nearest value
  - Numbers update in real-time above slider

#### Step 3: Skill Level (Optional)
- **Layout**:
  - Title: "Any skill restrictions?" (xxxl, semibold)
  - Subtitle: "Optional — leave off to welcome everyone" (sm, textSecondary)
  - Toggle switch: "Restrict by skill level" (large, friendly)
  - If ON: Show skill range picker (same as Step 2 style)

- **Toggle Design**:
  - Switch: 60px width, 34px height, rounded (full)
  - Track: `border` (off), `primary` (on)
  - Thumb: Circular, white, shadow sm
  - Animation: Smooth slide (200ms) + color fade

#### Step 4: Time Selection
- **Layout**:
  - Title: "When to play?" (xxxl, semibold)
  - Three option cards (vertical stack, 12px gap)
  
- **Option Card Anatomy**:
  - Height: 80px
  - Border radius: 16px
  - Border: `border` (default), `primary` (selected, 2px)
  - Background: `surface` (default), `primarySurface` (selected)
  - Icon (left, 40px) + Label (center, lg, semibold) + Radio (right, 24px)

- **Options**:
  1. **Now**: Clock icon, "Right Now!", subtitle "Start immediately"
  2. **Time of Day**: Sun icon, "Time of Day", subtitle "Choose preset times"
     - If selected: Show 5 horizontal chips below (scrollable)
     - Each chip: Time label, tap to select
  3. **Precise Time**: Calendar icon, "Specific Time", subtitle "Pick exact time"
     - If selected: Show time picker (native iOS/Android style)

- **Bottom Action**:
  - Large button: "Post Game 🎉" (primary, full width, shadow md)
  - Press → loading state (spinner), disable interactions
  - Success → navigate to Dashboard with confirmation toast

---

### 3.5 My Games Screen
**Current Issues:**
- Two sections (Confirmed / Waiting) might lack clear visual separation

**Redesign:**

#### Top Navigation
- Same as Dashboard (consistent header)

#### Layout
- **Tabs** (Segmented Control):
  - Two tabs: "Confirmed" (left), "Waiting" (right)
  - Style: `backgroundSecondary` track, `surface` active segment
  - Border radius: 12px
  - Height: 48px
  - Active segment: shadow sm, white background, `primary` text
  - Inactive segment: `textSecondary` text

- **Content Area**:
  - Scrollable list of game cards (same design as Dashboard)
  - Empty state for each tab if no games

#### Game Card Additions
- **Context Menu** (Long Press):
  - Options: "View Details", "Share Game", "Leave Game"
  - Style: Bottom sheet modal with rounded top corners

- **Swipe Actions** (iOS-style):
  - Swipe left: Reveal "Leave" button (red background)
  - Swipe right: Reveal "Share" button (blue background)

---

### 3.6 Game Detail Screen
**Current Issues:**
- Might be cramped with all features (info, players, chat, actions)

**Redesign: Sectioned Layout with Tabs**

#### Modal Presentation
- Full screen modal (slide up from bottom)
- Top bar: Close button (left) + Share button (right)
- Rounded top corners (xl, 20px)

#### Header Section (Fixed)
- **Layout**:
  - Large sport icon (80px, centered, pastel background)
  - Sport name (xxl, bold, centered)
  - Status badge (centered below, large chip)
  - Time + Location (centered, md, textSecondary)

- **Background**: Gradient from `primarySurface` to `background`

#### Tab Bar (Sticky)
- **Tabs**: "Info", "Players", "Chat"
- **Style**: Segmented control (same as My Games)

#### Tab Content (Scrollable)

**Info Tab:**
- Player count: Large visual (circular progress indicator)
- Skill level requirements (if any): Card with icon
- Creator info: Small card with avatar + name
- Created time: Small text
- Action buttons (full width, stacked, 12px gap):
  - "Share Game" (outline, primary)
  - "Leave Game" (outline, error) or "End Game" (secondary)

**Players Tab:**
- List of player cards (40px height each):
  - Avatar (left, 32px circle)
  - Username (md, semibold)
  - Badge (right, if creator): "Creator" chip
- Real-time updates (player joins → fade in animation)

**Chat Tab:**
- Standard chat UI:
  - Messages scroll (top-aligned, auto-scroll to bottom)
  - Input field (bottom, fixed):
    - Rounded rectangle (sm, 8px)
    - Placeholder: "Type a message..."
    - Send button (right, icon only, primary)
  - Message bubbles:
    - Own messages: Right-aligned, `primary` background, white text
    - Others: Left-aligned, `backgroundSecondary`, text color
    - Rounded corners (sm, 8px), timestamp below (xs, textTertiary)

#### Floating Action Button (Leave/End Game)
- If user is in game: FAB at bottom right
- Style: Circular, 56px diameter, shadow lg
- Icon: X or Exit icon (white)
- Background: `error` (leave) or `warning` (end)
- Press → scale down, show confirmation modal

---

### 3.7 Profile Screen
**Redesign:**

#### Header Section
- **Background**: Gradient `primarySurface` to `background`
- **Layout**:
  - Large avatar (96px, centered, editable)
  - Username (xxl, bold, centered, editable inline)
  - Join date (sm, textSecondary, centered)

#### Settings Cards (Vertical Stack)
- **Card Style**: `surface`, shadow sm, 16px padding, 16px radius
- **Cards**:
  1. **Username Card**:
     - Icon (left) + "Username" label + current name (right) + Edit icon
     - Tap → open edit modal
  
  2. **Skills Card**:
     - Icon + "Re-evaluate Skills" + Arrow
     - Tap → navigate to skills screen
  
  3. **Notifications Card**:
     - Icon + "Notification Settings" + Arrow
     - Tap → navigate to notification settings
  
  4. **Stats Card** (Future):
     - Icon + "Your Stats" + Arrow
     - Shows: Games played, win rate, etc.
  
  5. **Logout Card**:
     - Icon + "Log Out" + Arrow
     - Tap → confirmation alert

- **Spacing**: 12px gap between cards

---

### 3.8 Leaderboards/Leagues Screen (Coming Soon)
**Redesign:**

#### Layout
- **Background**: Gradient pastel background
- **Center Content**:
  - Large illustration (trophy icon, 120px, pastel colored)
  - Title: "Leagues Coming Soon!" (xxxl, bold, centered)
  - Description: "Competitive features are on the way..." (md, textSecondary, centered)
  - Email signup (optional): Input field + "Notify Me" button

---

## 4. Implementation Notes & Code Examples

### 4.1 Updated Theme File

```typescript
// apps/mobile/src/theme/index.ts

// ============================================
// PASTEL COLOR PALETTE (Material 3 Inspired)
// ============================================
export const Colors = {
  // Primary (Soft Lavender-Blue)
  primary: '#A8B5F5',
  primaryDark: '#8A9AE8',
  primaryLight: '#D4DBFC',
  primarySurface: '#F5F7FF',
  
  // Secondary (Soft Mint Green)
  secondary: '#B8E6D5',
  secondaryDark: '#95D9BF',
  secondaryLight: '#E0F5ED',
  
  // Accent (Soft Peach)
  accent: '#FFD4B8',
  accentDark: '#FFBF94',
  accentLight: '#FFEEE0',
  
  // Status Colors (Muted)
  success: '#B8E6D5',
  warning: '#FFE4C4',
  error: '#FFB8B8',
  info: '#BCD9F5',
  
  // Neutral Colors
  background: '#FEFEFE',
  backgroundSecondary: '#F8F8F9',
  backgroundTertiary: '#F0F1F5',
  
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  
  text: '#2E2F3A',
  textSecondary: '#6B6C7E',
  textTertiary: '#A4A5B5',
  textInverse: '#FFFFFF',
  
  border: '#E8E9F0',
  borderLight: '#F3F4F8',
  borderDark: '#D4D5E0',
  
  // Sport-Specific (Optional)
  basketball: '#FFDAB9',
  volleyball: '#E6E6FA',
  football: '#B0E0E6',
  tennis: '#F0E68C',
} as const;

// ============================================
// SPACING SYSTEM (8pt Grid)
// ============================================
export const Spacing = {
  xxxs: 2,
  xxs: 4,
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
} as const;

// ============================================
// BORDER RADIUS (Rounded Everything)
// ============================================
export const BorderRadius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

// ============================================
// TYPOGRAPHY
// ============================================
export const Typography = {
  fontSize: {
    xxxs: 10,
    xxs: 11,
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    xxxl: 36,
    huge: 48,
  },
  
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// ============================================
// SHADOWS (Soft, Colored)
// ============================================
export const Shadows = {
  none: {},
  
  xs: {
    shadowColor: '#A8B5F5',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  
  sm: {
    shadowColor: '#A8B5F5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  
  md: {
    shadowColor: '#A8B5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
  
  lg: {
    shadowColor: '#A8B5F5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  
  xl: {
    shadowColor: '#A8B5F5',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

// ============================================
// LAYOUT
// ============================================
export const Layout = {
  maxContentWidth: 600,
  screenPadding: Spacing.lg,
  headerHeight: 60,
  tabBarHeight: 60,
  buttonHeight: 48,
  inputHeight: 48,
  avatarSize: {
    small: 32,
    medium: 48,
    large: 64,
    xlarge: 96,
  },
} as const;

// ============================================
// ANIMATION TIMINGS
// ============================================
export const Animation = {
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 400,
    slower: 500,
  },
} as const;

// Combined Theme
export const Theme = {
  colors: Colors,
  spacing: Spacing,
  borderRadius: BorderRadius,
  typography: Typography,
  shadows: Shadows,
  layout: Layout,
  animation: Animation,
} as const;

export default Theme;
```

---

### 4.2 Enhanced Button Component

```typescript
// apps/mobile/src/components/Button.tsx

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: string; // Emoji or icon component
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const isDisabled = disabled || loading;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 5,
    }).start();
  };

  const variantStyle = 
    variant === 'primary' ? styles.buttonPrimary :
    variant === 'secondary' ? styles.buttonSecondary :
    variant === 'outline' ? styles.buttonOutline :
    styles.buttonGhost;

  const sizeStyle = 
    size === 'small' ? styles.buttonSmall :
    size === 'large' ? styles.buttonLarge :
    styles.buttonMedium;

  const textVariantStyle = 
    variant === 'primary' || variant === 'secondary' 
      ? styles.buttonTextLight 
      : styles.buttonTextPrimary;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[
          styles.button,
          variantStyle,
          sizeStyle,
          fullWidth && styles.buttonFullWidth,
          isDisabled && styles.buttonDisabled,
        ]}
        activeOpacity={0.9}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'outline' ? Colors.primary : Colors.textInverse} />
        ) : (
          <>
            {icon && <Text style={styles.buttonIcon}>{icon}</Text>}
            <Text style={[styles.buttonText, textVariantStyle]}>
              {title}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
    ...Shadows.sm,
  },
  buttonSecondary: {
    backgroundColor: Colors.secondary,
    ...Shadows.sm,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonSmall: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  buttonMedium: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  buttonLarge: {
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonFullWidth: {
    width: '100%',
  },
  buttonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  buttonTextLight: {
    color: Colors.textInverse,
  },
  buttonTextPrimary: {
    color: Colors.primary,
  },
  buttonIcon: {
    fontSize: 20,
  },
});
```

---

### 4.3 Enhanced Card Component

```typescript
// apps/mobile/src/components/Card.tsx

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
  variant?: 'default' | 'outlined' | 'flat' | 'elevated';
  padding?: keyof typeof Spacing;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  style, 
  onPress,
  variant = 'default',
  padding = 'lg',
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
    }).start();
  };

  const variantStyle = 
    variant === 'elevated' ? styles.cardElevated :
    variant === 'outlined' ? styles.cardOutlined :
    variant === 'flat' ? styles.cardFlat :
    styles.cardDefault;

  const CardContent = (
    <Animated.View
      style={[
        styles.card,
        variantStyle,
        { padding: Spacing[padding], transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
  },
  cardDefault: {
    ...Shadows.sm,
  },
  cardElevated: {
    ...Shadows.md,
  },
  cardOutlined: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardFlat: {
    backgroundColor: Colors.backgroundSecondary,
  },
});
```

---

### 4.4 Sport Filter Chip Component

```typescript
// apps/mobile/src/components/SportChip.tsx

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';

interface SportChipProps {
  icon: string;
  label: string;
  isActive: boolean;
  onPress: () => void;
}

export const SportChip: React.FC<SportChipProps> = ({
  icon,
  label,
  isActive,
  onPress,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 120,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.chip, isActive && styles.chipActive]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <Text style={styles.chipIcon}>{icon}</Text>
        <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipIcon: {
    fontSize: 16,
  },
  chipText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text,
  },
  chipTextActive: {
    color: Colors.textInverse,
  },
});
```

---

### 4.5 Loading Skeleton Component

```typescript
// apps/mobile/src/components/Skeleton.tsx

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors, BorderRadius } from '../theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = BorderRadius.sm,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.borderLight,
  },
});
```

---

### 4.6 Animated Page Transition Wrapper

```typescript
// apps/mobile/src/components/AnimatedScreen.tsx

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

interface AnimatedScreenProps {
  children: React.ReactNode;
}

export const AnimatedScreen: React.FC<AnimatedScreenProps> = ({ children }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

---

### 4.7 Custom Input Field Component

```typescript
// apps/mobile/src/components/Input.tsx

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../theme';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  icon?: string;
  secureTextEntry?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  icon,
  secureTextEntry,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.spring(scaleAnim, {
      toValue: 1.02,
      useNativeDriver: true,
      tension: 100,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <Animated.View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          error && styles.inputWrapperError,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry}
        />
      </Animated.View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  inputWrapperFocused: {
    borderColor: Colors.primary,
    borderWidth: 2,
    ...Shadows.sm,
  },
  inputWrapperError: {
    borderColor: Colors.error,
  },
  icon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    color: Colors.text,
  },
  errorText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
});
```

---

## 5. Icon Packs & Asset Recommendations

### 5.1 Recommended Icon Libraries

#### **Option 1: Lucide React Native** (Recommended)
- **Why**: Modern, consistent, minimal design. Perfect for pastel aesthetic
- **Style**: Outlined, 24px default, customizable
- **Installation**:
  ```bash
  npm install lucide-react-native
  ```
- **Usage**:
  ```typescript
  import { Calendar, Users, Trophy } from 'lucide-react-native';
  
  <Calendar color={Colors.primary} size={24} />
  ```
- **Link**: https://lucide.dev/

---

#### **Option 2: Feather Icons** (Alternative)
- **Why**: Simple, clean, well-maintained
- **Style**: Outlined, minimal
- **Installation**:
  ```bash
  npm install react-native-feather
  ```
- **Usage**:
  ```typescript
  import { Calendar } from 'react-native-feather';
  
  <Calendar stroke={Colors.primary} width={24} height={24} />
  ```
- **Link**: https://feathericons.com/

---

#### **Option 3: Material Symbols (Google)** (Material 3 Native)
- **Why**: Official Material 3 icons, variable weights
- **Style**: Rounded variant recommended (matches your aesthetic)
- **Installation**: Use `@expo/vector-icons` (MaterialCommunityIcons)
  ```bash
  # Already included in Expo
  ```
- **Usage**:
  ```typescript
  import { MaterialCommunityIcons } from '@expo/vector-icons';
  
  <MaterialCommunityIcons name="basketball" size={24} color={Colors.primary} />
  ```
- **Link**: https://fonts.google.com/icons

---

### 5.2 Sport Icon Recommendations

**Option A: Custom Pastel Sport Icons**
Create or source custom sport icons with:
- Soft, rounded shapes
- Duotone style (two-color gradients)
- Pastel color fills

**Sources:**
- **IconScout** (Premium): https://iconscout.com/
  - Search: "sport pastel icons" or "sport duotone"
  - License: Check for commercial use
  
- **Flaticon** (Free/Premium): https://www.flaticon.com/
  - Search: "sport flat icons"
  - Customize colors in editor
  
- **Figma Community**: 
  - Search: "sport icon set pastel"
  - Many free icon sets available for export

**Option B: Emoji-Based (Current Approach)**
- Keep using emojis for quick prototyping
- Advantage: Universally supported, no downloads
- Disadvantage: Less control over style

---

### 5.3 Illustration Assets

**Hero Illustrations (Empty States, Onboarding):**

**Source 1: Blush.design** (Free/Premium)
- **Link**: https://blush.design/
- **Style**: Customizable, pastel-friendly
- **Collections**: "Humans", "Sports", "Abstract"
- **Format**: SVG, PNG (high-res)

**Source 2: Undraw** (Free)
- **Link**: https://undraw.co/
- **Style**: Flat, customizable primary color
- **Search**: "sport", "team", "activity"
- **Format**: SVG

**Source 3: Storyset** (Free)
- **Link**: https://storyset.com/
- **Style**: Animated SVGs, customizable
- **Categories**: Sport, People, Technology

---

### 5.4 Asset Organization Structure

```
apps/mobile/assets/
  icons/
    sports/
      basketball.svg
      volleyball.svg
      football.svg
      ...
    ui/
      calendar.svg
      users.svg
      trophy.svg
      ...
  illustrations/
    empty-states/
      no-games.svg
      no-players.svg
      ...
    onboarding/
      welcome.svg
      skills.svg
      ...
  animations/
    loading.json (Lottie)
    success.json
    ...
```

---

### 5.5 Animation Assets (Optional)

**Lottie Animations** (Micro-interactions)
- **Source**: https://lottiefiles.com/
- **Usage**: Loading states, success confirmations, empty states
- **Installation**:
  ```bash
  npm install lottie-react-native
  ```
- **Example**:
  ```typescript
  import LottieView from 'lottie-react-native';
  
  <LottieView
    source={require('./assets/animations/loading.json')}
    autoPlay
    loop
    style={{ width: 100, height: 100 }}
  />
  ```

---

## 6. UX Improvements Summary

### Key UX Changes
1. **Progressive Disclosure**: Multi-step forms reduce cognitive load
2. **Clear Hierarchy**: Visual weight guides attention (titles → content → actions)
3. **Feedback Everywhere**: Micro-animations confirm every interaction
4. **Reduced Friction**: Auto-advance, smart defaults, saved history
5. **Accessibility**: High contrast text, 48px tap targets, clear labels
6. **Consistent Patterns**: Same components behave the same everywhere
7. **Forgiving Design**: Confirmations for destructive actions, undo options
8. **Contextual Help**: Inline tooltips, empty state guidance
9. **Performance Perception**: Skeleton loaders, optimistic updates

### Interaction Principles
- **Instant Feedback**: Button press animations (100ms)
- **Natural Motion**: Spring physics, not linear transitions
- **Haptic Feedback**: Vibrations for confirmations (iOS/Android)
- **Error Prevention**: Disabled states, validation before submission
- **Clear CTAs**: Primary actions always visible, color-coded by importance

---

## 7. Migration Strategy (Implementation Plan)

### Phase 1: Foundation (Week 1)
1. Update `theme/index.ts` with new color palette
2. Add animation constants
3. Create enhanced base components (Button, Card, Input)
4. Test component library in Storybook (optional) or dedicated screen

### Phase 2: Core Screens (Week 2-3)
5. Redesign Dashboard screen with new cards and filters
6. Redesign Post Game flow (wizard-style)
7. Redesign Game Detail screen (tabbed layout)
8. Add loading skeletons and transitions

### Phase 3: Secondary Screens (Week 4)
9. Redesign My Games screen (segmented tabs)
10. Redesign Profile screen (settings cards)
11. Redesign Onboarding (expandable sport cards)
12. Polish animations and micro-interactions

### Phase 4: Assets & Polish (Week 5)
13. Replace emojis with custom icon library
14. Add illustrations to empty states
15. Implement Lottie animations (optional)
16. Final QA and performance optimization

---

## 8. Design Tokens Export (For Reference)

```json
{
  "color": {
    "primary": "#A8B5F5",
    "secondary": "#B8E6D5",
    "accent": "#FFD4B8",
    "background": "#FEFEFE",
    "surface": "#FFFFFF",
    "text": "#2E2F3A"
  },
  "spacing": {
    "sm": "8px",
    "md": "12px",
    "lg": "16px",
    "xl": "24px"
  },
  "borderRadius": {
    "sm": "8px",
    "md": "12px",
    "lg": "16px"
  },
  "typography": {
    "fontSize": {
      "sm": "14px",
      "md": "16px",
      "lg": "18px",
      "xl": "22px"
    },
    "fontWeight": {
      "regular": "400",
      "semibold": "600",
      "bold": "700"
    }
  },
  "shadow": {
    "sm": "0 2px 4px rgba(168, 181, 245, 0.12)",
    "md": "0 4px 8px rgba(168, 181, 245, 0.16)",
    "lg": "0 8px 16px rgba(168, 181, 245, 0.2)"
  },
  "animation": {
    "duration": {
      "fast": "200ms",
      "normal": "300ms",
      "slow": "400ms"
    },
    "easing": {
      "easeOut": "cubic-bezier(0.25, 0.1, 0.25, 1)"
    }
  }
}
```

---

## Conclusion

This design system provides:
- ✅ **Complete visual language** (colors, typography, spacing, shapes)
- ✅ **Screen-by-screen redesigns** with detailed layouts
- ✅ **React Native code examples** (ready to implement)
- ✅ **Icon & asset sources** (Lucide, Feather, Blush, Undraw)
- ✅ **Animation guidelines** (smooth, subtle, Material 3-inspired)
- ✅ **UX improvements** (progressive disclosure, clear hierarchy, feedback)
- ✅ **Implementation plan** (phased migration strategy)

The design is **minimal, airy, pastel, expressive** — perfect for a community sports app that should feel welcoming and energetic without being overwhelming.

---

**Next Steps:**
1. Review and approve the design direction
2. Install recommended icon library (`lucide-react-native`)
3. Start with Phase 1 (update theme file)
4. Implement component library
5. Roll out screen redesigns incrementally

Let me know if you'd like me to:
- Create detailed mockups for specific screens
- Generate component variants (dark mode, etc.)
- Add more animation examples
- Provide additional code snippets for specific features

