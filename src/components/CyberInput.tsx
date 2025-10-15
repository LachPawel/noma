'use client';

import React from 'react';

interface CyberInputProps {
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  maxLength?: number;
  step?: string;
}

export default function CyberInput({
  type = 'text',
  value,
  onChange,
  placeholder,
  label,
  disabled = false,
  className = '',
  maxLength,
  step
}: CyberInputProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium mb-2 text-gray-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        step={step}
        className="
          w-full px-4 py-3 
          bg-black/50 
          border border-gray-800 
          rounded-lg 
          focus:outline-none 
          focus:border-[#70ec9f] 
          focus:ring-2 
          focus:ring-[#70ec9f]/20
          text-white 
          placeholder-gray-600
          transition-all duration-300
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      />
    </div>
  );
}
