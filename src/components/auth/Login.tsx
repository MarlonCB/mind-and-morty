import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store'
import { Input, Button, Card } from '../index'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

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
          disabled={isLoading}
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
        {error && <p>{error}</p>}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Ingresando...' : 'Iniciar sesión'}
        </Button>
        <button type="button" className="login-form__forgot">
          ¿Olvidaste tu usuario o contraseña?
        </button>
      </form>
    </Card>
  )
}
