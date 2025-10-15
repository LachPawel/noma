'use client';

import React, { useState, useEffect } from 'react';
import { Wallet, EyeOff, TrendingUp, Send, Shield, Banknote, Loader2 } from 'lucide-react';

export default function AnonNeobankUI() {
  const [step, setStep] = useState('landing');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [userState, setUserState] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [yieldEarned, setYieldEarned] = useState(0);
  const [transferAmount, setTransferAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateAccount = async () => {
    if (!email) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', email })
      });

      if (!response.ok) throw new Error('Failed to create account');
      
      const data = await response.json();
      setUserData(data);
      setStep('verify-otp');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || !userData) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          otpCode: otp,
          user: userData.user,
          sessionSecrets: userData.sessionSecrets,
          email: userData.email
        })
      });

      if (!response.ok) throw new Error('OTP verification failed');
      
      const result = await response.json();
      setUserState(result);
      setStep('dashboard');
      loadBalances(result.address);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadBalances = async (address: string) => {
    try {
      const response = await fetch(`/api/account?address=${address}`);
      const data = await response.json();
      setBalance(data.sol || 0);
      // Mock yield for demo
      setYieldEarned(12.45);
    } catch (err) {
      console.error('Failed to load balances:', err);
    }
  };

  const handleTransfer = async () => {
    if (!transferAmount || !recipient || !userState) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'transfer',
          userState,
          recipient,
          amount: parseFloat(transferAmount) * 1_000_000,
          mint: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
          usePrivacy: false
        })
      });

      const result = await response.json();
      if (result.signature) {
        alert('Transfer successful! Signature: ' + result.signature);
        setTransferAmount('');
        setRecipient('');
        loadBalances(userState.address);
      } else {
        throw new Error(result.error || 'Transfer failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-8">
              <Shield className="w-16 h-16 text-purple-400" />
            </div>
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Anonbank
            </h1>
            <p className="text-2xl text-gray-300 mb-4">
              Financial freedom. Built for privacy.
            </p>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Earn yield on stablecoins while maintaining complete financial privacy. 
              No surveillance. No tracking. Just you and your money.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
              <TrendingUp className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-bold mb-3">Earn Yield</h3>
              <p className="text-gray-400">
                Your stablecoins automatically earn yield through DeFi strategies.
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
              <Shield className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-bold mb-3">Private Transfers</h3>
              <p className="text-gray-400">
                Anonymous transfers with cryptographic privacy. <span className="text-purple-400">Coming Soon</span>
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
              <Banknote className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-bold mb-3">No Bank Required</h3>
              <p className="text-gray-400">
                Open an account in minutes with just email. No KYC required.
              </p>
            </div>
          </div>

          <div className="max-w-md mx-auto bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
            <h2 className="text-2xl font-bold mb-6 text-center">Get Started</h2>
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="your@email.com"
                  disabled={loading}
                />
              </div>
              <button
                onClick={handleCreateAccount}
                disabled={loading || !email}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Anonymous Account'}
              </button>
              <p className="text-xs text-gray-500 text-center">
                By creating an account, you agree to our privacy-first principles
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'verify-otp') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white flex items-center justify-center">
        <div className="max-w-md w-full mx-4 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
          <h2 className="text-2xl font-bold mb-6 text-center">Verify Your Email</h2>
          <p className="text-gray-400 mb-6 text-center">
            We've sent a 6-digit code to <span className="text-purple-400">{email}</span>
          </p>
          <p className="text-sm text-yellow-400 mb-6 text-center">
            Check spam folder. May take 1-2 minutes.
          </p>
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Enter OTP Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                disabled={loading}
              />
            </div>
            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length !== 6}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Create Account'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'dashboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
        <nav className="border-b border-gray-800 backdrop-blur-sm bg-gray-900/50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-purple-400" />
              <span className="text-xl font-bold">Anonbank</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">{userState?.address.slice(0, 8)}...</span>
              <Wallet className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-purple-100 text-sm mb-2">Total Balance</p>
                  <h2 className="text-5xl font-bold">${balance.toFixed(2)}</h2>
                  <p className="text-purple-100 text-sm mt-2">USDC+</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-purple-100 text-sm">Yield Earned (24h)</span>
                  <span className="text-white font-bold text-lg">+${yieldEarned.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-purple-100 text-sm">APY</span>
                  <span className="text-green-300 font-semibold">~8.5%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
              <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <Send className="w-6 h-6 text-purple-400" />
                <span>Send Money</span>
              </h3>
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Amount (USDC)</label>
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                    placeholder="0.00"
                    step="0.01"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Recipient Address</label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                    placeholder="Wallet address..."
                    disabled={loading}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                  <div className="flex items-center space-x-3">
                    <EyeOff className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-sm text-gray-400">Private Transfer</p>
                      <p className="text-xs text-purple-400">Coming Soon - Umbra Integration</p>
                    </div>
                  </div>
                  <div className="bg-gray-700 px-3 py-1 rounded-full text-xs">
                    Q1 2025
                  </div>
                </div>
                <button
                  onClick={handleTransfer}
                  disabled={loading || !transferAmount || !recipient}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Transfer'}
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto mt-8 bg-purple-900/30 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-purple-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Privacy Features Coming Soon</p>
                <p className="text-xs text-gray-400 mt-1">
                  Umbra integration will enable cryptographic stealth addresses for completely anonymous transfers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}