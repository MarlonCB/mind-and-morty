import { useEffect } from 'react'
import { GameCard, Button, Card } from '../components'
import { useGameStore } from '../store'

export default function GamePage() {
  const { cards, isLoading, isPreview, initGame } = useGameStore()

  useEffect(() => {
    initGame()
  }, [initGame])

  if (isLoading) {
    return (
      <div className="game-page">
        <p className="game-page__loading">Cargando personajes...</p>
      </div>
    )
  }

  return (
    <div className="game-page">
      <img src="/Rick_and_Morty.svg" alt="Rick and Morty" className="game-page__logo" />
      <Card className="game-page__card" hideLogo>
        <div className="game-page__grid">
          {cards.map((card) => (
            <GameCard
              key={card.id}
              card={card}
              isFlipped={isPreview}
              isMatched={false}
              onClick={() => {}}
            />
          ))}
        </div>
        {isPreview && (
          <div className="game-page__start">
            <Button onClick={() => {}}>Iniciar</Button>
          </div>
        )}
      </Card>
    </div>
  )
}
