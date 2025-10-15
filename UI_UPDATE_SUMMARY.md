# AnonBank UI Update Summary

## Changes Made

### 1. Background Effect
- **Replaced**: Canvas-based particle animation with animated SVG paths
- **New Component**: `BackgroundPaths` from 21st.dev design patterns
- **Style**: Minimalistic flowing lines that subtly animate
- **Opacity**: Reduced to 40% for a more subtle effect
- **Animation**: Slower, smoother transitions (25-40 seconds)

### 2. Color Scheme Update
**Old Color**: `#a3ff12` (Bright neon green)
**New Color**: `#70ec9f` (Soft mint green)

Updated in:
- All text colors
- Border colors
- Button gradients
- Icon colors
- Glow effects
- Focus states
- Hover effects
- CSS animations

### 3. Visual Effects Removed/Minimized
- ❌ Removed: Neon text glow effects
- ❌ Removed: Intense box shadows
- ❌ Removed: Bright radial gradients in background
- ❌ Removed: Scanline overlay effect
- ✅ Kept (minimized): Subtle glass morphism
- ✅ Kept (minimized): Gentle pulse animations
- ✅ Kept (minimized): Soft hover effects

### 4. Component Updates

#### CyberBackground.tsx
- Uses animated SVG paths instead of canvas particles
- 24 paths (reduced from 36) for cleaner look
- Lower opacity (0.03-0.15 vs 0.05-0.4)
- Slower animation timing
- Color: #70ec9f

#### globals.css
- Minimalistic glass effect (reduced blur, softer shadows)
- Simple button style (no clip-path, subtle shadow)
- Subtle grid animation (opacity reduced to 0.02)
- Gentle pulse glow (reduced intensity)
- Clean scrollbar with new color

#### All Components
- Updated focus states to use softer green
- Reduced hover effect intensity
- Cleaner, more modern aesthetic

### 5. New Dependencies Installed
- `@radix-ui/react-slot` - For button composition
- `class-variance-authority` - For button variants
- `clsx` & `tailwind-merge` - For className utilities
- `framer-motion` - For smooth animations (already installed)

### 6. New Files Created
- `/src/components/ui/button.tsx` - Shadcn button component
- `/src/components/ui/background-paths.tsx` - Animated background
- `/src/lib/utils.ts` - Utility functions for className merging

## Result
The UI now has a:
- ✨ More minimalistic and professional appearance
- 🎨 Softer, easier-on-the-eyes color palette
- 🌊 Subtle flowing background animation
- 💎 Clean glass morphism effects
- 🎯 Better focus on content over effects
