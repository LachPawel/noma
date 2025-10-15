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
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-8">
              <Shield className="w-16 h-16 text-[#a3ff12]" />
            </div>
            <h1 className="text-7xl font-bold mb-6 text-white leading-tight">
              Autonomous money<br />designed for the<br />stablecoin era
            </h1>
            <p className="text-xl text-gray-400 mb-6 max-w-4xl mx-auto uppercase tracking-wider text-sm">
              Experience USD that automates DeFi strategy, enhances<br />
              capital efficiency and delivers on decentralization - all<br />
              seamlessly integrated with insurance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            <div className="bg-[#1a1a1a] rounded-lg p-8 border border-gray-800 hover:border-[#a3ff12] transition">
              <TrendingUp className="w-12 h-12 text-[#a3ff12] mb-4" />
              <h3 className="text-xl font-bold mb-3">Earn Yield</h3>
              <p className="text-gray-400">
                Your stablecoins automatically earn yield through DeFi strategies.
              </p>
            </div>

            <div className="bg-[#1a1a1a] rounded-lg p-8 border border-gray-800 hover:border-[#a3ff12] transition">
              <Shield className="w-12 h-12 text-[#a3ff12] mb-4" />
              <h3 className="text-xl font-bold mb-3">Private Transfers</h3>
              <p className="text-gray-400">
                Anonymous transfers with cryptographic privacy. <span className="text-[#a3ff12]">Coming Soon</span>
              </p>
            </div>

            <div className="bg-[#1a1a1a] rounded-lg p-8 border border-gray-800 hover:border-[#a3ff12] transition">
              <Banknote className="w-12 h-12 text-[#a3ff12] mb-4" />
              <h3 className="text-xl font-bold mb-3">No Bank Required</h3>
              <p className="text-gray-400">
                Open an account in minutes with just email.
              </p>
            </div>
          </div>

          <div className="max-w-md mx-auto bg-[#1a1a1a] rounded-lg p-8 border border-gray-800">
            <div className="flex justify-center mb-6">
              <div className="bg-black rounded-lg p-1 flex border border-gray-800">
                <button
                  onClick={() => setIsLogin(false)}
                  className={`px-6 py-2 rounded-md transition ${
                    !isLogin ? 'bg-[#a3ff12] text-black font-semibold' : 'text-gray-400'
                  }`}
                >
                  Sign Up
                </button>
                <button
                  onClick={() => setIsLogin(true)}
                  className={`px-6 py-2 rounded-md transition ${
                    isLogin ? 'bg-[#a3ff12] text-black font-semibold' : 'text-gray-400'
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
                <label className="block text-sm font-medium mb-2 text-gray-400">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg focus:outline-none focus:border-[#a3ff12] text-white"
                  placeholder="your@email.com"
                  disabled={loading}
                />
              </div>
              <button
                onClick={handleCreateAccount}
                disabled={loading || !email}
                className="w-full bg-[#a3ff12] text-black py-3 rounded-lg font-semibold hover:bg-[#8fe000] transition disabled:opacity-50 flex items-center justify-center"
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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-md w-full mx-4 bg-[#1a1a1a] rounded-lg p-8 border border-gray-800">
          <h2 className="text-2xl font-bold mb-6 text-center">Verify Your Email</h2>
          <p className="text-gray-400 mb-6 text-center">
            Code sent to <span className="text-[#a3ff12]">{email}</span>
          </p>
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-400">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg focus:outline-none focus:border-[#a3ff12] text-center text-2xl tracking-widest text-white"
                placeholder="000000"
                maxLength={6}
                disabled={loading}
              />
            </div>
            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length !== 6}
              className="w-full bg-[#a3ff12] text-black py-3 rounded-lg font-semibold hover:bg-[#8fe000] transition disabled:opacity-50 flex items-center justify-center"
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
      <div className="min-h-screen bg-black text-white">
        <nav className="border-b border-gray-800 bg-black">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-[#a3ff12]" />
              <span className="text-xl font-bold">Anonbank</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">{email}</span>
              <WalletMultiButton />
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white rounded-lg transition text-sm border border-gray-800"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-8">
              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-2">Grid Account</p>
                <h2 className="text-3xl font-bold">${balance.toFixed(2)}</h2>
                <p className="text-gray-500 text-sm mt-2">{userState?.address.slice(0, 8)}...</p>
              </div>
              <div className="bg-black rounded-lg p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">USDC Balance</span>
                  <span className="text-white font-bold">${usdcBalance.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Yield Earned</span>
                  <span className="text-[#a3ff12] font-semibold">+${yieldEarned.toFixed(2)}</span>
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
            <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <TrendingUp className="w-6 h-6 text-[#a3ff12]" />
                <span>Convert to Yield</span>
              </h3>
              <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-xs text-yellow-300 mb-1">⚠️ Mainnet Only Feature</p>
                <p className="text-xs text-gray-400">
                  USDC+ conversion requires mainnet-beta. Currently on devnet for testing.
                </p>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Convert USDC to USDC+ (yield-bearing) using your wallet
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-400">Amount (USDC)</label>
                  <input
                    type="number"
                    value={convertAmount}
                    onChange={(e) => setConvertAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg focus:outline-none focus:border-[#a3ff12] text-white"
                    placeholder="0.00"
                    step="0.01"
                    disabled={loading}
                  />
                </div>
                <button
                  onClick={handleConvertToYield}
                  disabled={loading || !convertAmount || !connected}
                  className="w-full bg-[#a3ff12] text-black py-3 rounded-lg font-semibold hover:bg-[#8fe000] transition disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                   !connected ? 'Connect Wallet' : 'Convert to USDC+'}
                </button>
              </div>
            </div>

            <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <Send className="w-6 h-6 text-[#a3ff12]" />
                <span>Send Money</span>
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Send via Grid (uses your Grid session)
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-400">Amount (USDC)</label>
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg focus:outline-none focus:border-[#a3ff12] text-white"
                    placeholder="0.00"
                    step="0.01"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-400">Recipient</label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg focus:outline-none focus:border-[#a3ff12] text-white"
                    placeholder="Address..."
                    disabled={loading}
                  />
                </div>
                <button
                  onClick={handleTransfer}
                  disabled={loading || !transferAmount || !recipient}
                  className="w-full bg-[#a3ff12] text-black py-3 rounded-lg font-semibold hover:bg-[#8fe000] transition disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send'}
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto mt-8 bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <EyeOff className="w-5 h-5 text-[#a3ff12] mt-0.5" />
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