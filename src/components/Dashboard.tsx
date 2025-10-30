"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowDownUp,
  ArrowLeft,
  Check,
  Copy,
  Eye,
  EyeOff,
  QrCode,
  RefreshCcw,
  Send,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DashboardProps {
  onBack: () => void;
  walletAddress?: string | null;
  totalBalance: number;
  usdcBalance: number;
  yieldEarned: number;
  onSend: (amount: string, recipient: string, currency: string) => Promise<boolean>;
  onConvert: (amount: string) => Promise<boolean>;
  onRedeemYield: (amount: string) => Promise<boolean>;
  onSwap: (amount: string, fromCurrency: string, toCurrency: string) => Promise<boolean>;
  onRefreshBalances: () => Promise<void>;
  loading: boolean;
  error?: string;
  walletButton: React.ReactNode;
  connected: boolean;
}

export default function Dashboard({
  onBack,
  walletAddress,
  totalBalance,
  usdcBalance,
  yieldEarned,
  onSend,
  onConvert,
  onRedeemYield,
  onSwap,
  onRefreshBalances,
  loading,
  error,
  walletButton,
  connected,
}: DashboardProps) {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [convertAmount, setConvertAmount] = useState("");
  const [copied, setCopied] = useState(false);

  // Swap states
  const [swapAmount, setSwapAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("USDC");
  const [toCurrency, setToCurrency] = useState("SOL");

  // Yield states
  const [yieldAmount, setYieldAmount] = useState("");
  const [yieldDirection, setYieldDirection] = useState<"toYield" | "fromYield">("toYield");

  // Send and Receive currency states
  const [sendCurrency, setSendCurrency] = useState("USDC");
  const [receiveCurrency, setReceiveCurrency] = useState("USDC");

  useEffect(() => {
    const words = document.querySelectorAll(".word");
    words.forEach((word) => {
      const delay = parseInt(word.getAttribute("data-delay") || "0", 10);
      setTimeout(() => {
        word.classList.add("animate-word-appear");
      }, delay);
    });
  }, []);

  const currentAddress = walletAddress || "";

  const copyAddress = () => {
    if (!currentAddress) {
      return;
    }

    const handleSuccess = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(currentAddress).then(handleSuccess).catch(fallbackCopy);
      return;
    }

    fallbackCopy();

    function fallbackCopy() {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = currentAddress;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        handleSuccess();
      } catch (err) {
        console.error("Copy failed:", err);
      }
    }
  };

  const handleSend = async () => {
    if (!sendAmount || !recipient) {
      return;
    }
    const success = await onSend(sendAmount, recipient, sendCurrency);
    if (success) {
      setSendAmount("");
      setRecipient("");
    }
  };

  const handleSwap = async () => {
    if (!swapAmount || fromCurrency === toCurrency) {
      return;
    }
    const success = await onSwap(swapAmount, fromCurrency, toCurrency);
    if (success) {
      setSwapAmount("");
    }
  };

  const handleYieldConvert = async () => {
    if (!yieldAmount) {
      return;
    }
    
    const success = yieldDirection === "toYield" 
      ? await onConvert(yieldAmount)
      : await onRedeemYield(yieldAmount);
      
    if (success) {
      setYieldAmount("");
    }
  };

  const handleRefresh = async () => {
    await onRefreshBalances();
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <button
        onClick={onBack}
        className="fixed left-6 top-6 z-50 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-white/70 transition-colors hover:text-white sm:text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Back</span>
      </button>

      <div className="fixed right-6 top-6 z-50 flex flex-col items-end gap-2">
        <div className="w-full max-w-xs text-right text-[10px] font-mono uppercase tracking-widest text-white/60 sm:text-xs">
          {connected ? "Wallet connected" : "Wallet disconnected"}
        </div>
        <div className="wallet-button-wrapper">{walletButton}</div>
        <button
          onClick={onBack}
          className="border-white/30 text-white/70 hover:border-white/60 hover:text-white bg-black/20 px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all sm:px-4 sm:py-2 sm:text-sm"
        >
          Logout
        </button>
      </div>

      <div className="w-full max-w-4xl space-y-4 sm:space-y-6">
        <div className="mb-3 text-center sm:mb-6">
          <h1 className="brutal-glitch mb-2 block text-8xl font-black leading-none tracking-tighter text-white sm:text-9xl md:text-[10rem] lg:text-[12rem] xl:text-[16rem] 2xl:text-[20rem]">
            <span className="word block" data-delay="300">
              NOMA
            </span>
          </h1>
          <div className="text-white/90 word inline-block font-mono text-3xl font-bold tracking-[0.3em] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl" data-delay="500">
            CASH
          </div>
        </div>

        {error && (
          <div className="grunge-box border-2 border-red-600/40 p-4 text-center text-sm font-mono uppercase tracking-wider text-red-400">
            {error}
          </div>
        )}

        <div className="grunge-box relative border-2 border-white/20 p-6 sm:p-8">
          <div className="absolute inset-0 opacity-30" />
          <div className="relative z-10">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs uppercase tracking-wider text-white/60 sm:text-sm">
                  Total Balance
                </span>
                <button
                  onClick={() => setBalanceVisible((v) => !v)}
                  className="text-white/40 transition-colors hover:text-white/70"
                >
                  {balanceVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-white/50 transition-colors hover:text-white"
                disabled={loading}
              >
                <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            <div className="mb-6">
              <div className="font-black text-white" style={{ fontSize: "clamp(2.5rem, 8vw, 5rem)" }}>
                {balanceVisible ? `$${totalBalance.toFixed(2)}` : "••••••"}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <div>
                <div className="mb-1 font-mono text-xs uppercase tracking-wider text-white/40">
                  USDC Balance
                </div>
                <div className="text-xl font-black text-white sm:text-2xl">
                  {balanceVisible ? `$${usdcBalance.toFixed(2)}` : "••••"}
                </div>
              </div>
              <div className="text-right">
                <div className="mb-1 font-mono text-xs uppercase tracking-wider text-white/40">
                  Yield Earned
                </div>
                <div className="text-xl font-black text-white/70 sm:text-2xl">
                  {balanceVisible ? `+$${yieldEarned.toFixed(2)}` : "••••"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="send" className="w-full">
          <TabsList className="grid h-auto w-full grid-cols-4 gap-1 border-2 border-white/20 bg-black/40 p-1">
            <TabsTrigger
              value="send"
              className="rounded-none py-3 text-[0.6rem] font-black uppercase tracking-wider text-white/60 transition data-[state=active]:border-2 data-[state=active]:border-white data-[state=active]:bg-white data-[state=active]:text-black sm:py-4 sm:text-xs md:text-sm"
            >
              <Send className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Send Money</span>
              <span className="sm:hidden">Send</span>
            </TabsTrigger>
            <TabsTrigger
              value="receive"
              className="rounded-none py-3 text-[0.6rem] font-black uppercase tracking-wider text-white/60 transition data-[state=active]:border-2 data-[state=active]:border-white data-[state=active]:bg-white data-[state=active]:text-black sm:py-4 sm:text-xs md:text-sm"
            >
              <QrCode className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Receive Money</span>
              <span className="sm:hidden">Receive</span>
            </TabsTrigger>
            <TabsTrigger
              value="yield"
              className="rounded-none py-3 text-[0.6rem] font-black uppercase tracking-wider text-white/60 transition data-[state=active]:border-2 data-[state=active]:border-white data-[state=active]:bg-white data-[state=active]:text-black sm:py-4 sm:text-xs md:text-sm"
            >
              <RefreshCcw className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Earn Yield</span>
              <span className="sm:hidden">Yield</span>
            </TabsTrigger>
            <TabsTrigger
              value="swap"
              className="rounded-none py-3 text-[0.6rem] font-black uppercase tracking-wider text-white/60 transition data-[state=active]:border-2 data-[state=active]:border-white data-[state=active]:bg-white data-[state=active]:text-black sm:py-4 sm:text-xs md:text-sm"
            >
              <ArrowDownUp className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Swap</span>
              <span className="sm:hidden">Swap</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="send" className="mt-0">
            <div className="grunge-box space-y-6 border-2 border-white/20 p-6 sm:p-8">
              <div className="font-mono text-xs uppercase tracking-wider text-white/50 sm:text-sm">
                Send {sendCurrency}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wider text-white sm:text-sm">
                    Currency
                  </label>
                  <Select value={sendCurrency} onValueChange={setSendCurrency}>
                    <SelectTrigger className="h-auto w-full rounded-none border-2 border-white/20 bg-black/60 px-4 py-3 font-mono text-sm text-white transition-colors focus:border-white/60 focus:outline-none sm:py-4 sm:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-2 border-white/20 bg-black font-mono text-white">
                      <SelectItem value="USDC" className="text-white hover:bg-white/10 focus:bg-white/10">USDC</SelectItem>
                      <SelectItem value="USDT" className="text-white hover:bg-white/10 focus:bg-white/10">USDT</SelectItem>
                      <SelectItem value="SOL" className="text-white hover:bg-white/10 focus:bg-white/10">SOL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wider text-white sm:text-sm">
                    Amount ({sendCurrency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-none border-2 border-white/20 bg-black/60 px-4 py-3 font-mono text-base text-white transition-colors outline-none focus:border-white/60 sm:py-4 sm:text-lg"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wider text-white sm:text-sm">
                    Recipient
                  </label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="Address..."
                    className="w-full rounded-none border-2 border-white/20 bg-black/60 px-4 py-3 font-mono text-sm text-white transition-colors outline-none focus:border-white/60 sm:py-4 sm:text-base"
                    disabled={loading}
                  />
                </div>

                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="brutal-btn-primary flex w-full items-center justify-center gap-3 py-4 text-sm font-black uppercase tracking-wider transition disabled:cursor-not-allowed disabled:opacity-60 sm:py-5 sm:text-base"
                >
                  {loading ? "Processing" : "Send"}
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="receive" className="mt-0">
            <div className="grunge-box space-y-6 border-2 border-white/20 p-6 sm:p-8">
              <div className="font-mono text-xs uppercase tracking-wider text-white/50 sm:text-sm">
                Receive {receiveCurrency} to your wallet
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-wider text-white sm:text-sm">
                  Currency to Receive
                </label>
                <Select value={receiveCurrency} onValueChange={setReceiveCurrency}>
                  <SelectTrigger className="h-auto w-full rounded-none border-2 border-white/20 bg-black/60 px-4 py-3 font-mono text-sm text-white transition-colors focus:border-white/60 focus:outline-none sm:py-4 sm:text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-2 border-white/20 bg-black font-mono text-white">
                    <SelectItem value="USDC" className="text-white hover:bg-white/10 focus:bg-white/10">USDC</SelectItem>
                    <SelectItem value="USDT" className="text-white hover:bg-white/10 focus:bg-white/10">USDT</SelectItem>
                    <SelectItem value="SOL" className="text-white hover:bg-white/10 focus:bg-white/10">SOL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-center">
                <div className="bg-white p-4 sm:p-6">
                  <svg viewBox="0 0 180 180" className="h-36 w-36 sm:h-44 sm:w-44">
                    <rect width="180" height="180" fill="white" />
                    <g fill="black">
                      <rect x="10" y="10" width="50" height="50" />
                      <rect x="20" y="20" width="30" height="30" fill="white" />
                      <rect x="25" y="25" width="20" height="20" fill="black" />

                      <rect x="120" y="10" width="50" height="50" />
                      <rect x="130" y="20" width="30" height="30" fill="white" />
                      <rect x="135" y="25" width="20" height="20" fill="black" />

                      <rect x="10" y="120" width="50" height="50" />
                      <rect x="20" y="130" width="30" height="30" fill="white" />
                      <rect x="25" y="135" width="20" height="20" fill="black" />

                      <rect x="70" y="15" width="8" height="8" />
                      <rect x="82" y="15" width="8" height="8" />
                      <rect x="94" y="15" width="8" height="8" />
                      <rect x="70" y="27" width="8" height="8" />
                      <rect x="94" y="27" width="8" height="8" />
                      <rect x="106" y="27" width="8" height="8" />

                      <rect x="70" y="70" width="8" height="8" />
                      <rect x="82" y="70" width="8" height="8" />
                      <rect x="94" y="82" width="8" height="8" />
                      <rect x="106" y="70" width="8" height="8" />
                      <rect x="118" y="82" width="8" height="8" />

                      <rect x="15" y="70" width="8" height="8" />
                      <rect x="27" y="82" width="8" height="8" />
                      <rect x="39" y="70" width="8" height="8" />
                      <rect x="51" y="82" width="8" height="8" />

                      <rect x="70" y="120" width="8" height="8" />
                      <rect x="82" y="132" width="8" height="8" />
                      <rect x="94" y="120" width="8" height="8" />
                      <rect x="106" y="144" width="8" height="8" />
                      <rect x="118" y="132" width="8" height="8" />
                      <rect x="130" y="120" width="8" height="8" />
                      <rect x="142" y="132" width="8" height="8" />
                      <rect x="154" y="144" width="8" height="8" />
                    </g>
                  </svg>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-black uppercase tracking-wider text-white sm:text-sm">
                  Your Wallet Address
                </label>
                <div className="relative">
                  <div className="w-full break-all border-2 border-white/20 bg-black/60 px-4 py-3 font-mono text-xs text-white sm:py-4 sm:text-sm">
                    {currentAddress || "Connect wallet or complete email login"}
                  </div>
                  <button
                    onClick={copyAddress}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white/60 transition-colors hover:text-white"
                    disabled={!currentAddress}
                  >
                    {copied ? <Check className="h-5 w-5 text-white" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                onClick={copyAddress}
                className="brutal-btn-primary flex w-full items-center justify-center gap-3 py-4 text-sm font-black uppercase tracking-wider transition sm:py-5 sm:text-base"
                disabled={!currentAddress}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 sm:h-5 sm:w-5" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 sm:h-5 sm:w-5" /> Copy Address
                  </>
                )}
              </button>

              <div className="border border-white/20 bg-white/5 p-4">
                <div className="text-xs font-black uppercase tracking-wider text-white/70">
                  How to Receive
                </div>
                <ul className="mt-2 space-y-1 font-mono text-xs text-white/50">
                  <li>• Share your address or QR code</li>
                  <li>• Only accept {receiveCurrency} on Solana</li>
                  <li>• Transactions are irreversible</li>
                  <li>• Verify sender before confirming</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="yield" className="mt-0">
            <div className="grunge-box space-y-6 border-2 border-white/20 p-6 sm:p-8">
              <div className="font-mono text-xs uppercase tracking-wider text-white/50 sm:text-sm">
                {yieldDirection === "toYield" ? "Convert USDC to USDC+ (Earn Yield)" : "Redeem USDC+ to USDC"}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-4 block text-xs font-black uppercase tracking-wider text-white sm:text-sm">
                    Conversion Direction
                  </label>
                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-6">
                      <span className={`font-mono text-sm transition-colors ${yieldDirection === "toYield" ? "text-white font-black" : "text-white/40"}`}>
                        USDC → USDC+
                      </span>
                      <button
                        onClick={() => setYieldDirection(yieldDirection === "toYield" ? "fromYield" : "toYield")}
                        className="relative inline-flex h-8 w-16 items-center rounded-none border-2 border-white/30 bg-black/80 transition-all duration-300 focus:outline-none focus:border-white/60 hover:border-white/50"
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-none border-2 transition-all duration-300 ${
                            yieldDirection === "toYield" 
                              ? "translate-x-1 border-white bg-white" 
                              : "translate-x-7 border-white/60 bg-white/60"
                          }`}
                        />
                      </button>
                      <span className={`font-mono text-sm transition-colors ${yieldDirection === "fromYield" ? "text-white font-black" : "text-white/40"}`}>
                        USDC+ → USDC
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 text-center text-xs font-mono text-white/50">
                    {yieldDirection === "toYield" ? "Earn yield on your USDC" : "Redeem USDC+ back to USDC"}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wider text-white sm:text-sm">
                    Amount ({yieldDirection === "toYield" ? "USDC" : "USDC+"})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={yieldAmount}
                    onChange={(e) => setYieldAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-none border-2 border-white/20 bg-black/60 px-4 py-3 font-mono text-base text-white transition-colors outline-none focus:border-white/60 sm:py-4 sm:text-lg"
                    disabled={loading}
                  />
                </div>

                {/* Conversion Information */}
                <div className="rounded-none border border-white/20 bg-white/5 p-4">
                  <div className="mb-3 text-xs font-black uppercase tracking-wider text-white/70">
                    {yieldDirection === "toYield" ? "Yield Information" : "Redemption Information"}
                  </div>
                  <div className="space-y-2">
                    {yieldDirection === "toYield" ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-white/60">Current APY:</span>
                          <span className="text-sm font-black text-green-400">20%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-white/60">You will receive:</span>
                          <span className="text-sm font-black text-white">
                            {yieldAmount ? parseFloat(yieldAmount).toFixed(2) : '0.00'} USDC+
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-white/60">Est. annual earnings:</span>
                          <span className="text-sm font-black text-white/80">
                            ${yieldAmount ? (parseFloat(yieldAmount) * 0.2).toFixed(2) : '0.00'}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-white/60">Exchange rate:</span>
                          <span className="text-sm font-black text-white">1 USDC+ = 1 USDC</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-white/60">You will receive:</span>
                          <span className="text-sm font-black text-white">
                            {yieldAmount ? parseFloat(yieldAmount).toFixed(2) : '0.00'} USDC
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-white/60">Processing time:</span>
                          <span className="text-sm font-black text-white/80">Instant</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Benefits/Information */}
                <div className="border border-white/20 bg-white/5 p-4">
                  <div className="text-xs font-black uppercase tracking-wider text-white/70">
                    {yieldDirection === "toYield" ? "Benefits of USDC+" : "Redemption Details"}
                  </div>
                  <ul className="mt-2 space-y-1 font-mono text-xs text-white/50">
                    {yieldDirection === "toYield" ? (
                      <>
                        <li>• Earn up to 20% APY on your USDC</li>
                        <li>• Compound interest automatically</li>
                        <li>• Redeem back to USDC anytime</li>
                        <li>• Protected by DeFi protocols</li>
                      </>
                    ) : (
                      <>
                        <li>• Instant conversion to USDC</li>
                        <li>• No fees or penalties</li>
                        <li>• Keep all earned yield</li>
                        <li>• Can re-convert to USDC+ anytime</li>
                      </>
                    )}
                  </ul>
                </div>

                <button
                  onClick={handleYieldConvert}
                  disabled={loading || !yieldAmount}
                  className="brutal-btn-primary flex w-full items-center justify-center gap-3 py-4 text-sm font-black uppercase tracking-wider transition disabled:cursor-not-allowed disabled:opacity-60 sm:py-5 sm:text-base"
                >
                  {loading ? "Processing..." : yieldDirection === "toYield" ? "Convert to USDC+" : "Redeem to USDC"}
                  <RefreshCcw className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="swap" className="mt-0">
            <div className="grunge-box space-y-6 border-2 border-white/20 p-6 sm:p-8">
              <div className="font-mono text-xs uppercase tracking-wider text-white/50 sm:text-sm">
                SWAP TOKENS INSTANTLY
              </div>

              <div className="space-y-4">
                {/* From Currency */}
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wider text-white sm:text-sm">
                    From
                  </label>
                  <Select value={fromCurrency} onValueChange={setFromCurrency}>
                    <SelectTrigger className="h-auto w-full rounded-none border-2 border-white/20 bg-black/60 px-4 py-3 font-mono text-sm text-white transition-colors focus:border-white/60 focus:outline-none sm:py-4 sm:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-2 border-white/20 bg-black font-mono text-white">
                      <SelectItem value="SOL" className="text-white hover:bg-white/10 focus:bg-white/10">SOL</SelectItem>
                      <SelectItem value="USDC" className="text-white hover:bg-white/10 focus:bg-white/10">USDC</SelectItem>
                      <SelectItem value="USDT" className="text-white hover:bg-white/10 focus:bg-white/10">USDT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount */}
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wider text-white sm:text-sm">
                    Amount ({fromCurrency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={swapAmount}
                    onChange={(e) => setSwapAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-none border-2 border-white/20 bg-black/60 px-4 py-3 font-mono text-base text-white transition-colors focus:border-white/60 focus:outline-none sm:py-4 sm:text-lg"
                  />
                </div>

                {/* Swap Direction Indicator */}
                <div className="flex justify-center py-2">
                  <button
                    onClick={() => {
                      const temp = fromCurrency;
                      setFromCurrency(toCurrency);
                      setToCurrency(temp);
                    }}
                    className="rounded-none border-2 border-white/20 bg-white/10 p-3 transition-colors hover:bg-white/20"
                  >
                    <ArrowDownUp className="h-5 w-5 text-white" />
                  </button>
                </div>

                {/* To Currency */}
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wider text-white sm:text-sm">
                    To
                  </label>
                  <Select value={toCurrency} onValueChange={setToCurrency}>
                    <SelectTrigger className="h-auto w-full rounded-none border-2 border-white/20 bg-black/60 px-4 py-3 font-mono text-sm text-white transition-colors focus:border-white/60 focus:outline-none sm:py-4 sm:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-2 border-white/20 bg-black font-mono text-white">
                      <SelectItem value="SOL" className="text-white hover:bg-white/10 focus:bg-white/10">SOL</SelectItem>
                      <SelectItem value="USDC" className="text-white hover:bg-white/10 focus:bg-white/10">USDC</SelectItem>
                      <SelectItem value="USDT" className="text-white hover:bg-white/10 focus:bg-white/10">USDT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Estimated Output */}
                <div className="rounded-none border border-white/20 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-white/60 sm:text-sm">Estimated output:</span>
                    <span className="font-mono text-sm font-black text-white sm:text-base">
                      {swapAmount ? (parseFloat(swapAmount) * 0.98).toFixed(4) : '0.00'} {toCurrency}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={handleSwap}
                  disabled={fromCurrency === toCurrency || loading}
                  className="brutal-btn-primary flex w-full items-center justify-center gap-3 py-4 text-sm font-black uppercase tracking-wider transition disabled:cursor-not-allowed disabled:opacity-50 sm:py-5 sm:text-base"
                >
                  {fromCurrency === toCurrency ? 'Select different tokens' : loading ? 'Processing...' : 'Swap'}
                  <ArrowDownUp className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="text-center font-mono text-xs uppercase tracking-widest text-white/40">
          <span className="font-black text-red-500">⚠</span> Your keys, Your crypto
        </div>
      </div>
    </div>
  );
}
