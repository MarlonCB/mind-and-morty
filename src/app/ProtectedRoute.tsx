import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store'

// Separado en su propio archivo para que router.tsx solo exporte no-componentes
// (la constante router), cumpliendo el requisito de React Fast Refresh de que
// un archivo exporte solo componentes o solo no-componentes.
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />
}
