'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'strong';
  hover?: boolean;
  glow?: boolean;
}

export default function GlassCard({ 
  children, 
  className = '', 
  variant = 'default',
  hover = true,
  glow = false
}: GlassCardProps) {
  const baseClass = variant === 'strong' ? 'glass-strong' : 'glass';
  const hoverClass = hover ? 'glow-border' : '';
  const glowClass = glow ? 'pulse-glow' : '';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`${baseClass} ${hoverClass} ${glowClass} rounded-xl p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}
