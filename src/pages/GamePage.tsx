import { GameCard } from '../components'

const mockCards = [
  { id: 1, characterId: 1, name: 'Rick Sanchez', image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg' },
  { id: 2, characterId: 2, name: 'Morty Smith', image: 'https://rickandmortyapi.com/api/character/avatar/2.jpeg' },
  { id: 3, characterId: 3, name: 'Summer Smith', image: 'https://rickandmortyapi.com/api/character/avatar/3.jpeg' },
  { id: 4, characterId: 4, name: 'Beth Smith', image: 'https://rickandmortyapi.com/api/character/avatar/4.jpeg' },
  { id: 5, characterId: 5, name: 'Jerry Smith', image: 'https://rickandmortyapi.com/api/character/avatar/5.jpeg' },
  { id: 6, characterId: 6, name: 'Abadango Cluster Princess', image: 'https://rickandmortyapi.com/api/character/avatar/6.jpeg' },
]

export default function GamePage() {
  return (
    <div className="game-page">
      <div className="game-page__hud">
        <span>Turnos: 0</span>
        <span>Pares: 0/6</span>
      </div>
      <div className="game-page__grid">
        {mockCards.map((card) => (
          <GameCard
            key={card.id}
            card={card}
            isFlipped={false}
            isMatched={false}
            onClick={() => {}}
          />
        ))}
      </div>
    </div>
  )
}
