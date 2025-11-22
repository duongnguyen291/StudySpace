/**
 * Authentication Hook
 * Manages user authentication state
 */
import { useState, useEffect } from 'react'
import { apiClient } from '../utils/api'

interface User {
  id: string
  email: string
  username: string
  avatar_url?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('access_token')
    if (token) {
      fetchUser()
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await apiClient.get('/auth/me')
      setAuthState({
        user: response.data,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to fetch user',
      })
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      })
      const { access_token, user: userData } = response.data
      localStorage.setItem('access_token', access_token)
      // Update user state immediately with response data
      if (userData) {
        setAuthState({
          user: userData,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })
      } else {
        await fetchUser()
      }
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed',
      }
    }
  }

  const register = async (email: string, username: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/register', {
        email,
        username,
        password,
      })
      const { access_token, user: userData } = response.data
      localStorage.setItem('access_token', access_token)
      // Update user state immediately with response data
      if (userData) {
        setAuthState({
          user: userData,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })
      } else {
        await fetchUser()
      }
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Registration failed',
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
  }

  return {
    ...authState,
    login,
    register,
    logout,
    refreshUser: fetchUser,
  }
}

