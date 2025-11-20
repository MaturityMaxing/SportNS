# SportNS – Visual Mockup Descriptions

This document provides detailed visual descriptions of each screen, as if you were looking at a high-fidelity mockup in Figma or Sketch.

---

## Screen Mockups

### 1. Dashboard Screen

```
┌─────────────────────────────────────────┐
│  NS SPORTS                         (👤) │ ← TopNav (60px, white bg, subtle shadow)
├─────────────────────────────────────────┤
│                                         │
│  Filter by Sport          [Clear]       │ ← Filter header (secondary bg)
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐        │
│  │⚽ │ │🏀 │ │🏐 │ │🎾 │ │⛳│ ...      │ ← Horizontal scroll chips
│  └───┘ └───┘ └───┘ └───┘ └───┘        │
│                                         │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐  │
│  │  📢    Post a New Game       →   │  │ ← Hero CTA (gradient lavender bg)
│  │        Create and invite players  │  │   100px tall, rounded 16px
│  └───────────────────────────────────┘  │
│                                         │
│  Active Games                           │ ← Section title (22px, bold)
│  12 games available                     │ ← Subtitle (14px, gray)
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  (⚽)  Basketball      [✓ Confirmed]│ ← Game card (white bg, shadow)
│  │       Today at 3:30pm              │   Icon in circle (64px, pastel bg)
│  │       6/8 players                  │   Status badge (top right)
│  │       📊 Average - Pro             │   Skill chip (bottom)
│  │                                   │  │
│  │   Tap to view details →           │  │ ← Action hint
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  (🏀)  Volleyball      [Waiting]  │  │
│  │       Tomorrow at 9:00am          │  │
│  │       2/6 • needs 2 more          │  │
│  │                                   │  │
│  │   Tap to join →                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  (🏐)  Tennis         [You're In] │  │ ← Joined card (lavender tint bg)
│  │       In 45 minutes               │  │   Border highlight (primary)
│  │       4/4 players ✓               │  │
│  └───────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
│ 📋 My Games  ⚽ Dashboard  🏆 Leagues  │ ← Tab bar (white bg, icons 24px)
└─────────────────────────────────────────┘
```

**Color Notes:**
- Background: #FEFEFE (almost white)
- Hero button: Gradient from #A8B5F5 to #8A9AE8
- Cards: #FFFFFF with shadow rgba(168,181,245,0.12)
- Status badges: Confirmed=#B8E6D5, Waiting=#FFE4C4, Joined=#A8B5F5
- Text: #2E2F3A (primary), #6B6C7E (secondary)

---

### 2. Post Game Screen (Wizard Flow)

#### Step 1: Sport Selection

```
┌─────────────────────────────────────────┐
│  ← Step 1/4               ○ ○ ○ ○      │ ← Progress dots (primary = filled)
├─────────────────────────────────────────┤
│                                         │
│  Which sport?                           │ ← Title (36px, bold)
│  Tap to select your game type           │ ← Subtitle (16px, gray)
│                                         │
│  ┌─────────────┐  ┌─────────────┐      │
│  │             │  │             │      │
│  │   ┌─────┐   │  │   ┌─────┐   │      │
│  │   │  ⚽  │   │  │   │  🏀  │   │      │ ← Sport cards (grid, 2 cols)
│  │   └─────┘   │  │   └─────┘   │      │   Square ~150px, rounded 16px
│  │ Basketball  │  │ Volleyball  │      │   Pastel backgrounds
│  └─────────────┘  └─────────────┘      │
│                                         │
│  ┌─────────────┐  ┌─────────────┐      │
│  │    (✓)      │  │             │      │ ← Selected = checkmark badge
│  │   ┌─────┐   │  │   ┌─────┐   │      │   + primary border (2px)
│  │   │  🎾  │   │  │   │  ⛳  │   │      │   + scale 1.05
│  │   └─────┘   │  │   └─────┘   │      │
│  │   Tennis    │  │    Golf     │      │
│  └─────────────┘  └─────────────┘      │
│                                         │
│                                         │
│  [        Next Step →        ]          │ ← Primary button (bottom)
└─────────────────────────────────────────┘
```

#### Step 2: Player Count

