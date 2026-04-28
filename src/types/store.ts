import type { GameCard } from './game'

export interface GameState {
  cards: GameCard[]
  flippedIds: number[]
  matchedIds: number[]
  errorIds: number[]
  turns: number
  isPreview: boolean
  // Bloquea los clics mientras la animación de evaluación del par está en curso
  isLocked: boolean
  isLoading: boolean
  initGame: () => Promise<void>
  startGame: () => void
  flipCard: (id: number) => void
  resetGame: () => void
}
