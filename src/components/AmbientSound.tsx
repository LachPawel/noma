'use client';

import { useEffect, useRef } from 'react';

interface AmbientSoundProps {
  volume?: number;
  fadeInDuration?: number;
  fadeOutDuration?: number;
  playbackRate?: number;
}

const STORAGE_KEY = 'ambient-sound-muted-v2';
const AMBIENT_EVENT = 'ambient-sound:mute';

export default function AmbientSound({
  volume = 0.15,
  fadeInDuration = 3000,
  fadeOutDuration = 2000,
  playbackRate = 1.0,
}: AmbientSoundProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeFrameRef = useRef<number | null>(null);
  const interactionHandlerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const audio = new Audio('/sounds/drone.mp3');
    audio.loop = true;
    audio.volume = 0;
    audio.playbackRate = playbackRate;
    audio.preload = 'auto';
    audioRef.current = audio;

    const cancelFade = () => {
      if (fadeFrameRef.current !== null) {
        cancelAnimationFrame(fadeFrameRef.current);
        fadeFrameRef.current = null;
      }
    };

    const fadeTo = (targetVolume: number, duration: number, onComplete?: () => void) => {
      if (!audioRef.current) return;
      cancelFade();

      const startVolume = audioRef.current.volume;
      const startTime = performance.now();

      const step = (now: number) => {
        if (!audioRef.current) return;

        const elapsed = now - startTime;
        const progress = duration === 0 ? 1 : Math.min(elapsed / duration, 1);
        const eased = progress * progress * (3 - 2 * progress);
        audioRef.current.volume = startVolume + (targetVolume - startVolume) * eased;

        if (progress < 1) {
          fadeFrameRef.current = requestAnimationFrame(step);
        } else {
          fadeFrameRef.current = null;
          onComplete?.();
        }
      };

      fadeFrameRef.current = requestAnimationFrame(step);
    };

    const clearInteractionHandlers = () => {
      if (!interactionHandlerRef.current) return;
      document.removeEventListener('pointerdown', interactionHandlerRef.current);
      document.removeEventListener('keydown', interactionHandlerRef.current);
      interactionHandlerRef.current = null;
    };

    const scheduleInteractionStart = () => {
      if (interactionHandlerRef.current) return;

      const handler = () => {
        interactionHandlerRef.current = null;
        void startPlayback(true);
      };

      interactionHandlerRef.current = handler;
      document.addEventListener('pointerdown', handler, { once: true });
      document.addEventListener('keydown', handler, { once: true });
    };

    const startPlayback = async (triggeredByUser = false) => {
      if (!audioRef.current) return;

      clearInteractionHandlers();
      audioRef.current.muted = false;
      audioRef.current.volume = Math.min(audioRef.current.volume, volume);

      try {
        await audioRef.current.play();
        fadeTo(volume, fadeInDuration);
      } catch (error) {
        if (!triggeredByUser) {
          scheduleInteractionStart();
        } else {
          console.log('Failed to play ambient sound:', error);
        }
      }
    };

    const stopPlayback = () => {
      if (!audioRef.current) return;

      clearInteractionHandlers();
      fadeTo(0, fadeOutDuration, () => {
        audioRef.current?.pause();
      });
    };

    const handleMuteChange = (event: Event) => {
      if (!audioRef.current) return;

      const muted = (event as CustomEvent<{ muted: boolean }>).detail.muted;
      audioRef.current.muted = muted;

      if (muted) {
        stopPlayback();
      } else {
        void startPlayback(true);
      }
    };

    const initialMute = (() => {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === null) {
        // First visit - default to playing (not muted)
        window.localStorage.setItem(STORAGE_KEY, 'false');
        return false;
      }
      return stored === 'true';
    })();
    audio.muted = initialMute;

    if (!initialMute) {
      void startPlayback();
    }

    window.addEventListener(AMBIENT_EVENT, handleMuteChange as EventListener);

    return () => {
      window.removeEventListener(AMBIENT_EVENT, handleMuteChange as EventListener);
      cancelFade();
      clearInteractionHandlers();

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.remove();
        audioRef.current = null;
      }
    };
  }, [fadeInDuration, fadeOutDuration, playbackRate, volume]);

  return null;
}