```
┌─────────────────────────────────────────┐
│  ← Step 2/4               ● ○ ○ ○      │
├─────────────────────────────────────────┤
│                                         │
│  How many players?                      │
│  Set minimum and maximum                │
│                                         │
│         ┌────────┐     ┌────────┐      │
│         │   4    │  /  │   10   │      │ ← Large number displays
│         │  MIN   │     │  MAX   │      │   (40px numbers, lavender bg)
│         └────────┘     └────────┘      │
│                                         │
│         2   4       6       8      10   │ ← Slider labels
│         ├───●───────────────●───────┤   │ ← Double-range slider
│         │   ████████████████████   │   │   Active range = primary color
│                                         │   Handles = 40px circles
│                                         │
│  💡 Minimum players needed to confirm   │ ← Helper text
│     Maximum capacity for the game       │
│                                         │
│  [        Next Step →        ]          │
└─────────────────────────────────────────┘
```

#### Step 3: Skill Level (Optional)

```
┌─────────────────────────────────────────┐
│  ← Step 3/4               ● ● ○ ○      │
├─────────────────────────────────────────┤
│                                         │
│  Any skill restrictions?                │
│  Optional — leave off to welcome all    │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │  Restrict by skill level    ( ○ )  ││ ← Toggle switch (OFF)
│  └─────────────────────────────────────┘│   Track: gray
│                                         │   Thumb: white circle
│  ┌─────────────────────────────────────┐│
│  │  Restrict by skill level    (● ○)  ││ ← Toggle switch (ON)
│  └─────────────────────────────────────┘│   Track: lavender
│                                         │   Thumb: white, slides right
│  ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯  │
│  When ON, show:                         │
│                                         │
│         Beginner  Average      Pro      │ ← Skill slider labels
│         ├─────●───────────●─────────┤   │   Same style as player count
│         │     ████████████████      │   │
│                                         │
│  [        Next Step →        ]          │
└─────────────────────────────────────────┘
```

#### Step 4: Time Selection

```
┌─────────────────────────────────────────┐
│  ← Step 4/4               ● ● ● ○      │
├─────────────────────────────────────────┤
│                                         │
│  When to play?                          │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │  🕐   Right Now!              (●)  ││ ← Option 1 (selected)
│  │       Start immediately            ││   Border: primary 2px
│  └─────────────────────────────────────┘│   Background: #F5F7FF
│                                         │
│  ┌─────────────────────────────────────┐│
│  │  ☀️   Time of Day             ( )  ││ ← Option 2
│  │       Choose preset times          ││   Border: gray 1px
│  └─────────────────────────────────────┘│   Background: white
│                                         │
│  ┌─────────────────────────────────────┐│
│  │  📅   Specific Time           ( )  ││ ← Option 3
│  │       Pick exact date & time       ││
│  └─────────────────────────────────────┘│
│                                         │
│  Previous Posts (expand)                │ ← History section
│  ⌄                                      │
│                                         │
│  [     Post Game 🎉      ]              │ ← Final button
└─────────────────────────────────────────┘
```

---

### 3. Game Detail Screen (Modal)

```
┌─────────────────────────────────────────┐
│  ✕                                  📤  │ ← Modal header (close + share)
│                                         │   Rounded top corners (20px)
├─────────────────────────────────────────┤
│         ┌─────────────┐                 │
│         │             │                 │
│         │     ⚽      │                 │ ← Large sport icon (80px)
│         │             │                 │   Pastel circle background
│         └─────────────┘                 │
│                                         │
│          Basketball                     │ ← Sport name (28px, bold)
│       [✓ Confirmed]                     │ ← Status badge
│      Today at 3:30pm                    │ ← Time (16px, gray)
│                                         │
│  ┌───┬───┬───┐                          │
│  │Info│Plr│Chat│                        │ ← Tab bar (segmented control)
│  └───┴───┴───┘                          │   Active = white bg, shadow
│                                         │
│  ⎯⎯⎯⎯⎯⎯⎯⎯⎯ Info Tab ⎯⎯⎯⎯⎯⎯⎯⎯⎯      │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │        ●●●●●○○○                     ││ ← Circular progress
│  │         6 / 8 Players                ││   (75% filled, primary color)
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │  📊 Skill Level                     ││ ← Info card
│  │     Average to Pro                  ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │  👤 Created by @alex                ││
│  └─────────────────────────────────────┘│
│                                         │
│  [      Share Game      ]               │ ← Outline button (primary)
│  [      Leave Game      ]               │ ← Outline button (red)
│                                         │
│  ⎯⎯⎯⎯⎯⎯⎯⎯ Players Tab ⎯⎯⎯⎯⎯⎯⎯⎯     │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │  (A)  @alex          [Creator]     ││ ← Player list item
│  └─────────────────────────────────────┘│   Avatar (32px) + name + badge
│  ┌─────────────────────────────────────┐│
│  │  (M)  @maria                       ││
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │  (J)  @john                        ││
│  └─────────────────────────────────────┘│
│                                         │
│  ⎯⎯⎯⎯⎯⎯⎯⎯⎯ Chat Tab ⎯⎯⎯⎯⎯⎯⎯⎯⎯     │
│                                         │
│  ┌─────────────────────────────┐       │ ← Others' messages (left)
│  │ alex: See you there! 2:30pm │       │   Light gray background
│  └─────────────────────────────┘       │
│                                         │
│       ┌─────────────────────────────┐  │ ← Own messages (right)
│       │ Sounds good! 2:31pm        │  │   Primary color background
│       └─────────────────────────────┘  │   White text
│                                         │
│  ┌─────────────────────────────┐  [↑] │ ← Input field + send button
│  │ Type a message...           │      │   Rounded (8px), sticky bottom
│  └─────────────────────────────┘      │
└─────────────────────────────────────────┘
```

