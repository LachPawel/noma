"use client";

import React from "react";

interface DebugModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export default function DebugModal({ isOpen, title, message, onClose }: DebugModalProps) {
  console.log('DebugModal render:', { isOpen, title, message });
  
  if (!isOpen) {
    console.log('DebugModal not open, returning null');
    return null;
  }

  console.log('DebugModal should be visible now!');

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 0, 0, 0.8)', // Red background to make it super obvious
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        fontSize: '24px',
        color: 'white',
        fontWeight: 'bold'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'black',
          padding: '40px',
          border: '4px solid white',
          textAlign: 'center' as const,
          maxWidth: '500px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginBottom: '20px' }}>{title}</h2>
        <p style={{ marginBottom: '20px' }}>{message}</p>
        <button 
          onClick={onClose}
          style={{
            backgroundColor: 'white',
            color: 'black',
            padding: '10px 20px',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}