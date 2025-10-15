'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: React.ReactNode;
  delay?: number;
}

export default function FeatureCard({ 
  icon: Icon, 
  title, 
  description,
  delay = 0 
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -10 }}
      className="glass glow-border rounded-xl p-8 group cursor-pointer"
    >
      <div className="mb-4 relative">
        <div className="absolute inset-0 bg-[#70ec9f] opacity-0 group-hover:opacity-15 blur-xl transition-opacity duration-300 rounded-full" />
        <Icon className="w-12 h-12 text-[#70ec9f] relative z-10" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-bold mb-3 text-white group-hover:text-[#70ec9f] transition-colors">
        {title}
      </h3>
      <div className="text-gray-400 leading-relaxed">
        {description}
      </div>
    </motion.div>
  );
}
