'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { VersionedTransaction } from '@solana/web3.js';
import { Flame, Heart, Share2, Smartphone, X, Zap } from 'lucide-react';

import VideoBackground from '@/components/VideoBackground';
import Dashboard from '@/components/Dashboard';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from '@/components/ui/dialog';

type View = 'landing' | 'dashboard';

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
};

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
	const { connected, publicKey, signTransaction, disconnect, connect, wallets, select } = useWallet();

	const [view, setView] = useState<View>('landing');
	const [manifestoOpen, setManifestoOpen] = useState(false);
	const [showPwaBanner, setShowPwaBanner] = useState(false);
	const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
	const [glitchTexts, setGlitchTexts] = useState<GlitchText[]>([]);
	const [balance, setBalance] = useState(0);
	const [usdcBalance, setUsdcBalance] = useState(0);
	const [yieldEarned, setYieldEarned] = useState(0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		if (typeof window === 'undefined') return;

		// Auto-redirect to dashboard if wallet is connected
		if (connected && publicKey && view === 'landing') {
			setView('dashboard');
		}
	}, [connected, publicKey, view]);

	// Additional check on mount to handle already-connected wallets
	useEffect(() => {
		console.log('Component mounted, checking wallet connection...');
		if (connected && publicKey) {
			console.log('Wallet already connected on mount, redirecting...');
			setView('dashboard');
		}
	}, [connected, publicKey]);

	const loadBalances = useCallback(async () => {
		const address = publicKey?.toString();
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
	}, [publicKey]);

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
	}, [view]);

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

	const handleLogout = async () => {
		// Disconnect the wallet
		try {
			await disconnect();
		} catch (error) {
			console.log('Error disconnecting wallet:', error);
		}
		
		// Reset all state
		setBalance(0);
		setUsdcBalance(0);
		setYieldEarned(0);
		setView('landing');
		setError('');
	};

	const handleEnterApp = async () => {
		try {
			// Try to connect to a previously used wallet or the first available one
			if (wallets.length > 0) {
				// Look for Phantom wallet first (most common), then fallback to first available
				const phantomWallet = wallets.find(wallet => 
					wallet.adapter.name.toLowerCase().includes('phantom')
				);
				const targetWallet = phantomWallet || wallets[0];
				
				select(targetWallet.adapter.name);
				await connect();
			} else {
				console.log('No wallets available');
			}
		} catch (error) {
			console.log('Error connecting wallet:', error);
			// If auto-connect fails, the user can still use the WalletMultiButton when connected
		}
	};

	const handleTransfer = useCallback(
		async (amount: string, destination: string): Promise<boolean> => {
			const parsedAmount = parseFloat(amount);
			if (!publicKey || !connected) {
				setError('Connect wallet to send funds.');
				return false;
			}
			if (!destination || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
				setError('Enter a valid recipient and amount.');
				return false;
			}

			setLoading(true);
			setError('Wallet-only transfers coming soon. For now, you can only view balances.');
			setLoading(false);
			return false;
		},
		[publicKey, connected],
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

	const handleSwap = useCallback(
		async (amount: string, fromCurrency: string, toCurrency: string): Promise<boolean> => {
			const parsedAmount = parseFloat(amount);
			if (!publicKey || !signTransaction) {
				setError('Connect wallet to swap tokens.');
				return false;
			}
			if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
				setError('Enter a valid amount to swap.');
				return false;
			}
			if (fromCurrency === toCurrency) {
				setError('Select different tokens to swap.');
				return false;
			}

			setLoading(true);
			setError('');

			try {
				// For now, just show an alert since this is demo functionality
				// In a real app, you would integrate with Jupiter or another DEX
				window.alert(`Swap functionality coming soon!\nSwap ${parsedAmount} ${fromCurrency} → ${toCurrency}`);
				
				// Simulate success
				await new Promise(resolve => setTimeout(resolve, 1000));
				await loadBalances();
				setError('');
				return true;
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Swap failed');
				return false;
			} finally {
				setLoading(false);
			}
		},
		[loadBalances, publicKey, signTransaction],
	);

	const currentWalletAddress = publicKey?.toString() ?? null;
	const totalBalance = balance + usdcBalance;
	const isIOSDevice = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

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
						onSwap={handleSwap}
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

	return (
		<div className="bg-black text-white min-h-screen relative overflow-hidden">
			<VideoBackground />

			<div className="relative z-10 flex flex-col items-center justify-center h-screen p-8 overflow-hidden">
				<div className="fixed top-0 left-0 right-0 z-50">
					<div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
						<div className="flex items-center gap-2 sm:gap-4 md:gap-8 text-[0.6rem] sm:text-xs font-mono uppercase tracking-wider">
							<span className="text-white font-bold hidden sm:inline">{'>'} SURVEILLANCE_OFF</span>
							<span className="text-white font-bold sm:hidden">{'>'} SURV_OFF</span>
							<span className="text-white/40 hidden sm:inline">{'|'}</span>
							<span className="text-white font-bold hidden md:inline">{'>'} ENCRYPTED</span>
							<span className="text-white/40 hidden md:inline">{'|'}</span>
							<span className="text-white font-bold hidden md:inline">{'>'} ANONYMOUS</span>
						</div>
						<div className="flex items-center gap-2 sm:gap-3">
							<div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></div>
							<span className="text-[0.6rem] sm:text-xs font-mono text-white uppercase tracking-widest font-bold">LIVE</span>
						</div>
					</div>
				</div>

				<div className="text-center mb-2 sm:mb-4 mt-4 sm:mt-8 px-4">
					<div className="text-sm sm:text-sm md:text-base uppercase tracking-[0.2em] sm:tracking-[0.3em] font-bold text-white/60">
						<span className="word" data-delay="0">Keep</span>{' '}
						<span className="word" data-delay="100">What&apos;s</span>{' '}
						<span className="word" data-delay="200">Yours</span>
					</div>
				</div>

				<div className="text-center max-w-7xl mx-auto mb-3 sm:mb-6 px-4">
					<div className="mb-3 sm:mb-6">
						<h1 
							className="text-white uppercase tracking-tighter brutal-glitch"
							style={{ fontFamily: 'Anton, sans-serif', fontSize: 'clamp(6rem, 20vw, 14rem)', lineHeight: '0.9' }}
						>
							<span className="word block" data-delay="300">NOMA</span>
						</h1>
						<div 
							className="text-white/90 uppercase tracking-[0.3em] md:tracking-[0.4em] font-mono font-bold"
							style={{ fontSize: 'clamp(1.25rem, 5vw, 3rem)' }}
						>
							<span className="word inline-block" data-delay="500">CASH</span>
						</div>
					</div>
					
				</div>

				<div className="flex justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-16 mb-4 sm:mb-6 opacity-0 fade-in-stats px-4">
					<div className="grunge-stat">
						<div className="text-[0.6rem] sm:text-xs md:text-sm text-white/60 mb-1 font-mono uppercase tracking-[0.2em] sm:tracking-[0.3em] grunge-flicker">APY</div>
						<div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white grunge-text">UP TO 20%</div>
					</div>
					<div className="grunge-stat">
						<div className="text-[0.6rem] sm:text-xs md:text-sm text-white/60 mb-1 font-mono uppercase tracking-[0.2em] sm:tracking-[0.3em] grunge-flicker">SECURE</div>
						<div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white grunge-text">TRANSFERS</div>
					</div>
					<div className="grunge-stat">
						<div className="text-[0.6rem] sm:text-xs md:text-sm text-white/60 mb-1 font-mono uppercase tracking-[0.2em] sm:tracking-[0.3em] grunge-flicker">PRIVACY</div>
						<div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white grunge-text">FULL</div>
					</div>
				</div>

				<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6 opacity-0 fade-in-cta px-4">
					<button
						onClick={handleEnterApp}
						className="brutal-btn-primary px-8 sm:px-8 py-3.5 sm:py-3 text-sm sm:text-sm md:text-base font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]"
					>
						{'>'} ENTER APP
					</button>
					<button
						onClick={() => setManifestoOpen(true)}
						className="brutal-btn-ghost px-8 sm:px-8 py-3.5 sm:py-3 text-sm sm:text-sm md:text-base font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]"
					>
						{'>'} MANIFESTO
					</button>
				</div>

				<div className="text-center px-4">
					<div className="text-xs sm:text-sm md:text-base uppercase tracking-[0.3em] sm:tracking-[0.4em] font-black text-white/70 brutal-bottom">
						<span className="word" data-delay="2200">THEY</span>{' '}
						<span className="word" data-delay="2300">CAN&apos;T</span>{' '}
						<span className="word" data-delay="2400">STOP</span>{' '}
						<span className="word" data-delay="2500">US</span>
					</div>
				</div>

				{glitchTexts.map((item) => (
					<div
						key={item.id}
						className="fixed text-red-600 font-black uppercase tracking-wider glitch-text-random opacity-0"
						style={{
							left: `${item.x}%`,
							top: `${item.y}%`,
							fontSize: `${Math.random() * 0.5 + 0.5}rem`,
						}}
					>
						{item.text}
					</div>
				))}

				<div className="fixed bottom-6 sm:bottom-12 left-4 sm:left-12 text-xs sm:text-sm text-white/70 font-mono uppercase tracking-widest space-y-1 sm:space-y-2 hidden md:block">
					<div className="font-black flex items-center gap-2">
						<Heart className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" />
						SOL POWERED
					</div>
					<div className="font-black flex items-center gap-2">
						<Zap className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" />
						FAST AS HELL
					</div>
					<div className="font-black flex items-center gap-2">
						<Flame className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" />
						UNSTOPPABLE
					</div>
				</div>

				<div className="fixed top-24 right-12 text-xs text-white/50 font-mono hidden md:block">
					<div>REC ●</div>
					<div>{new Date().toLocaleTimeString()}</div>
				</div>

				<div className="corner-bracket corner-tl" />
				<div className="corner-bracket corner-tr" />
				<div className="corner-bracket corner-bl" />
				<div className="corner-bracket corner-br" />
			</div>

			<Dialog open={manifestoOpen} onOpenChange={setManifestoOpen}>
				<DialogContent className="max-w-6xl w-[95vw] bg-black border-4 border-white/30 p-4 sm:p-6">
					<DialogTitle className="sr-only">NOMA Manifesto</DialogTitle>
					<DialogDescription className="sr-only">
						Watch the NOMA manifesto video
					</DialogDescription>

					<DialogClose className="absolute top-2 right-2 z-50 text-white/70 hover:text-white transition-colors bg-black/80 border border-white/30 p-2">
						<X className="w-5 h-5" />
					</DialogClose>

					<div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
						<iframe
							className="absolute top-0 left-0 w-full h-full border-2 border-white/20"
							src="https://player.vimeo.com/video/1132033928?h=0&title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479"
							title="NOMA MANIFESTO"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowFullScreen
						></iframe>
					</div>
				</DialogContent>
			</Dialog>

			{showPwaBanner && (
				<div
					className="fixed top-0 left-0 right-0 z-[100]"
					style={{
						animation: 'slideDown 0.5s ease-out forwards',
					}}
				>
					<div className="bg-black border-b-4 border-white/30 shadow-2xl">
						<div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
							{isIOSDevice ? (
								<div className="space-y-3">
									<div className="flex items-center justify-between gap-4">
										<div className="flex items-center gap-3 flex-1">
											<div className="bg-red-600 p-2 border-2 border-white/30 flex-shrink-0">
												<Smartphone className="w-5 h-5 text-white" />
											</div>

											<div className="flex-1 min-w-0">
												<h3
													className="text-white uppercase tracking-wider mb-0.5 text-sm sm:text-base"
													style={{ fontFamily: 'Anton, sans-serif' }}
												>
													{'>'} ADD TO HOME
												</h3>
												<p className="text-[9px] sm:text-[10px] font-mono text-white/60 uppercase tracking-wider">
													INSTANT ACCESS • ZERO TRACE
												</p>
											</div>
										</div>

										<button
											onClick={handlePwaDismiss}
											className="text-white/70 hover:text-white transition-colors bg-black/80 border-2 border-white/30 p-2 flex-shrink-0"
										>
											<X className="w-4 h-4" />
										</button>
									</div>

									<div className="bg-white/5 border-2 border-white/20 p-3">
										<div className="flex items-start gap-2 mb-2">
											<Share2 className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
											<p className="text-[10px] sm:text-xs font-mono text-white/80">
												Tap <span className="text-red-500 font-bold">SHARE</span> button in Safari
											</p>
										</div>
										<div className="flex items-start gap-2">
											<Smartphone className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
											<p className="text-[10px] sm:text-xs font-mono text-white/80">
												Select <span className="text-red-500 font-bold">&quot;Add to Home Screen&quot;</span>
											</p>
										</div>
									</div>
								</div>
							) : (
								<div className="flex items-center justify-between gap-4">
									<div className="flex items-center gap-3 sm:gap-4 flex-1">
										<div className="bg-red-600 p-2 border-2 border-white/30 flex-shrink-0">
											<Smartphone className="w-5 h-5 text-white" />
										</div>

										<div className="flex-1 min-w-0">
											<h3
												className="text-white uppercase tracking-wider mb-0.5 text-sm sm:text-base"
												style={{ fontFamily: 'Anton, sans-serif' }}
											>
												{'>'} ADD TO HOME SCREEN
											</h3>
											<p className="text-[9px] sm:text-[10px] font-mono text-white/60 uppercase tracking-wider">
												INSTANT ACCESS • ZERO TRACE
											</p>
										</div>
									</div>

									<div className="flex items-center gap-2">
										<button
											onClick={handlePwaInstall}
											className="bg-red-600 hover:bg-red-700 border-2 border-white/30 text-white font-black uppercase tracking-wider px-3 sm:px-4 py-2 text-[10px] sm:text-xs transition-colors whitespace-nowrap"
										>
											{'>'} INSTALL
										</button>
										<button
											onClick={handlePwaDismiss}
											className="text-white/70 hover:text-white transition-colors bg-black/80 border-2 border-white/30 p-2"
										>
											<X className="w-4 h-4" />
										</button>
									</div>
								</div>
							)}
						</div>

						<div className="h-1 bg-gradient-to-r from-transparent via-red-600/50 to-transparent opacity-50"></div>
					</div>
				</div>
			)}
		</div>
	);
	}
