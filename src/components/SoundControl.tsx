'use client';

import { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SoundControl() {
  const [isMuted, setIsMuted] = useState(false);
  const [showControl, setShowControl] = useState(false);

  useEffect(() => {
    // Load mute preference from localStorage
    const savedMute = localStorage.getItem('ambient-sound-muted');
    if (savedMute === 'true') {
      setIsMuted(true);
      // Mute any playing audio
      const audioElements = document.querySelectorAll('audio');
      audioElements.forEach(audio => {
        audio.muted = true;
      });
    }
  }, []);

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    localStorage.setItem('ambient-sound-muted', String(newMutedState));

    // Mute/unmute all audio elements
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.muted = newMutedState;
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
        className="glass glow-border rounded-full p-3 backdrop-blur-md hover:bg-white/5 transition-all"
        aria-label={isMuted ? 'Unmute ambient sound' : 'Mute ambient sound'}
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5 text-gray-400" />
        ) : (
          <Volume2 className="w-5 h-5 text-[#70ec9f]" />
        )}
      </motion.button>

      <AnimatePresence>
        {showControl && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full right-0 mb-2 glass-strong rounded-lg px-3 py-2 whitespace-nowrap"
          >
            <p className="text-xs text-gray-400">
              {isMuted ? 'Ambient sound muted' : 'Ambient sound playing'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
