/**
 * Global State Management
 * Using Zustand for state management
 */
import { create } from 'zustand'

interface AppState {
  // Add global state here
  isLoading: boolean
  setLoading: (loading: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
}))

