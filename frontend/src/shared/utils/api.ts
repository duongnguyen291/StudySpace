/**
 * API Client
 * Axios instance with authentication and error handling
 */
import axios, { AxiosInstance, AxiosError } from 'axios'
import '@/lib/axios-https-patch'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
      },
    })



    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      (config) => {
        // Force HTTPS in production - This is the LAST LINE OF DEFENSE
        if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
          // Check and fix URL
          if (config.url && config.url.startsWith('http://') && !config.url.includes('localhost')) {
            config.url = config.url.replace('http://', 'https://')
          }
          
          // Check and fix baseURL
          if (config.baseURL && config.baseURL.startsWith('http://') && !config.baseURL.includes('localhost')) {
            config.baseURL = config.baseURL.replace('http://', 'https://')
          }
          
          // AGGRESSIVE FIX: Reconstruct full URL and ensure HTTPS
          const fullUrl = (config.baseURL || '') + (config.url || '')
          if (fullUrl.startsWith('http://') && !fullUrl.includes('localhost')) {
            const httpsUrl = fullUrl.replace('http://', 'https://')
            
            // Split back into baseURL and url
            const apiV1Index = httpsUrl.indexOf('/api/v1')
            if (apiV1Index !== -1) {
              config.baseURL = httpsUrl.substring(0, apiV1Index + 7) // Include "/api/v1"
              config.url = httpsUrl.substring(apiV1Index + 7) // Rest of the path
            }
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