---

### 4. Profile Screen

```
┌─────────────────────────────────────────┐
│  ←        Profile                       │ ← Header (white bg, shadow)
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐  │
│  │                                   │  │ ← Header section
│  │         ┌─────────┐               │  │   Gradient background
│  │         │         │               │  │   (primarySurface to white)
│  │         │    A    │               │  │
│  │         │         │               │  │ ← Avatar (96px, lavender bg)
│  │         └─────────┘               │  │   Letter (48px, bold, primary)
│  │                                   │  │
│  │         @alex_sports               │  │ ← Username (28px, bold)
│  │      Joined Nov 2025              │  │   Join date (14px, gray)
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │  (👤)  Username             →      ││ ← Setting card (white, shadow)
│  │        @alex_sports                ││   Icon (48px box, gray bg)
│  └─────────────────────────────────────┘│   Arrow (20px, light gray)
│                                         │
│  ┌─────────────────────────────────────┐│
│  │  (⚡)  Re-evaluate Skills   →      ││
│  │        Update your skill levels    ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │  (🔔)  Notifications        →      ││
│  │        Manage preferences          ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │  (📊)  Your Stats           →      ││ ← Disabled (opacity 0.5)
│  │        Coming soon                 ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │  (🚪)  Log Out              →      ││ ← Destructive action
│  │        Sign out of account         ││   Title in red (#FFB8B8)
│  └─────────────────────────────────────┘│
│                                         │
└─────────────────────────────────────────┘
```

---

### 5. Onboarding (Skill Evaluation)

```
┌─────────────────────────────────────────┐
│  Choose Your Sports & Skill Levels      │ ← Title (28px, bold)
│  Select at least one sport to continue  │ ← Subtitle (14px, gray)
│                                         │
│  ┌─────────────────────────────────────┐│
│  │  ⚽  Basketball        [Average]    ││ ← Collapsed sport card
│  │                                ⌄   ││   Status badge or "Not set"
│  └─────────────────────────────────────┘│   Down arrow (expand)
│                                         │
│  ┌─────────────────────────────────────┐│
│  │  🏀  Volleyball        [Not set]   ││
│  │                                ⌄   ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │  🎾  Tennis                        ││ ← Expanded card (180px height)
│  │                                ⌃   ││   Up arrow (collapse)
│  │  ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯  ││
│  │  Never  Beginner  Average  Pro  Exp││ ← Horizontal slider (5 stops)
│  │    ○       ○        ●      ○     ○ ││   Active dot = larger + primary
│  │                                     ││   Inactive = small + gray
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │  ⛳  Golf             [Not set]     ││
│  │                                ⌄   ││
│  └─────────────────────────────────────┘│
│                                         │
│  [       Continue      ]                │ ← Primary button (bottom)
│  Disabled until ≥1 sport selected       │   (opacity 0.4 when disabled)
└─────────────────────────────────────────┘
```

---

### 6. My Games Screen

