import Confetti from 'react-confetti'
import { useNavigate } from 'react-router-dom'
import { Card, Button } from '../components'
import { useGameStore } from '../store'
import { useAuthStore } from '../store'
import { CONFETTI_COLORS } from '../constants/confettiColors'

export default function ResultPage() {
  const { turns, resetGame } = useGameStore()
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  // Usa localStorage como fallback para que el puntaje sobreviva un refresco de página
  const storedTurns = localStorage.getItem('game-result')
  const displayTurns = turns || (storedTurns ? parseInt(storedTurns) : 0)

  const handleReplay = () => {
    resetGame()
    navigate('/game')
  }

  const handleExit = () => {
    resetGame()
    logout()
    navigate('/')
  }

  return (
    <div className="result-page">
      <img src="/portal.gif" alt="Portal" className="result-page__portal" />
      <img src="/morty-run.gif" alt="Morty corriendo" className="result-page__morty" />
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
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
