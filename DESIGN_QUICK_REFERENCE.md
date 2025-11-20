# Design Quick Reference Card

> **Print this page or keep it open while implementing!**

---

## 🎨 Color Palette (Copy-Paste Ready)

```typescript
// Primary Colors
primary: '#A8B5F5',
primaryDark: '#8A9AE8',
primaryLight: '#D4DBFC',
primarySurface: '#F5F7FF',

// Secondary Colors
secondary: '#B8E6D5',
secondaryDark: '#95D9BF',
secondaryLight: '#E0F5ED',

// Accent Colors
accent: '#FFD4B8',
accentDark: '#FFBF94',
accentLight: '#FFEEE0',

// Status Colors
success: '#B8E6D5',
warning: '#FFE4C4',
error: '#FFB8B8',
info: '#BCD9F5',

// Neutrals
background: '#FEFEFE',
surface: '#FFFFFF',
text: '#2E2F3A',
textSecondary: '#6B6C7E',
textTertiary: '#A4A5B5',
border: '#E8E9F0',
```

---

## 📏 Spacing Scale

```typescript
xxxs: 2,    xs: 6,     sm: 8,     md: 12,
lg: 16,     xl: 24,    xxl: 32,   xxxl: 48
```

**Common Usage:**
- Screen padding: `lg` (16px)
- Card spacing: `md` (12px)
- Button padding (horizontal): `xl` (24px)
- Button padding (vertical): `md` (12px)
- Section gap: `xxl` (32px)

---

## 🔤 Typography

```typescript
// Sizes
xs: 12,   sm: 14,   md: 16,   lg: 18,
xl: 22,   xxl: 28,  xxxl: 36, huge: 48

// Weights
regular: '400'    medium: '500'
semibold: '600'   bold: '700'
```

**Common Usage:**
- Page title: `xxxl` + `bold`
- Section heading: `xxl` + `semibold`
- Card title: `lg` + `semibold`
- Body text: `md` + `regular`
- Caption: `xs` + `medium`

---

## ⚡ Border Radius

```typescript
xs: 6,   sm: 8,   md: 12,   lg: 16,
xl: 20,  xxl: 24, full: 9999
```

**Common Usage:**
- Cards: `lg` (16px)
- Buttons: `md` (12px)
- Inputs: `sm` (8px)
- Modals: `xl` (20px)
- Avatars: `full`

---

## 🎭 Animation Timings

```typescript
instant: 100,  fast: 200,  normal: 300,
slow: 400,     slower: 500
```

**Spring Physics:**
```typescript
// Button press (snappy)
{ tension: 120, friction: 5 }

// Card entrance (bouncy)
{ tension: 65, friction: 7 }

// Modal open (smooth)
{ tension: 80, friction: 8 }
```

---

## 🔳 Component Sizes

```typescript
// Heights
buttonHeight: 48,
inputHeight: 48,
tabBarHeight: 60,
headerHeight: 60,

// Avatar Sizes
avatarSmall: 32,
avatarMedium: 48,
avatarLarge: 64,
avatarXLarge: 96,
```

---

## 🌑 Shadows (Soft & Colored)

```typescript
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
```

---

## 📱 Touch Target Sizes

```
Minimum: 48x48px
Buttons: 48px height
Tab icons: 48x48px area
Slider handles: 40px diameter
```

---

## 🎨 Status Badge Colors

```typescript
Confirmed:  background: '#B8E6D5' (mint)
Waiting:    background: '#FFE4C4' (bisque)
Joined:     background: '#A8B5F5' (lavender)
Error:      background: '#FFB8B8' (coral)
```

---

## 📐 Layout Guidelines

```typescript
// Screen padding
horizontal: 16px (lg)
vertical: 48px (xxxl) from safe area

// Card anatomy
padding: 16px (lg)
border-radius: 16px (lg)
shadow: sm (default), md (elevated)

// Button anatomy
padding: 24px horizontal, 12px vertical
border-radius: 12px (md)
height: 48px
icon-size: 20px
```

---

## 🔤 Text Hierarchy

```
Page Title       → 36px, bold     (xxxl)
Section Heading  → 28px, semibold (xxl)
Card Title       → 18px, semibold (lg)
Body Text        → 16px, regular  (md)
Secondary Text   → 14px, regular  (sm)
Caption          → 12px, medium   (xs)
```

---

## ♿ Accessibility Checklist

```
✅ Minimum font size: 14px
✅ Touch targets: 48x48px
✅ Text contrast: 4.5:1 (WCAG AA)
✅ accessibilityLabel on all interactive elements
✅ accessibilityRole defined
✅ Support for screen readers
✅ Support for reduced motion
✅ Support for dynamic type
```

---

## 🎬 Common Animation Patterns

### Button Press
```typescript
// Press down (100ms)
scale: 1 → 0.96

// Release (200ms, spring)
scale: 0.96 → 1
```

### Card Entrance
```typescript
// From (0ms)
opacity: 0, scale: 0.9

// To (300ms)
opacity: 1, scale: 1
```

### Screen Transition
```typescript
// From (0ms)
opacity: 0, translateX: 30

// To (400ms)
opacity: 1, translateX: 0
```

---

## 🛠️ Installation Commands

