"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface SimpleLoadingModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'transfer' | 'convert' | 'swap' | 'redeem';
}

export default function SimpleLoadingModal({
  isOpen,
  title,
  message,
  type
}: SimpleLoadingModalProps) {
  const getTypeColor = () => {
    switch (type) {
      case 'transfer':
        return 'text-blue-400';
      case 'convert':
        return 'text-green-400';
      case 'swap':
        return 'text-purple-400';
      case 'redeem':
        return 'text-yellow-400';
      default:
        return 'text-green-400';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center" style={{ zIndex: 99999 }}>
      <div className="max-w-sm w-[90vw] bg-black border-4 border-white/30 p-6 relative">
        {/* Background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 via-black to-black"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent_70%)]"></div>

        {/* Content */}
        <div className="relative">
          {/* Loading spinner */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Loader2 className={`w-12 h-12 ${getTypeColor()} animate-spin`} />
              <div className={`absolute inset-0 w-12 h-12 ${getTypeColor()} animate-pulse opacity-30`}>
                <Loader2 className="w-12 h-12" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 
            className="text-white text-lg font-black uppercase tracking-[0.2em] text-center mb-2"
            style={{ fontFamily: 'Anton, sans-serif' }}
          >
            {title}
          </h2>

          {/* Message */}
          <p className="text-white/70 text-sm font-mono text-center mb-4 leading-relaxed">
            {message}
          </p>

          {/* Processing indicator */}
          <div className="flex justify-center items-center space-x-1 mb-4">
            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>

          {/* Demo indicator */}
          <div className="text-center">
            <span className="text-white/40 text-xs font-mono uppercase tracking-wider">
              ● DEMO MODE ●
            </span>
          </div>
        </div>

        {/* Corner brackets */}
        <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-white/30"></div>
        <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-white/30"></div>
        <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-white/30"></div>
        <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-white/30"></div>
      </div>
    </div>
  );
}