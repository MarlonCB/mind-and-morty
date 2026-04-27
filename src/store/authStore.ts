import { create } from 'zustand'
import type { AuthState } from '../types'

const MOCK_CREDENTIALS = {
  email: 'demo@memorygame.com',
  password: 'password123',
  token: 'fake-jwt-token-123456',
} as const

const TOKEN_KEY = 'authToken'

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  token: null,
  user: null,

  login: async (email, password) => {
    await new Promise((resolve) => setTimeout(resolve, 800))

    if (email !== MOCK_CREDENTIALS.email || password !== MOCK_CREDENTIALS.password) {
      return false
    }

    const token = MOCK_CREDENTIALS.token
    localStorage.setItem(TOKEN_KEY, token)
    set({ isAuthenticated: true, token, user: { email } })
    return true
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    set({ isAuthenticated: false, token: null, user: null })
  },

  checkAuth: () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      set({ isAuthenticated: true, token, user: { email: MOCK_CREDENTIALS.email } })
    }
  },
}))
