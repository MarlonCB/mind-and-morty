import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGroup } from 'framer-motion'
import { GameCard, Button, Card } from '../components'
import { useGameStore } from '../store'

export default function GamePage() {
  const {
    cards,
    isLoading,
    isPreview,
    flippedIds,
    matchedIds,
    errorIds,
    turns,
    initGame,
    startGame,
    flipCard,
  } = useGameStore()

  const navigate = useNavigate()

  useEffect(() => {
    initGame()
  }, [initGame])

  useEffect(() => {
    if (matchedIds.length === 12) {
      setTimeout(() => navigate('/result'), 600)
    }
  }, [matchedIds, navigate])

  if (isLoading) {
    return (
      <div className="game-page">
        <p className="game-page__loading">Cargando personajes...</p>
      </div>
    )
  }

  return (
    <div className="game-page">
      <img src="/header.png" alt="Rick and Morty juego de memoria" className="game-page__logo" />
      <Card className="game-page__card" hideLogo>
        {!isPreview && (
          <div className="game-page__hud">
            <span className="game-page__hud-item">
              Turnos: <strong>{turns}</strong>
            </span>
            <span className="game-page__hud-item">
              Pares: <strong>{matchedIds.length / 2}/6</strong>
            </span>
          </div>
        )}
        <LayoutGroup>
          <div className="game-page__grid">
            {cards.map((card) => (
              <GameCard
                key={card.id}
                card={card}
                isFlipped={isPreview || flippedIds.includes(card.id)}
                isMatched={matchedIds.includes(card.id)}
                isError={errorIds.includes(card.id)}
                onClick={() => flipCard(card.id)}
              />
            ))}
          </div>
        </LayoutGroup>
        {isPreview && (
          <div className="game-page__start">
            <Button onClick={startGame}>Iniciar</Button>
          </div>
        )}
      </Card>
    </div>
  )
}
