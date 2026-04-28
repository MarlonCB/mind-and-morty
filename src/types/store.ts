import type { GameCard } from './game'

/**
 * Contrato completo del estado y las acciones del juego.
 *
 * Fases del juego (representadas por combinaciones de flags):
 *  isLoading=true                          → cargando personajes de la API
 *  isPreview=true,  isMemorizing=false     → cartas ordenadas boca arriba, esperando "Iniciar"
 *  isPreview=true,  isMemorizing=true      → cartas barajadas boca arriba, cuenta regresiva activa
 *  isPreview=false, isMemorizing=false     → juego activo, cartas boca abajo
 *  isGameFinished=true                     → todos los pares encontrados, navegando a /result
 *  hasError=true                           → fallo en la carga de la API
 */
export interface GameState {
  /** Cartas del tablero; contiene pares: cada characterId aparece exactamente dos veces. */
  cards: GameCard[]

  /** IDs de las cartas actualmente volteadas boca arriba (máximo 2). */
  flippedIds: number[]

  /** IDs de todas las cartas ya emparejadas correctamente. */
  matchedIds: number[]

  /** IDs de las dos cartas que acaban de fallar; activa la animación de shake. */
  errorIds: number[]

  /** Número de turnos jugados (se incrementa en cada par evaluado, acertado o fallado). */
  turns: number

  /**
   * true cuando las cartas están boca arriba (fase de preview o memorización).
   * false cuando el juego está activo y las cartas están boca abajo.
   */
  isPreview: boolean

  /** true durante los 3 segundos de memorización post-barajado; activa el overlay de cuenta regresiva. */
  isMemorizing: boolean

  /**
   * Bloquea nuevos clicks mientras la animación de evaluación de un par está en curso.
   * Evita race conditions por clicks rápidos que podrían voltear una tercera carta
   * antes de que las dos anteriores terminen de evaluarse.
   */
  isLocked: boolean

  /** true mientras se realiza la petición a la Rick and Morty API. */
  isLoading: boolean

  /** true cuando los 6 pares han sido encontrados; dispara la navegación a /result. */
  isGameFinished: boolean

  /** true si la petición a la API falló; permite mostrar un botón de reintento. */
  hasError: boolean

  /** Carga personajes de la API y prepara el tablero en modo preview ordenado. */
  initGame: () => Promise<void>

  /** Baraja las cartas y activa la fase de memorización (isMemorizing=true). */
  startGame: () => void

  /** Finaliza la memorización: voltea las cartas boca abajo e inicia el juego real. */
  beginPlay: () => void

  /** Voltea una carta y evalúa el par si ya hay dos cartas volteadas. */
  flipCard: (id: number) => void

  /** Reinicia todo el estado y carga una nueva ronda con personajes aleatorios. */
  resetGame: () => void
}
