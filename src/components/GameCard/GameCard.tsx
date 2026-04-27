import { motion } from 'framer-motion'
import styles from './GameCard.module.scss'

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

export const GameCard = ({
  card,
  isFlipped,
  isMatched,
  onClick,
}: GameCardProps) => {
  const shouldShowFront = isFlipped || isMatched

  return (
    <motion.div
      className={`${styles.card} ${isMatched ? styles.matched : ''}`}
      onClick={onClick}
      whileHover={!isMatched ? { scale: 1.05 } : undefined}
      whileTap={!isMatched ? { scale: 0.95 } : undefined}
    >
      <motion.div
        className={styles.inner}
        animate={{ rotateY: shouldShowFront ? 0 : 180 }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.front}>
          <img src={card.image} alt={card.name} className={styles.image} />
          <span className={styles.name}>{card.name}</span>
        </div>
        <div className={styles.back}>
          <img
            src="/card-back-image.png"
            alt="Card back"
            className={styles.backImage}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}