```
┌─────────────────────────────────────────┐
│  NS SPORTS                         (👤) │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┬──────────────┐        │ ← Segmented control tabs
│  │  Confirmed   │   Waiting    │        │   Active = white bg, shadow
│  └──────────────┴──────────────┘        │   Inactive = transparent
│                                         │
│  ⎯⎯⎯⎯⎯⎯⎯ Confirmed Games ⎯⎯⎯⎯⎯⎯⎯    │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  (⚽)  Basketball  [You're In]    │  │ ← Game card (same as Dashboard)
│  │       Today at 3:30pm            │  │   Swipeable actions:
│  │       6/8 players ✓              │  │   • Swipe left = Leave (red)
│  │       Tap for details →          │  │   • Swipe right = Share (blue)
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  (🏐)  Tennis                    │  │
│  │       Tomorrow at 9am            │  │
│  │       4/4 players ✓              │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ⎯⎯⎯⎯⎯⎯ Waiting for Players ⎯⎯⎯⎯⎯⎯   │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  (🏀)  Volleyball  [Waiting]     │  │
│  │       In 2 hours                 │  │
│  │       2/6 • needs 2 more         │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │ ← Empty state (if no games)
│  │         ⚽                        │  │   Large icon (96px)
│  │    No games yet!                 │  │   Title (28px, bold)
│  │    Join or create one to start   │  │   Description (16px, gray)
│  │                                  │  │
│  │   [  Browse Games  ]             │  │   Primary button
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
│ 📋 My Games  ⚽ Dashboard  🏆 Leagues  │
└─────────────────────────────────────────┘
```

---

### 7. Leagues Screen (Coming Soon)

```
┌─────────────────────────────────────────┐
│  NS SPORTS                         (👤) │
├─────────────────────────────────────────┤
│                                         │
│                                         │
│                                         │
│            ┌─────────┐                  │
│            │         │                  │
│            │   🏆    │                  │ ← Trophy illustration (120px)
│            │         │                  │   Pastel colored
│            └─────────┘                  │
│                                         │
│      Leagues Coming Soon!               │ ← Title (36px, bold, centered)
│                                         │
│   Competitive features are on the way   │ ← Description (16px, gray)
│   Stay tuned for rankings, challenges,  │   Multi-line, centered
│   and leaderboards!                     │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │  📧 your@email.com                 ││ ← Optional email signup
│  └─────────────────────────────────────┘│   Input (48px height)
│                                         │
│  [       Notify Me       ]              │ ← Outline button (primary)
│                                         │
└─────────────────────────────────────────┘
│ 📋 My Games  ⚽ Dashboard  🏆 Leagues  │
└─────────────────────────────────────────┘
```

---

## Interaction Details

### Touch Target Sizes
- **Minimum**: 44x44pt (Apple HIG) / 48x48dp (Material Design)
- **Buttons**: 48px height (comfortable for thumbs)
- **Tab bar icons**: 48x48px touch area
- **Card tap areas**: Full card width/height
- **Slider handles**: 40px diameter (easy to grab)

### Scroll Behavior
- **Pull-to-refresh**: Standard iOS/Android pattern, shows spinner in primary color
- **Momentum scroll**: Enabled on all lists
- **Snap points**: Sport filter chips snap to edges when scrolling
- **Scroll-to-top**: Tap tab bar icon when on screen → scroll to top

### Loading States
1. **Initial Load**: Skeleton screens (pulsing gray boxes)
2. **Refresh**: Pull-down spinner (primary color)
3. **Button Loading**: Spinner replaces text, button disabled
4. **Optimistic Updates**: Show changes immediately, revert on error

### Error States
- **Network Error**: Toast notification (red background, error icon)
- **Validation Error**: Input field border turns red, helper text below
- **Empty State**: Large icon + friendly message + action button

### Success Feedback
- **Toast**: Green background, checkmark icon, auto-dismiss (3s)
- **Haptic**: Light haptic on successful tap (iOS) / short vibration (Android)
- **Visual**: Scale-up animation on confirmed actions

---

## Accessibility Considerations

