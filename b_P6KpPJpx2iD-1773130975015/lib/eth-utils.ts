import { formatEther, parseEther, formatUnits, parseUnits } from 'ethers';

/**
 * Format ETH price string (18 decimals) to human-readable format
 * Uses ethers.js to avoid JavaScript floating-point errors
 */
export function formatEthPrice(priceWei: string, decimals: number = 4): string {
  try {
    const formatted = formatEther(priceWei);
    const num = parseFloat(formatted);
    return num.toFixed(decimals);
  } catch {
    // If already in decimal format, just format it
    const num = parseFloat(priceWei);
    return num.toFixed(decimals);
  }
}

/**
 * Parse human-readable ETH amount to wei string
 */
export function toWei(ethAmount: string | number): string {
  return parseEther(ethAmount.toString()).toString();
}

/**
 * Format wei to ETH with specified decimals
 */
export function fromWei(weiAmount: string | bigint, decimals: number = 18): string {
  return formatUnits(weiAmount, decimals);
}

/**
 * Calculate price per ton of CO2
 */
export function calculatePricePerTon(totalPriceEth: string, co2Tonnage: number): string {
  try {
    const priceNum = parseFloat(totalPriceEth);
    const perTon = priceNum / co2Tonnage;
    return perTon.toFixed(6);
  } catch {
    return '0.000000';
  }
}

/**
 * Format a wallet address to short form (0x1234...5678)
 */
export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format a transaction hash to short form
 */
export function formatTxHash(hash: string): string {
  if (!hash) return '';
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

/**
 * Validate Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Calculate fractional price based on percentage
 */
export function calculateFractionalPrice(
  totalPriceEth: string,
  percentage: number
): string {
  const total = parseFloat(totalPriceEth);
  const fractional = (total * percentage) / 100;
  return fractional.toFixed(6);
}

/**
 * Calculate fractional CO2 tonnage based on percentage
 */
export function calculateFractionalTonnage(
  totalTonnage: number,
  percentage: number
): number {
  return (totalTonnage * percentage) / 100;
}
