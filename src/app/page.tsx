'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { VersionedTransaction } from '@solana/web3.js';
import { ArrowLeft, Flame, Heart, Share2, Smartphone, X, Zap } from 'lucide-react';

import VideoBackground from '@/components/VideoBackground';
import Dashboard from '@/components/Dashboard';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from '@/components/ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

type View = 'landing' | 'auth' | 'dashboard';
type AuthStep = 'welcome' | 'email' | 'otp';
type AuthMode = 'signup' | 'login';

type TokenBalance = {
	symbol?: string;
	mint?: string;
	amount?: number;
};

type GlitchText = {
	id: number;
	text: string;
	x: number;
	y: number;
	size: number;
};

interface UserState {
	address: string;
	authentication?: unknown;
	sessionSecrets?: unknown;
	email?: string;
}

interface PendingUserData {
	user: unknown;
	sessionSecrets: unknown;
	email: string;
	isNewUser: boolean;
}

interface StoredSession {
	userState: UserState;
	email: string;
	timestamp: number;
}

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const anarchyTexts = [
	'FUCK THE SYSTEM',
	'FUCK CENSORSHIP',
	'FUCK REGIMES',
	'THEY CANT CONTROL US',
	'NO MASTERS NO SLAVES',
	'PRIVACY IS A RIGHT',
	'RESIST',
	'ANONYMOUS',
	'UNGOVERNABLE',
	'NO SURVEILLANCE',
];

