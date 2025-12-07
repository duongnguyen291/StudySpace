/**
 * Global axios HTTPS enforcer for production
 * This patches ALL axios instances to ensure HTTPS
 */

import axios from 'axios'



// Patch the global axios request method
const originalRequest = axios.request

axios.request = function<T = any, R = any, D = any>(config: any): Promise<R> {
  // Force HTTPS in production
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    if (config.url && config.url.startsWith('http://') && !config.url.includes('localhost')) {
      config.url = config.url.replace('http://', 'https://')
    }
    if (config.baseURL && config.baseURL.startsWith('http://') && !config.baseURL.includes('localhost')) {
      config.baseURL = config.baseURL.replace('http://', 'https://')
    }
  }
  
  return originalRequest.call(this, config) as Promise<R>
}

// Also patch axios.create to ensure all instances use HTTPS
const originalCreate = axios.create

axios.create = function(...args) {
  const instance = originalCreate.apply(axios, args)
  
  // Patch this instance too
  const originalInstanceRequest = instance.request
  
  instance.request = function<T = any, R = any, D = any>(config: any): Promise<R> {
    // Force HTTPS in production
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
      if (config.url && config.url.startsWith('http://') && !config.url.includes('localhost')) {
        config.url = config.url.replace('http://', 'https://')
      }
      if (config.baseURL && config.baseURL.startsWith('http://') && !config.baseURL.includes('localhost')) {
        config.baseURL = config.baseURL.replace('http://', 'https://')
      }
    }
    
    return originalInstanceRequest.call(this, config) as Promise<R>
  }
  
  return instance
}

export default axios
