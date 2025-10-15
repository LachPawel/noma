'use client';

import { useEffect, useRef, useState } from 'react';

interface AmbientSoundProps {
  volume?: number;
  fadeInDuration?: number;
  fadeOutDuration?: number;
  playbackRate?: number;
}

export default function AmbientSound({ 
  volume = 0.15, 
  fadeInDuration = 3000,
  fadeOutDuration = 2000,
  playbackRate = 1.0 
}: AmbientSoundProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Create audio element
    const audio = new Audio('/sounds/drone.mp3');
    audio.loop = true;
    audio.volume = 0; // Start at 0 for fade in
    audio.playbackRate = playbackRate; // Playback speed (1.0 is normal speed)
    audioRef.current = audio;

    // Function to fade in
    const fadeIn = () => {
      if (!audioRef.current) return;
      
      const startTime = Date.now();
      const startVolume = 0;
      const targetVolume = volume;

      const fade = () => {
        if (!audioRef.current) return;
        
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / fadeInDuration, 1);
        
        // Smooth easing function
        const eased = progress * progress * (3 - 2 * progress); // Smoothstep
        audioRef.current.volume = startVolume + (targetVolume - startVolume) * eased;

        if (progress < 1) {
          requestAnimationFrame(fade);
        }
      };

      fade();
    };

    // Try to play (may fail due to browser autoplay policy)
    const playAudio = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
        fadeIn();
      } catch {
        console.log('Autoplay prevented, will start on user interaction');
        
        // Set up one-time event listener for user interaction
        const startOnInteraction = () => {
          audio.play().then(() => {
            setIsPlaying(true);
            fadeIn();
          }).catch(err => console.log('Failed to play:', err));
          
          // Remove listeners after first interaction
          document.removeEventListener('click', startOnInteraction);
          document.removeEventListener('keydown', startOnInteraction);
        };

        document.addEventListener('click', startOnInteraction, { once: true });
        document.addEventListener('keydown', startOnInteraction, { once: true });
      }
    };

    playAudio();

    // Cleanup function with fade out
    return () => {
      if (audioRef.current && isPlaying) {
        const audio = audioRef.current;
        const startTime = Date.now();
        const startVolume = audio.volume;

        const fadeOut = () => {
          if (!audio) return;
          
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / fadeOutDuration, 1);
          
          // Smooth easing function
          const eased = progress * progress * (3 - 2 * progress);
          audio.volume = startVolume * (1 - eased);

          if (progress < 1) {
            requestAnimationFrame(fadeOut);
          } else {
            audio.pause();
            audio.remove();
          }
        };

        fadeOut();
      } else if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.remove();
      }
    };
  }, [volume, fadeInDuration, fadeOutDuration, playbackRate, isPlaying]);

  // This component doesn't render anything visible
  return null;
}
