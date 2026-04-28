import { useMemo } from 'react'
import Confetti from 'react-confetti'
import { useNavigate } from 'react-router-dom'
import { Card, Button } from '../components'
import { useGameStore, useAuthStore } from '../store'
import { CONFETTI_COLORS } from '../constants/confettiColors'
import { useWindowSize } from '../hooks/useWindowSize'

export default function ResultPage() {
  const { turns, resetGame } = useGameStore()
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  // useWindowSize escucha los eventos resize y devuelve dimensiones actualizadas,
  // a diferencia de window.innerWidth que solo se lee una vez en el render inicial.
  const { width, height } = useWindowSize()

  /**
   * El store de Zustand se reinicia cuando el jugador pulsa "Jugar de nuevo",
   * por lo que turns podría ser 0 al llegar a esta página por segunda vez.
   * El fallback de localStorage garantiza que el puntaje se muestre correctamente
   * incluso si el usuario recarga la página (el store se reinicia, pero localStorage persiste).
   *
   * useMemo evita releer localStorage en cada render innecesario.
   */
  const displayTurns = useMemo(() => {
    if (turns) return turns
    const stored = localStorage.getItem('game-result')
    return stored ? parseInt(stored) : 0
  }, [turns])

  /**
   * Reinicia el estado del juego y vuelve al tablero para una nueva partida.
   * resetGame limpia localStorage, resetea el store y llama a initGame internamente.
   */
  const handleReplay = () => {
    resetGame()
    navigate('/game')
  }

  /**
   * Cierra sesión completamente: resetea el juego, borra el token y
   * redirige al login. Sirve como salida limpia de la aplicación.
   */
  const handleExit = () => {
    resetGame()
    logout()
    navigate('/')
  }

  return (
    <div className="result-page">
      {/* Elementos decorativos: el portal y Morty corriendo son animaciones CSS
          posicionadas de forma fija para no interferir con el layout del contenido. */}
      <img src="/portal.gif" alt="Portal" className="result-page__portal" />
      <img src="/morty-run.gif" alt="Morty corriendo" className="result-page__morty" />

      {/* recycle={false} hace que el confetti caiga una sola vez y desaparezca
          en lugar de regenerarse en bucle. numberOfPieces controla la densidad. */}
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={300}
        colors={CONFETTI_COLORS}
      />
      <img src="/header.png" alt="Rick and Morty" className="result-page__logo" />
      <Card hideLogo>
        <div className="result-page__content">
          <h1 className="result-page__title">¡Fin del juego!</h1>
          <p className="result-page__score">
            Completaste el juego en <strong>{displayTurns}</strong> turnos
          </p>
          <Button onClick={handleReplay}>Jugar de nuevo</Button>
          <Button variant="secondary" onClick={handleExit}>
            Salir
          </Button>
        </div>
      </Card>
    </div>
  )
}
