export interface User {
  email: string
}

export interface AuthState {
  isAuthenticated: boolean
  token: string | null
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  checkAuth: () => void
}