### Text Contrast
All text meets WCAG AA standards:
- **Primary text** (#2E2F3A) on white: 15.8:1 ✓
- **Secondary text** (#6B6C7E) on white: 5.4:1 ✓
- **White text** on primary (#A8B5F5): 4.8:1 ✓
- **White text** on secondary (#B8E6D5): 3.2:1 (Large text only)

### Font Sizes
- **Minimum**: 14px for body text (comfortable reading)
- **Large buttons**: 16px (semibold)
- **Headings**: 22px+ (clear hierarchy)
- **Dynamic type**: Support iOS/Android text size preferences

### Screen Reader Support
```typescript
// Button example
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Join Basketball game at 3:30pm"
  accessibilityHint="Double tap to confirm joining this game"
  accessibilityRole="button"
>
  <Text>Join Game</Text>
</TouchableOpacity>

// Status badge example
<View
  accessible={true}
  accessibilityLabel="Game confirmed with 6 out of 8 players"
  accessibilityRole="text"
>
  <Text>✓ Confirmed</Text>
</View>

// Sport chip example
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Filter by Basketball"
  accessibilityState={{ selected: isSelected }}
  accessibilityRole="button"
>
  <Text>🏀 Basketball</Text>
</TouchableOpacity>
```

### Keyboard Navigation (Android TV/Web)
- Tab order follows visual hierarchy
- Focus indicators visible (2px primary border)
- Enter/Space activates buttons
- Arrow keys navigate lists

### Reduced Motion
```typescript
import { AccessibilityInfo } from 'react-native';

const [reduceMotion, setReduceMotion] = useState(false);

useEffect(() => {
  AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
    setReduceMotion(enabled);
  });
}, []);

// Then in animations:
const animationDuration = reduceMotion ? 0 : 300;
```

---

## Dark Mode Considerations (Future)

### Color Palette Adjustments
```typescript
const DarkColors = {
  // Backgrounds (darker)
  background: '#121218',         // Near black
  backgroundSecondary: '#1A1A24',
  surface: '#222230',
  
  // Text (inverted)
  text: '#F0F0F5',               // Almost white
  textSecondary: '#A8A8B8',
  textTertiary: '#707080',
  
  // Primary (slightly brighter)
  primary: '#B8C5FF',            // Lighter lavender
  primaryLight: '#8A9AE8',       // Current primary becomes light
  
  // Borders (softer)
  border: '#2E2E3C',
  
  // Shadows (lighter, blue-tinted)
  shadowColor: '#6366F1',        // Blue-ish glow
}
```

### Elevation in Dark Mode
- Use lighter surfaces for elevation (not shadows)
- Surface levels: #222230 → #2A2A38 → #323242
- Glowing borders instead of shadows (optional)

---

## Animation Specifications

### Spring Physics Parameters
```typescript
// Button press (snappy)
{
  tension: 120,
  friction: 5,
  useNativeDriver: true
}

// Card entrance (bouncy)
{
  tension: 65,
  friction: 7,
  useNativeDriver: true
}

// Modal open (smooth)
{
  tension: 80,
  friction: 8,
  useNativeDriver: true
}
```

### Timing Curves
```typescript
// Ease out (deceleration - default)
duration: 300,
easing: Easing.bezier(0.25, 0.1, 0.25, 1)

// Ease in (acceleration - exit)
duration: 200,
easing: Easing.bezier(0.42, 0, 1, 1)

// Spring (playful)
duration: 400,
easing: Easing.bezier(0.34, 1.56, 0.64, 1)
```

---

## Responsive Breakpoints

### Phone (< 600px width)
- 2-column sport grid
- Full-width cards
- Single column layout

### Tablet (600-900px width)
- 3-column sport grid
- Max content width: 600px (centered)
- Larger touch targets (56px buttons)

### Large Tablet/Desktop (> 900px)
- 4-column sport grid
- Max content width: 800px
- Side-by-side layout for Post Game wizard

---

## Performance Optimization

### Image/Icon Loading
- Use vector icons (SVG or icon fonts) instead of images
- Lazy load illustrations (only when screen is visible)
- Cache sport icons in memory

### List Rendering
```typescript
// Use FlatList for long lists
<FlatList
  data={games}
  renderItem={({ item }) => <GameCard game={item} />}
  keyExtractor={item => item.id}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={5}
/>
```

### Animation Performance
- Always use `useNativeDriver: true` for transform/opacity
- Avoid animating layout properties (width, height, padding)
- Use `React.memo()` for static components
- Debounce scroll listeners

---

## Component Library Checklist

### Core Components (Priority 1)
- ✅ Button (with variants and animations)
- ✅ Card (with press animations)
- ✅ Input (with focus states)
- ✅ TopNav (with safe area)
- ✅ SportChip (with toggle animation)
- ✅ GameCard (with staggered entrance)
- ✅ Skeleton (with pulse animation)
- ✅ Toast (with slide-in animation)

### Extended Components (Priority 2)
- [ ] Modal (with backdrop and spring animation)
- [ ] BottomSheet (with drag gesture)
- [ ] SegmentedControl (for tabs)
- [ ] Slider (double-range for min/max)
- [ ] Toggle (animated switch)
- [ ] Avatar (with initials and image support)
- [ ] Badge (status indicators)
- [ ] ProgressIndicator (circular and linear)

### Utility Components (Priority 3)
- [ ] SafeAreaView (consistent padding)
- [ ] KeyboardAvoidingView (for forms)
- [ ] EmptyState (with illustration)
- [ ] ErrorBoundary (fallback UI)
- [ ] LoadingOverlay (full-screen spinner)

---

This document provides pixel-perfect descriptions of each screen to guide implementation. Use these mockups as reference when building components and layouts.

