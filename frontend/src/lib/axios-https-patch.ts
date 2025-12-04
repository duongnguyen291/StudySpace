/**
 * Middleware for Next.js to enforce HTTPS for external API calls
 */

import axios from 'axios'

// Patch axios to ensure HTTPS URLs
const originalCreate = axios.create

axios.create = function(...args) {
  const instance = originalCreate.apply(axios, args)
  
  // Add response interceptor to check for downgrade attacks
  instance.interceptors.request.use(config => {
    // Ensure HTTPS for production URLs
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
      if (config.url && config.url.startsWith('http://') && !config.url.includes('localhost')) {
        config.url = config.url.replace('http://', 'https://')
      }
      if (config.baseURL && config.baseURL.startsWith('http://') && !config.baseURL.includes('localhost')) {
        config.baseURL = config.baseURL.replace('http://', 'https://')
      }
    }
    return config
  })
  
  return instance
}

export default axios
