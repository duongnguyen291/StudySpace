/**
 * API Client
 * Axios instance with authentication and error handling
 */
import axios, { AxiosInstance, AxiosError } from 'axios'
import '@/lib/axios-https-patch'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Debug: Log API URL in production
if (typeof window !== 'undefined') {
  console.log('🔗 API URL:', API_URL)
}

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Debug: Log full baseURL
    if (typeof window !== 'undefined') {
      console.log('🔧 Axios baseURL:', this.client.defaults.baseURL)
    }

    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      (config) => {
        // Debug: Log each request URL
        if (typeof window !== 'undefined') {
          console.log('📡 Request URL:', (config.baseURL || '') + (config.url || ''))
        }
        
        // Ensure HTTPS on production
        if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
          if (config.url && config.url.startsWith('http://') && !config.url.includes('localhost')) {
            console.warn('⚠️ Converting HTTP to HTTPS:', config.url)
            config.url = config.url.replace('http://', 'https://')
          }
          if (config.baseURL && config.baseURL.startsWith('http://') && !config.baseURL.includes('localhost')) {
            console.warn('⚠️ Converting baseURL HTTP to HTTPS:', config.baseURL)
            config.baseURL = config.baseURL.replace('http://', 'https://')
          }
        }
        
        const token = localStorage.getItem('access_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor - Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('access_token')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  get instance(): AxiosInstance {
    return this.client
  }
}

export const apiClient = new ApiClient().instance

