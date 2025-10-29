'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const STORAGE_KEY = 'ambient-sound-muted-v2';

const getStoredMutePreference = () => {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(STORAGE_KEY) === 'true';
};

export default function SoundControl() {
  const [isMuted, setIsMuted] = useState<boolean>(getStoredMutePreference);
  const [showControl, setShowControl] = useState(false);
  const isMutedRef = useRef(isMuted);

  const applyMuteState = useCallback((mute: boolean) => {
    if (typeof window === 'undefined') return;

    window.localStorage.setItem(STORAGE_KEY, String(mute));
    const audioElements = document.querySelectorAll('audio');

    audioElements.forEach((element) => {
      const audio = element as HTMLAudioElement;
      audio.muted = mute;

      if (!mute && audio.paused) {
        void audio.play().catch(() => {
          // Ignore autoplay rejections; AmbientSound will retry on interaction.
        });
      }
    });

    window.dispatchEvent(
      new CustomEvent('ambient-sound:mute', {
        detail: { muted: mute },
      }),
    );
  }, []);

  useEffect(() => {
    applyMuteState(isMutedRef.current);
  }, [applyMuteState]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleAddedAudio = (node: Node) => {
      if (node instanceof HTMLAudioElement) {
        node.muted = isMutedRef.current;
        if (!isMutedRef.current && node.paused) {
          void node.play().catch(() => undefined);
        }
      } else if (node instanceof HTMLElement) {
        node.querySelectorAll('audio').forEach((element) => {
          const audio = element as HTMLAudioElement;
          audio.muted = isMutedRef.current;
          if (!isMutedRef.current && audio.paused) {
            void audio.play().catch(() => undefined);
          }
        });
      }
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => handleAddedAudio(node));
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  const toggleMute = () => {
    setIsMuted((previous) => {
      const next = !previous;
      applyMuteState(next);
      return next;
    });
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50"
      onMouseEnter={() => setShowControl(true)}
      onMouseLeave={() => setShowControl(false)}
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleMute}
        aria-label={isMuted ? 'Unmute ambient sound' : 'Mute ambient sound'}
        aria-pressed={!isMuted}
        className={clsx(
          'rounded-full border p-3 backdrop-blur-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80',
          'glass glow-border',
          isMuted
            ? 'border-white/15 text-gray-400 hover:bg-white/5'
            : 'border-white/60 bg-white/10 text-white shadow-[0_0_18px_rgba(255,255,255,0.45)] hover:bg-white/15'
        )}
      >
        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </motion.button>

      <AnimatePresence>
        {showControl && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full right-0 mb-2 glass-strong rounded-lg px-3 py-2 whitespace-nowrap"
          >
            <p className="text-xs text-white/80">
              {isMuted ? 'Ambient sound muted' : 'Ambient sound active'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
