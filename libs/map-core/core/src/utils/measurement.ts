/**
 * Framework-agnostic measurement formatting utilities
 */

import { formatNumber } from './number';

/**
 * Format distance value with appropriate unit (meters or kilometers)
 *
 * @param value - Distance in kilometers
 * @param locales - Locale string for number formatting (default: 'vi')
 * @returns Formatted distance string (e.g., "1.234,56 m" or "1,23 km")
 *
 * @example
 * formatDistanceText(0.5) // "500,00 m"
 * formatDistanceText(1.5) // "1,50 km"
 */
export function formatDistanceText(value = 0, locales = 'vi'): string {
  if (value < 1) {
    return `${formatNumber((value * 1000).toFixed(2), locales)} m`;
  }
  return `${formatNumber(value.toFixed(2), locales)} km`;
}

/**
 * Format area value with appropriate unit (square meters or square kilometers)
 *
 * @param value - Area in square meters
 * @param locales - Locale string for number formatting (default: 'vi')
 * @returns Formatted area string (e.g., "1.234,56 m²" or "1,23 km²")
 *
 * @example
 * formatAreaText(500000) // "500.000,00 m²"
 * formatAreaText(2000000) // "2,00 km²"
 */
export function formatAreaText(value = 0, locales = 'vi'): string {
  if (value < 1_000_000) {
    return `${formatNumber(value.toFixed(2), locales)} m²`;
  }
  return `${formatNumber((value / 1_000_000).toFixed(2), locales)} km²`;
}
