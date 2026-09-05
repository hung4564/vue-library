/**
 * Framework-agnostic number formatting utilities
 */

/**
 * Format a number with locale-specific formatting
 *
 * @param number - The number to format (can be string or number)
 * @param locales - Locale string (default: 'vi')
 * @returns Formatted number string
 *
 * @example
 * formatNumber(1234.56) // "1.234,56" (Vietnamese locale)
 * formatNumber(1234.56, 'en') // "1,234.56" (English locale)
 */
export function formatNumber(number: number | string, locales = 'vi'): string {
  const num = typeof number === 'string' ? parseFloat(number) : number;
  return new Intl.NumberFormat(locales).format(num);
}
