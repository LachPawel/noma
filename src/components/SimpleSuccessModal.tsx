"use client";

import React from "react";
import { CheckCircle, X, ExternalLink, Copy } from "lucide-react";

interface SimpleSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  details?: string;
  txHash?: string;
  amount?: string;
  currency?: string;
  fromCurrency?: string;
  toCurrency?: string;
  type: 'transfer' | 'convert' | 'swap' | 'redeem';
}

export default function SimpleSuccessModal({
  isOpen,
  onClose,
  title,
  message,
  details,
  txHash,
  amount,
  currency,
  fromCurrency,
  toCurrency,
  type
}: SimpleSuccessModalProps) {
  const [copied, setCopied] = React.useState(false);

  const copyTxHash = () => {
    if (txHash) {
      navigator.clipboard.writeText(txHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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

  const getTypeIcon = () => {
    return <CheckCircle className={`w-12 h-12 ${getTypeColor()}`} />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center" style={{ zIndex: 99999 }}>
      <div className="max-w-md w-[95vw] bg-black border-4 border-white/30 p-0 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 text-white/70 hover:text-white transition-colors bg-black/80 border border-white/30 p-2 rounded-sm"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-black to-black"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(34,197,94,0.1),transparent_50%)]"></div>

        {/* Content */}
        <div className="relative p-6 pt-8">
          {/* Success icon */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 animate-ping">
                {getTypeIcon()}
              </div>
              {getTypeIcon()}
            </div>
          </div>

          {/* Title */}
          <h2 
            className="text-white text-xl font-black uppercase tracking-[0.2em] text-center mb-2"
            style={{ fontFamily: 'Anton, sans-serif' }}
          >
            {title}
          </h2>

          {/* Message */}
          <p className="text-white/80 text-sm font-mono text-center mb-6 leading-relaxed">
            {message}
          </p>

          {/* Transaction details */}
          {(amount || fromCurrency || toCurrency) && (
            <div className="bg-white/5 border border-white/20 rounded-sm p-4 mb-4 space-y-2">
              {amount && currency && (
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-xs font-mono uppercase">Amount:</span>
                  <span className="text-white font-bold font-mono">{amount} {currency}</span>
                </div>
              )}
              {fromCurrency && toCurrency && (
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-xs font-mono uppercase">Swap:</span>
                  <span className="text-white font-bold font-mono">{fromCurrency} → {toCurrency}</span>
                </div>
              )}
              {details && (
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-xs font-mono uppercase">Details:</span>
                  <span className="text-white font-bold font-mono text-right text-xs">{details}</span>
                </div>
              )}
            </div>
          )}

          {/* Transaction hash */}
          {txHash && (
            <div className="bg-white/5 border border-white/20 rounded-sm p-3 mb-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-white/60 text-xs font-mono uppercase mb-1">Transaction Hash:</div>
                  <div className="text-white font-mono text-xs break-all">{txHash}</div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={copyTxHash}
                    className="text-white/60 hover:text-white transition-colors p-1"
                    title="Copy transaction hash"
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => window.open(`https://solscan.io/tx/${txHash}`, '_blank')}
                    className="text-white/60 hover:text-white transition-colors p-1"
                    title="View on Solscan"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action button */}
          <button
            onClick={onClose}
            className="w-full brutal-btn-primary px-6 py-3 text-sm font-black uppercase tracking-[0.2em]"
          >
            {'>'} CONTINUE
          </button>

          {/* Demo indicator */}
          <div className="text-center mt-3">
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