```bash
# Icon library
npm install lucide-react-native

# Animations (optional)
npm install lottie-react-native

# Already in Expo
@expo/vector-icons
react-native-safe-area-context
```

---

## 📦 Import Templates

### Theme
```typescript
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../theme';
```

### Components
```typescript
import { Button, Card, Input, TopNav } from '../components';
```

### Icons (Lucide)
```typescript
import { Calendar, Users, Trophy } from 'lucide-react-native';

<Calendar color={Colors.primary} size={24} />
```

---

## 🎨 Gradient Backgrounds

```typescript
// Hero button gradient
colors: [Colors.primary, Colors.primaryDark]
start: { x: 0, y: 0 }
end: { x: 1, y: 1 }

// Profile header gradient
colors: [Colors.primarySurface, Colors.background]
start: { x: 0, y: 0 }
end: { x: 0, y: 1 }
```

---

## 📊 Component State Colors

### Button
```typescript
default:  background: primary
pressed:  background: primaryDark
disabled: opacity: 0.4
outline:  border: primary, background: transparent
```

### Input
```typescript
default:  border: border (1px)
focused:  border: primary (2px), shadow: sm
error:    border: error (2px)
```

### Card
```typescript
default:  shadow: sm
pressed:  shadow: md, scale: 0.98
joined:   background: primarySurface, border: primaryLight
```

---

## 🎯 z-index Layers

```
Base (0):        Regular content
Elevated (1):    Cards with shadow sm
Floating (2):    Cards with shadow md
Sticky (10):     Top nav, tab bar
Overlay (100):   Modals, bottom sheets
Toast (9999):    Notifications
```

---

## 📱 Responsive Breakpoints

```
Phone:        < 600px  (2-column grid)
Tablet:       600-900px (3-column, max-width: 600px)
Large Tablet: > 900px   (4-column, max-width: 800px)
```

---

## 🔧 Performance Tips

```
✅ Use useNativeDriver: true (transform/opacity only)
✅ Use FlatList for long lists
✅ Memoize static components (React.memo)
✅ Lazy load illustrations
✅ Remove clipped subviews on FlatList
✅ Debounce scroll listeners
❌ Never animate layout properties (width, height, padding)
```

---

## 🎨 Sport Icon Colors (Optional)

```typescript
basketball: '#FFDAB9',  // Peach puff
volleyball: '#E6E6FA',  // Lavender
football:   '#B0E0E6',  // Powder blue
tennis:     '#F0E68C',  // Khaki yellow
golf:       '#98FB98',  // Pale green
```

---

## 📝 Screen Padding Template

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg, // 16px
  },
});
```

---

## 🔔 Toast Color Guide

```typescript
success: background: secondary (#B8E6D5)
error:   background: error (#FFB8B8)
info:    background: primary (#A8B5F5)
warning: background: warning (#FFE4C4)
```

---

## 🎭 Micro-interaction Checklist

```
✅ Button press → scale down (100ms)
✅ Button release → spring back (200ms)
✅ Card tap → scale to 0.98
✅ Card enter → fade + scale from 0.9
✅ Input focus → scale 1.02 + shadow
✅ Toggle switch → slide animation (200ms)
✅ Modal open → scale from 0.9 + fade
✅ Screen enter → slide from right + fade
```

---

## 📚 Document Map

```
DESIGN_SYSTEM.md           → Full style guide (colors, typography, etc.)
IMPLEMENTATION_EXAMPLES.md → React Native code (copy-paste ready)
VISUAL_MOCKUPS.md          → Screen descriptions (ASCII mockups)
REDESIGN_SUMMARY.md        → Executive summary (project overview)
DESIGN_QUICK_REFERENCE.md  → This file (quick values)
```

---

## 🚀 Implementation Order

```
1. Update theme/index.ts (colors, spacing, typography)
2. Create Button component (with animation)
3. Create Card component (with press feedback)
4. Create Input component (with focus states)
5. Create TopNav component (with safe area)
6. Redesign Dashboard screen (most visible)
7. Redesign Post Game screen (wizard flow)
8. Redesign Game Detail screen (tabbed modal)
9. Redesign Profile screen (cards layout)
10. Redesign My Games screen (segmented tabs)
11. Polish animations and transitions
12. Accessibility audit
```

---

## 💡 Common Pitfalls to Avoid

```
❌ Hardcoding colors (use theme constants)
❌ Inconsistent spacing (use theme values)
❌ Animating layout properties (use transform/opacity)
❌ Forgetting useNativeDriver: true
❌ Using map() for long lists (use FlatList)
❌ Not testing on real devices
❌ Ignoring accessibility labels
❌ Not supporting reduced motion
```

---

## 🎯 Testing Checklist

```
✅ Test on iOS device
✅ Test on Android device
✅ Test with VoiceOver (iOS)
✅ Test with TalkBack (Android)
✅ Test with reduced motion enabled
✅ Test with large text size
✅ Test network error states
✅ Test empty states
✅ Test loading states
✅ Test with slow animations (10x slower)
```

---

**Quick Tip:** Bookmark this page in your browser or pin it in your IDE for instant access to all design values while coding!

---

**Version:** 1.0
**Last Updated:** November 2025
**Target Platform:** React Native (iOS + Android)

