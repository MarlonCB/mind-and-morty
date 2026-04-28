import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store'

/**
 * Guarda de ruta que redirige al login si el usuario no está autenticado.
 *
 * Se separa de router.tsx porque ese archivo exporta la constante `router`
 * (un no-componente). React Fast Refresh requiere que cada módulo exporte
 * solo componentes o solo no-componentes; mezclar ambos rompe el HMR.
 *
 * Uso en el router:
 *   <ProtectedRoute> actúa como layout route sin path; <Outlet> renderiza
 *   la ruta hija que corresponda (/game o /result).
 *
 * `replace` en Navigate evita agregar la ruta protegida al historial del
 * navegador, impidiendo que el botón "atrás" regrese a una ruta bloqueada.
 */
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />
}
