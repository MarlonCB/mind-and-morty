import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { GameCard, Button, Card } from '../components'
import { useGameStore } from '../store'

export default function GamePage() {
  const {
    cards,
    isLoading,
    isPreview,
    isMemorizing,
    isGameFinished,
    hasError,
    flippedIds,
    matchedIds,
    errorIds,
    turns,
    initGame,
    startGame,
    beginPlay,
    flipCard,
  } = useGameStore()

  const navigate = useNavigate()

  // Estado local de la cuenta regresiva; solo existe en esta vista,
  // por eso no pertenece al store global.
  const [countdown, setCountdown] = useState(3)

  // Carga los personajes al montar la página.
  // initGame se incluye en las deps para satisfacer la regla de ESLint
  // exhaustive-deps; en la práctica la referencia es estable (Zustand no la recrea).
  useEffect(() => {
    initGame()
  }, [initGame])

  /**
   * Maneja la cuenta regresiva de 3 segundos y la transición al juego.
   *
   * Se usan cuatro setTimeout en lugar de setInterval para tener control
   * individual sobre cada tick y poder cancelarlos todos con el cleanup.
   *
   * t0 resetea el contador a 3 de forma asíncrona (delay 0ms) en lugar de
   * hacerlo sincrónico dentro del effect: llamar setState directamente en
   * el cuerpo de un effect desencadena renders en cascada y está flaggeado
   * por el linter de React. Un setTimeout de 0ms lo convierte en microtarea.
   *
   * El cleanup (return) cancela los timers pendientes si el usuario pulsa
   * "Iniciar ya" antes de que expire el contador, evitando que beginPlay
   * se llame dos veces o que se actualice estado en un componente desmontado.
   */
  useEffect(() => {
    if (!isMemorizing) return

    const t0 = setTimeout(() => setCountdown(3), 0)   // reset async para evitar setState síncrono en effect
    const t1 = setTimeout(() => setCountdown(2), 1000)
    const t2 = setTimeout(() => setCountdown(1), 2000)
    const t3 = setTimeout(beginPlay, 3000)             // voltea las cartas al llegar a 0

    return () => {
      clearTimeout(t0)
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [isMemorizing, beginPlay])

  /**
   * Navega a la pantalla de resultado cuando el juego termina.
   * El delay de 600ms permite que la animación de scale del último par
   * termine de reproducirse antes de cambiar de página.
   * El cleanup evita el memory leak si el componente se desmonta durante ese delay.
   */
  useEffect(() => {
    if (!isGameFinished) return
    const id = setTimeout(() => navigate('/result'), 600)
    return () => clearTimeout(id)
  }, [isGameFinished, navigate])

  if (isLoading) {
    return (
      <div className="game-page">
        <p className="game-page__loading">Cargando personajes...</p>
      </div>
    )
  }

  // Si la API falló se ofrece reintentar en lugar de dejar la pantalla vacía
  if (hasError) {
    return (
      <div className="game-page">
        <p className="game-page__loading">Error al cargar los personajes.</p>
        <Button onClick={initGame}>Reintentar</Button>
      </div>
    )
  }

  return (
    <div className="game-page">
      <img src="/header.png" alt="Rick and Morty juego de memoria" className="game-page__logo" />
      <Card className="game-page__card" hideLogo>
        {/* El HUD solo se muestra cuando las cartas están boca abajo (juego activo).
            Durante preview y memorización no hay turnos que contar. */}
        {!isPreview && (
          <div className="game-page__hud">
            <span className="game-page__hud-item">
              Turnos: <strong>{turns}</strong>
            </span>
            <span className="game-page__hud-item">
              {/* matchedIds guarda los IDs individuales, no los pares */}
              Pares: <strong>{matchedIds.length / 2}/6</strong>
            </span>
          </div>
        )}
        <div className="game-page__grid-container">
          {/* LayoutGroup + layoutId en cada GameCard permiten que Framer Motion
              anime la reordenación de cartas al hacer shuffle, calculando
              automáticamente las posiciones origen y destino (FLIP animation). */}
          <LayoutGroup>
            <div className="game-page__grid">
              {cards.map((card) => (
                <GameCard
                  key={card.id}
                  card={card}
                  // Durante preview (isPreview=true) todas las cartas muestran su frente.
                  // Durante el juego solo las que están en flippedIds o matchedIds.
                  isFlipped={isPreview || flippedIds.includes(card.id)}
                  isMatched={matchedIds.includes(card.id)}
                  isError={errorIds.includes(card.id)}
                  onClick={() => flipCard(card.id)}
                />
              ))}
            </div>
          </LayoutGroup>

          {/* Overlay de memorización: se monta solo durante los 3 segundos post-barajado.
              AnimatePresence con mode="wait" garantiza que el número saliente
              termine su animación de salida antes de que entre el siguiente. */}
          {isMemorizing && (
            <div className="game-page__memorize-overlay">
              <AnimatePresence mode="wait">
                {/* key={countdown} hace que Framer Motion trate cada número como
                    un elemento distinto, disparando mount/unmount animations en cada tick. */}
                <motion.span
                  key={countdown}
                  className="game-page__countdown"
                  initial={{ scale: 1.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {countdown}
                </motion.span>
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* El botón "Iniciar" solo se muestra en la fase de preview ordenada.
            Desaparece durante la memorización para no confundir al usuario. */}
        {isPreview && !isMemorizing && (
          <div className="game-page__start">
            <Button onClick={startGame}>Iniciar</Button>
          </div>
        )}
      </Card>
    </div>
  )
}
