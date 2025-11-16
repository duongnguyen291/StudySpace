/**
 * Formatting utilities
 */

/**
 * Format date to Vietnamese format
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format time duration (minutes) to readable format
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} phút`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours} giờ ${mins} phút` : `${hours} giờ`
}

/**
 * Format number with thousand separator
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('vi-VN')
}

