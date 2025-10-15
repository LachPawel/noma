'use client';

import { useCallback } from 'react';

type SoundType = 'click' | 'success' | 'error' | 'hover';

const sounds: Record<SoundType, string[]> = {
  click: ['/sounds/click.wav', '/sounds/click.mp3'],
  success: ['/sounds/success.wav', '/sounds/success.mp3'],
  error: ['/sounds/error.wav', '/sounds/error.mp3'],
  hover: ['/sounds/hover.wav', '/sounds/hover.mp3'],
};

// Note: drone.wav is handled separately by the AmbientSound component for looping

// Fallback: Generate synthetic beep sounds using Web Audio API
function playSyntheticBeep(frequency: number, duration: number, volume: number) {
  if (typeof window === 'undefined' || !window.AudioContext) return;
  
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    console.log('Error generating synthetic sound:', error);
  }
}

const syntheticSounds: Record<SoundType, { frequency: number; duration: number }> = {
  click: { frequency: 800, duration: 0.05 },
  success: { frequency: 600, duration: 0.1 },
  error: { frequency: 400, duration: 0.15 },
  hover: { frequency: 1000, duration: 0.03 },
};

export function useSound() {
  const play = useCallback((type: SoundType, volume: number = 0.3) => {
    const soundFiles = sounds[type];
    let played = false;

    // Try each sound file format in order
    for (const soundFile of soundFiles) {
      try {
        const audio = new Audio(soundFile);
        audio.volume = volume;
        
        // Try to play the audio file
        audio.play().then(() => {
          played = true;
        }).catch(() => {
          // Continue to next format or fallback
        });
        
        // If we successfully created the Audio object, break
        if (audio) break;
      } catch {
        // Try next format
        continue;
      }
    }

    // If no audio file played, use synthetic beep as fallback
    if (!played) {
      setTimeout(() => {
        const synth = syntheticSounds[type];
        playSyntheticBeep(synth.frequency, synth.duration, volume);
      }, 50);
    }
  }, []);

  return { play };
}
