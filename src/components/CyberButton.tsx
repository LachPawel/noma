'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface CyberButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export default function CyberButton({ 
  children, 
  onClick, 
  disabled = false,
  loading = false,
  variant = 'primary',
  className = '',
  type = 'button'
}: CyberButtonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'cyber-button text-black font-semibold';
      case 'secondary':
        return 'bg-gray-800 text-white border border-gray-700 hover:border-[#a3ff12] font-semibold';
      case 'outline':
        return 'bg-transparent text-[#a3ff12] border-2 border-[#a3ff12] hover:bg-[#a3ff12] hover:text-black font-semibold';
      default:
        return 'cyber-button text-black font-semibold';
    }
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
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
