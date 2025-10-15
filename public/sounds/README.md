# Sound Effects Setup

This folder contains sound effects for the application.

## Required Sound Files

You need to add sound files to this directory. Supported formats: **WAV** or **MP3**

1. **click.wav** or **click.mp3** - Button click sound (sci-fi computer beep)
2. **success.wav** or **success.mp3** - Success confirmation sound
3. **error.wav** or **error.mp3** - Error alert sound
4. **hover.wav** or **hover.mp3** - Hover/rollover sound (optional, subtle)

The app will automatically detect which format you have!

## Where to Get Free Sci-Fi Sounds

### Recommended Sources:

1. **Freesound.org** (Free, requires attribution)
   - https://freesound.org/search/?q=sci-fi+click
   - https://freesound.org/search/?q=computer+beep
   - Search terms: "sci-fi click", "computer beep", "futuristic button"

2. **Zapsplat** (Free for personal/commercial use)
   - https://www.zapsplat.com/sound-effect-category/user-interface/
   - Great UI sounds including sci-fi clicks

3. **Mixkit** (Royalty-free)
   - https://mixkit.co/free-sound-effects/click/
   - Clean, modern click sounds

4. **Pixabay** (Free, no attribution required)
   - https://pixabay.com/sound-effects/search/sci-fi/
   - Various sci-fi sound effects

## Recommended Sounds to Download:

### Quick Start (Copy these URLs into your browser):

**Click Sound:**
- Freesound: https://freesound.org/people/original_sound/sounds/366102/ (UI Click)
- Freesound: https://freesound.org/people/plasterbrain/sounds/242857/ (Sci-fi Click)

**Success Sound:**
- Freesound: https://freesound.org/people/shinephoenixstormcrow/sounds/337049/ (Success)

**Error Sound:**
- Freesound: https://freesound.org/people/distillerystudio/sounds/327736/ (Error Beep)

**Hover Sound:**
- Freesound: https://freesound.org/people/InspectorJ/sounds/410804/ (Subtle Beep)

## File Format
- Format: **WAV** or **MP3** (both supported)
- Duration: < 1 second recommended
- Volume: Keep original, volume is controlled in code (default 0.3)
- The app tries WAV first, then MP3, then falls back to synthetic beeps

## Testing Sounds

After adding the sounds, refresh your browser and click any button to hear the effect.

## Volume Control

Default volume is set to 0.3 (30%). You can adjust in the component:
\`\`\`tsx
sound.play('click', 0.5); // 50% volume
\`\`\`
