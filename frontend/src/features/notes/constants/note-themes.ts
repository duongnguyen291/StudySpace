/**
 * Note Theme Constants
 * Theme presets for regular notes
 */

export type NoteTheme = 
  | 'standard'
  | 'cute_pink'
  | 'elegant_beige'
  | 'calm_blue'
  | 'study_minimal'
  | 'soft_lavender'
  | 'mint_green'
  | 'peach_cream'
  | 'sky_blue'
  | 'warm_apricot'
  | 'lilac_dream'
  | 'sage_green'

export interface ThemeConfig {
  id: NoteTheme
  name: string
  icon: string
  bgColor: string
  borderColor: string
  textColor: string
  previewBg: string
  // Inline styles for dynamic usage
  bgColorHex: string
  borderColorHex: string
  textColorHex: string
}

export const NOTE_THEMES: Record<NoteTheme, ThemeConfig> = {
  standard: {
    id: 'standard',
    name: 'Standard',
    icon: '📝',
    bgColor: 'bg-gray-900 dark:bg-gray-900',
    borderColor: 'border-gray-700 dark:border-gray-700',
    textColor: 'text-white dark:text-white',
    previewBg: 'bg-gray-900',
    bgColorHex: '#111827',
    borderColorHex: '#374151',
    textColorHex: '#ffffff',
  },
  study_minimal: {
    id: 'study_minimal',
    name: 'Study Minimal',
    icon: '📚',
    bgColor: 'bg-gray-50 dark:bg-gray-800',
    borderColor: 'border-gray-200 dark:border-gray-700',
    textColor: 'text-gray-800 dark:text-gray-200',
    previewBg: 'bg-gray-50',
    bgColorHex: '#f9fafb',
    borderColorHex: '#e5e7eb',
    textColorHex: '#1f2937',
  },
  cute_pink: {
    id: 'cute_pink',
    name: 'Cute Pink',
    icon: '🎀',
    bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    borderColor: 'border-pink-300 dark:border-pink-600',
    textColor: 'text-pink-900 dark:text-pink-200',
    previewBg: 'bg-pink-50',
    bgColorHex: '#fce7f3',
    borderColorHex: '#f9a8d4',
    textColorHex: '#831843',
  },
  elegant_beige: {
    id: 'elegant_beige',
    name: 'Elegant Beige',
    icon: '✨',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-300 dark:border-amber-600',
    textColor: 'text-amber-900 dark:text-amber-200',
    previewBg: 'bg-amber-50',
    bgColorHex: '#fffbeb',
    borderColorHex: '#fcd34d',
    textColorHex: '#78350f',
  },
  calm_blue: {
    id: 'calm_blue',
    name: 'Calm Blue',
    icon: '🌊',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-300 dark:border-blue-600',
    textColor: 'text-blue-900 dark:text-blue-200',
    previewBg: 'bg-blue-50',
    bgColorHex: '#eff6ff',
    borderColorHex: '#93c5fd',
    textColorHex: '#1e3a8a',
  },
  soft_lavender: {
    id: 'soft_lavender',
    name: 'Soft Lavender',
    icon: '💜',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-600',
    textColor: 'text-purple-900 dark:text-purple-200',
    previewBg: 'bg-purple-50',
    bgColorHex: '#faf5ff',
    borderColorHex: '#e9d5ff',
    textColorHex: '#6b21a8',
  },
  mint_green: {
    id: 'mint_green',
    name: 'Mint Green',
    icon: '🌿',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    borderColor: 'border-emerald-200 dark:border-emerald-600',
    textColor: 'text-emerald-900 dark:text-emerald-200',
    previewBg: 'bg-emerald-50',
    bgColorHex: '#ecfdf5',
    borderColorHex: '#a7f3d0',
    textColorHex: '#064e3b',
  },
  peach_cream: {
    id: 'peach_cream',
    name: 'Peach Cream',
    icon: '🍑',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-600',
    textColor: 'text-orange-900 dark:text-orange-200',
    previewBg: 'bg-orange-50',
    bgColorHex: '#fff7ed',
    borderColorHex: '#fed7aa',
    textColorHex: '#9a3412',
  },
  sky_blue: {
    id: 'sky_blue',
    name: 'Sky Blue',
    icon: '☁️',
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
    borderColor: 'border-cyan-200 dark:border-cyan-600',
    textColor: 'text-cyan-900 dark:text-cyan-200',
    previewBg: 'bg-cyan-50',
    bgColorHex: '#ecfeff',
    borderColorHex: '#a5f3fc',
    textColorHex: '#164e63',
  },
  warm_apricot: {
    id: 'warm_apricot',
    name: 'Warm Apricot',
    icon: '🍊',
    bgColor: 'bg-rose-50 dark:bg-rose-900/20',
    borderColor: 'border-rose-200 dark:border-rose-600',
    textColor: 'text-rose-900 dark:text-rose-200',
    previewBg: 'bg-rose-50',
    bgColorHex: '#fff1f2',
    borderColorHex: '#fecdd3',
    textColorHex: '#881337',
  },
  lilac_dream: {
    id: 'lilac_dream',
    name: 'Lilac Dream',
    icon: '🌸',
    bgColor: 'bg-fuchsia-50 dark:bg-fuchsia-900/20',
    borderColor: 'border-fuchsia-200 dark:border-fuchsia-600',
    textColor: 'text-fuchsia-900 dark:text-fuchsia-200',
    previewBg: 'bg-fuchsia-50',
    bgColorHex: '#fdf4ff',
    borderColorHex: '#f0abfc',
    textColorHex: '#86198f',
  },
  sage_green: {
    id: 'sage_green',
    name: 'Sage Green',
    icon: '🍃',
    bgColor: 'bg-teal-50 dark:bg-teal-900/20',
    borderColor: 'border-teal-200 dark:border-teal-600',
    textColor: 'text-teal-900 dark:text-teal-200',
    previewBg: 'bg-teal-50',
    bgColorHex: '#f0fdfa',
    borderColorHex: '#99f6e4',
    textColorHex: '#134e4a',
  },
}

export const DEFAULT_THEME: NoteTheme = 'standard'

export const THEME_LIST: ThemeConfig[] = Object.values(NOTE_THEMES)

