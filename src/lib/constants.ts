export const SOL_USD_RATE = 186.54;

export const STABLECOIN_SYMBOLS = ["USDC", "USDT"] as const;

export type StablecoinSymbol = (typeof STABLECOIN_SYMBOLS)[number];

export const isStablecoin = (symbol: string): symbol is StablecoinSymbol =>
  STABLECOIN_SYMBOLS.includes(symbol as StablecoinSymbol);

export const formatSolUsdRate = () =>
  new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(SOL_USD_RATE);
