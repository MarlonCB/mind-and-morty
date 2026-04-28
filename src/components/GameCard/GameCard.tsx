import { motion } from 'framer-motion'
import type { GameCardProps } from '../../types'

/**
 * Definidos fuera del componente para mantener identidad de objeto estable
 * entre renders. Si se definieran dentro, Framer Motion los trataría como
 * animaciones "nuevas" en cada render y las reproduciría innecesariamente.
 */

// Sacude la carta horizontalmente al detectar un error (par incorrecto)
const shakeAnimation = {
  x: [0, -10, 10, -10, 10, -6, 6, 0],
  transition: { duration: 0.5 }, // duración total del shake; sincronizada con el setTimeout de 600ms en gameStore
}

// Escala levemente la carta al confirmar un acierto (par correcto)
const matchAnimation = {
  scale: [1, 1.12, 1],
  transition: { duration: 0.4 },
}

/**
 * Tarjeta de juego con flip 3D.
 *
 * La técnica de flip funciona así:
 *  - El div exterior (.game-card) tiene `perspective` para dar profundidad 3D.
 *  - El div interior (.game-card__inner) tiene `transform-style: preserve-3d`
 *    y es el que rota con rotateY.
 *  - La cara frontal (.game-card__front) arranca rotada 180° en CSS, así que
 *    en el estado inicial (rotateY=0) está oculta. Al animar a rotateY=180°,
 *    la cara frontal queda mirando al usuario y la trasera queda invertida.
 *  - Ambas caras tienen `backface-visibility: hidden` para que no se vean
 *    "al revés" durante la transición.
 */
export const GameCard = ({ card, isFlipped, isMatched, isError, onClick }: GameCardProps) => {
  // Las cartas matched deben seguir mostrando su frente aunque ya no estén en flippedIds
  const shouldShowFront = isFlipped || isMatched

  return (
    <motion.div
      layout          // permite animación de reposicionamiento cuando cambia el layout del grid
      layoutId={`card-${card.id}`}  // identifica la carta entre renders para FLIP animations
      className={`game-card${isMatched ? ' game-card--matched' : ''}`}
      onClick={onClick}
      // Prioridad de animación: error > match > ninguna.
      // Un objeto vacío {} significa "sin animación keyframe activa".
      animate={isError ? shakeAnimation : isMatched ? matchAnimation : {}}
      // Las interacciones hover/tap se desactivan en cartas matched o en shake
      // para evitar feedback visual engañoso durante transiciones de estado.
      whileHover={!isMatched && !isError ? { scale: 1.05 } : undefined}
      whileTap={!isMatched && !isError ? { scale: 0.95 } : undefined}
    >
      {/* El div inner es el que rota; animar su rotateY a 180° revela la cara frontal */}
      <motion.div
        className="game-card__inner"
        animate={{ rotateY: shouldShowFront ? 180 : 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Cara frontal: imagen del personaje */}
        <div className="game-card__front">
          <img src={card.image} alt={card.name} className="game-card__image" />
        </div>
        {/* Cara trasera: imagen genérica de reverso */}
        <div className="game-card__back">
          <img src="/card-back-image.png" alt="Card back" className="game-card__back-image" />
        </div>
      </motion.div>
    </motion.div>
  )
}
