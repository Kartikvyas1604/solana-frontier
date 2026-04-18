const LAMPORTS_PER_USDC = 1_000_000n;
const BPS_DENOMINATOR = 10_000n;

export function calculateShares(
  depositAmount: bigint,
  totalAssets: bigint,
  totalShares: bigint
): bigint {
  if (totalShares === 0n || totalAssets === 0n) {
    return depositAmount;
  }
  return (depositAmount * totalShares) / totalAssets;
}

export function calculateAssets(
  shares: bigint,
  totalAssets: bigint,
  totalShares: bigint
): bigint {
  if (totalShares === 0n) return 0n;
  return (shares * totalAssets) / totalShares;
}

export function calculateDrawdown(peakNav: bigint, currentNav: bigint): number {
  if (peakNav === 0n) return 0;
  return Number((peakNav - currentNav) * 10000n / peakNav) / 10000;
}

export function applySlippage(price: bigint, slippageBps: number, direction: 'buy' | 'sell'): bigint {
  const slippageFactor = direction === 'buy'
    ? BPS_DENOMINATOR + BigInt(slippageBps)
    : BPS_DENOMINATOR - BigInt(slippageBps);
  return (price * slippageFactor) / BPS_DENOMINATOR;
}

export function calculateVolatility(prices: bigint[]): number {
  if (prices.length < 2) return 0;

  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    const ret = Number(prices[i]! - prices[i - 1]!) / Number(prices[i - 1]!);
    returns.push(ret);
  }

  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
  return Math.sqrt(variance);
}

export function lamportsToUsdc(lamports: bigint): number {
  return Number(lamports) / Number(LAMPORTS_PER_USDC);
}

export function usdcToLamports(usdc: number): bigint {
  return BigInt(Math.floor(usdc * Number(LAMPORTS_PER_USDC)));
}
