# 🔊 Sound Effects Implementation Guide

## ✅ What's Been Added

Your AnonBank app now has sound effects! Here's what's implemented:

### 1. Sound System
- **Custom Hook**: `useSound()` hook for playing sounds
- **Fallback System**: If sound files aren't found, synthetic beeps play automatically
- **CyberButton Integration**: All buttons now play sounds on click and hover

### 2. Sound Types
- **Click** - Main button click (800Hz beep)
- **Hover** - Subtle hover sound (1000Hz, very quiet)
- **Success** - Success confirmation (600Hz)
- **Error** - Error alert (400Hz)

## 🎵 The Sounds Work Right Now!

Even without MP3 files, the app will play synthetic sci-fi beeps using the Web Audio API. Try clicking any button!

## 🎨 How to Add Real Sound Files

### Quick Start (5 minutes)

1. **Download from Freesound** (Free, requires account):
   - Go to: https://freesound.org/
   - Create a free account
   - Download these sounds:

#### Recommended Sounds:

**Click Sound** (Pick one):
- https://freesound.org/people/plasterbrain/sounds/242857/ (Sci-fi UI Click)
- https://freesound.org/people/LittleRobotSoundFactory/sounds/270303/ (Retro Click)
- https://freesound.org/people/fins/sounds/146718/ (Computer Beep)

**Hover Sound** (Very subtle):
- https://freesound.org/people/Jagadamba/sounds/257813/ (Soft Blip)
- https://freesound.org/people/deleted_user_7146007/sounds/383251/ (Minimal Beep)

**Success Sound**:
- https://freesound.org/people/shinephoenixstormcrow/sounds/337049/ (Success Chime)
- https://freesound.org/people/LittleRobotSoundFactory/sounds/270467/ (Powerup)

**Error Sound**:
- https://freesound.org/people/distillerystudio/sounds/327736/ (Error Alert)
- https://freesound.org/people/Breviceps/sounds/445978/ (Warning Beep)

2. **Save Files**:
   - Convert to MP3 if needed (use online converters like cloudconvert.com)
   - Rename files to: `click.mp3`, `hover.mp3`, `success.mp3`, `error.mp3`
   - Place in: `/public/sounds/` folder

3. **Refresh Browser** - Sounds will automatically load!

### Alternative: Use Zapsplat (No Account Needed)

1. Go to: https://www.zapsplat.com/
2. Search for "sci-fi button click"
3. Download and rename as above

### Alternative: Quick Download Links

If you want to skip registration, use these royalty-free sounds:

**Mixkit** (Direct download, no signup):
- https://mixkit.co/free-sound-effects/click/
- Look for "Button click" or "Interface click"

**Pixabay** (No attribution required):
- https://pixabay.com/sound-effects/search/ui/
- Search "button click" or "beep"

## 🎛️ Customization

### Adjust Volume

In your component:
\`\`\`tsx
sound.play('click', 0.5); // 50% volume (default is 30%)
\`\`\`

### Disable Sound on Specific Buttons

\`\`\`tsx
<CyberButton 
  onClick={handleClick}
  playSound={false}
>
  Silent Button
</CyberButton>
\`\`\`

### Change Synthetic Sound Frequencies

Edit `/src/hooks/useSound.ts`:
\`\`\`tsx
const syntheticSounds = {
  click: { frequency: 1200, duration: 0.05 },  // Higher pitch
  hover: { frequency: 800, duration: 0.03 },   // Lower pitch
  // ...
};
\`\`\`

## 🎯 Where Sounds Play

- **All CyberButtons** - Click sound on press, subtle hover sound on mouseover
- **Works with**: Login, Sign Up, Verify OTP, Send Money, Convert to Yield, etc.

## 🐛 Troubleshooting

### Sounds Don't Play
1. **Browser Autoplay Policy**: Modern browsers block audio until user interaction. The first click might be silent.
2. **Check Browser Console**: Look for any errors
3. **Test Synthetic Sounds**: They should work immediately without files

### Sound Files Not Loading
1. Make sure files are in `/public/sounds/`
2. File names must be exact: `click.mp3`, `hover.mp3`, etc.
3. Hard refresh browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

### Sounds Too Loud/Quiet
- Adjust volume in the play() call
- Or edit the source MP3 files with audio software

## 🔥 Pro Tips

1. **Keep it subtle**: Hover sounds should be very quiet (0.1 volume)
2. **Short duration**: Best sounds are < 0.5 seconds
3. **Test on mobile**: Sounds may not play on iOS Safari without user gesture
4. **MP3 format**: Best compatibility across all browsers

## 🎬 Next Steps

1. Download your favorite sci-fi click sound
2. Add it to `/public/sounds/click.mp3`
3. Enjoy! The app will automatically use it instead of synthetic beeps

## 📝 License Note

If using sounds from Freesound, check the license:
- CC0 (Public Domain) - Use freely
- CC-BY - Requires attribution
- Add attributions to your footer or about page

---

**Your app is already playing synthetic beeps! Add MP3 files to make it even better! 🚀**
