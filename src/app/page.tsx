'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { VersionedTransaction } from '@solana/web3.js';
import { EyeOff, TrendingUp, Send, Shield, Banknote, Loader2 } from 'lucide-react';

export default function AnonNeobankUI() {
  const { publicKey, signTransaction, connected } = useWallet();
  const [step, setStep] = useState('landing');
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [userState, setUserState] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [yieldEarned, setYieldEarned] = useState(0);
  const [convertAmount, setConvertAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('anonbank_session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        
        // Check if session has expired (7 days = 604800000 ms)
        const sessionAge = Date.now() - (session.timestamp || 0);
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        
        if (sessionAge > maxAge) {
          // Session expired, clear it
          localStorage.removeItem('anonbank_session');
          return;
        }
        
        // Session is valid, restore it
        if (session.userState && session.email) {
          setUserState(session.userState);
          setEmail(session.email);
          setStep('dashboard');
        }
      } catch (err) {
        console.error('Failed to load session:', err);
        localStorage.removeItem('anonbank_session');
      }
    }
  }, []);

  useEffect(() => {
    if (connected && step === 'dashboard') {
      loadBalances();
    }
  }, [connected]);

  const handleCreateAccount = async () => {
    if (!email) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: isLogin ? 'login' : 'create', 
          email 
        })
      });

      if (!response.ok) throw new Error(isLogin ? 'Login failed' : 'Failed to create account');
      
      const data = await response.json();
      setUserData({ ...data, isNewUser: !isLogin });
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
          email: userData.email,
          isNewUser: userData.isNewUser // Pass the flag to determine which flow to use
        })
      });

      if (!response.ok) throw new Error('OTP verification failed');
      
      const result = await response.json();
      setUserState(result);
      setStep('dashboard');
      
      // Save session to localStorage
      localStorage.setItem('anonbank_session', JSON.stringify({
        userState: result,
        email: userData.email,
        timestamp: Date.now()
      }));
      
      await loadBalances();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear session from localStorage
    localStorage.removeItem('anonbank_session');
    // Reset all state
    setUserState(null);
    setUserData(null);
    setEmail('');
    setOtp('');
    setBalance(0);
    setUsdcBalance(0);
    setYieldEarned(0);
    setStep('landing');
    setError('');
  };

  const loadBalances = async () => {
    if (!userState?.address && !publicKey) return;

    try {
      const response = await fetch(`/api/account?address=${userState?.address || publicKey?.toString()}`);
      const data = await response.json();
      setBalance(data.sol || 0);
      
      const usdcToken = data.tokens?.find((t: any) => 
        t.symbol === 'USDC' || t.mint === '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'
      );
      setUsdcBalance(usdcToken?.amount || 0);
      
      setYieldEarned(12.45);
    } catch (err) {
      console.error('Failed to load balances:', err);
    }
  };

  const handleConvertToYield = async () => {
    if (!publicKey || !signTransaction || !convertAmount) {
      setError('Connect wallet to convert to yield-bearing stablecoin');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Request transaction from API
      const response = await fetch('/api/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'convert',
          publicKey: publicKey.toString(),
          amount: parseFloat(convertAmount)
        })
      });

      if (!response.ok) throw new Error('Failed to create conversion transaction');
      
      const { transaction: serializedTx } = await response.json();
      
      // Deserialize and sign the transaction
      const transaction = VersionedTransaction.deserialize(
        Buffer.from(serializedTx, 'base64')
      );
      const signed = await signTransaction(transaction);
      
      // Send transaction back to API for submission
      const submitResponse = await fetch('/api/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit',
          signedTransaction: Buffer.from(signed.serialize()).toString('base64')
        })
      });

      const result = await submitResponse.json();
      if (result.signature) {
        alert('Successfully converted to USDC+! Signature: ' + result.signature);
        setConvertAmount('');
        await loadBalances();
      } else {
        throw new Error(result.error || 'Conversion failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
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
        await loadBalances();
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
                Open an account in minutes with just email.
              </p>
            </div>
          </div>

          <div className="max-w-md mx-auto bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
            <div className="flex justify-center mb-6">
              <div className="bg-gray-900 rounded-lg p-1 flex">
                <button
                  onClick={() => setIsLogin(false)}
                  className={`px-6 py-2 rounded-md transition ${
                    !isLogin ? 'bg-purple-600 text-white' : 'text-gray-400'
                  }`}
                >
                  Sign Up
                </button>
                <button
                  onClick={() => setIsLogin(true)}
                  className={`px-6 py-2 rounded-md transition ${
                    isLogin ? 'bg-purple-600 text-white' : 'text-gray-400'
                  }`}
                >
                  Login
                </button>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-6 text-center">
              {isLogin ? 'Welcome Back' : 'Get Started'}
            </h2>
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
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                  isLogin ? 'Login to Account' : 'Create Account'}
              </button>
              <p className="text-xs text-gray-500 text-center">
                {isLogin ? 'We\'ll send an OTP to verify your email' : 'By creating an account, you agree to our privacy-first principles'}
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
            Code sent to <span className="text-purple-400">{email}</span>
          </p>
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Enter OTP</label>
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
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify'}
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
              <span className="text-sm text-gray-400">{email}</span>
              <WalletMultiButton />
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 shadow-2xl">
              <div className="mb-6">
                <p className="text-purple-100 text-sm mb-2">Grid Account</p>
                <h2 className="text-3xl font-bold">${balance.toFixed(2)}</h2>
                <p className="text-purple-100 text-sm mt-2">{userState?.address.slice(0, 8)}...</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-100 text-sm">USDC Balance</span>
                  <span className="text-white font-bold">${usdcBalance.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-100 text-sm">Yield Earned</span>
                  <span className="text-green-300 font-semibold">+${yieldEarned.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
              <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <TrendingUp className="w-6 h-6 text-purple-400" />
                <span>Convert to Yield</span>
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Convert USDC to USDC+ (yield-bearing) using your wallet
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Amount (USDC)</label>
                  <input
                    type="number"
                    value={convertAmount}
                    onChange={(e) => setConvertAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                    placeholder="0.00"
                    step="0.01"
                    disabled={loading}
                  />
                </div>
                <button
                  onClick={handleConvertToYield}
                  disabled={loading || !convertAmount || !connected}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                   !connected ? 'Connect Wallet' : 'Convert to USDC+'}
                </button>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
              <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <Send className="w-6 h-6 text-purple-400" />
                <span>Send Money</span>
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Send via Grid (uses your Grid session)
              </p>
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
                  <label className="block text-sm font-medium mb-2">Recipient</label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                    placeholder="Address..."
                    disabled={loading}
                  />
                </div>
                <button
                  onClick={handleTransfer}
                  disabled={loading || !transferAmount || !recipient}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send'}
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto mt-8 bg-purple-900/30 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <EyeOff className="w-5 h-5 text-purple-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Private Transfers Coming Soon</p>
                <p className="text-xs text-gray-400 mt-1">
                  Umbra integration will enable anonymous transfers via stealth addresses.
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