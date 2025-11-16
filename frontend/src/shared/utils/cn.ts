/**
 * Utility function to merge Tailwind CSS classes
 * Similar to clsx but optimized for Tailwind
 */
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

