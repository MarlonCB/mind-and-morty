import { Navigate } from 'react-router-dom'
import Login from '../components/auth/Login'
import { useAuthStore } from '../store'

export default function LoginPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (isAuthenticated) return <Navigate to="/game" replace />

  return (
    <div className="login-page">
      <Login />
    </div>
  )
}
