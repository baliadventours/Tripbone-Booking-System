import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 
 * @deprecated Use FormattedPrice component or useCurrency hook for dynamic currency support.
 * This utility only provides a static USD fallback.
 */
export function formatPrice(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