export default function Home() {
	const { connected, publicKey, signTransaction } = useWallet();

	const [view, setView] = useState<View>('landing');
	const [authStep, setAuthStep] = useState<AuthStep>('welcome');
	const [authMode, setAuthMode] = useState<AuthMode>('signup');
	const [email, setEmail] = useState('');
	const [otp, setOtp] = useState('');
	const [manifestoOpen, setManifestoOpen] = useState(false);
	const [showPwaBanner, setShowPwaBanner] = useState(false);
	const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
	const [glitchTexts, setGlitchTexts] = useState<GlitchText[]>([]);
	const [userState, setUserState] = useState<UserState | null>(null);
	const [userData, setUserData] = useState<PendingUserData | null>(null);
	const [balance, setBalance] = useState(0);
	const [usdcBalance, setUsdcBalance] = useState(0);
	const [yieldEarned, setYieldEarned] = useState(0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		if (typeof window === 'undefined') return;

		const savedSession = window.localStorage.getItem('anonbank_session');
		if (!savedSession) return;

		try {
			const session = JSON.parse(savedSession) as StoredSession;
			const sessionAge = Date.now() - (session.timestamp ?? 0);
			const maxAge = 7 * 24 * 60 * 60 * 1000;
			if (sessionAge > maxAge) {
				window.localStorage.removeItem('anonbank_session');
				return;
			}

			if (session.userState && session.email) {
				setUserState(session.userState);
				setEmail(session.email);
				setView('dashboard');
				setAuthStep('welcome');
			}
		} catch (err) {
			console.error('Failed to restore session:', err);
			window.localStorage.removeItem('anonbank_session');
		}
	}, []);

	const loadBalances = useCallback(async () => {
		const address = userState?.address ?? publicKey?.toString();
		if (!address) {
			return;
		}

		try {
			const response = await fetch(`/api/account?address=${address}`);
			if (!response.ok) {
				throw new Error('Failed to load balances');
			}

			const data = (await response.json()) as { sol?: number; tokens?: TokenBalance[] };
			setBalance(data.sol ?? 0);

			const usdcToken = data.tokens?.find(
				(token) => token.symbol === 'USDC' || token.mint === '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
			);
			setUsdcBalance(usdcToken?.amount ?? 0);
			setYieldEarned(12.45);
		} catch (err) {
			console.error('Failed to load balances:', err);
		}
	}, [publicKey, userState?.address]);

	useEffect(() => {
		if (view !== 'dashboard') return;
		void loadBalances();
	}, [view, loadBalances, connected]);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		const interval = window.setInterval(() => {
			const count = Math.random() > 0.5 ? 2 : 1;
			const newTexts = Array.from({ length: count }, (_, index) => ({
				id: Date.now() + index,
				text: anarchyTexts[Math.floor(Math.random() * anarchyTexts.length)],
				x: Math.random() * 80 + 10,
				y: Math.random() * 80 + 10,
				size: Math.random() * 0.6 + 0.6,
			}));
			setGlitchTexts(newTexts);
		}, 2000);

		return () => {
			window.clearInterval(interval);
		};
	}, []);

	useEffect(() => {
		const words = document.querySelectorAll('.word');
		words.forEach((word) => {
			const delay = parseInt(word.getAttribute('data-delay') ?? '0', 10);
			window.setTimeout(() => {
				word.classList.add('animate-word-appear');
			}, delay);
		});
	}, [view, authStep]);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		const isDismissed = window.localStorage.getItem('pwa-prompt-dismissed') === 'true';
		const isStandalone =
			window.matchMedia('(display-mode: standalone)').matches ||
			(window.navigator as unknown as { standalone?: boolean }).standalone === true;

		let iosTimeoutId: number | undefined;

		const handleBeforeInstallPrompt = (event: Event) => {
			event.preventDefault();
			const promptEvent = event as BeforeInstallPromptEvent;
			setDeferredPrompt(promptEvent);

			if (!isDismissed && !isStandalone && view === 'landing') {
				window.setTimeout(() => setShowPwaBanner(true), 3000);
			}
		};

		window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

		const isIOSDevice = /iPad|iPhone|iPod/.test(window.navigator.userAgent);
		if (!isDismissed && !isStandalone && view === 'landing' && isIOSDevice) {
			iosTimeoutId = window.setTimeout(() => setShowPwaBanner(true), 3000);
		}

		return () => {
			window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
			if (iosTimeoutId) {
				window.clearTimeout(iosTimeoutId);
			}
		};
	}, [view]);

	const handlePwaInstall = async () => {
		const isIOSDevice = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
		if (isIOSDevice || !deferredPrompt) {
			return;
		}

		deferredPrompt.prompt();
		await deferredPrompt.userChoice;
		setDeferredPrompt(null);
		setShowPwaBanner(false);
		if (typeof window !== 'undefined') {
			window.localStorage.setItem('pwa-prompt-dismissed', 'true');
		}
	};

	const handlePwaDismiss = () => {
		if (typeof window !== 'undefined') {
			window.localStorage.setItem('pwa-prompt-dismissed', 'true');
		}
		setShowPwaBanner(false);
	};

	const startAuthFlow = (mode: AuthMode) => {
		setAuthMode(mode);
		setAuthStep('email');
		setError('');
		setEmail('');
		setOtp('');
	};

	const handleRequestOtp = async () => {
		if (!email || !email.includes('@')) {
			return;
		}

		setLoading(true);
		setError('');

		try {
			const response = await fetch('/api/account', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: authMode === 'login' ? 'login' : 'create',
					email,
				}),
			});

			if (!response.ok) {
				throw new Error(authMode === 'login' ? 'Login failed' : 'Failed to create account');
			}

			const data = (await response.json()) as { user: unknown; sessionSecrets: unknown };
			setUserData({
				user: data.user,
				sessionSecrets: data.sessionSecrets,
				email,
				isNewUser: authMode !== 'login',
			});
			setAuthStep('otp');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred');
		} finally {
			setLoading(false);
		}
	};

	const handleVerifyOtp = async () => {
		if (!otp || otp.length !== 6 || !userData) {
			return;
		}

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
					isNewUser: userData.isNewUser,
				}),
			});

			if (!response.ok) {
				throw new Error('OTP verification failed');
			}

			const result = (await response.json()) as UserState;
			setUserState(result);
			setUserData(null);
			setOtp('');
			setView('dashboard');
			setAuthStep('welcome');

			if (typeof window !== 'undefined') {
				const session: StoredSession = {
					userState: result,
					email: userData.email,
					timestamp: Date.now(),
				};
				window.localStorage.setItem('anonbank_session', JSON.stringify(session));
			}

			await loadBalances();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred');
		} finally {
			setLoading(false);
		}
	};

	const handleLogout = () => {
		if (typeof window !== 'undefined') {
			window.localStorage.removeItem('anonbank_session');
		}

		setUserState(null);
		setUserData(null);
		setEmail('');
		setOtp('');
		setBalance(0);
		setUsdcBalance(0);
		setYieldEarned(0);
		setView('landing');
		setAuthStep('welcome');
		setAuthMode('signup');
		setError('');
	};

	const handleTransfer = useCallback(
		async (amount: string, destination: string): Promise<boolean> => {
			const parsedAmount = parseFloat(amount);
			if (!userState) {
				setError('Complete email login to send funds.');
				return false;
			}
			if (!destination || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
				setError('Enter a valid recipient and amount.');
				return false;
			}

			setLoading(true);
			setError('');

			try {
				const response = await fetch('/api/account', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						action: 'transfer',
						userState,
						recipient: destination,
						amount: parsedAmount * 1_000_000,
						mint: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
						usePrivacy: false,
					}),
				});

				if (!response.ok) {
					throw new Error('Transfer failed');
				}

				const result = await response.json();
				if (result.signature) {
					window.alert(`Transfer successful! Signature: ${result.signature}`);
					await loadBalances();
					setError('');
					return true;
				}

				throw new Error(result.error || 'Transfer failed');
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Transfer failed');
				return false;
			} finally {
				setLoading(false);
			}
		},
		[loadBalances, userState],
	);

	const handleConvertToYield = useCallback(
		async (amount: string): Promise<boolean> => {
			const parsedAmount = parseFloat(amount);
			if (!publicKey || !signTransaction) {
				setError('Connect wallet to convert to yield-bearing stablecoin.');
				return false;
			}
			if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
				setError('Enter a valid amount to convert.');
				return false;
			}

			setLoading(true);
			setError('');

			try {
				const response = await fetch('/api/account', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						action: 'convert',
						publicKey: publicKey.toString(),
						amount: parsedAmount,
					}),
				});

				if (!response.ok) {
					throw new Error('Failed to create conversion transaction');
				}

				const { transaction: serializedTx } = await response.json();
				const transaction = VersionedTransaction.deserialize(Buffer.from(serializedTx, 'base64'));
				const signed = await signTransaction(transaction);

				const submitResponse = await fetch('/api/account', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						action: 'submit',
						signedTransaction: Buffer.from(signed.serialize()).toString('base64'),
					}),
				});

				if (!submitResponse.ok) {
					throw new Error('Failed to submit transaction');
				}

				const submitResult = await submitResponse.json();
				if (submitResult.signature) {
					window.alert(`Successfully converted to USDC+! Signature: ${submitResult.signature}`);
					await loadBalances();
					setError('');
					return true;
				}

				throw new Error(submitResult.error || 'Conversion failed');
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Conversion failed');
				return false;
			} finally {
				setLoading(false);
			}
		},
		[loadBalances, publicKey, signTransaction],
	);

	const currentWalletAddress = userState?.address ?? publicKey?.toString() ?? null;
	const totalBalance = balance + usdcBalance;
	const isIOSDevice = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
	const currentTime = new Date().toLocaleTimeString();

	if (view === 'dashboard') {
		return (
			<div className="relative min-h-screen overflow-hidden bg-black text-white">
				<VideoBackground />
				<div className="relative z-10">
					<Dashboard
						onBack={handleLogout}
						walletAddress={currentWalletAddress}
						totalBalance={totalBalance}
						usdcBalance={usdcBalance}
						yieldEarned={yieldEarned}
						onSend={handleTransfer}
						onConvert={handleConvertToYield}
						onRefreshBalances={loadBalances}
						loading={loading}
						error={error}
						walletButton={<WalletMultiButton />}
						connected={connected}
					/>
				</div>
			</div>
		);
	}

	if (view === 'auth') {
		return (
			<div className="relative min-h-screen overflow-hidden bg-black text-white">
				<VideoBackground />

				<div className="corner-bracket corner-tl" />
				<div className="corner-bracket corner-tr" />
				<div className="corner-bracket corner-bl" />
				<div className="corner-bracket corner-br" />

				<div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-3 py-3 font-mono text-[0.6rem] uppercase tracking-widest text-white/60 sm:px-6 sm:py-4 sm:text-xs md:text-sm">
					<div className="flex items-center gap-2 sm:gap-4 md:gap-8">
						<span className="font-bold text-white">&gt; SURVEILLANCE_OFF</span>
						<span className="hidden text-white/40 sm:inline">|</span>
						<span className="hidden font-bold text-white md:inline">&gt; ENCRYPTED</span>
						<span className="hidden text-white/40 md:inline">|</span>
						<span className="hidden font-bold text-white md:inline">&gt; ANONYMOUS</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="h-2 w-2 animate-pulse rounded-full bg-white" />
						<span className="font-bold text-white">LIVE</span>
					</div>
				</div>

				<div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-20">
					<div className="w-full max-w-md space-y-8">
						{authStep === 'welcome' && (
							<div className="space-y-8 text-center animate-fade-in">
								<div className="space-y-2">
									<h1
										className="brutal-glitch text-white"
										style={{ fontFamily: 'Anton, sans-serif', fontSize: 'clamp(4rem, 15vw, 8rem)', lineHeight: '0.9' }}
									>
										NOMA
									</h1>
									<p
										className="text-white/90 font-mono font-bold tracking-[0.3em] uppercase"
										style={{ fontSize: 'clamp(0.75rem, 3vw, 1.5rem)' }}
									>
										CASH
									</p>
								</div>

								<div className="mt-12 space-y-4">
									<button
										onClick={() => startAuthFlow('signup')}
										className="w-full border-4 border-white/30 bg-red-600 px-4 py-4 text-lg font-black uppercase tracking-wider text-white transition-colors hover:bg-red-700"
										style={{ fontFamily: 'Anton, sans-serif' }}
									>
										SIGN UP
									</button>
									<button
										onClick={() => startAuthFlow('login')}
										className="w-full border-4 border-white/30 bg-white/10 px-4 py-4 text-lg font-black uppercase tracking-wider text-white transition-colors hover:bg-white/20"
										style={{ fontFamily: 'Anton, sans-serif' }}
									>
										LOGIN
									</button>
								</div>

								<button
									onClick={() => setView('landing')}
									className="mx-auto mt-8 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-wider text-white/60 transition-colors hover:text-white"
								>
									<ArrowLeft className="h-4 w-4" /> BACK TO HOME
								</button>
							</div>
						)}

						{authStep === 'email' && (
							<div className="space-y-6 animate-fade-in">
								<div className="space-y-2 text-center">
									<h2
										className="text-white brutal-glitch"
										style={{ fontFamily: 'Anton, sans-serif', fontSize: 'clamp(2rem, 8vw, 3rem)' }}
									>
										{authMode === 'signup' ? 'CREATE ACCOUNT' : 'LOGIN'}
									</h2>
									<p className="font-mono text-xs uppercase tracking-wider text-white/60">ENTER YOUR EMAIL</p>
								</div>

								{error && (
									<div className="rounded-none border border-red-600 bg-red-500/10 p-3 text-center font-mono text-xs uppercase tracking-wider text-red-400">
										{error}
									</div>
								)}

								<input
									type="email"
									placeholder="your@email.com"
									value={email}
									onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
									onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
										if (event.key === 'Enter') {
											event.preventDefault();
											handleRequestOtp();
										}
									}}
									disabled={loading}
									className="w-full border-4 border-white/30 bg-black px-4 py-6 font-mono text-lg text-white placeholder:text-white/40 focus:border-red-600"
								/>

								<button
									onClick={handleRequestOtp}
									disabled={loading || !email || !email.includes('@')}
									className="w-full border-4 border-white/30 bg-red-600 px-4 py-4 text-lg font-black uppercase tracking-wider text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-white/10"
									style={{ fontFamily: 'Anton, sans-serif' }}
								>
									{authMode === 'signup' ? 'CREATE ACCOUNT' : 'LOGIN TO ACCOUNT'}
								</button>

								<button
									onClick={() => setAuthStep('welcome')}
									className="flex w-full items-center justify-center gap-2 font-mono text-xs uppercase tracking-wider text-white/60 transition-colors hover:text-white"
								>
									<ArrowLeft className="h-4 w-4" /> BACK
								</button>
							</div>
						)}

						{authStep === 'otp' && (
							<div className="space-y-6 animate-fade-in">
								<div className="space-y-2 text-center">
									<h2
										className="text-white brutal-glitch"
										style={{ fontFamily: 'Anton, sans-serif', fontSize: 'clamp(2rem, 8vw, 3rem)' }}
									>
										VERIFY EMAIL
									</h2>
									<p className="font-mono text-xs uppercase tracking-wider text-white/60">CODE SENT TO</p>
									<p className="font-mono text-sm text-red-500">{email}</p>
								</div>

								{error && (
									<div className="rounded-none border border-red-600 bg-red-500/10 p-3 text-center font-mono text-xs uppercase tracking-wider text-red-400">
										{error}
									</div>
								)}

								<div className="flex justify-center">
									<InputOTP
										maxLength={6}
										value={otp}
										onChange={(value: string) => setOtp(value.replace(/\D/g, '').slice(0, 6))}
										onComplete={handleVerifyOtp}
									>
										<InputOTPGroup className="gap-2">
											{Array.from({ length: 6 }).map((_, index) => (
												<InputOTPSlot
													key={`otp-slot-${index}`}
													index={index}
													className="h-16 w-14 border-2 border-white/30 bg-black text-2xl font-mono text-white focus:border-red-600"
												/>
											))}
										</InputOTPGroup>
									</InputOTP>
								</div>

								<button
									onClick={handleVerifyOtp}
									disabled={loading || otp.length !== 6}
									className="w-full border-4 border-white/30 bg-red-600 px-4 py-4 text-lg font-black uppercase tracking-wider text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-white/10"
									style={{ fontFamily: 'Anton, sans-serif' }}
								>
									VERIFY
								</button>

								<button
									onClick={() => {
										setAuthStep('email');
										setOtp('');
										setError('');
									}}
									className="flex w-full items-center justify-center gap-2 font-mono text-xs uppercase tracking-wider text-white/60 transition-colors hover:text-white"
								>
									<ArrowLeft className="h-4 w-4" /> BACK TO EMAIL
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="relative min-h-screen overflow-hidden bg-black text-white">
			<VideoBackground />

			<div className="fixed top-0 left-0 right-0 z-50">
				<div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-3 font-mono text-[0.6rem] uppercase tracking-widest text-white/60 sm:px-6 sm:py-4 sm:text-xs">
					<div className="flex items-center gap-3 sm:gap-6 md:gap-8">
						<span className="hidden font-bold text-white sm:inline">&gt; SURVEILLANCE_OFF</span>
						<span className="hidden text-white/40 sm:inline">|</span>
						<span className="hidden font-bold text-white md:inline">&gt; ENCRYPTED</span>
						<span className="hidden text-white/40 md:inline">|</span>
						<span className="hidden font-bold text-white md:inline">&gt; ANONYMOUS</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="h-2 w-2 animate-pulse rounded-full bg-white" />
						<span className="font-bold text-white">LIVE</span>
					</div>
				</div>
			</div>

			<div className="relative z-10 flex h-screen flex-col items-center justify-center overflow-hidden p-8">
				<div className="mb-4 mt-8 px-4 text-center">
					<div className="word text-sm font-bold uppercase tracking-[0.2em] text-white/60 sm:text-sm md:text-base" data-delay="0">
						Keep What&#39;s Yours
					</div>
				</div>

				<div className="mx-auto mb-6 max-w-7xl px-4 text-center">
					<div className="mb-6">
						<h1 className="brutal-glitch word mb-2 block text-7xl font-black leading-none tracking-tighter text-white sm:text-7xl md:text-8xl lg:text-9xl xl:text-[12rem]" data-delay="300">
							NOMA
						</h1>
						<div className="word inline-block font-mono text-2xl font-bold tracking-[0.3em] text-white/90 sm:text-2xl md:text-3xl lg:text-4xl" data-delay="500">
							CASH
						</div>
					</div>

					<div className="mb-4 text-2xl font-black leading-none tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
						<div className="mb-1">
							<span className="word brutal-word" data-delay="700">
								PRIVACY.
							</span>
						</div>
						<div className="mb-1">
							<span className="word brutal-word text-red-600" data-delay="900">
								FUCK
							</span>{' '}
							<span className="word brutal-word text-red-600" data-delay="1050">
								THE
							</span>{' '}
							<span className="word brutal-word text-red-600" data-delay="1200">
								REST
							</span>
						</div>
					</div>

					<div className="mb-4 space-y-1 text-sm font-black uppercase tracking-wider text-white/90 sm:text-base md:text-lg lg:text-xl">
						<div>
							<span className="word brutal-statement" data-delay="1500">
								FUCK
							</span>{' '}
							<span className="word brutal-statement" data-delay="1650">
								CENSORSHIP
							</span>
						</div>
						<div>
							<span className="word brutal-statement" data-delay="1800">
								FUCK
							</span>{' '}
							<span className="word brutal-statement" data-delay="1950">
								REGIMES
							</span>
						</div>
					</div>
				</div>

				<div className="fade-in-stats mb-6 flex items-center justify-center gap-4 px-4 sm:gap-6 md:gap-8 lg:gap-16">
					<div className="grunge-stat text-center">
						<div className="grunge-flicker mb-1 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/60 sm:text-xs md:text-sm">APY</div>
						<div className="grunge-text text-2xl font-black text-white sm:text-3xl md:text-4xl lg:text-5xl" data-text="UP TO 20%">
							UP TO 20%
						</div>
					</div>
					<div className="grunge-stat text-center">
						<div className="grunge-flicker mb-1 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/60 sm:text-xs md:text-sm">SECURE</div>
						<div className="grunge-text text-2xl font-black text-white sm:text-3xl md:text-4xl lg:text-5xl" data-text="TRANSFERS">
							TRANSFERS
						</div>
					</div>
					<div className="grunge-stat text-center">
						<div className="grunge-flicker mb-1 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/60 sm:text-xs md:text-sm">PRIVACY</div>
						<div className="grunge-text text-2xl font-black text-white sm:text-3xl md:text-4xl lg:text-5xl" data-text="FULL">
							FULL
						</div>
					</div>
				</div>

				<div className="fade-in-cta mb-6 flex flex-col gap-3 px-4 sm:flex-row sm:gap-4">
					<button
						onClick={() => {
							setView('auth');
							setAuthStep('welcome');
							setError('');
						}}
						className="brutal-btn-primary px-8 py-3 text-sm font-black uppercase tracking-[0.2em] sm:px-8 sm:py-3 sm:text-sm md:text-base"
					>
						&gt; ENTER APP
					</button>
					<button
						onClick={() => setManifestoOpen(true)}
						className="brutal-btn-ghost px-8 py-3 text-sm font-black uppercase tracking-[0.2em] sm:px-8 sm:py-3 sm:text-sm md:text-base"
					>
						&gt; MANIFESTO
					</button>
				</div>

				<div className="px-4 text-center">
					<div className="brutal-bottom word text-xs font-black uppercase tracking-[0.3em] text-white/70 sm:text-sm md:text-base" data-delay="2200">
						THEY CAN&#39;T STOP US
					</div>
				</div>

				{glitchTexts.map((item) => (
					<div
						key={item.id}
						className="glitch-text-random fixed"
						style={{ left: `${item.x}%`, top: `${item.y}%`, fontSize: `${item.size}rem` }}
					>
						{item.text}
					</div>
				))}

				<div className="hidden space-y-2 font-mono text-xs uppercase tracking-widest text-white/70 md:fixed md:bottom-12 md:left-12 md:block">
					<div className="flex items-center gap-2 font-black">
						<Heart className="h-4 w-4" /> SOL POWERED
					</div>
					<div className="flex items-center gap-2 font-black">
						<Zap className="h-4 w-4" /> FAST AS HELL
					</div>
					<div className="flex items-center gap-2 font-black">
						<Flame className="h-4 w-4" /> UNSTOPPABLE
					</div>
				</div>

				<div className="hidden font-mono text-xs text-white/50 md:fixed md:right-12 md:top-24">
					<div>REC ●</div>
					<div>{currentTime}</div>
				</div>
			</div>

			<Dialog open={manifestoOpen} onOpenChange={setManifestoOpen}>
				<DialogContent className="w-[95vw] max-w-6xl border-4 border-white/30 bg-black p-4 sm:p-6">
					<DialogTitle className="sr-only">NOMA Manifesto</DialogTitle>
					<DialogDescription className="sr-only">Watch the NOMA manifesto</DialogDescription>

					<DialogClose className="absolute right-2 top-2 flex items-center justify-center border border-white/30 bg-black/80 p-2 text-white/70 transition-colors hover:text-white">
						<X className="h-5 w-5" />
					</DialogClose>

					<div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
						<iframe
							className="absolute left-0 top-0 h-full w-full border-2 border-white/20"
							src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0"
							title="NOMA MANIFESTO"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowFullScreen
						/>
					</div>
				</DialogContent>
			</Dialog>

			{showPwaBanner && (
				<div className="fixed top-0 left-0 right-0 z-[100] animate-slide-down">
					<div className="border-b-4 border-white/30 bg-black shadow-2xl">
						<div className="mx-auto max-w-4xl px-3 py-3 sm:px-4 sm:py-4">
							{isIOSDevice ? (
								<div className="space-y-3">
									<div className="flex items-center justify-between gap-4">
										<div className="flex flex-1 items-center gap-3">
											<div className="border-2 border-white/30 bg-red-600 p-2">
												<Smartphone className="h-5 w-5 text-white" />
											</div>
											<div className="min-w-0 flex-1">
												<h3
													className="mb-0.5 uppercase tracking-wider text-white"
													style={{ fontFamily: 'Anton, sans-serif' }}
												>
													&gt; ADD TO HOME
												</h3>
												<p className="font-mono text-[10px] uppercase tracking-wider text-white/60">
													INSTANT ACCESS • ZERO TRACE
												</p>
											</div>
										</div>
										<button
											onClick={handlePwaDismiss}
											className="border-2 border-white/30 bg-black/80 p-2 text-white/70 transition-colors hover:text-white"
										>
											<X className="h-4 w-4" />
										</button>
									</div>

									<div className="space-y-2 border-2 border-white/20 bg-white/5 p-3">
										<div className="flex items-start gap-2">
											<Share2 className="mt-0.5 h-4 w-4 text-red-500" />
											<p className="font-mono text-[10px] text-white/80">
												Tap <span className="font-bold text-red-500">SHARE</span> button in Safari
											</p>
										</div>
										<div className="flex items-start gap-2">
											<Smartphone className="mt-0.5 h-4 w-4 text-red-500" />
											<p className="font-mono text-[10px] text-white/80">
												Select <span className="font-bold text-red-500">&quot;Add to Home Screen&quot;</span>
											</p>
										</div>
									</div>
								</div>
							) : (
								<div className="flex items-center justify-between gap-4">
									<div className="flex flex-1 items-center gap-3 sm:gap-4">
										<div className="border-2 border-white/30 bg-red-600 p-2">
											<Smartphone className="h-5 w-5 text-white" />
										</div>
										<div className="min-w-0 flex-1">
											<h3
												className="mb-0.5 uppercase tracking-wider text-white"
												style={{ fontFamily: 'Anton, sans-serif' }}
											>
												&gt; ADD TO HOME SCREEN
											</h3>
											<p className="font-mono text-[10px] uppercase tracking-wider text-white/60">
												INSTANT ACCESS • ZERO TRACE
											</p>
										</div>
									</div>

									<div className="flex items-center gap-2">
										<button
											onClick={handlePwaInstall}
											className="border-2 border-white/30 bg-red-600 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-white transition-colors hover:bg-red-700 sm:px-4 sm:text-xs"
										>
											&gt; INSTALL
										</button>
										<button
											onClick={handlePwaDismiss}
											className="border-2 border-white/30 bg-black/80 p-2 text-white/70 transition-colors hover:text-white"
										>
											<X className="h-4 w-4" />
										</button>
									</div>
								</div>
							)}
						</div>
						<div className="h-1 bg-gradient-to-r from-transparent via-red-600/50 to-transparent opacity-50" />
					</div>
				</div>
			)}
		</div>
		);
	}
