import { motion } from 'framer-motion'
import type { GameCardProps } from '../../types'

const shakeAnimation = {
  x: [0, -10, 10, -10, 10, -6, 6, 0],
  transition: { duration: 0.5 },
}

const matchAnimation = {
  scale: [1, 1.12, 1],
  transition: { duration: 0.4 },
}

export const GameCard = ({ card, isFlipped, isMatched, isError, onClick }: GameCardProps) => {
  const shouldShowFront = isFlipped || isMatched

  return (
    <motion.div
      layout
      layoutId={`card-${card.id}`}
      className={`game-card${isMatched ? ' game-card--matched' : ''}`}
      onClick={onClick}
      animate={isError ? shakeAnimation : isMatched ? matchAnimation : {}}
      whileHover={!isMatched && !isError ? { scale: 1.05 } : undefined}
      whileTap={!isMatched && !isError ? { scale: 0.95 } : undefined}
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
