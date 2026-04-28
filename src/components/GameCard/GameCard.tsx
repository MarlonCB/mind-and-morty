import { motion } from 'framer-motion'

interface GameCardData {
  id: number
  characterId: number
  name: string
  image: string
}

type GameCardProps = {
  card: GameCardData
  isFlipped: boolean
  isMatched: boolean
  onClick: () => void
}

export const GameCard = ({ card, isFlipped, isMatched, onClick }: GameCardProps) => {
  const shouldShowFront = isFlipped || isMatched

  return (
    <motion.div
      className={`game-card${isMatched ? ' game-card--matched' : ''}`}
      onClick={onClick}
      whileHover={!isMatched ? { scale: 1.05 } : undefined}
      whileTap={!isMatched ? { scale: 0.95 } : undefined}
    >
      <motion.div
        className="game-card__inner"
        animate={{ rotateY: shouldShowFront ? 180 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="game-card__front">
          <img src={card.image} alt={card.name} className="game-card__image" />
        </div>
        <div className="game-card__back">
          <img src="/card-back-image.png" alt="Card back" className="game-card__back-image" />
        </div>
      </motion.div>
    </motion.div>
  )
}
