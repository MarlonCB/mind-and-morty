import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store'
import { Input, Button, Card } from '../index'

/**
 * Formulario de inicio de sesión.
 * Maneja su propio estado local de UI (email, password, error, loading)
 * y delega la lógica de autenticación al authStore.
 */
export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // isLoading local (no del store) porque solo afecta a este formulario,
  // no a otras partes de la UI que puedan consumir authStore.
  const [isLoading, setIsLoading] = useState(false)

  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  /**
   * Gestiona el envío del formulario.
   *
   * Tipo SyntheticEvent<HTMLFormElement>: FormEvent fue marcado como deprecated
   * en @types/react v19 porque era un alias trivial de SyntheticEvent.
   * SyntheticEvent es el tipo base correcto para eventos de formulario en React 19.
   *
   * Flujo:
   *  1. Limpia el error anterior para no mostrar mensajes de intentos previos.
   *  2. Activa isLoading para bloquear el formulario y mostrar feedback visual.
   *  3. Espera la respuesta del store (que simula latencia de red con 800ms).
   *  4. Navega al juego si tuvo éxito, o muestra el error si falló.
   */
  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')       // limpia errores del intento anterior
    setIsLoading(true) // bloquea el formulario durante la petición

    const success = await login(email, password)

    setIsLoading(false)

    if (success) {
      navigate('/game')
    } else {
      setError('Credenciales inválidas')
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="login-form">
        <Input
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="demo@memorygame.com"
          required
          disabled={isLoading} // evita edición mientras se procesa el login
        />
        <Input
          type="password"
          label="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          disabled={isLoading}
        />
        {/* El error solo se renderiza si existe, evitando espacio vacío en el DOM */}
        {error && <p className="login-form__error">{error}</p>}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Ingresando...' : 'Iniciar sesión'}
        </Button>
        {/* Botón decorativo — no tiene funcionalidad en esta demo */}
        <button type="button" className="login-form__forgot">
          ¿Olvidaste tu usuario o contraseña?
        </button>
      </form>
    </Card>
  )
}
