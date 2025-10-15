'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useSound } from '@/hooks/useSound';

interface CyberButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  playSound?: boolean;
}

export default function CyberButton({ 
  children, 
  onClick, 
  disabled = false,
  loading = false,
  variant = 'primary',
  className = '',
  type = 'button',
  playSound = true
}: CyberButtonProps) {
  const sound = useSound();

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'cyber-button text-black font-semibold';
      case 'secondary':
        return 'bg-gray-800 text-white border border-gray-700 hover:border-[#70ec9f] font-semibold';
      case 'outline':
        return 'bg-transparent text-[#70ec9f] border-2 border-[#70ec9f] hover:bg-[#70ec9f] hover:text-black font-semibold';
      default:
        return 'cyber-button text-black font-semibold';
    }
  };

  const handleClick = () => {
    if (playSound && !disabled && !loading) {
      sound.play('click');
    }
    if (onClick) {
      onClick();
    }
  };

  const handleMouseEnter = () => {
    if (playSound && !disabled && !loading) {
      sound.play('hover', 0.1);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      disabled={disabled || loading}
      type={type}
      className={`
        ${getVariantClasses()} 
        px-6 py-3 rounded-lg 
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center space-x-2
        ${className}
      `}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        children
      )}
    </motion.button>
  );
}
