# 🎵 Ambient Drone Sound Implementation

## ✅ What's Been Added

Your AnonBank app now has an **ambient drone sound** that plays continuously in the background!

## 🎼 Features

### 1. **Smooth Fade In/Out**
- **Fade In**: 3 seconds smooth fade when page loads
- **Fade Out**: 2 seconds smooth fade when page closes
- Uses smoothstep easing for natural audio transitions

### 2. **Continuous Loop**
- Plays `drone.wav` on infinite loop
- Seamless looping without gaps
- Runs across all pages (Landing, Dashboard, OTP verification)

### 3. **Auto-Start with Fallback**
- Tries to autoplay when page loads
- If browser blocks autoplay, starts on first user interaction (click/keypress)
- Completely automatic - no user action needed after first click

### 4. **Volume Control**
- **Default volume**: 15% (0.15) - subtle background atmosphere
- **Mute/Unmute button**: Fixed in bottom-right corner
- **Persistent**: Mute preference saved in localStorage
- **Visual feedback**: Green icon when playing, gray when muted

## 🎚️ Sound Control Button

Located in the bottom-right corner:
- 🔊 **Green speaker icon** = Playing
- 🔇 **Gray muted icon** = Muted
- Hover to see status tooltip
- Click to toggle mute/unmute
- Preference persists across page reloads

## ⚙️ Configuration

Want to adjust the settings? Edit `/src/app/layout.tsx`:

```tsx
<AmbientSound 
  volume={0.15}           // 0.0 to 1.0 (15% default)
  fadeInDuration={3000}   // milliseconds (3 seconds)
  fadeOutDuration={2000}  // milliseconds (2 seconds)
  playbackRate={0.2}      // 0.2 = 5x slower, 1.0 = normal speed
/>
```

### Volume Recommendations:
- **0.10** - Very subtle, barely noticeable
- **0.15** - Default, present but not intrusive
- **0.20** - More prominent atmosphere
- **0.30** - Bold, immersive experience

### Fade Duration Tips:
- **Fade In**: 2-5 seconds (smooth entry)
- **Fade Out**: 1-3 seconds (graceful exit)
- Longer = more gradual, shorter = more immediate

### Playback Rate (Speed):
- **0.1** - 10x slower (very deep, stretched)
- **0.2** - 5x slower (default, deep ambient)
- **0.5** - 2x slower (slower but recognizable)
- **1.0** - Normal speed (original sound)
- **2.0** - 2x faster (higher pitch, energetic)

**Note**: Your 2-second drone is now effectively 10 seconds long at 0.2 speed!

## 🎨 How It Works

1. **On Page Load**: 
   - Drone starts at 0% volume
   - Smoothly fades to 15% over 3 seconds
   - Plays continuously in loop

2. **On Page Close**:
   - Volume fades from 15% to 0% over 2 seconds
   - Audio stops gracefully

3. **User Control**:
   - Click mute button to instantly silence
   - Click again to fade back in
   - Preference saved automatically

## 🔧 Your Files

You now have:
- ✅ `click.wav` - Button clicks
- ✅ `success.wav` - Success sounds
- ✅ `error.wav` - Error alerts  
- ✅ `drone.wav` - **Ambient background (looping)**

All working perfectly! 🎉

## 🎭 Customization Ideas

### Change the Drone Sound
Replace `/public/sounds/drone.wav` with any ambient sound:
- Space atmosphere
- Computer hum
- Synthesizer pad
- White noise
- Sci-fi ambience

### Multiple Drones
Want layered atmosphere? Edit `AmbientSound.tsx` to play multiple files:
```tsx
const audio1 = new Audio('/sounds/drone.wav');
const audio2 = new Audio('/sounds/drone2.wav');
```

### Disable on Specific Pages
Wrap the component with a condition in layout.tsx

### Add Visual Audio Visualizer
Could add animated waveforms synced to the drone!

## 🐛 Troubleshooting

### Drone doesn't autoplay?
- Browser autoplay policies require user interaction first
- Click anywhere on the page - it will start
- This is normal browser behavior for audio

### Volume too loud/quiet?
- Adjust the `volume` prop in layout.tsx
- Or use the mute button for quick silence

### Want to remove it?
Just comment out these lines in `/src/app/layout.tsx`:
```tsx
// <AmbientSound ... />
// <SoundControl />
```

## 🎼 Technical Details

- **Component**: `/src/components/AmbientSound.tsx`
- **Control**: `/src/components/SoundControl.tsx`
- **Placement**: Root layout (plays everywhere)
- **Memory**: Properly cleaned up on unmount
- **Performance**: Uses requestAnimationFrame for smooth fades

---

**Your cyberpunk atmosphere is now complete! 🚀🎵**

Try it out - refresh the page and listen for the smooth fade in!
